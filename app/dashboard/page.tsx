"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { listEmployees, listJobs } from "../lib/api";
import { toEmployeeRow } from "../lib/employee-row";

export default function DashboardPage() {
  const employeesQuery = useQuery({
    queryKey: ["employees", "overview"],
    queryFn: () => listEmployees({ page: 1, pageSize: 100 }),
  });
  const pendingQuery = useQuery({
    queryKey: ["employees", "pending-count"],
    queryFn: () =>
      listEmployees({ page: 1, pageSize: 1, status: "PENDING" }),
  });
  const jobsQuery = useQuery({
    queryKey: ["jobs"],
    queryFn: listJobs,
  });

  const employees = (employeesQuery.data?.data ?? []).map(toEmployeeRow);
  const jobs = jobsQuery.data ?? [];

  const stats = [
    {
      label: "Employees",
      value: employeesQuery.data?.total ?? employees.length,
      href: "/dashboard/employees",
    },
    {
      label: "Pending review",
      value: pendingQuery.data?.total ?? 0,
      href: "/dashboard/employees",
    },
    { label: "Jobs", value: jobs.length, href: "/dashboard/jobs" },
    {
      label: "Unassigned jobs",
      value: jobs.filter((job) => !job.employeeId).length,
      href: "/dashboard/jobs",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">Overview</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Track registered employees and create jobs from their availability.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-brand-200"
          >
            <p className="text-sm text-zinc-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900">{stat.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
