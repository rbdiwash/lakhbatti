"use client";

import Link from "next/link";
import { Suspense, use, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getEmployee } from "../../../lib/api";
import { toEmployeeRow } from "../../../lib/employee-row";
import type {
  InvoiceRecord,
  JobRecord,
  PaymentRecord,
} from "../../../lib/types";
import { EmployeeDetailPanel } from "../../employee-detail-panel";
import { JobFormDialog } from "../../job-form-dialog";

type TabId = "details" | "jobs" | "invoices" | "payments";

const TABS: { id: TabId; label: string }[] = [
  { id: "details", label: "Details" },
  { id: "jobs", label: "Assigned jobs" },
  { id: "invoices", label: "Invoices" },
  { id: "payments", label: "Payments" },
];

const JOB_STATUS_CLASS: Record<string, string> = {
  OPEN: "bg-zinc-100 text-zinc-700",
  ASSIGNED: "bg-sky-50 text-sky-800",
  IN_PROGRESS: "bg-amber-50 text-amber-800",
  COMPLETED: "bg-emerald-50 text-emerald-800",
  CANCELLED: "bg-rose-50 text-rose-800",
};

const INVOICE_STATUS_CLASS: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-700",
  SENT: "bg-sky-50 text-sky-800",
  PAID: "bg-emerald-50 text-emerald-800",
  OVERDUE: "bg-rose-50 text-rose-800",
  CANCELLED: "bg-zinc-100 text-zinc-500",
};

const PAYMENT_STATUS_CLASS: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-800",
  COMPLETED: "bg-emerald-50 text-emerald-800",
  FAILED: "bg-rose-50 text-rose-800",
};

function isTab(value: string | null): value is TabId {
  return TABS.some((tab) => tab.id === value);
}

function isPhotoSrc(value: string) {
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusChip({
  value,
  classMap,
}: {
  value: string;
  classMap: Record<string, string>;
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        classMap[value] ?? "bg-zinc-100 text-zinc-700"
      }`}
    >
      {value.replace(/_/g, " ")}
    </span>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-16 text-center">
      <p className="text-base font-semibold text-zinc-800">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-zinc-500">
        {description}
      </p>
    </div>
  );
}

function JobsList({ jobs }: { jobs: JobRecord[] }) {
  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No jobs assigned yet"
        description="Assign a job from this page or the jobs board. Assigned work will show up here with date, suburb, and pay."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-zinc-100 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="px-4 py-3">Job</th>
            <th className="px-4 py-3">When</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Pay</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id} className="border-b border-zinc-50 last:border-0">
              <td className="px-4 py-3">
                <p className="font-medium text-zinc-900">{job.title}</p>
                <p className="text-xs text-zinc-500">{job.category}</p>
              </td>
              <td className="px-4 py-3 text-zinc-700">
                {formatDate(job.scheduledDate)}
                {job.startTime ? (
                  <span className="block text-xs text-zinc-500">
                    {job.startTime}
                    {job.endTime ? `–${job.endTime}` : ""}
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3 text-zinc-700">
                {[job.suburb, job.state, job.postcode]
                  .filter(Boolean)
                  .join(" ") || "—"}
              </td>
              <td className="px-4 py-3 text-zinc-700">{job.payRate || "—"}</td>
              <td className="px-4 py-3">
                <StatusChip value={job.status} classMap={JOB_STATUS_CLASS} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InvoicesList({ invoices }: { invoices: InvoiceRecord[] }) {
  if (invoices.length === 0) {
    return (
      <EmptyState
        title="No invoices yet"
        description="Invoices for this employee will appear here once they are created. The layout is ready — add invoice data when you start billing jobs."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-zinc-100 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="px-4 py-3">Invoice</th>
            <th className="px-4 py-3">Job</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Due</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr
              key={invoice.id}
              className="border-b border-zinc-50 last:border-0"
            >
              <td className="px-4 py-3 font-medium text-zinc-900">
                {invoice.number}
              </td>
              <td className="px-4 py-3 text-zinc-700">
                {invoice.job?.title ?? "—"}
              </td>
              <td className="px-4 py-3 text-zinc-700">{invoice.amount}</td>
              <td className="px-4 py-3 text-zinc-700">
                {formatDate(invoice.dueDate)}
              </td>
              <td className="px-4 py-3">
                <StatusChip
                  value={invoice.status}
                  classMap={INVOICE_STATUS_CLASS}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PaymentsList({ payments }: { payments: PaymentRecord[] }) {
  if (payments.length === 0) {
    return (
      <EmptyState
        title="No payments yet"
        description="Completed and pending payments will list here against invoices. Nothing to show until the first payment is recorded."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-zinc-100 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="px-4 py-3">Paid</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Method</th>
            <th className="px-4 py-3">Invoice</th>
            <th className="px-4 py-3">Reference</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr
              key={payment.id}
              className="border-b border-zinc-50 last:border-0"
            >
              <td className="px-4 py-3 text-zinc-700">
                {formatDate(payment.paidAt)}
              </td>
              <td className="px-4 py-3 font-medium text-zinc-900">
                {payment.amount}
              </td>
              <td className="px-4 py-3 capitalize text-zinc-700">
                {payment.method.replace(/-/g, " ")}
              </td>
              <td className="px-4 py-3 text-zinc-700">
                {payment.invoice?.number ?? "—"}
              </td>
              <td className="px-4 py-3 text-zinc-700">
                {payment.reference || "—"}
              </td>
              <td className="px-4 py-3">
                <StatusChip
                  value={payment.status}
                  classMap={PAYMENT_STATUS_CLASS}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function EmployeeDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-center text-sm text-zinc-500">
          Loading employee…
        </div>
      }
    >
      <EmployeeDetailsContent params={params} />
    </Suspense>
  );
}

function EmployeeDetailsContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: TabId = isTab(tabParam) ? tabParam : "details";

  const [jobOpen, setJobOpen] = useState(false);

  const query = useQuery({
    queryKey: ["employee", id],
    queryFn: () => getEmployee(id),
  });

  const employee = query.data;
  const row = useMemo(
    () => (employee ? toEmployeeRow(employee) : null),
    [employee],
  );

  const jobs = employee?.jobs ?? [];
  const invoices = employee?.invoices ?? [];
  const payments = employee?.payments ?? [];

  function setTab(next: TabId) {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (next === "details") nextParams.delete("tab");
    else nextParams.set("tab", next);
    const queryString = nextParams.toString();
    router.replace(
      queryString
        ? `/dashboard/employees/${id}?${queryString}`
        : `/dashboard/employees/${id}`,
    );
  }

  if (query.isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-center text-sm text-zinc-500">
        Loading employee…
      </div>
    );
  }

  if (query.isError || !employee || !row) {
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

  const photo = employee.profilePhoto?.trim() ?? "";
  const initials =
    `${row.firstName?.[0] ?? ""}${row.lastName?.[0] ?? ""}`.toUpperCase() ||
    "?";

  return (
    <div>
      <Link
        href="/dashboard/employees"
        className="text-sm font-medium text-zinc-500 hover:text-zinc-800"
      >
        ← Employees
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          {photo && isPhotoSrc(photo) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt={row.fullName}
              className="h-16 w-16 rounded-2xl object-cover ring-2 ring-brand-100"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-lg font-bold text-brand-800">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-zinc-900">
                {row.fullName || "Unnamed employee"}
              </h1>
              <StatusChip
                value={row.status}
                classMap={{
                  PENDING: "bg-amber-50 text-amber-800",
                  REVIEWING: "bg-sky-50 text-sky-800",
                  APPROVED: "bg-emerald-50 text-emerald-800",
                  REJECTED: "bg-rose-50 text-rose-800",
                }}
              />
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              {row.email} · {row.phone || "No phone"}
            </p>
            <p className="mt-0.5 text-sm text-zinc-500">
              {[row.suburb, row.state, row.postcode].filter(Boolean).join(" ") ||
                "No location"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/employees/${id}/edit`}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => setJobOpen(true)}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Assign job
          </button>
        </div>
      </div>

      <div className="mt-6 border-b border-zinc-200">
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {TABS.map((item) => {
            const count =
              item.id === "jobs"
                ? jobs.length
                : item.id === "invoices"
                  ? invoices.length
                  : item.id === "payments"
                    ? payments.length
                    : null;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium ${
                  active
                    ? "border-brand-600 text-brand-700"
                    : "border-transparent text-zinc-500 hover:border-zinc-200 hover:text-zinc-800"
                }`}
              >
                {item.label}
                {count === null ? null : (
                  <span className="ml-1.5 rounded-full bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6">
        {tab === "details" ? (
          <EmployeeDetailPanel employee={row} hideSummary />
        ) : null}
        {tab === "jobs" ? <JobsList jobs={jobs} /> : null}
        {tab === "invoices" ? <InvoicesList invoices={invoices} /> : null}
        {tab === "payments" ? <PaymentsList payments={payments} /> : null}
      </div>

      <JobFormDialog
        open={jobOpen}
        employees={[row]}
        preselectedEmployeeId={id}
        onClose={() => setJobOpen(false)}
      />
    </div>
  );
}
