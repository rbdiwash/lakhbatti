"use client";

import { useMemo, useState } from "react";
import { LuMinus, LuPlus, LuTriangleAlert, LuX } from "react-icons/lu";
import {
  PRICE_UNIT_LABELS,
  addonsFor,
  defaultCleaningCounts,
  estimateQuote,
  formatMoney,
  type Estimate,
  type EstimateInput,
  type EstimateOptions,
} from "../lib/pricing";
import type { PricingConfig } from "../lib/types";

function Counter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const btn =
    "flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 px-3 py-1.5">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={`Fewer ${label.toLowerCase()}`}
          disabled={value <= 0}
          onClick={() => onChange(Math.max(0, value - 1))}
          className={btn}
        >
          <LuMinus className="h-4 w-4" aria-hidden />
        </button>
        <span className="w-6 text-center text-sm font-semibold text-zinc-900 tabular-nums">
          {value}
        </span>
        <button
          type="button"
          aria-label={`More ${label.toLowerCase()}`}
          onClick={() => onChange(Math.min(20, value + 1))}
          className={btn}
        >
          <LuPlus className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        selected
          ? "border-brand-500 bg-brand-50 text-brand-800"
          : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
      }`}
    >
      {label}
    </button>
  );
}

function Row({
  label,
  detail,
  amount,
  muted,
}: {
  label: string;
  detail?: string;
  amount: number;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <div className="min-w-0">
        <span
          className={`text-sm ${muted ? "text-zinc-500" : "text-zinc-800"}`}
        >
          {label}
        </span>
        {detail ? (
          <span className="ml-2 text-xs text-zinc-400">{detail}</span>
        ) : null}
      </div>
      <span
        className={`shrink-0 text-sm tabular-nums ${
          amount < 0
            ? "text-emerald-700"
            : muted
              ? "text-zinc-500"
              : "text-zinc-900"
        }`}
      >
        {amount < 0 ? `−${formatMoney(-amount)}` : formatMoney(amount)}
      </span>
    </div>
  );
}

/**
 * Interactive price estimate: auto-priced from the request, with admin
 * adjustments (room counts, add-ons, surcharges) layered on top.
 */
export function EstimateBuilder({
  config,
  input,
  action,
}: {
  config: PricingConfig;
  input: EstimateInput;
  action?: (estimate: Estimate) => React.ReactNode;
}) {
  const [options, setOptions] = useState<EstimateOptions>({});
  const [addonPick, setAddonPick] = useState("");

  const isCleaning = !["Gardening", "Mowing"].includes(input.category);
  const defaults = defaultCleaningCounts(input.details ?? {});
  const catalog = addonsFor(config, input.category).filter((a) => a.enabled);
  const chosen = options.addons ?? [];

  const estimate = useMemo(
    () => estimateQuote(config, input, options),
    [config, input, options],
  );

  function set<K extends keyof EstimateOptions>(
    key: K,
    value: EstimateOptions[K],
  ) {
    setOptions((current) => ({ ...current, [key]: value }));
  }

  function setAddonQty(id: string, qty: number) {
    set(
      "addons",
      chosen.map((a) => (a.id === id ? { ...a, qty: Math.max(1, qty) } : a)),
    );
  }

  const serviceSubtotal = estimate.lines.reduce(
    (sum, line) => sum + line.amount,
    0,
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        {isCleaning ? (
          <div>
            <p className="text-xs font-medium text-zinc-500">Rooms to price</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <Counter
                label="Bathrooms"
                value={options.bathrooms ?? defaults.bathrooms}
                onChange={(v) => set("bathrooms", v)}
              />
              <Counter
                label="Kitchens"
                value={options.kitchens ?? defaults.kitchens}
                onChange={(v) => set("kitchens", v)}
              />
            </div>
            <div className="mt-2">
              <Chip
                label="Laundry"
                selected={options.laundry ?? defaults.laundry}
                onClick={() =>
                  set("laundry", !(options.laundry ?? defaults.laundry))
                }
              />
            </div>
          </div>
        ) : null}

        <div>
          <p className="text-xs font-medium text-zinc-500">Add-ons</p>
          {chosen.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {chosen.map(({ id, qty }) => {
                const addon = catalog.find((a) => a.id === id);
                if (!addon) return null;
                return (
                  <li
                    key={id}
                    className="flex items-center gap-2 rounded-xl border border-zinc-200 py-1.5 pr-1.5 pl-3"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm text-zinc-800">
                      {addon.name}
                      <span className="ml-1.5 text-xs text-zinc-400">
                        {formatMoney(addon.price)}{" "}
                        {PRICE_UNIT_LABELS[addon.unit].toLowerCase()}
                      </span>
                    </span>
                    {addon.unit === "flat" ? null : (
                      <input
                        type="number"
                        min={1}
                        aria-label={`${addon.name} quantity`}
                        value={qty}
                        onChange={(e) =>
                          setAddonQty(id, Number(e.target.value) || 1)
                        }
                        className="h-8 w-16 rounded-lg border border-zinc-200 px-2 text-sm tabular-nums focus:border-brand-500 focus:outline-none"
                      />
                    )}
                    <button
                      type="button"
                      aria-label={`Remove ${addon.name}`}
                      onClick={() =>
                        set(
                          "addons",
                          chosen.filter((a) => a.id !== id),
                        )
                      }
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                    >
                      <LuX className="h-4 w-4" aria-hidden />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
          <select
            aria-label="Add an extra"
            value={addonPick}
            onChange={(e) => {
              const id = e.target.value;
              setAddonPick("");
              if (id && !chosen.some((a) => a.id === id)) {
                set("addons", [...chosen, { id, qty: 1 }]);
              }
            }}
            className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-dashed border-zinc-300 bg-white px-3 text-sm text-zinc-600 focus:border-brand-500 focus:outline-none"
          >
            <option value="">+ Add an extra…</option>
            {catalog
              .filter((a) => !chosen.some((c) => c.id === a.id))
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — {formatMoney(a.price)}{" "}
                  {PRICE_UNIT_LABELS[a.unit].toLowerCase()}
                </option>
              ))}
          </select>
        </div>

        <div>
          <p className="text-xs font-medium text-zinc-500">Conditions</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Chip
              label="Public holiday"
              selected={Boolean(options.publicHoliday)}
              onClick={() => set("publicHoliday", !options.publicHoliday)}
            />
            <Chip
              label="After hours"
              selected={Boolean(options.afterHours)}
              onClick={() => set("afterHours", !options.afterHours)}
            />
            <Chip
              label="Urgent"
              selected={Boolean(options.urgent)}
              onClick={() => set("urgent", !options.urgent)}
            />
          </div>
          <label className="mt-3 flex items-center gap-3 text-sm text-zinc-700">
            Travel distance
            <span className="relative">
              <input
                type="number"
                min={0}
                value={options.travelKm ?? ""}
                placeholder="0"
                onChange={(e) =>
                  set(
                    "travelKm",
                    e.target.value === "" ? undefined : Number(e.target.value),
                  )
                }
                className="h-9 w-28 rounded-lg border border-zinc-200 pr-9 pl-3 text-sm tabular-nums focus:border-brand-500 focus:outline-none"
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-zinc-400">
                km
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="rounded-2xl bg-zinc-50 p-4">
        {estimate.warnings.map((warning) => (
          <p
            key={warning}
            className="mb-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800"
          >
            <LuTriangleAlert
              className="mt-0.5 h-3.5 w-3.5 shrink-0"
              aria-hidden
            />
            {warning}
          </p>
        ))}
        <div className="divide-y divide-zinc-200/70">
          <div className="pb-2">
            {estimate.lines.map((line, i) => (
              <Row key={i} {...line} />
            ))}
          </div>
          {estimate.adjustments.length > 0 ? (
            <div className="py-2">
              <Row label="Service subtotal" amount={serviceSubtotal} muted />
              {estimate.adjustments.map((line, i) => (
                <Row key={i} {...line} />
              ))}
            </div>
          ) : null}
          <div className="pt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-zinc-900">Total</span>
              <span className="text-2xl font-bold text-zinc-900 tabular-nums">
                {formatMoney(estimate.total)}
              </span>
            </div>
            {estimate.gstIncluded && estimate.gst > 0 ? (
              <p className="mt-0.5 text-right text-xs text-zinc-500">
                Includes {formatMoney(estimate.gst)} GST
              </p>
            ) : null}
            {estimate.callOutCredit > 0 ? (
              <div className="mt-2">
                <Row
                  label="Less call-out fee paid"
                  amount={-estimate.callOutCredit}
                />
                <Row label="Balance due" amount={estimate.balance} />
              </div>
            ) : null}
            {estimate.deposit > 0 ? (
              <p className="mt-2 text-xs text-zinc-500">
                Deposit to confirm: {formatMoney(estimate.deposit)}
              </p>
            ) : null}
          </div>
        </div>
        {action ? <div className="mt-4">{action(estimate)}</div> : null}
      </div>
    </div>
  );
}
