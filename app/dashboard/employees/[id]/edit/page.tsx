"use client";

import Link from "next/link";
import { use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getEmployee } from "../../../../lib/api";
import { registrationSeedsFromEmployee } from "../../../../lib/employee-form";
import { EmployeeFormTabs } from "../../../employee-form-tabs";

export default function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["employee", id],
    queryFn: () => getEmployee(id),
  });

  const seeds = useMemo(
    () => (query.data ? registrationSeedsFromEmployee(query.data) : null),
    [query.data],
  );

  if (query.isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-center text-sm text-zinc-500">
        Loading employee…
      </div>
    );
  }

  if (query.isError || !query.data || !seeds) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-center">
        <p className="text-base font-semibold text-zinc-800">
          Employee not found
        </p>
        <Link
          href="/dashboard/employees"
          className="mt-3 inline-block text-sm font-medium text-brand-700 hover:underline"
        >
          Back to employees
        </Link>
      </div>
    );
  }

  const name =
    `${query.data.firstName ?? ""} ${query.data.lastName ?? ""}`.trim() ||
    query.data.email;

  return (
    <div>
      <Link
        href={`/dashboard/employees/${id}`}
        className="text-sm font-medium text-zinc-500 hover:text-zinc-800"
      >
        ← {name}
      </Link>

      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Edit employee</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Update the same fields used on registration, then save from Review.
        </p>
      </div>

      <EmployeeFormTabs
        key={id}
        useDummyData={false}
        mode="edit"
        employeeId={id}
        initialSeeds={seeds}
        onSuccess={async () => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ["employees"] }),
            queryClient.invalidateQueries({ queryKey: ["employee", id] }),
          ]);
          router.push(`/dashboard/employees/${id}`);
        }}
      />
    </div>
  );
}
