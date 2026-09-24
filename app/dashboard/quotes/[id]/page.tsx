"use client";

import Link from "next/link";
import { Suspense, use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import {
  LuArrowLeft,
  LuBriefcase,
  LuCalendar,
  LuCamera,
  LuChevronLeft,
  LuChevronRight,
  LuCircleCheck,
  LuMail,
  LuMapPin,
  LuPhone,
  LuRepeat,
  LuTrash2,
  LuX,
} from "react-icons/lu";
import {
  convertQuoteToJob,
  deleteQuote,
  getPricing,
  getQuote,
  updateQuote,
} from "../../../lib/api";
import { formatMoney } from "../../../lib/pricing";
import {
  QUOTE_STATUSES,
  QUOTE_STATUS_META,
  formatPreferredDates,
  formatQuoteDate,
  quoteDetailRows,
  quoteModeLabel,
} from "../../../lib/quotes";
import type { QuoteDetailRecord, QuoteStatus } from "../../../lib/types";
import { EstimateBuilder } from "../../estimate-builder";
import { QuoteStatusBadge } from "../../quote-status-badge";

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none";

function errorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) return error.response?.data?.message ?? fallback;
  return fallback;
}

export default function QuoteDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-center text-sm text-zinc-500">
          Loading quote…
        </div>
      }
    >
      <QuoteDetailsContent params={params} />
    </Suspense>
  );
}

function Card({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-zinc-500">{label}</dt>
      <dd className="mt-1 text-sm text-zinc-900">{value || "—"}</dd>
    </div>
  );
}

function QuoteDetailsContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const quoteQuery = useQuery({
    queryKey: ["quote", id],
    queryFn: () => getQuote(id),
  });
  const quote = quoteQuery.data;
  const pricingQuery = useQuery({
    queryKey: ["settings", "pricing"],
    queryFn: getPricing,
    retry: false,
  });

  const [lightbox, setLightbox] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [flash, setFlash] = useState("");

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(""), 2500);
    return () => clearTimeout(timer);
  }, [flash]);

  function onSaved(updated: QuoteDetailRecord, message: string) {
    queryClient.setQueryData(["quote", id], updated);
    queryClient.invalidateQueries({ queryKey: ["quotes"] });
    setFlash(message);
  }

  const quickStatusMutation = useMutation({
    mutationFn: (next: QuoteStatus) => updateQuote(id, { status: next }),
    onSuccess: (updated) =>
      onSaved(updated, `Marked as ${QUOTE_STATUS_META[updated.status].label}`),
  });

  const applyEstimateMutation = useMutation({
    mutationFn: (total: number) =>
      updateQuote(id, {
        quotedAmount: total.toFixed(2).replace(/\.00$/, ""),
        ...(quote?.status === "NEW" || quote?.status === "CONTACTED"
          ? { status: "QUOTED" as const }
          : {}),
      }),
    onSuccess: (updated) => onSaved(updated, "Estimate set as quoted amount"),
  });

  const convertMutation = useMutation({
    mutationFn: () => convertQuoteToJob(id),
    onSuccess: (updated) => {
      onSaved(updated, "Job created");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteQuote(id),
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: ["quote", id] });
      await queryClient.invalidateQueries({ queryKey: ["quotes"] });
      router.push("/dashboard/quotes");
    },
  });

  useEffect(() => {
    if (lightbox === null || !quote) return;
    const total = quote.images.length;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setLightbox(null);
      if (event.key === "ArrowRight")
        setLightbox((i) => (i === null ? i : (i + 1) % total));
      if (event.key === "ArrowLeft")
        setLightbox((i) => (i === null ? i : (i - 1 + total) % total));
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightbox, quote]);

  if (quoteQuery.isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-center text-sm text-zinc-500">
        Loading quote…
      </div>
    );
  }

  if (quoteQuery.isError || !quote) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-center">
        <p className="text-sm font-medium text-zinc-900">
          {isAxiosError(quoteQuery.error) &&
          quoteQuery.error.response?.status === 404
            ? "This quote no longer exists."
            : "Could not load this quote."}
        </p>
        <Link
          href="/dashboard/quotes"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          <LuArrowLeft className="h-4 w-4" aria-hidden />
          Back to quotes
        </Link>
      </div>
    );
  }

  const detailRows = quoteDetailRows(quote.details);
  const ratesTab = ["gardening", "mowing"].includes(
    quote.category.toLowerCase(),
  )
    ? quote.category.toLowerCase()
    : "cleaning";
  const mailSubject = encodeURIComponent(
    `Your ${quote.serviceType || quote.category} quote — Lakhbatti`,
  );
  const nextStep: QuoteStatus | null =
    quote.status === "NEW"
      ? "CONTACTED"
      : quote.status === "CONTACTED"
        ? "QUOTED"
        : null;
  const actionError =
    (quickStatusMutation.isError &&
      errorMessage(quickStatusMutation.error, "Could not update status.")) ||
    (applyEstimateMutation.isError &&
      errorMessage(applyEstimateMutation.error, "Could not apply estimate.")) ||
    (convertMutation.isError &&
      errorMessage(convertMutation.error, "Could not create job.")) ||
    (deleteMutation.isError &&
      errorMessage(deleteMutation.error, "Could not delete quote.")) ||
    "";

  return (
    <div>
      <Link
        href="/dashboard/quotes"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900"
      >
        <LuArrowLeft className="h-4 w-4" aria-hidden />
        All quotes
      </Link>

      <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="truncate text-2xl font-bold text-zinc-900">
              {quote.name}
            </h1>
            <QuoteStatusBadge status={quote.status} />
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            {quote.serviceType || quote.category} · {quoteModeLabel(quote)} ·
            Received{" "}
            {new Date(quote.createdAt).toLocaleString("en-AU", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href={`mailto:${quote.email}?subject=${mailSubject}`}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            <LuMail className="h-4 w-4" aria-hidden />
            Email
          </a>
          {quote.phone ? (
            <a
              href={`tel:${quote.phone.replace(/\s+/g, "")}`}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              <LuPhone className="h-4 w-4" aria-hidden />
              Call
            </a>
          ) : null}
          {nextStep ? (
            <button
              type="button"
              disabled={quickStatusMutation.isPending}
              onClick={() => quickStatusMutation.mutate(nextStep)}
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-60"
            >
              <LuCircleCheck className="h-4 w-4" aria-hidden />
              Mark {QUOTE_STATUS_META[nextStep].label.toLowerCase()}
            </button>
          ) : null}
          {quote.job ? null : (
            <button
              type="button"
              disabled={convertMutation.isPending}
              onClick={() => convertMutation.mutate()}
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-brand-600 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
            >
              <LuBriefcase className="h-4 w-4" aria-hidden />
              {convertMutation.isPending ? "Creating…" : "Convert to job"}
            </button>
          )}
        </div>
      </div>

      {actionError ? (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {actionError}
        </p>
      ) : null}

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card title="Request">
            <dl className="grid gap-5 sm:grid-cols-2">
              <Field label="Service" value={quote.category} />
              <Field label="Type" value={quote.serviceType} />
              {detailRows.map((row) => (
                <Field key={row.label} label={row.label} value={row.value} />
              ))}
            </dl>
          </Card>

          <Card
            title="Price estimate"
            action={
              <Link
                href={`/dashboard/settings?tab=${ratesTab}`}
                className="text-xs font-semibold text-brand-700 hover:text-brand-800"
              >
                Edit rates
              </Link>
            }
          >
            {pricingQuery.data ? (
              <EstimateBuilder
                config={pricingQuery.data.config}
                input={quote}
                action={(estimate) => {
                  const current = Number(quote.quotedAmount);
                  const applied =
                    Number.isFinite(current) && current === estimate.total;
                  return (
                    <button
                      type="button"
                      disabled={
                        applied ||
                        estimate.total <= 0 ||
                        applyEstimateMutation.isPending
                      }
                      onClick={() =>
                        applyEstimateMutation.mutate(estimate.total)
                      }
                      className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
                    >
                      {applied
                        ? "Quoted at this amount"
                        : applyEstimateMutation.isPending
                          ? "Saving…"
                          : `Use ${formatMoney(estimate.total)} as quoted amount`}
                    </button>
                  );
                }}
              />
            ) : pricingQuery.isError ? (
              <p className="text-sm text-zinc-500">
                Pricing isn&apos;t set up yet.{" "}
                <Link
                  href="/dashboard/settings?tab=cleaning"
                  className="font-semibold text-brand-700 hover:text-brand-800"
                >
                  Configure rates
                </Link>{" "}
                to get suggested prices.
              </p>
            ) : (
              <div className="h-40 animate-pulse rounded-xl bg-zinc-50" />
            )}
          </Card>

          <Card title="Schedule">
            <dl className="grid gap-5 sm:grid-cols-3">
              <Field
                label="Preferred dates"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <LuCalendar className="h-4 w-4 text-zinc-400" aria-hidden />
                    {formatPreferredDates(quote)}
                  </span>
                }
              />
              <Field
                label="Frequency"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <LuRepeat className="h-4 w-4 text-zinc-400" aria-hidden />
                    {quote.frequency || "One-off"}
                  </span>
                }
              />
              <Field label="Quote type" value={quoteModeLabel(quote)} />
            </dl>
            {quote.quoteMode === "site-visit" ? (
              <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 text-sm text-brand-900">
                On-site visit requested
                {quote.callOutFee != null
                  ? ` · $${quote.callOutFee} call-out fee`
                  : ""}{" "}
                ·{" "}
                {quote.callOutAccepted
                  ? "customer accepted the fee"
                  : "fee not yet accepted"}
              </div>
            ) : null}
          </Card>

          {quote.quoteMode === "digital" ? (
            <Card
              title="Photos"
              action={
                <span className="text-xs text-zinc-500">
                  {quote.images.length} uploaded
                </span>
              }
            >
              {quote.images.length === 0 ? (
                <p className="flex items-center gap-2 text-sm text-zinc-500">
                  <LuCamera className="h-4 w-4" aria-hidden />
                  No photos were saved with this request.
                </p>
              ) : (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {quote.images.map((src, index) => (
                    <li key={index}>
                      <button
                        type="button"
                        onClick={() => setLightbox(index)}
                        className="block w-full cursor-zoom-in overflow-hidden rounded-xl border border-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={`Photo ${index + 1} from ${quote.name}`}
                          className="aspect-square w-full object-cover transition-transform hover:scale-105"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ) : null}

          <Card title="Customer">
            <dl className="grid gap-5 sm:grid-cols-2">
              <Field label="Name" value={quote.name} />
              <Field
                label="Email"
                value={
                  <a
                    href={`mailto:${quote.email}`}
                    className="text-brand-700 hover:underline"
                  >
                    {quote.email}
                  </a>
                }
              />
              <Field
                label="Phone"
                value={
                  quote.phone ? (
                    <a
                      href={`tel:${quote.phone.replace(/\s+/g, "")}`}
                      className="text-brand-700 hover:underline"
                    >
                      {quote.phone}
                    </a>
                  ) : null
                }
              />
              <Field
                label="Address"
                value={
                  quote.address ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(quote.address)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-start gap-1.5 text-brand-700 hover:underline"
                    >
                      <LuMapPin
                        className="mt-0.5 h-4 w-4 shrink-0"
                        aria-hidden
                      />
                      {quote.address}
                    </a>
                  ) : null
                }
              />
            </dl>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Manage">
            <ManageForm
              key={quote.updatedAt}
              quote={quote}
              flash={flash}
              onSaved={(updated) => onSaved(updated, "Changes saved")}
            />
          </Card>

          <Card title="Linked job">
            {quote.job ? (
              <div>
                <p className="text-sm font-medium text-zinc-900">
                  {quote.job.title}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Status: {quote.job.status.toLowerCase().replace(/_/g, " ")}
                </p>
                <Link
                  href="/dashboard/jobs"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
                >
                  Open jobs
                  <LuChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            ) : (
              <p className="text-sm text-zinc-500">
                Not converted yet. Use <strong>Convert to job</strong> once the
                customer accepts, then assign an employee from Jobs.
              </p>
            )}
          </Card>

          <section className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-rose-800">
              Delete quote
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Permanently removes this request and its photos.
            </p>
            {confirmDelete ? (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate()}
                  className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-rose-600 px-3.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                >
                  {deleteMutation.isPending ? "Deleting…" : "Yes, delete"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="h-10 cursor-pointer rounded-lg px-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="mt-3 inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-rose-200 px-3.5 text-sm font-semibold text-rose-700 hover:bg-rose-50"
              >
                <LuTrash2 className="h-4 w-4" aria-hidden />
                Delete
              </button>
            )}
          </section>

          <p className="px-1 text-xs text-zinc-400">
            Last updated {formatQuoteDate(quote.updatedAt)}
          </p>
        </div>
      </div>

      {lightbox !== null && quote.images[lightbox] ? (
        <div
          role="dialog"
          aria-modal
          aria-label="Photo viewer"
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/85 p-4"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={quote.images[lightbox]}
            alt={`Photo ${lightbox + 1} from ${quote.name}`}
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            aria-label="Close"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <LuX className="h-5 w-5" aria-hidden />
          </button>
          {quote.images.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox(
                    (lightbox - 1 + quote.images.length) % quote.images.length,
                  );
                }}
                className="absolute left-4 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <LuChevronLeft className="h-5 w-5" aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((lightbox + 1) % quote.images.length);
                }}
                className="absolute right-4 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <LuChevronRight className="h-5 w-5" aria-hidden />
              </button>
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
                {lightbox + 1} / {quote.images.length}
              </p>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** Keyed by `updatedAt`, so it re-initialises from the server after each save. */
function ManageForm({
  quote,
  flash,
  onSaved,
}: {
  quote: QuoteDetailRecord;
  flash: string;
  onSaved: (updated: QuoteDetailRecord) => void;
}) {
  const [status, setStatus] = useState<QuoteStatus>(quote.status);
  const [quotedAmount, setQuotedAmount] = useState(quote.quotedAmount);
  const [adminNotes, setAdminNotes] = useState(quote.adminNotes);

  const saveMutation = useMutation({
    mutationFn: () =>
      updateQuote(quote.id, { status, quotedAmount, adminNotes }),
    onSuccess: onSaved,
  });

  const dirty =
    status !== quote.status ||
    quotedAmount !== quote.quotedAmount ||
    adminNotes !== quote.adminNotes;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        saveMutation.mutate();
      }}
      className="space-y-5"
    >
      <fieldset>
        <legend className="text-xs font-medium text-zinc-500">Status</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {QUOTE_STATUSES.map((s) => {
            const meta = QUOTE_STATUS_META[s];
            const selected = status === s;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={selected}
                onClick={() => setStatus(s)}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors ${
                  selected
                    ? "border-brand-500 bg-brand-50 text-brand-800"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${meta.dot}`}
                  aria-hidden
                />
                {meta.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="quotedAmount"
          className="text-xs font-medium text-zinc-500"
        >
          Quoted amount
        </label>
        <div className="relative mt-1.5">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-zinc-400">
            $
          </span>
          <input
            id="quotedAmount"
            inputMode="decimal"
            value={quotedAmount}
            onChange={(e) => setQuotedAmount(e.target.value)}
            placeholder="e.g. 250"
            className={`${inputClass} pl-7`}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="adminNotes"
          className="text-xs font-medium text-zinc-500"
        >
          Internal notes
        </label>
        <textarea
          id="adminNotes"
          rows={5}
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Call notes, follow-up reminders, pricing breakdown…"
          className={`${inputClass} mt-1.5 resize-y`}
        />
        <p className="mt-1 text-xs text-zinc-400">Only visible to admins.</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!dirty || saveMutation.isPending}
          className="inline-flex h-10 flex-1 cursor-pointer items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
        >
          {saveMutation.isPending ? "Saving…" : "Save changes"}
        </button>
        {dirty ? (
          <button
            type="button"
            onClick={() => {
              setStatus(quote.status);
              setQuotedAmount(quote.quotedAmount);
              setAdminNotes(quote.adminNotes);
            }}
            className="h-10 cursor-pointer rounded-lg px-3 text-sm font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
          >
            Reset
          </button>
        ) : null}
      </div>
      {flash ? (
        <p
          role="status"
          className="flex items-center gap-1.5 text-sm text-emerald-700"
        >
          <LuCircleCheck className="h-4 w-4" aria-hidden />
          {flash}
        </p>
      ) : null}
      {saveMutation.isError ? (
        <p role="alert" className="text-sm text-rose-700">
          {errorMessage(saveMutation.error, "Could not save changes.")}
        </p>
      ) : null}
    </form>
  );
}
