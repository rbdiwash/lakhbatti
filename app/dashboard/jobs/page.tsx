"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listEmployees, listJobs } from "../../lib/api";
import { toEmployeeRow } from "../../lib/employee-row";
import { JobFormDialog } from "../job-form-dialog";
import { JobsTable } from "../jobs-table";

export default function JobsPage() {
  const [jobOpen, setJobOpen] = useState(false);
  const jobsQuery = useQuery({
    queryKey: ["jobs"],
    queryFn: listJobs,
  });
  const employeesQuery = useQuery({
    queryKey: ["employees", "job-assign"],
    queryFn: () => listEmployees({ page: 1, pageSize: 100 }),
  });

  const employees = useMemo(
    () => (employeesQuery.data?.data ?? []).map(toEmployeeRow),
    [employeesQuery.data],
  );

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Jobs</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Create jobs and assign them to registered employees.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setJobOpen(true)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Create job
        </button>
      </div>
      <JobsTable
        data={jobsQuery.data ?? []}
        isLoading={jobsQuery.isLoading}
        isError={jobsQuery.isError}
      />
      <JobFormDialog
        open={jobOpen}
        employees={employees}
        onClose={() => setJobOpen(false)}
      />
    </div>
  );
}
