"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LuArrowRight,
  LuBriefcase,
  LuCircleAlert,
  LuClipboardList,
  LuFileText,
  LuUsers,
  LuUserPlus,
} from "react-icons/lu";
import {
  getAdminProfile,
  listEmployees,
  listJobs,
  listQuotes,
} from "../lib/api";
import { toEmployeeRow } from "../lib/employee-row";
import type { JobStatus, RegistrationStatus } from "../lib/types";

const EMP_STATUS: Record<RegistrationStatus, string> = {
  PENDING: "bg-amber-50 text-amber-800 ring-amber-200",
  REVIEWING: "bg-sky-50 text-sky-800 ring-sky-200",
  APPROVED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  REJECTED: "bg-rose-50 text-rose-800 ring-rose-200",
};

const JOB_STATUS: Record<JobStatus, string> = {
  OPEN: "bg-sky-50 text-sky-800 ring-sky-200",
  ASSIGNED: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  IN_PROGRESS: "bg-amber-50 text-amber-800 ring-amber-200",
  COMPLETED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  CANCELLED: "bg-zinc-100 text-zinc-600 ring-zinc-200",
};

function formatDate(value: string | null | undefined) {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
}

function StatCard({
  label,
  value,
  hint,
  href,
  icon: Icon,
  loading,
}: {
  label: string;
  value: number;
  hint: string;
  href: string;
  icon: typeof LuUsers;
  loading: boolean;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-brand-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-zinc-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
            {loading ? "—" : value}
          </p>
          <p className="mt-1 text-xs text-zinc-400">{hint}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const profileQuery = useQuery({
    queryKey: ["settings", "profile"],
    queryFn: getAdminProfile,
    retry: false,
  });
  const employeesQuery = useQuery({
    queryKey: ["employees", "overview"],
    queryFn: () => listEmployees({ page: 1, pageSize: 8 }),
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

  const newQuotes = (quotesQuery.data ?? []).filter(
    (quote) => quote.status === "NEW",
  ).length;
  const employees = (employeesQuery.data?.data ?? []).map(toEmployeeRow);
  const pending = (pendingQuery.data?.data ?? []).map(toEmployeeRow);
  const jobs = jobsQuery.data ?? [];
  const unassignedCount = jobs.filter((job) => !job.employeeId).length;
  const openJobs = jobs.filter(
    (job) => job.status === "OPEN" || job.status === "ASSIGNED",
  ).length;

  const recentJobs = useMemo(() => {
    return [...jobs]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 6);
  }, [jobs]);

  const firstName = profileQuery.data?.name?.trim().split(/\s+/)[0];
  const today = new Date().toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-zinc-500">{today}</p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-900">
            {firstName ? `Welcome back, ${firstName}` : "Overview"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Staff, jobs, and items that need a decision today.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/employees/new"
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            <LuUserPlus className="h-4 w-4" aria-hidden />
            Add employee
          </Link>
          <Link
            href="/dashboard/jobs"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand-600 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            <LuBriefcase className="h-4 w-4" aria-hidden />
            View jobs
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="New quotes"
          value={newQuotes}
          hint="Awaiting follow-up"
          href="/dashboard/quotes?status=NEW"
          icon={LuFileText}
          loading={quotesQuery.isLoading}
        />
        <StatCard
          label="Employees"
          value={employeesQuery.data?.total ?? employees.length}
          hint="Registered staff"
          href="/dashboard/employees"
          icon={LuUsers}
          loading={employeesQuery.isLoading}
        />
        <StatCard
          label="Pending review"
          value={pendingQuery.data?.total ?? 0}
          hint="Awaiting approval"
          href="/dashboard/employees"
          icon={LuCircleAlert}
          loading={pendingQuery.isLoading}
        />
        <StatCard
          label="Active jobs"
          value={openJobs}
          hint="Open or assigned"
          href="/dashboard/jobs"
          icon={LuClipboardList}
          loading={jobsQuery.isLoading}
        />
        <StatCard
          label="Unassigned"
          value={unassignedCount}
          hint="Need an employee"
          href="/dashboard/jobs"
          icon={LuBriefcase}
          loading={jobsQuery.isLoading}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-zinc-900">Needs review</h2>
            <Link
              href="/dashboard/employees"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              All employees
              <LuArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          {pendingQuery.isLoading ? (
            <p className="px-5 py-8 text-sm text-zinc-500">Loading…</p>
          ) : pending.length === 0 ? (
            <p className="px-5 py-8 text-sm text-zinc-500">
              No pending registrations.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {pending.map((row) => (
                <li key={row.id}>
                  <Link
                    href={`/dashboard/employees/${row.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-zinc-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900">
                        {row.fullName || row.email}
                      </p>
                      <p className="truncate text-xs text-zinc-500">
                        {row.suburb}
                        {row.suburb && row.workType ? " · " : ""}
                        {row.workType}
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${EMP_STATUS[row.status]}`}
                    >
                      {formatStatus(row.status)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-zinc-900">Recent jobs</h2>
            <Link
              href="/dashboard/jobs"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              All jobs
              <LuArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          {jobsQuery.isLoading ? (
            <p className="px-5 py-8 text-sm text-zinc-500">Loading…</p>
          ) : recentJobs.length === 0 ? (
            <p className="px-5 py-8 text-sm text-zinc-500">
              No jobs yet. Create one from the New menu.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {recentJobs.map((job) => (
                <li
                  key={job.id}
                  className="flex items-center justify-between gap-3 px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900">
                      {job.title}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {job.suburb || "No suburb"} · {formatDate(job.scheduledDate)}
                      {job.employee
                        ? ` · ${job.employee.firstName} ${job.employee.lastName}`
                        : " · Unassigned"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${JOB_STATUS[job.status] ?? "bg-zinc-100 text-zinc-700 ring-zinc-200"}`}
                  >
                    {formatStatus(job.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
