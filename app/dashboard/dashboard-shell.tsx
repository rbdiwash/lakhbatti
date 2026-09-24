"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useQuery } from "@tanstack/react-query";
import type { IconType } from "react-icons";
import {
  LuBell,
  LuBriefcase,
  LuChevronDown,
  LuChevronRight,
  LuExternalLink,
  LuFileText,
  LuLayoutDashboard,
  LuLogOut,
  LuMenu,
  LuPanelLeftClose,
  LuPanelLeftOpen,
  LuPlus,
  LuSettings,
  LuUser,
  LuUserPlus,
  LuUsers,
  LuX,
} from "react-icons/lu";
import {
  getAdminProfile,
  listEmployees,
  listJobs,
  listQuotes,
} from "../lib/api";
import { toEmployeeRow } from "../lib/employee-row";
import { site } from "../lib/site";
import { JobFormDialog } from "./job-form-dialog";

type NavItem = {
  href: string;
  label: string;
  icon: IconType;
  badgeKey?: "quotes" | "employees";
};

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: "General",
    items: [{ href: "/dashboard", label: "Overview", icon: LuLayoutDashboard }],
  },
  {
    title: "Operations",
    items: [
      {
        href: "/dashboard/quotes",
        label: "Quotes",
        icon: LuFileText,
        badgeKey: "quotes",
      },
      { href: "/dashboard/jobs", label: "Jobs", icon: LuBriefcase },
      {
        href: "/dashboard/employees",
        label: "Employees",
        icon: LuUsers,
        badgeKey: "employees",
      },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/dashboard/settings", label: "Settings", icon: LuSettings },
    ],
  },
];

const segmentLabels: Record<string, string> = {
  dashboard: "Dashboard",
  quotes: "Quotes",
  jobs: "Jobs",
  employees: "Employees",
  settings: "Settings",
  new: "New",
  edit: "Edit",
};

const COLLAPSE_KEY = "dashboard_sidebar_collapsed";

// Sidebar collapse preference, persisted in localStorage when available.
const collapseListeners = new Set<() => void>();
let collapsedFallback = false;

function subscribeCollapsed(listener: () => void) {
  collapseListeners.add(listener);
  return () => {
    collapseListeners.delete(listener);
  };
}

function readCollapsed() {
  try {
    const stored = localStorage.getItem(COLLAPSE_KEY);
    return stored === null ? collapsedFallback : stored === "1";
  } catch {
    return collapsedFallback;
  }
}

function writeCollapsed(next: boolean) {
  collapsedFallback = next;
  try {
    localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
  } catch {
    // Storage unavailable — keep the in-memory value only.
  }
  collapseListeners.forEach((listener) => listener());
}

type MenuId = "create" | "notifications" | "account" | null;

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname.startsWith(href);
}

function breadcrumbsFor(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return segments.map((segment, index) => ({
    href: "/" + segments.slice(0, index + 1).join("/"),
    label: segmentLabels[segment] ?? "Details",
  }));
}

function MenuPanel({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      role="menu"
      className="absolute top-full right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg"
    >
      {children}
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const menuRootRef = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<MenuId>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [jobOpen, setJobOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const collapsed = useSyncExternalStore(
    subscribeCollapsed,
    readCollapsed,
    () => false,
  );

  // Close open menus and the mobile drawer after navigating.
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setMenu(null);
    setMobileOpen(false);
  }

  const profileQuery = useQuery({
    queryKey: ["settings", "profile"],
    queryFn: getAdminProfile,
    retry: false,
  });
  const employeesQuery = useQuery({
    queryKey: ["employees", "nav"],
    queryFn: () => listEmployees({ page: 1, pageSize: 100 }),
  });
  const pendingQuery = useQuery({
    queryKey: ["employees", "pending-count"],
    queryFn: () => listEmployees({ page: 1, pageSize: 5, status: "PENDING" }),
  });
  const jobsQuery = useQuery({
    queryKey: ["jobs"],
    queryFn: listJobs,
  });
  const quotesQuery = useQuery({
    queryKey: ["quotes"],
    queryFn: () => listQuotes(),
  });

  const employees = useMemo(
    () => (employeesQuery.data?.data ?? []).map(toEmployeeRow),
    [employeesQuery.data],
  );
  const pending = pendingQuery.data?.data ?? [];
  const pendingTotal = pendingQuery.data?.total ?? pending.length;
  const jobs = jobsQuery.data ?? [];
  const unassigned = jobs.filter((job) => !job.employeeId);
  const newQuotes = (quotesQuery.data ?? []).filter(
    (quote) => quote.status === "NEW",
  );

  const badges: Record<NonNullable<NavItem["badgeKey"]>, number> = {
    quotes: newQuotes.length,
    employees: pendingTotal,
  };

  const notifications = useMemo(() => {
    const items: { id: string; title: string; detail: string; href: string }[] =
      [];
    if (newQuotes.length > 0) {
      items.push({
        id: "new-quotes",
        title: `${newQuotes.length} new quote request${newQuotes.length === 1 ? "" : "s"}`,
        detail: "Customers waiting to hear back.",
        href: "/dashboard/quotes?status=NEW",
      });
    }
    if (pendingTotal > 0) {
      items.push({
        id: "pending-employees",
        title: `${pendingTotal} registration${pendingTotal === 1 ? "" : "s"} to review`,
        detail: "New staff waiting for approval.",
        href: "/dashboard/employees",
      });
    }
    if (unassigned.length > 0) {
      items.push({
        id: "unassigned-jobs",
        title: `${unassigned.length} unassigned job${unassigned.length === 1 ? "" : "s"}`,
        detail: "Jobs that still need an employee.",
        href: "/dashboard/jobs",
      });
    }
    newQuotes.slice(0, 3).forEach((quote) => {
      items.push({
        id: `quote-${quote.id}`,
        title: quote.name,
        detail: `${quote.serviceType || quote.category} · New quote`,
        href: `/dashboard/quotes/${quote.id}`,
      });
    });
    return items;
  }, [newQuotes, pendingTotal, unassigned.length]);

  const displayName = profileQuery.data?.name?.trim() || "Admin";
  const displayEmail = profileQuery.data?.email?.trim() || site.email;
  const initials =
    displayName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "A";

  const crumbs = breadcrumbsFor(pathname);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!menuRootRef.current?.contains(event.target as Node)) setMenu(null);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenu(null);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function toggleCollapsed() {
    writeCollapsed(!collapsed);
  }

  function toggleMenu(id: MenuId) {
    setMenu((current) => (current === id ? null : id));
  }

  function logout() {
    localStorage.removeItem("auth_token");
    setMenu(null);
    router.push("/");
  }

  const iconBtn =
    "relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";

  function renderSidebar(isCompact: boolean) {
    return (
      <div className="flex h-full flex-col">
        <div
          className={`flex h-16 shrink-0 items-center border-b border-zinc-100 ${
            isCompact ? "justify-center px-2" : "gap-2.5 px-5"
          }`}
        >
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            <Image
              src="/images/lakhbatti-logo-only.png"
              alt=""
              width={36}
              height={36}
              unoptimized
              className="h-9 w-9 shrink-0 object-contain"
            />
            {isCompact ? (
              <span className="sr-only">{site.name}</span>
            ) : (
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-zinc-900">
                  {site.name}
                </span>
                <span className="block text-xs text-zinc-500">
                  Admin console
                </span>
              </span>
            )}
          </Link>
        </div>

        <nav
          className={`flex-1 overflow-y-auto py-4 ${isCompact ? "px-2" : "px-3"}`}
          aria-label="Dashboard"
        >
          {navSections.map((section) => (
            <div key={section.title} className="mb-5 last:mb-0">
              {isCompact ? (
                <div className="mx-auto mb-2 h-px w-6 bg-zinc-200 first:hidden" />
              ) : (
                <p className="mb-1.5 px-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                  {section.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActivePath(pathname, item.href);
                  const badge = item.badgeKey ? badges[item.badgeKey] : 0;
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={isCompact ? item.label : undefined}
                        aria-current={active ? "page" : undefined}
                        className={`group relative flex h-10 items-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
                          isCompact ? "justify-center" : "gap-3 px-3"
                        } ${
                          active
                            ? "bg-brand-50 text-brand-800"
                            : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                        }`}
                      >
                        {active ? (
                          <span
                            className="absolute top-2 bottom-2 left-0 w-0.5 rounded-full bg-brand-600"
                            aria-hidden
                          />
                        ) : null}
                        <Icon
                          className={`h-[18px] w-[18px] shrink-0 ${
                            active
                              ? "text-brand-700"
                              : "text-zinc-400 group-hover:text-zinc-600"
                          }`}
                          aria-hidden
                        />
                        {isCompact ? (
                          <>
                            <span className="sr-only">{item.label}</span>
                            {badge > 0 ? (
                              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
                            ) : null}
                          </>
                        ) : (
                          <>
                            <span className="flex-1 truncate">
                              {item.label}
                            </span>
                            {badge > 0 ? (
                              <span
                                className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                                  active
                                    ? "bg-brand-600 text-white"
                                    : "bg-zinc-100 text-zinc-700"
                                }`}
                              >
                                {badge > 99 ? "99+" : badge}
                              </span>
                            ) : null}
                          </>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div
          className={`shrink-0 border-t border-zinc-100 ${isCompact ? "p-2" : "p-3"}`}
        >
          <Link
            href="/"
            title={isCompact ? "View website" : undefined}
            className={`flex h-10 items-center rounded-lg text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 ${
              isCompact ? "justify-center" : "gap-3 px-3"
            }`}
          >
            <LuExternalLink
              className="h-[18px] w-[18px] text-zinc-400"
              aria-hidden
            />
            {isCompact ? (
              <span className="sr-only">View website</span>
            ) : (
              "View website"
            )}
          </Link>
          <div
            className={`mt-2 flex items-center rounded-xl bg-zinc-50 ${
              isCompact ? "flex-col gap-2 p-2" : "gap-3 p-2.5"
            }`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800">
              {initials}
            </span>
            {isCompact ? null : (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-zinc-900">
                  {displayName}
                </p>
                <p className="truncate text-xs text-zinc-500">{displayEmail}</p>
              </div>
            )}
            <button
              type="button"
              onClick={logout}
              title="Log out"
              aria-label="Log out"
              className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
            >
              <LuLogOut className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden border-r border-zinc-200 bg-white transition-[width] duration-200 lg:block ${
          collapsed ? "w-[72px]" : "w-64"
        }`}
      >
        {renderSidebar(collapsed)}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal>
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 cursor-default bg-zinc-900/40 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative h-full w-72 max-w-[85vw] bg-white shadow-xl">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className={`${iconBtn} absolute top-3 right-3 z-10`}
            >
              <LuX className="h-5 w-5" aria-hidden />
            </button>
            {renderSidebar(false)}
          </aside>
        </div>
      ) : null}

      <div
        className={`transition-[padding] duration-200 ${
          collapsed ? "lg:pl-[72px]" : "lg:pl-64"
        }`}
      >
        <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center gap-2 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              className={`${iconBtn} -ml-2 lg:hidden`}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => {
                setMenu(null);
                setMobileOpen(true);
              }}
            >
              <LuMenu className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              className={`${iconBtn} -ml-2 hidden lg:inline-flex`}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={toggleCollapsed}
            >
              {collapsed ? (
                <LuPanelLeftOpen className="h-5 w-5" aria-hidden />
              ) : (
                <LuPanelLeftClose className="h-5 w-5" aria-hidden />
              )}
            </button>

            <nav aria-label="Breadcrumb" className="min-w-0">
              <ol className="flex min-w-0 items-center gap-1 text-sm">
                {crumbs.map((crumb, index) => {
                  const last = index === crumbs.length - 1;
                  return (
                    <li
                      key={crumb.href}
                      className={`flex min-w-0 items-center gap-1 ${
                        last ? "" : "hidden sm:flex"
                      }`}
                    >
                      {index > 0 ? (
                        <LuChevronRight
                          className="hidden h-3.5 w-3.5 shrink-0 text-zinc-300 sm:block"
                          aria-hidden
                        />
                      ) : null}
                      {last ? (
                        <span
                          aria-current="page"
                          className="truncate font-semibold text-zinc-900"
                        >
                          {crumb.label}
                        </span>
                      ) : (
                        <Link
                          href={crumb.href}
                          className="truncate text-zinc-500 hover:text-zinc-900"
                        >
                          {crumb.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>

            <div ref={menuRootRef} className="ml-auto flex items-center gap-1">
              <div className="relative">
                <button
                  type="button"
                  aria-label="Create"
                  aria-expanded={menu === "create"}
                  aria-haspopup="menu"
                  onClick={() => toggleMenu("create")}
                  className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                >
                  <LuPlus className="h-4 w-4" aria-hidden />
                  <span className="hidden sm:inline">New</span>
                  <LuChevronDown
                    className="h-3.5 w-3.5 opacity-80"
                    aria-hidden
                  />
                </button>
                <MenuPanel open={menu === "create"}>
                  <Link
                    role="menuitem"
                    href="/dashboard/employees/new"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50"
                    onClick={() => setMenu(null)}
                  >
                    <LuUserPlus className="h-4 w-4 text-zinc-400" aria-hidden />
                    Add employee
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                    onClick={() => {
                      setMenu(null);
                      setJobOpen(true);
                    }}
                  >
                    <LuBriefcase
                      className="h-4 w-4 text-zinc-400"
                      aria-hidden
                    />
                    Add job
                  </button>
                </MenuPanel>
              </div>

              <div className="relative">
                <button
                  type="button"
                  aria-label={
                    notifications.length
                      ? `Notifications, ${notifications.length} unread`
                      : "Notifications"
                  }
                  aria-expanded={menu === "notifications"}
                  onClick={() => toggleMenu("notifications")}
                  className={iconBtn}
                >
                  <LuBell className="h-5 w-5" aria-hidden />
                  {notifications.length > 0 ? (
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                  ) : null}
                </button>
                <MenuPanel open={menu === "notifications"}>
                  <p className="px-3 py-2 text-xs font-semibold tracking-wide text-zinc-400 uppercase">
                    Notifications
                  </p>
                  {notifications.length === 0 ? (
                    <p className="px-3 py-6 text-center text-sm text-zinc-500">
                      You&apos;re all caught up.
                    </p>
                  ) : (
                    notifications.map((item) => (
                      <Link
                        key={item.id}
                        role="menuitem"
                        href={item.href}
                        className="block px-3 py-2.5 hover:bg-zinc-50"
                        onClick={() => setMenu(null)}
                      >
                        <p className="text-sm font-medium text-zinc-800">
                          {item.title}
                        </p>
                        <p className="text-xs text-zinc-500">{item.detail}</p>
                      </Link>
                    ))
                  )}
                </MenuPanel>
              </div>

              <div className="relative">
                <button
                  type="button"
                  aria-label="Account menu"
                  aria-expanded={menu === "account"}
                  onClick={() => toggleMenu("account")}
                  className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg px-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800">
                    {initials}
                  </span>
                  <LuChevronDown
                    className="hidden h-3.5 w-3.5 text-zinc-400 sm:inline"
                    aria-hidden
                  />
                </button>
                <MenuPanel open={menu === "account"}>
                  <div className="border-b border-zinc-100 px-3 py-3">
                    <p className="truncate text-sm font-semibold text-zinc-900">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {displayEmail}
                    </p>
                  </div>
                  <Link
                    role="menuitem"
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50"
                    onClick={() => setMenu(null)}
                  >
                    <LuUser className="h-4 w-4 text-zinc-400" aria-hidden />
                    Profile
                  </Link>
                  <Link
                    role="menuitem"
                    href="/dashboard/settings?tab=regional"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50"
                    onClick={() => setMenu(null)}
                  >
                    <LuSettings className="h-4 w-4 text-zinc-400" aria-hidden />
                    Account preferences
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={logout}
                    className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left text-sm text-rose-700 hover:bg-rose-50"
                  >
                    <LuLogOut className="h-4 w-4" aria-hidden />
                    Log out
                  </button>
                </MenuPanel>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-9xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      <JobFormDialog
        open={jobOpen}
        employees={employees}
        onClose={() => setJobOpen(false)}
      />
    </div>
  );
}
