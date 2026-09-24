"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LuPlus, LuRotateCcw, LuTrash2, LuTriangleAlert } from "react-icons/lu";
import { getDefaultPricing, getPricing, updatePricing } from "../../lib/api";
import {
  PRICE_UNIT_LABELS,
  bathroomPrice,
  formatMoney,
  type EstimateInput,
} from "../../lib/pricing";
import type {
  PriceItem,
  PriceUnit,
  PricingConfig,
  PricingSettings,
  QuoteDetails,
} from "../../lib/types";
import { EstimateBuilder } from "../estimate-builder";

// ─── Shared draft ────────────────────────────────────────────────────────────
// Every pricing tab edits one shared draft, so switching tabs keeps edits and
// a single save bar persists the whole config.

type Updater = (mutate: (draft: PricingConfig) => void) => void;

type PricingContextValue = {
  query: ReturnType<typeof useQuery<PricingSettings>>;
  draft: PricingConfig | null;
  update: Updater;
  replaceSection: <K extends keyof PricingConfig>(
    key: K,
    value: PricingConfig[K],
  ) => void;
  dirty: boolean;
  discard: () => void;
  save: () => void;
  saving: boolean;
  message: { tone: "ok" | "error"; text: string } | null;
};

const PricingContext = createContext<PricingContextValue | null>(null);

function usePricingDraft() {
  const value = useContext(PricingContext);
  if (!value) throw new Error("usePricingDraft must be inside PricingProvider");
  return value;
}

function hasInvalidNumber(value: unknown): boolean {
  if (typeof value === "number") return !Number.isFinite(value);
  if (Array.isArray(value)) return value.some(hasInvalidNumber);
  if (value && typeof value === "object") {
    return Object.values(value).some(hasInvalidNumber);
  }
  return false;
}

function hasBlankAddon(config: PricingConfig) {
  return [
    ...config.cleaning.addons,
    ...config.gardening.addons,
    ...config.mowing.addons,
  ].some((item) => !item.name.trim());
}

export function PricingProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["settings", "pricing"],
    queryFn: getPricing,
    retry: false,
  });
  const server = query.data?.config ?? null;
  const [draft, setDraft] = useState<PricingConfig | null>(null);
  const [message, setMessage] = useState<PricingContextValue["message"]>(null);

  // Seed the draft once the config first arrives (never clobber local edits).
  if (draft === null && server) setDraft(server);

  const dirty = Boolean(
    draft && server && JSON.stringify(draft) !== JSON.stringify(server),
  );

  const mutation = useMutation({
    mutationFn: updatePricing,
    onSuccess: (saved) => {
      queryClient.setQueryData(["settings", "pricing"], saved);
      setDraft(saved.config);
      setMessage({ tone: "ok", text: "Pricing saved." });
    },
    onError: () =>
      setMessage({ tone: "error", text: "Could not save pricing. Try again." }),
  });

  useEffect(() => {
    if (!dirty) return;
    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const value: PricingContextValue = {
    query,
    draft,
    dirty,
    saving: mutation.isPending,
    message,
    update: (mutate) => {
      setMessage(null);
      setDraft((current) => {
        if (!current) return current;
        const next = structuredClone(current);
        mutate(next);
        return next;
      });
    },
    replaceSection: (key, section) => {
      setMessage(null);
      setDraft((current) =>
        current ? { ...current, [key]: section } : current,
      );
    },
    discard: () => {
      setMessage(null);
      if (server) setDraft(server);
    },
    save: () => {
      if (!draft) return;
      if (hasInvalidNumber(draft)) {
        setMessage({
          tone: "error",
          text: "Fill in every amount before saving.",
        });
        return;
      }
      if (hasBlankAddon(draft)) {
        setMessage({ tone: "error", text: "Give every add-on a name." });
        return;
      }
      mutation.mutate(draft);
    },
  };

  return (
    <PricingContext.Provider value={value}>{children}</PricingContext.Provider>
  );
}

// ─── Building blocks ─────────────────────────────────────────────────────────

const fieldBase =
  "h-10 w-full rounded-lg border bg-white text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none";

function NumberInput({
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
  min = 0,
  max,
  label,
  className = "",
}: {
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
  label: string;
  className?: string;
}) {
  const invalid = !Number.isFinite(value);
  return (
    <div className={`relative ${className}`}>
      {prefix ? (
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-zinc-400">
          {prefix}
        </span>
      ) : null}
      <input
        type="number"
        inputMode="decimal"
        aria-label={label}
        aria-invalid={invalid || undefined}
        value={invalid ? "" : value}
        min={min}
        max={max}
        step={step}
        onChange={(e) =>
          onChange(e.target.value === "" ? NaN : Number(e.target.value))
        }
        className={`${fieldBase} ${prefix ? "pl-7" : "pl-3"} ${suffix ? "pr-12" : "pr-3"} tabular-nums ${
          invalid ? "border-rose-300" : "border-zinc-200"
        }`}
      />
      {suffix ? (
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-zinc-400">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-zinc-600">{label}</p>
      <div className="mt-1.5">{children}</div>
      {hint ? <p className="mt-1 text-xs text-zinc-400">{hint}</p> : null}
    </div>
  );
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
        checked ? "bg-brand-600" : "bg-zinc-200"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function SwitchRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-zinc-800">{label}</p>
        {description ? (
          <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
        ) : null}
      </div>
      <Switch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

function Section({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-100 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function TableHead({ columns }: { columns: string[] }) {
  return (
    <thead>
      <tr className="text-left text-[11px] font-semibold tracking-wide text-zinc-400 uppercase">
        {columns.map((column, i) => (
          <th
            key={i}
            scope="col"
            className="px-2 pb-2 font-semibold first:pl-0"
          >
            {column}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function newItemId() {
  return `custom-${Math.random().toString(36).slice(2, 10)}`;
}

function PriceItemsTable({
  items,
  onChange,
  fixed = false,
  addLabel = "Add item",
}: {
  items: PriceItem[];
  onChange: (items: PriceItem[]) => void;
  /** Rows mirror public form options — names are locked, no add/remove. */
  fixed?: boolean;
  addLabel?: string;
}) {
  function patch(index: number, change: Partial<PriceItem>) {
    onChange(
      items.map((item, i) => (i === index ? { ...item, ...change } : item)),
    );
  }

  return (
    <div>
      <div className="-mx-1 overflow-x-auto px-1">
        <table className="w-full min-w-[520px]">
          <TableHead
            columns={[
              "Item",
              "Charged",
              "Price",
              "Active",
              ...(fixed ? [] : [""]),
            ]}
          />
          <tbody className="align-middle">
            {items.map((item, index) => (
              <tr key={item.id} className={item.enabled ? "" : "opacity-60"}>
                <td className="py-1.5 pr-2">
                  {fixed ? (
                    <span className="text-sm font-medium text-zinc-800">
                      {item.name}
                    </span>
                  ) : (
                    <input
                      aria-label="Item name"
                      value={item.name}
                      onChange={(e) => patch(index, { name: e.target.value })}
                      placeholder="e.g. Oven clean"
                      className={`${fieldBase} px-3 ${
                        item.name.trim() ? "border-zinc-200" : "border-rose-300"
                      }`}
                    />
                  )}
                </td>
                <td className="w-36 px-2 py-1.5">
                  <select
                    aria-label={`${item.name || "Item"} unit`}
                    value={item.unit}
                    onChange={(e) =>
                      patch(index, { unit: e.target.value as PriceUnit })
                    }
                    className={`${fieldBase} cursor-pointer border-zinc-200 px-2`}
                  >
                    {(Object.keys(PRICE_UNIT_LABELS) as PriceUnit[]).map(
                      (unit) => (
                        <option key={unit} value={unit}>
                          {PRICE_UNIT_LABELS[unit]}
                        </option>
                      ),
                    )}
                  </select>
                </td>
                <td className="w-32 px-2 py-1.5">
                  <NumberInput
                    label={`${item.name || "Item"} price`}
                    prefix="$"
                    value={item.price}
                    step={0.5}
                    onChange={(price) => patch(index, { price })}
                  />
                </td>
                <td className="w-16 px-2 py-1.5">
                  <Switch
                    label={`${item.name || "Item"} active`}
                    checked={item.enabled}
                    onChange={(enabled) => patch(index, { enabled })}
                  />
                </td>
                {fixed ? null : (
                  <td className="w-10 py-1.5 pl-2">
                    <button
                      type="button"
                      aria-label={`Remove ${item.name || "item"}`}
                      onClick={() =>
                        onChange(items.filter((_, i) => i !== index))
                      }
                      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-zinc-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <LuTrash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {items.length === 0 ? (
        <p className="py-4 text-sm text-zinc-500">No items yet.</p>
      ) : null}
      {fixed ? null : (
        <button
          type="button"
          onClick={() =>
            onChange([
              ...items,
              {
                id: newItemId(),
                name: "",
                price: 0,
                unit: "flat",
                enabled: true,
              },
            ])
          }
          className="mt-3 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-zinc-300 px-3 text-sm font-medium text-zinc-600 hover:border-brand-400 hover:text-brand-700"
        >
          <LuPlus className="h-4 w-4" aria-hidden />
          {addLabel}
        </button>
      )}
    </div>
  );
}

function ResetButton({ sections }: { sections: (keyof PricingConfig)[] }) {
  const { replaceSection } = usePricingDraft();
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          const defaults = await getDefaultPricing();
          sections.forEach((key) => replaceSection(key, defaults[key]));
        } finally {
          setPending(false);
        }
      }}
      className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 disabled:opacity-60"
    >
      <LuRotateCcw className="h-4 w-4" aria-hidden />
      Reset to defaults
    </button>
  );
}

function SaveBar() {
  const { dirty, discard, save, saving, message } = usePricingDraft();
  if (!dirty && !message) return null;
  return (
    <div className="sticky bottom-4 z-10 mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
        <p
          role="status"
          className={`text-sm ${
            message?.tone === "error"
              ? "text-rose-700"
              : message
                ? "text-emerald-700"
                : "text-zinc-600"
          }`}
        >
          {message?.text ?? "You have unsaved pricing changes."}
        </p>
        {dirty ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={discard}
              disabled={saving}
              className="h-10 cursor-pointer rounded-lg px-3.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="h-10 cursor-pointer rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save pricing"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Loading / error states + save bar around every pricing tab. */
function PricingTab({
  children,
}: {
  children: (draft: PricingConfig, update: Updater) => React.ReactNode;
}) {
  const { query, draft, update } = usePricingDraft();
  if (query.isError) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <LuTriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
        <div>
          <p className="font-medium">Could not load pricing.</p>
          <p className="mt-1 text-amber-800">
            Check the API server is running and the pricing migration has been
            applied (<code>npm run db:migrate</code>).
          </p>
          <button
            type="button"
            onClick={() => query.refetch()}
            className="mt-3 cursor-pointer font-semibold underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="space-y-4">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-2xl border border-zinc-200 bg-white"
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-5">{children(draft, update)}</div>
      <SaveBar />
    </div>
  );
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

export function PricingGeneralSettings() {
  return (
    <PricingTab>
      {(draft, update) => {
        const g = draft.general;
        return (
          <>
            <Section
              title="Tax"
              description="How GST is applied to quotes and invoices."
              action={<ResetButton sections={["general"]} />}
            >
              <div className="divide-y divide-zinc-100">
                <SwitchRow
                  label="Registered for GST"
                  description="Add or include GST on customer quotes."
                  checked={g.gstRegistered}
                  onChange={(v) =>
                    update((d) => void (d.general.gstRegistered = v))
                  }
                />
                {g.gstRegistered ? (
                  <SwitchRow
                    label="Prices include GST"
                    description={
                      g.pricesIncludeGst
                        ? "Rates below are GST-inclusive — the quote shows the GST component."
                        : "Rates below are ex-GST — GST is added on top of the quote."
                    }
                    checked={g.pricesIncludeGst}
                    onChange={(v) =>
                      update((d) => void (d.general.pricesIncludeGst = v))
                    }
                  />
                ) : null}
              </div>
              {g.gstRegistered ? (
                <div className="mt-3 grid gap-4 sm:grid-cols-3">
                  <Field label="GST rate">
                    <NumberInput
                      label="GST rate"
                      suffix="%"
                      max={100}
                      value={g.gstRate}
                      onChange={(v) =>
                        update((d) => void (d.general.gstRate = v))
                      }
                    />
                  </Field>
                </div>
              ) : null}
            </Section>

            <Section
              title="Quote rules"
              description="Applied to every estimate."
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <Field
                  label="Minimum job charge"
                  hint="Smaller jobs are topped up."
                >
                  <NumberInput
                    label="Minimum job charge"
                    prefix="$"
                    value={g.minimumCharge}
                    onChange={(v) =>
                      update((d) => void (d.general.minimumCharge = v))
                    }
                  />
                </Field>
                <Field
                  label="Round totals to"
                  hint="Nearest amount; 0 = no rounding."
                >
                  <NumberInput
                    label="Round totals to"
                    prefix="$"
                    value={g.roundTo}
                    onChange={(v) =>
                      update((d) => void (d.general.roundTo = v))
                    }
                  />
                </Field>
                <Field label="Quote valid for">
                  <NumberInput
                    label="Quote validity"
                    suffix="days"
                    value={g.quoteValidityDays}
                    onChange={(v) =>
                      update((d) => void (d.general.quoteValidityDays = v))
                    }
                  />
                </Field>
              </div>
            </Section>

            <Section
              title="Payment & cancellation"
              description="Terms quoted to customers."
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Deposit" hint="0 = no deposit.">
                  <NumberInput
                    label="Deposit"
                    suffix="%"
                    max={100}
                    value={g.depositPercent}
                    onChange={(v) =>
                      update((d) => void (d.general.depositPercent = v))
                    }
                  />
                </Field>
                <Field label="Payment terms">
                  <NumberInput
                    label="Payment terms"
                    suffix="days"
                    value={g.paymentTermsDays}
                    onChange={(v) =>
                      update((d) => void (d.general.paymentTermsDays = v))
                    }
                  />
                </Field>
                <Field label="Cancellation notice">
                  <NumberInput
                    label="Cancellation notice"
                    suffix="hrs"
                    value={g.cancellationNoticeHours}
                    onChange={(v) =>
                      update(
                        (d) => void (d.general.cancellationNoticeHours = v),
                      )
                    }
                  />
                </Field>
                <Field label="Late cancellation fee">
                  <NumberInput
                    label="Late cancellation fee"
                    prefix="$"
                    value={g.cancellationFee}
                    onChange={(v) =>
                      update((d) => void (d.general.cancellationFee = v))
                    }
                  />
                </Field>
              </div>
            </Section>
          </>
        );
      }}
    </PricingTab>
  );
}

export function PricingCallOutSettings() {
  return (
    <PricingTab>
      {(draft, update) => {
        const c = draft.callOut;
        const fee = formatMoney(Number.isFinite(c.amount) ? c.amount : 0);
        return (
          <>
            <Section
              title="On-site quote visits"
              description="Charged when a customer books an in-person quote instead of sending photos."
              action={<ResetButton sections={["callOut"]} />}
            >
              <div className="divide-y divide-zinc-100">
                <SwitchRow
                  label="Charge a call-out fee"
                  description="When off, on-site quote visits are free."
                  checked={c.enabled}
                  onChange={(v) => update((d) => void (d.callOut.enabled = v))}
                />
                {c.enabled ? (
                  <SwitchRow
                    label="Deduct from the final invoice"
                    description="Credit the fee back when the customer books the job."
                    checked={c.deductible}
                    onChange={(v) =>
                      update((d) => void (d.callOut.deductible = v))
                    }
                  />
                ) : null}
              </div>
              {c.enabled ? (
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <Field label="Call-out fee">
                    <NumberInput
                      label="Call-out fee"
                      prefix="$"
                      value={c.amount}
                      onChange={(v) =>
                        update((d) => void (d.callOut.amount = v))
                      }
                    />
                  </Field>
                  <Field
                    label="Waive when job is at least"
                    hint="Credit the fee on bigger jobs; 0 = never."
                  >
                    <NumberInput
                      label="Waive threshold"
                      prefix="$"
                      value={c.waiveAbove}
                      onChange={(v) =>
                        update((d) => void (d.callOut.waiveAbove = v))
                      }
                    />
                  </Field>
                </div>
              ) : null}
              <div className="mt-4">
                <Field label="Internal notes">
                  <textarea
                    rows={3}
                    value={c.notes}
                    onChange={(e) =>
                      update((d) => void (d.callOut.notes = e.target.value))
                    }
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                  />
                </Field>
              </div>
            </Section>

            <Section
              title="What customers see"
              description="Preview of the on-site option on the website quote form."
            >
              <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-4">
                <p className="text-sm font-semibold text-zinc-900">
                  On-site visit
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  {c.enabled && c.amount > 0
                    ? `We'll come to the property. A ${fee} call-out fee applies${
                        c.deductible
                          ? " and is deducted from your final invoice"
                          : ""
                      }.`
                    : "We'll come to the property to quote — free of charge."}
                </p>
              </div>
            </Section>
          </>
        );
      }}
    </PricingTab>
  );
}

export function PricingCleaningSettings() {
  return (
    <PricingTab>
      {(draft, update) => {
        const cl = draft.cleaning;
        const tierPreview = [1, 2, 3, 4, 5]
          .map((n) => {
            const price = bathroomPrice(draft, n);
            return `${n} bath${n === 1 ? "" : "s"} ${
              Number.isFinite(price) ? formatMoney(price) : "—"
            }`;
          })
          .join(" · ");
        return (
          <>
            <Section
              title="Service rates"
              description="Base price per cleaning type, including a set number of rooms."
              action={<ResetButton sections={["cleaning"]} />}
            >
              <div className="-mx-1 overflow-x-auto px-1">
                <table className="w-full min-w-[560px]">
                  <TableHead
                    columns={[
                      "Service",
                      "Base price",
                      "Rooms included",
                      "Each extra room",
                      "Active",
                    ]}
                  />
                  <tbody>
                    {cl.types.map((type, i) => (
                      <tr
                        key={type.id}
                        className={type.enabled ? "" : "opacity-60"}
                      >
                        <td className="py-1.5 pr-2 text-sm font-medium text-zinc-800">
                          {type.name}
                        </td>
                        <td className="w-32 px-2 py-1.5">
                          <NumberInput
                            label={`${type.name} base price`}
                            prefix="$"
                            value={type.basePrice}
                            onChange={(v) =>
                              update(
                                (d) => void (d.cleaning.types[i].basePrice = v),
                              )
                            }
                          />
                        </td>
                        <td className="w-32 px-2 py-1.5">
                          <NumberInput
                            label={`${type.name} rooms included`}
                            value={type.includedRooms}
                            onChange={(v) =>
                              update(
                                (d) =>
                                  void (d.cleaning.types[i].includedRooms = v),
                              )
                            }
                          />
                        </td>
                        <td className="w-32 px-2 py-1.5">
                          <NumberInput
                            label={`${type.name} extra room price`}
                            prefix="$"
                            value={type.extraRoomPrice}
                            onChange={(v) =>
                              update(
                                (d) =>
                                  void (d.cleaning.types[i].extraRoomPrice = v),
                              )
                            }
                          />
                        </td>
                        <td className="w-16 px-2 py-1.5">
                          <Switch
                            label={`${type.name} active`}
                            checked={type.enabled}
                            onChange={(v) =>
                              update(
                                (d) => void (d.cleaning.types[i].enabled = v),
                              )
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section
              title="Bathrooms"
              description="Set a price for each bathroom count. Counts above your highest tier add the extra-bathroom rate."
            >
              <div className="grid gap-5 lg:grid-cols-[1fr_220px]">
                <div>
                  <table className="w-full">
                    <TableHead columns={["Bathrooms", "Price", ""]} />
                    <tbody>
                      {cl.bathroomTiers.map((tier, i) => (
                        <tr key={i}>
                          <td className="w-32 py-1.5 pr-2">
                            <NumberInput
                              label="Bathroom count"
                              min={1}
                              suffix={tier.count === 1 ? "bath" : "baths"}
                              value={tier.count}
                              onChange={(v) =>
                                update(
                                  (d) =>
                                    void (d.cleaning.bathroomTiers[i].count =
                                      v),
                                )
                              }
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <NumberInput
                              label={`Price for ${tier.count} bathrooms`}
                              prefix="$"
                              value={tier.price}
                              onChange={(v) =>
                                update(
                                  (d) =>
                                    void (d.cleaning.bathroomTiers[i].price =
                                      v),
                                )
                              }
                            />
                          </td>
                          <td className="w-10 py-1.5 pl-2">
                            <button
                              type="button"
                              aria-label={`Remove ${tier.count} bathroom tier`}
                              onClick={() =>
                                update(
                                  (d) =>
                                    void d.cleaning.bathroomTiers.splice(i, 1),
                                )
                              }
                              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-zinc-400 hover:bg-rose-50 hover:text-rose-600"
                            >
                              <LuTrash2 className="h-4 w-4" aria-hidden />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    type="button"
                    onClick={() =>
                      update((d) => {
                        const tiers = d.cleaning.bathroomTiers;
                        const last = tiers[tiers.length - 1];
                        tiers.push({
                          count: (last?.count ?? 0) + 1,
                          price:
                            (last?.price ?? 0) +
                            (d.cleaning.bathroomAdditional || 0),
                        });
                      })
                    }
                    className="mt-3 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-zinc-300 px-3 text-sm font-medium text-zinc-600 hover:border-brand-400 hover:text-brand-700"
                  >
                    <LuPlus className="h-4 w-4" aria-hidden />
                    Add tier
                  </button>
                </div>
                <Field
                  label="Each extra bathroom"
                  hint="Beyond the highest tier."
                >
                  <NumberInput
                    label="Each extra bathroom"
                    prefix="$"
                    value={cl.bathroomAdditional}
                    onChange={(v) =>
                      update((d) => void (d.cleaning.bathroomAdditional = v))
                    }
                  />
                </Field>
              </div>
              <p className="mt-4 rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
                {tierPreview}
              </p>
            </Section>

            <Section title="Kitchen & laundry">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Kitchen">
                  <NumberInput
                    label="Kitchen"
                    prefix="$"
                    value={cl.kitchenFirst}
                    onChange={(v) =>
                      update((d) => void (d.cleaning.kitchenFirst = v))
                    }
                  />
                </Field>
                <Field
                  label="Each extra kitchen"
                  hint="e.g. granny flat, kitchenette."
                >
                  <NumberInput
                    label="Each extra kitchen"
                    prefix="$"
                    value={cl.kitchenAdditional}
                    onChange={(v) =>
                      update((d) => void (d.cleaning.kitchenAdditional = v))
                    }
                  />
                </Field>
                <Field label="Laundry">
                  <NumberInput
                    label="Laundry"
                    prefix="$"
                    value={cl.laundry}
                    onChange={(v) =>
                      update((d) => void (d.cleaning.laundry = v))
                    }
                  />
                </Field>
              </div>
            </Section>

            <Section
              title="Property type adjustment"
              description="Percentage added to (or taken off) the cleaning price by property type."
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cl.propertyAdjustments.map((adj, i) => (
                  <Field key={adj.id} label={adj.name}>
                    <NumberInput
                      label={`${adj.name} adjustment`}
                      suffix="%"
                      min={-100}
                      value={adj.adjustPercent}
                      onChange={(v) =>
                        update(
                          (d) =>
                            void (d.cleaning.propertyAdjustments[
                              i
                            ].adjustPercent = v),
                        )
                      }
                    />
                  </Field>
                ))}
              </div>
            </Section>

            <Section
              title="Cleaning add-ons"
              description="Extras you can add to a quote — ovens, windows, carpets and more."
            >
              <PriceItemsTable
                items={cl.addons}
                addLabel="Add cleaning extra"
                onChange={(items) =>
                  update((d) => void (d.cleaning.addons = items))
                }
              />
            </Section>
          </>
        );
      }}
    </PricingTab>
  );
}

export function PricingGardeningSettings() {
  return (
    <PricingTab>
      {(draft, update) => {
        const ga = draft.gardening;
        return (
          <>
            <Section
              title="Hourly rates"
              description="Gardening is estimated as hourly rate × the larger of the minimum hours or the garden-size hours."
              action={<ResetButton sections={["gardening"]} />}
            >
              <div className="-mx-1 overflow-x-auto px-1">
                <table className="w-full min-w-[460px]">
                  <TableHead
                    columns={["Service", "Hourly rate", "Minimum", "Active"]}
                  />
                  <tbody>
                    {ga.types.map((type, i) => (
                      <tr
                        key={type.id}
                        className={type.enabled ? "" : "opacity-60"}
                      >
                        <td className="py-1.5 pr-2 text-sm font-medium text-zinc-800">
                          {type.name}
                        </td>
                        <td className="w-36 px-2 py-1.5">
                          <NumberInput
                            label={`${type.name} hourly rate`}
                            prefix="$"
                            suffix="/hr"
                            value={type.hourlyRate}
                            onChange={(v) =>
                              update(
                                (d) =>
                                  void (d.gardening.types[i].hourlyRate = v),
                              )
                            }
                          />
                        </td>
                        <td className="w-32 px-2 py-1.5">
                          <NumberInput
                            label={`${type.name} minimum hours`}
                            suffix="hrs"
                            step={0.5}
                            value={type.minimumHours}
                            onChange={(v) =>
                              update(
                                (d) =>
                                  void (d.gardening.types[i].minimumHours = v),
                              )
                            }
                          />
                        </td>
                        <td className="w-16 px-2 py-1.5">
                          <Switch
                            label={`${type.name} active`}
                            checked={type.enabled}
                            onChange={(v) =>
                              update(
                                (d) => void (d.gardening.types[i].enabled = v),
                              )
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section
              title="Garden size"
              description="Typical hours for each size."
            >
              <div className="grid gap-4 sm:grid-cols-3">
                {ga.sizes.map((size, i) => (
                  <Field key={size.id} label={size.name}>
                    <NumberInput
                      label={`${size.name} garden hours`}
                      suffix="hrs"
                      step={0.5}
                      value={size.estimatedHours}
                      onChange={(v) =>
                        update(
                          (d) => void (d.gardening.sizes[i].estimatedHours = v),
                        )
                      }
                    />
                  </Field>
                ))}
              </div>
            </Section>

            <Section
              title="Tasks"
              description="Added on top of labour when the customer picks the task."
            >
              <PriceItemsTable
                fixed
                items={ga.tasks}
                onChange={(items) =>
                  update((d) => void (d.gardening.tasks = items))
                }
              />
            </Section>

            <Section
              title="Gardening add-ons"
              description="Disposal, materials and extras."
            >
              <PriceItemsTable
                items={ga.addons}
                addLabel="Add gardening extra"
                onChange={(items) =>
                  update((d) => void (d.gardening.addons = items))
                }
              />
            </Section>
          </>
        );
      }}
    </PricingTab>
  );
}

export function PricingMowingSettings() {
  return (
    <PricingTab>
      {(draft, update) => {
        const mo = draft.mowing;
        return (
          <>
            <Section
              title="Lawn size"
              description="Price per mow."
              action={<ResetButton sections={["mowing"]} />}
            >
              <div className="grid gap-4 sm:grid-cols-4">
                {mo.sizes.map((size, i) => (
                  <Field key={size.id} label={size.name}>
                    <NumberInput
                      label={`${size.name} lawn price`}
                      prefix="$"
                      value={size.price}
                      onChange={(v) =>
                        update((d) => void (d.mowing.sizes[i].price = v))
                      }
                    />
                  </Field>
                ))}
                <Field label="Minimum per visit">
                  <NumberInput
                    label="Mowing minimum per visit"
                    prefix="$"
                    value={mo.minimumCharge}
                    onChange={(v) =>
                      update((d) => void (d.mowing.minimumCharge = v))
                    }
                  />
                </Field>
              </div>
            </Section>

            <Section
              title="Extras"
              description="Options offered on the quote form."
            >
              <PriceItemsTable
                fixed
                items={mo.extras}
                onChange={(items) =>
                  update((d) => void (d.mowing.extras = items))
                }
              />
            </Section>

            <Section title="Lawn care add-ons">
              <PriceItemsTable
                items={mo.addons}
                addLabel="Add lawn care extra"
                onChange={(items) =>
                  update((d) => void (d.mowing.addons = items))
                }
              />
            </Section>
          </>
        );
      }}
    </PricingTab>
  );
}

export function PricingAdjustmentSettings() {
  return (
    <PricingTab>
      {(draft, update) => {
        const su = draft.surcharges;
        return (
          <>
            <Section
              title="Recurring service discounts"
              description="Taken off the service price for regular bookings."
              action={
                <ResetButton sections={["frequencyDiscounts", "surcharges"]} />
              }
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {draft.frequencyDiscounts.map((freq, i) => (
                  <Field key={freq.id} label={freq.name}>
                    <NumberInput
                      label={`${freq.name} discount`}
                      suffix="% off"
                      max={100}
                      value={freq.discountPercent}
                      onChange={(v) =>
                        update(
                          (d) =>
                            void (d.frequencyDiscounts[i].discountPercent = v),
                        )
                      }
                    />
                  </Field>
                ))}
              </div>
            </Section>

            <Section
              title="Time-based surcharges"
              description="Weekend rates apply automatically from the preferred date; others are ticked on the estimate."
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Weekend">
                  <NumberInput
                    label="Weekend surcharge"
                    suffix="%"
                    value={su.weekendPercent}
                    onChange={(v) =>
                      update((d) => void (d.surcharges.weekendPercent = v))
                    }
                  />
                </Field>
                <Field label="Public holiday">
                  <NumberInput
                    label="Public holiday surcharge"
                    suffix="%"
                    value={su.publicHolidayPercent}
                    onChange={(v) =>
                      update(
                        (d) => void (d.surcharges.publicHolidayPercent = v),
                      )
                    }
                  />
                </Field>
                <Field label="After hours">
                  <NumberInput
                    label="After-hours surcharge"
                    suffix="%"
                    value={su.afterHoursPercent}
                    onChange={(v) =>
                      update((d) => void (d.surcharges.afterHoursPercent = v))
                    }
                  />
                </Field>
                <Field label="Urgent (same / next day)">
                  <NumberInput
                    label="Urgent booking fee"
                    prefix="$"
                    value={su.urgentFee}
                    onChange={(v) =>
                      update((d) => void (d.surcharges.urgentFee = v))
                    }
                  />
                </Field>
              </div>
            </Section>

            <Section
              title="Travel"
              description="Charged per km beyond your free service radius."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Free travel radius">
                  <NumberInput
                    label="Free travel radius"
                    suffix="km"
                    value={su.travelFreeKm}
                    onChange={(v) =>
                      update((d) => void (d.surcharges.travelFreeKm = v))
                    }
                  />
                </Field>
                <Field label="Rate beyond radius">
                  <NumberInput
                    label="Travel rate per km"
                    prefix="$"
                    suffix="/km"
                    step={0.1}
                    value={su.travelPerKm}
                    onChange={(v) =>
                      update((d) => void (d.surcharges.travelPerKm = v))
                    }
                  />
                </Field>
              </div>
            </Section>
          </>
        );
      }}
    </PricingTab>
  );
}

// ─── Calculator ──────────────────────────────────────────────────────────────

const selectClass = `${fieldBase} cursor-pointer border-zinc-200 px-3`;

export function PricingCalculator() {
  return (
    <PricingTab>{(draft) => <CalculatorForm config={draft} />}</PricingTab>
  );
}

function CalculatorForm({ config }: { config: PricingConfig }) {
  const [category, setCategory] = useState("Cleaning");
  const [serviceType, setServiceType] = useState("");
  const [property, setProperty] = useState("House");
  const [rooms, setRooms] = useState(3);
  const [gardenSize, setGardenSize] = useState("Medium");
  const [tasks, setTasks] = useState<string[]>([]);
  const [lawnSize, setLawnSize] = useState("Medium");
  const [extras, setExtras] = useState<string[]>([]);
  const [frequency, setFrequency] = useState("One-off");
  const [dateFrom, setDateFrom] = useState("");

  const serviceOptions =
    category === "Gardening"
      ? config.gardening.types.map((t) => t.name)
      : category === "Mowing"
        ? ["Lawn Mowing"]
        : config.cleaning.types.map((t) => t.name);
  const service = serviceOptions.includes(serviceType)
    ? serviceType
    : serviceOptions[0];

  const details: QuoteDetails =
    category === "Gardening"
      ? { gardenSize, tasks }
      : category === "Mowing"
        ? { lawnSize, extras }
        : { property, rooms, areas: ["Bathroom", "Kitchen"] };
  const input: EstimateInput = {
    category,
    serviceType: service,
    details,
    frequency,
    dateFrom,
    quoteMode: "digital",
    callOutAccepted: false,
  };

  function toggle(list: string[], value: string) {
    return list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value];
  }

  return (
    <>
      <Section
        title="Sample job"
        description="Try a job against your current (unsaved) rates to sanity-check pricing."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Service">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={selectClass}
            >
              <option>Cleaning</option>
              <option>Gardening</option>
              <option>Mowing</option>
            </select>
          </Field>
          <Field label="Type">
            <select
              value={service}
              onChange={(e) => setServiceType(e.target.value)}
              className={selectClass}
            >
              {serviceOptions.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </Field>
          <Field label="Frequency">
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className={selectClass}
            >
              {config.frequencyDiscounts.map((f) => (
                <option key={f.id}>{f.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Preferred date">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={`${fieldBase} border-zinc-200 px-3`}
            />
          </Field>

          {category === "Cleaning" ? (
            <>
              <Field label="Property">
                <select
                  value={property}
                  onChange={(e) => setProperty(e.target.value)}
                  className={selectClass}
                >
                  {config.cleaning.propertyAdjustments.map((p) => (
                    <option key={p.id}>{p.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Rooms">
                <NumberInput
                  label="Rooms"
                  min={1}
                  value={rooms}
                  onChange={(v) => setRooms(Number.isFinite(v) ? v : 0)}
                />
              </Field>
            </>
          ) : null}

          {category === "Gardening" ? (
            <Field label="Garden size">
              <select
                value={gardenSize}
                onChange={(e) => setGardenSize(e.target.value)}
                className={selectClass}
              >
                {config.gardening.sizes.map((s) => (
                  <option key={s.id}>{s.name}</option>
                ))}
              </select>
            </Field>
          ) : null}

          {category === "Mowing" ? (
            <Field label="Lawn size">
              <select
                value={lawnSize}
                onChange={(e) => setLawnSize(e.target.value)}
                className={selectClass}
              >
                {config.mowing.sizes.map((s) => (
                  <option key={s.id}>{s.name}</option>
                ))}
              </select>
            </Field>
          ) : null}
        </div>

        {category === "Gardening" || category === "Mowing" ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {(category === "Gardening"
              ? config.gardening.tasks
              : config.mowing.extras
            ).map((item) => {
              const list = category === "Gardening" ? tasks : extras;
              const selected = list.includes(item.name);
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    category === "Gardening"
                      ? setTasks(toggle(tasks, item.name))
                      : setExtras(toggle(extras, item.name))
                  }
                  className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium ${
                    selected
                      ? "border-brand-500 bg-brand-50 text-brand-800"
                      : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
        ) : null}
      </Section>

      <Section title="Estimate">
        <EstimateBuilder key={category} config={config} input={input} />
      </Section>
    </>
  );
}
