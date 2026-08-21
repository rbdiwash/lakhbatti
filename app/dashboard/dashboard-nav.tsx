"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "../lib/site";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/employees", label: "Employees" },
  { href: "/dashboard/jobs", label: "Jobs" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col border-b border-zinc-200 bg-white lg:w-60 lg:border-b-0 lg:border-r">
      <div className="border-b border-zinc-100 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
          {site.name}
        </p>
        <h1 className="mt-1 text-lg font-bold text-zinc-900">Dashboard</h1>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:flex-col">
        {links.map((link) => {
          const active =
            link.href === "/dashboard"
              ? pathname === link.href
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap ${
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto hidden border-t border-zinc-100 px-5 py-4 lg:block">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">
          Back to website
        </Link>
      </div>
    </aside>
  );
}
