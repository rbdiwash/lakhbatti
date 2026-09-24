"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  LuCamera,
  LuChevronRight,
  LuFileText,
  LuMapPin,
  LuRefreshCw,
  LuSearch,
} from "react-icons/lu";
import { listQuotes } from "../../lib/api";
import {
  QUOTE_STATUSES,
  QUOTE_STATUS_META,
  formatPreferredDates,
  formatRelative,
  isQuoteStatus,
  quoteModeLabel,
} from "../../lib/quotes";
import type { QuoteRecord, QuoteStatus } from "../../lib/types";
import { QuoteStatusBadge } from "../quote-status-badge";

const CATEGORIES = ["Cleaning", "Gardening", "Mowing"];

const selectClass =
  "h-10 cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none";

export default function QuotesPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-center text-sm text-zinc-500">
          Loading quotes…
        </div>
      }
    >
      <QuotesContent />
    </Suspense>
  );
}

function ModeCell({ quote }: { quote: QuoteRecord }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-zinc-600">
      {quote.quoteMode === "digital" ? (
        <LuCamera className="h-4 w-4 text-zinc-400" aria-hidden />
      ) : (
        <LuMapPin className="h-4 w-4 text-zinc-400" aria-hidden />
      )}
      {quoteModeLabel(quote)}
      {quote.quoteMode === "digital" && quote.imageCount > 0 ? (
        <span className="text-xs text-zinc-400">· {quote.imageCount}</span>
      ) : null}
    </span>
  );
}

function QuotesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const status: QuoteStatus | "" = isQuoteStatus(statusParam)
    ? statusParam
    : "";

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [mode, setMode] = useState("");

  const quotesQuery = useQuery({
    queryKey: ["quotes"],
    queryFn: () => listQuotes(),
  });
  const quotes = useMemo(() => quotesQuery.data ?? [], [quotesQuery.data]);

  const counts = useMemo(() => {
    const result = { ALL: quotes.length } as Record<
      QuoteStatus | "ALL",
      number
    >;
    QUOTE_STATUSES.forEach((s) => {
      result[s] = quotes.filter((quote) => quote.status === s).length;
    });
    return result;
  }, [quotes]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return quotes.filter((quote) => {
      if (status && quote.status !== status) return false;
      if (category && quote.category !== category) return false;
      if (mode && quote.quoteMode !== mode) return false;
      if (!term) return true;
      return [
        quote.name,
        quote.email,
        quote.phone,
        quote.address,
        quote.serviceType,
        quote.category,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [quotes, status, category, mode, search]);

  function setStatus(next: QuoteStatus | "") {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("status", next);
    else params.delete("status");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  const hasFilters = Boolean(search || category || mode || status);
  const tabs: { id: QuoteStatus | ""; label: string; count: number }[] = [
    { id: "", label: "All", count: counts.ALL },
    ...QUOTE_STATUSES.map((s) => ({
      id: s,
      label: QUOTE_STATUS_META[s].label,
      count: counts[s],
    })),
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Quotes</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Quote requests submitted from the website. Follow up, price, and
            convert them into jobs.
          </p>
        </div>
        <button
          type="button"
          onClick={() => quotesQuery.refetch()}
          disabled={quotesQuery.isFetching}
          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-wait disabled:opacity-70"
        >
          <LuRefreshCw
            className={`h-4 w-4 ${quotesQuery.isFetching ? "animate-spin" : ""}`}
            aria-hidden
          />
          Refresh
        </button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["NEW", "CONTACTED", "QUOTED", "ACCEPTED"] as QuoteStatus[]).map(
          (s) => {
            const meta = QUOTE_STATUS_META[s];
            const active = status === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(active ? "" : s)}
                className={`cursor-pointer rounded-2xl border bg-white p-4 text-left shadow-sm transition-colors ${
                  active
                    ? "border-brand-400 ring-2 ring-brand-100"
                    : "border-zinc-200 hover:border-brand-200"
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                  <span
                    className={`h-2 w-2 rounded-full ${meta.dot}`}
                    aria-hidden
                  />
                  {meta.label}
                </span>
                <span className="mt-2 block text-2xl font-bold tracking-tight text-zinc-900">
                  {quotesQuery.isLoading ? "—" : counts[s]}
                </span>
                <span className="mt-0.5 block text-xs text-zinc-400">
                  {meta.hint}
                </span>
              </button>
            );
          },
        )}
      </div>

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100">
          <div
            role="tablist"
            aria-label="Filter by status"
            className="flex gap-1 overflow-x-auto px-3 pt-3"
          >
            {tabs.map((tab) => {
              const active = status === tab.id;
              return (
                <button
                  key={tab.id || "all"}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStatus(tab.id)}
                  className={`inline-flex shrink-0 cursor-pointer items-center gap-2 border-b-2 px-3 pb-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "border-brand-600 text-brand-800"
                      : "border-transparent text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                      active
                        ? "bg-brand-50 text-brand-700"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-b border-zinc-100 p-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search quotes</span>
            <LuSearch
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone, address…"
              className="h-10 w-full rounded-lg border border-zinc-200 bg-white pr-3 pl-9 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
            />
          </label>
          <div className="flex gap-2">
            <select
              aria-label="Service"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`${selectClass} flex-1 sm:flex-none`}
            >
              <option value="">All services</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              aria-label="Quote type"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className={`${selectClass} flex-1 sm:flex-none`}
            >
              <option value="">All types</option>
              <option value="digital">Digital quote</option>
              <option value="site-visit">On-site visit</option>
            </select>
          </div>
        </div>

        {quotesQuery.isLoading ? (
          <div className="divide-y divide-zinc-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="h-9 w-9 animate-pulse rounded-full bg-zinc-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-40 animate-pulse rounded bg-zinc-100" />
                  <div className="h-3 w-56 animate-pulse rounded bg-zinc-100" />
                </div>
              </div>
            ))}
          </div>
        ) : quotesQuery.isError ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-medium text-zinc-900">
              Could not load quotes.
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Check that the API server is running, then try again.
            </p>
            <button
              type="button"
              onClick={() => quotesQuery.refetch()}
              className="mt-4 cursor-pointer rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <LuFileText className="h-6 w-6" aria-hidden />
            </span>
            <p className="mt-4 text-sm font-medium text-zinc-900">
              {hasFilters ? "No quotes match your filters." : "No quotes yet."}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {hasFilters
                ? "Try a different status, service, or search term."
                : "Requests from the website quote form will appear here."}
            </p>
            {hasFilters ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("");
                  setMode("");
                  setStatus("");
                }}
                className="mt-4 cursor-pointer text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/60 text-xs font-semibold tracking-wide text-zinc-500 uppercase">
                    <th scope="col" className="px-5 py-3">
                      Customer
                    </th>
                    <th scope="col" className="px-5 py-3">
                      Service
                    </th>
                    <th scope="col" className="px-5 py-3">
                      Type
                    </th>
                    <th scope="col" className="px-5 py-3">
                      Preferred
                    </th>
                    <th scope="col" className="px-5 py-3">
                      Received
                    </th>
                    <th scope="col" className="px-5 py-3">
                      Status
                    </th>
                    <th scope="col" className="w-10 px-5 py-3">
                      <span className="sr-only">Open</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filtered.map((quote) => (
                    <tr
                      key={quote.id}
                      onClick={() =>
                        router.push(`/dashboard/quotes/${quote.id}`)
                      }
                      className={`group cursor-pointer transition-colors hover:bg-zinc-50 ${
                        quote.status === "NEW" ? "bg-sky-50/30" : ""
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/dashboard/quotes/${quote.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="block min-w-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                        >
                          <span className="block truncate text-sm font-semibold text-zinc-900">
                            {quote.name}
                          </span>
                          <span className="block truncate text-xs text-zinc-500">
                            {quote.email}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="block text-sm text-zinc-800">
                          {quote.serviceType || quote.category}
                        </span>
                        <span className="block text-xs text-zinc-500">
                          {quote.category}
                          {quote.frequency ? ` · ${quote.frequency}` : ""}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <ModeCell quote={quote} />
                      </td>
                      <td className="px-5 py-3.5 text-sm whitespace-nowrap text-zinc-600">
                        {formatPreferredDates(quote)}
                      </td>
                      <td className="px-5 py-3.5 text-sm whitespace-nowrap text-zinc-500">
                        {formatRelative(quote.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <QuoteStatusBadge status={quote.status} />
                      </td>
                      <td className="px-5 py-3.5 text-zinc-300 group-hover:text-zinc-500">
                        <LuChevronRight className="h-4 w-4" aria-hidden />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <ul className="divide-y divide-zinc-100 md:hidden">
              {filtered.map((quote) => (
                <li key={quote.id}>
                  <Link
                    href={`/dashboard/quotes/${quote.id}`}
                    className="block px-4 py-4 hover:bg-zinc-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-900">
                          {quote.name}
                        </p>
                        <p className="truncate text-xs text-zinc-500">
                          {quote.serviceType || quote.category} ·{" "}
                          {formatRelative(quote.createdAt)}
                        </p>
                      </div>
                      <QuoteStatusBadge status={quote.status} />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <ModeCell quote={quote} />
                      <span className="text-xs text-zinc-500">
                        {formatPreferredDates(quote)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <p className="border-t border-zinc-100 px-5 py-3 text-xs text-zinc-500">
              Showing {filtered.length} of {quotes.length} quote
              {quotes.length === 1 ? "" : "s"}
            </p>
          </>
        )}
      </section>
    </div>
  );
}
