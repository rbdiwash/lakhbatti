"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { EmployeeFormTabs } from "../../employee-form-tabs";

export default function CreateEmployeePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return (
    <div>
      <Link
        href="/dashboard/employees"
        className="text-sm font-medium text-zinc-500 hover:text-zinc-800"
      >
        ← Employees
      </Link>

      <div className="mt-4 mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Create employee</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Same registration fields as the public join form, organised in tabs.
        </p>
      </div>

      <EmployeeFormTabs
        useDummyData={false}
        mode="create"
        onSuccess={async () => {
          await queryClient.invalidateQueries({ queryKey: ["employees"] });
          router.push("/dashboard/employees");
        }}
      />
    </div>
  );
}
