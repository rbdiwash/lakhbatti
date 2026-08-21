"use client";

import { useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import type { JobRecord } from "../lib/types";

type Props = {
  data: JobRecord[];
  isLoading: boolean;
  isError: boolean;
};

export function JobsTable({ data, isLoading, isError }: Props) {
  const columns = useMemo<MRT_ColumnDef<JobRecord>[]>(
    () => [
      { accessorKey: "title", header: "Title" },
      { accessorKey: "category", header: "Category", filterVariant: "select" },
      { accessorKey: "status", header: "Status", filterVariant: "select" },
      { accessorKey: "suburb", header: "Suburb", filterVariant: "select" },
      { accessorKey: "postcode", header: "Postcode" },
      { accessorKey: "scheduledDate", header: "Date" },
      { accessorKey: "payRate", header: "Pay rate" },
      {
        id: "employeeName",
        header: "Employee",
        accessorFn: (row) =>
          row.employee
            ? `${row.employee.firstName} ${row.employee.lastName}`
            : "Unassigned",
        filterVariant: "select",
      },
      { accessorKey: "description", header: "Description" },
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data,
    state: { isLoading, showAlertBanner: isError },
    enableColumnFilterModes: true,
    enableColumnFilters: true,
    enableFacetedValues: true,
    enableGlobalFilter: true,
    initialState: {
      density: "compact",
      pagination: { pageIndex: 0, pageSize: 10 },
      showGlobalFilter: true,
      showColumnFilters: true,
    },
    muiToolbarAlertBannerProps: isError
      ? { color: "error", children: "Could not load jobs." }
      : undefined,
  });

  return <MaterialReactTable table={table} />;
}
