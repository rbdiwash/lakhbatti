import type { QuoteDetails, QuoteRecord, QuoteStatus } from "./types";

export const QUOTE_STATUSES: QuoteStatus[] = [
  "NEW",
  "CONTACTED",
  "QUOTED",
  "ACCEPTED",
  "DECLINED",
];

export const QUOTE_STATUS_META: Record<
  QuoteStatus,
  { label: string; hint: string; badge: string; dot: string }
> = {
  NEW: {
    label: "New",
    hint: "Not yet actioned",
    badge: "bg-sky-50 text-sky-800 ring-sky-200",
    dot: "bg-sky-500",
  },
  CONTACTED: {
    label: "Contacted",
    hint: "Customer reached",
    badge: "bg-amber-50 text-amber-800 ring-amber-200",
    dot: "bg-amber-500",
  },
  QUOTED: {
    label: "Quoted",
    hint: "Price sent",
    badge: "bg-indigo-50 text-indigo-800 ring-indigo-200",
    dot: "bg-indigo-500",
  },
  ACCEPTED: {
    label: "Accepted",
    hint: "Won the work",
    badge: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  DECLINED: {
    label: "Declined",
    hint: "Lost or not pursued",
    badge: "bg-zinc-100 text-zinc-600 ring-zinc-200",
    dot: "bg-zinc-400",
  },
};

export function isQuoteStatus(value: unknown): value is QuoteStatus {
  return QUOTE_STATUSES.includes(value as QuoteStatus);
}

export function quoteModeLabel(quote: Pick<QuoteRecord, "quoteMode">) {
  if (quote.quoteMode === "digital") return "Digital quote";
  if (quote.quoteMode === "site-visit") return "On-site visit";
  return "Not specified";
}

export function formatQuoteDate(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatPreferredDates(
  quote: Pick<QuoteRecord, "dateFrom" | "dateTo">,
) {
  const from = formatQuoteDate(quote.dateFrom);
  const to = formatQuoteDate(quote.dateTo);
  if (from && to) return `${from} → ${to}`;
  return from || "Flexible";
}

export function formatRelative(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  if (Number.isNaN(diffMs)) return "";
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatQuoteDate(value);
}

const DETAIL_LABELS: Record<string, string> = {
  property: "Property",
  areas: "Areas",
  rooms: "Rooms",
  tasks: "Tasks",
  gardenSize: "Garden size",
  lawnSize: "Lawn size",
  extras: "Extras",
};

/** Service-specific answers as label/value rows for display. */
export function quoteDetailRows(details: QuoteDetails | null | undefined) {
  return Object.entries(details ?? {}).map(([key, value]) => ({
    label:
      DETAIL_LABELS[key] ??
      key.replace(/([A-Z])/g, " $1").replace(/^\w/, (c) => c.toUpperCase()),
    value: Array.isArray(value)
      ? value.join(", ") || "None"
      : String(value ?? "") || "—",
  }));
}
