"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { MRT_PaginationState } from "material-react-table";
import { LuRefreshCw } from "react-icons/lu";
import { listEmployees } from "../../lib/api";
import { toEmployeeRow } from "../../lib/employee-row";
import { EmployeeTable } from "../employee-table";
import {
  emptyEmployeeFilters,
  EmployeeFilters,
  toListParams,
  type EmployeeFilterState,
} from "../employee-filters";

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] =
    useState<EmployeeFilterState>(emptyEmployeeFilters);
  const [debouncedFilters, setDebouncedFilters] =
    useState<EmployeeFilterState>(emptyEmployeeFilters);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedFilters((previous) => {
        const changed = JSON.stringify(previous) !== JSON.stringify(filters);
        if (changed) {
          setPagination((current) =>
            current.pageIndex === 0 ? current : { ...current, pageIndex: 0 },
          );
        }
        return filters;
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [filters]);

  const listParams = useMemo(
    () =>
      toListParams(debouncedFilters, pagination.pageIndex, pagination.pageSize),
    [debouncedFilters, pagination.pageIndex, pagination.pageSize],
  );

  const query = useQuery({
    queryKey: ["employees", listParams],
    queryFn: () => listEmployees(listParams),
    placeholderData: (previous) => previous,
  });

  const rows = useMemo(
    () => (query.data?.data ?? []).map(toEmployeeRow),
    [query.data],
  );

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-zinc-900">Employees</h1>
            <button
              type="button"
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["employees"] })
              }
              disabled={query.isFetching}
              aria-label="Refresh employees"
              title="Refresh"
              className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 disabled:opacity-50"
            >
              <LuRefreshCw
                className={`h-4 w-4 ${query.isFetching ? "animate-spin" : ""}`}
              />
            </button>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Server filters and pagination from the employee list API.
          </p>
        </div>
        <Link
          href="/dashboard/employees/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Create Employee
        </Link>
      </div>

      <EmployeeFilters value={filters} onChange={setFilters} />

      <EmployeeTable
        data={rows}
        totalRowCount={query.data?.total ?? 0}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        isError={query.isError}
        pagination={pagination}
        onPaginationChange={setPagination}
      />
    </div>
  );
}
