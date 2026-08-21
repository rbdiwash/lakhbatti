"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_PaginationState,
  type MRT_Row,
} from "material-react-table";
import { deleteEmployee } from "../lib/api";
import {
  labelPreferredDaysShort,
  labelUrgency,
  labelVisaStatus,
  labelWorkType,
} from "../lib/labels";
import type { EmployeeRow, RegistrationStatus } from "../lib/types";
import { JobFormDialog } from "./job-form-dialog";

const yesNo = (value: boolean) => (value ? "Yes" : "No");
const BOTTOM_GAP = 24;

const STATUS_STYLES: Record<RegistrationStatus, string> = {
  PENDING: "bg-amber-50 text-amber-800 ring-amber-200",
  REVIEWING: "bg-sky-50 text-sky-800 ring-sky-200",
  APPROVED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  REJECTED: "bg-rose-50 text-rose-800 ring-rose-200",
};

function StatusBadge({ status }: { status: RegistrationStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        STATUS_STYLES[status] ?? "bg-zinc-100 text-zinc-700 ring-zinc-200"
      }`}
    >
      {status}
    </span>
  );
}

type Props = {
  data: EmployeeRow[];
  totalRowCount: number;
  isLoading: boolean;
  isError: boolean;
  isFetching?: boolean;
  pagination: MRT_PaginationState;
  onPaginationChange: (
    updater:
      | MRT_PaginationState
      | ((old: MRT_PaginationState) => MRT_PaginationState),
  ) => void;
};

function RowActionsMenu({
  row,
  deletePending,
  onDetails,
  onEdit,
  onAssignJob,
  onDelete,
}: {
  row: MRT_Row<EmployeeRow>;
  deletePending: boolean;
  onDetails: () => void;
  onEdit: () => void;
  onAssignJob: () => void;
  onDelete: () => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  function closeMenu() {
    setAnchorEl(null);
  }

  return (
    <>
      <IconButton
        aria-label={`Actions for ${row.original.fullName || "employee"}`}
        aria-controls={open ? `employee-actions-${row.id}` : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        size="small"
        onClick={(event) => {
          event.stopPropagation();
          setAnchorEl(event.currentTarget);
        }}
        sx={{
          color: "rgb(82 82 91)",
          transition: "background-color 120ms ease, color 120ms ease",
          "&:hover": {
            backgroundColor: "rgba(58, 175, 169, 0.12)",
            color: "#2e948f",
          },
          ...(open
            ? {
                backgroundColor: "rgba(58, 175, 169, 0.16)",
                color: "#2e948f",
              }
            : {}),
        }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        id={`employee-actions-${row.id}`}
        anchorEl={anchorEl}
        open={open}
        onClose={closeMenu}
        onClick={(event) => event.stopPropagation()}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 160,
              borderRadius: 2,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            closeMenu();
            onDetails();
          }}
        >
          <ListItemText>Details</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            closeMenu();
            onEdit();
          }}
        >
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            closeMenu();
            onAssignJob();
          }}
        >
          <ListItemText>Assign job</ListItemText>
        </MenuItem>
        <MenuItem
          disabled={deletePending}
          onClick={() => {
            closeMenu();
            onDelete();
          }}
          sx={{ color: "rgb(185 28 28)" }}
        >
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

export function EmployeeTable({
  data,
  totalRowCount,
  isLoading,
  isError,
  isFetching = false,
  pagination,
  onPaginationChange,
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [jobEmployeeId, setJobEmployeeId] = useState<string | undefined>();
  const [jobOpen, setJobOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setTableHeight] = useState<number>();

  useEffect(() => {
    function updateHeight() {
      const el = containerRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      setTableHeight(Math.max(320, window.innerHeight - top - BOTTOM_GAP));
    }

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [isLoading, isFetching]);

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  const columns = useMemo<MRT_ColumnDef<EmployeeRow>[]>(
    () => [
      { accessorKey: "fullName", header: "Name", size: 180 },
      { accessorKey: "email", header: "Email", size: 220 },
      { accessorKey: "phone", header: "Phone", size: 140 },
      { accessorKey: "state", header: "State", size: 90 },
      { accessorKey: "postcode", header: "Postcode", size: 100 },
      {
        accessorKey: "status",
        header: "Status",
        size: 130,
        Cell: ({ cell }) => (
          <StatusBadge status={cell.getValue<RegistrationStatus>()} />
        ),
      },
      {
        accessorKey: "workType",
        header: "Work type",
        Cell: ({ cell }) => labelWorkType(cell.getValue<string>()),
      },
      {
        accessorKey: "visaStatus",
        header: "Visa",
        Cell: ({ cell }) => labelVisaStatus(cell.getValue<string>()),
      },
      { accessorKey: "gender", header: "Gender" },
      {
        accessorKey: "preferredDays",
        header: "Preferred days",
        Cell: ({ row }) =>
          labelPreferredDaysShort(row.original.raw.preferredDays),
      },
      { accessorKey: "preferredTimeSlots", header: "Time slots" },
      {
        accessorKey: "urgency",
        header: "Urgency",
        Cell: ({ cell }) => labelUrgency(cell.getValue<string>()),
      },
      { accessorKey: "expectedPayRate", header: "Pay rate" },
      {
        id: "willingToTravel",
        header: "Travel",
        accessorFn: (row) => yesNo(row.willingToTravel),
      },
      {
        id: "hasDriverLicense",
        header: "Licence",
        accessorFn: (row) => yesNo(row.hasDriverLicense),
      },
      { accessorKey: "maxTravelKm", header: "Max km" },
      {
        id: "hasPoliceCheck",
        header: "Police check",
        accessorFn: (row) => yesNo(row.hasPoliceCheck),
      },
      {
        id: "hasWorkingWithChildren",
        header: "WWC",
        accessorFn: (row) => yesNo(row.hasWorkingWithChildren),
      },
      {
        id: "hasPublicLiability",
        header: "Insurance",
        accessorFn: (row) => yesNo(row.hasPublicLiability),
      },
      {
        id: "hasCovidVaccination",
        header: "COVID vax",
        accessorFn: (row) => yesNo(row.hasCovidVaccination),
      },
      { accessorKey: "certifications", header: "Certifications" },
      { accessorKey: "machinesHandled", header: "Machines" },
      { accessorKey: "specialisations", header: "Specialisations" },
      { accessorKey: "yearsExperience", header: "Experience" },
      { accessorKey: "jobsCount", header: "Jobs", size: 80 },
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data,
    rowCount: totalRowCount,
    manualPagination: true,
    manualFiltering: true,
    enableColumnFilters: false,
    enableGlobalFilter: false,
    enableFacetedValues: false,
    enableSorting: true,
    enableColumnOrdering: true,
    enableColumnPinning: true,
    enableHiding: true,
    enableDensityToggle: true,
    enableFullScreenToggle: true,
    enableExpanding: false,
    enableRowActions: true,
    positionActionsColumn: "first",
    onPaginationChange,
    state: {
      isLoading,
      showAlertBanner: isError,
      showProgressBars: isFetching || deleteMutation.isPending,
      pagination,
      columnPinning: {
        left: ["mrt-row-actions"],
      },
    },
    initialState: {
      density: "compact",
      columnPinning: {
        left: ["mrt-row-actions"],
      },
      columnVisibility: {
        gender: false,
        preferredTimeSlots: false,
        maxTravelKm: false,
        hasCovidVaccination: false,
        machinesHandled: false,
        specialisations: false,
      },
    },
    displayColumnDefOptions: {
      "mrt-row-actions": {
        header: "Actions",
        size: 56,
        grow: false,
      },
    },
    muiTablePaperProps: {
      sx: {
        display: "flex",
        flexDirection: "column",
        minHeight: tableHeight ? `${tableHeight}px` : "calc(100dvh - 12rem)",
        height: tableHeight ? `${tableHeight}px` : "calc(100dvh - 12rem)",
      },
    },
    muiTableContainerProps: {
      sx: { flex: "1 1 auto" },
    },
    muiToolbarAlertBannerProps: isError
      ? { color: "error", children: "Could not load employees." }
      : undefined,
    renderRowActions: ({ row }) => (
      <RowActionsMenu
        row={row}
        deletePending={deleteMutation.isPending}
        onDetails={() => router.push(`/dashboard/employees/${row.original.id}`)}
        onEdit={() => {
          router.push(`/dashboard/employees/${row.original.id}/edit`);
        }}
        onAssignJob={() => {
          setJobEmployeeId(row.original.id);
          setJobOpen(true);
        }}
        onDelete={() => {
          const name = row.original.fullName || row.original.email;
          if (!window.confirm(`Delete ${name}? This cannot be undone.`)) {
            return;
          }
          deleteMutation.mutate(row.original.id);
        }}
      />
    ),
  });

  return (
    <div ref={containerRef}>
      <MaterialReactTable table={table} />
      <JobFormDialog
        open={jobOpen}
        employees={data}
        preselectedEmployeeId={jobEmployeeId}
        onClose={() => {
          setJobOpen(false);
          setJobEmployeeId(undefined);
        }}
      />
    </div>
  );
}
