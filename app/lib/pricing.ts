import type {
  PriceItem,
  PriceUnit,
  PricingConfig,
  QuoteDetails,
} from "./types";

export const PRICE_UNIT_LABELS: Record<PriceUnit, string> = {
  flat: "Flat",
  per_item: "Each",
  per_room: "Per room",
  per_hour: "Per hour",
  per_sqm: "Per m²",
};

const QTY_UNITS: Record<PriceUnit, string> = {
  flat: "",
  per_item: "item",
  per_room: "room",
  per_hour: "hr",
  per_sqm: "m²",
};

export function formatMoney(value: number) {
  return value.toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

function same(a: string | undefined, b: string | undefined) {
  return (a ?? "").trim().toLowerCase() === (b ?? "").trim().toLowerCase();
}

function asList(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function asCount(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : undefined;
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

/** Price for N bathrooms: exact tier if set, else top tier + each additional. */
export function bathroomPrice(config: PricingConfig, count: number) {
  if (count <= 0) return 0;
  const tiers = [...config.cleaning.bathroomTiers].sort(
    (a, b) => a.count - b.count,
  );
  const exact = tiers.find((tier) => tier.count === count);
  if (exact) return exact.price;
  const below = tiers.filter((tier) => tier.count < count).pop();
  if (below) {
    return (
      below.price + (count - below.count) * config.cleaning.bathroomAdditional
    );
  }
  return count * config.cleaning.bathroomAdditional;
}

export function kitchenPrice(config: PricingConfig, count: number) {
  if (count <= 0) return 0;
  return (
    config.cleaning.kitchenFirst +
    (count - 1) * config.cleaning.kitchenAdditional
  );
}

export type EstimateInput = {
  category: string;
  serviceType: string;
  details: QuoteDetails;
  frequency: string;
  dateFrom: string;
  quoteMode: string;
  callOutAccepted: boolean;
  /** Call-out fee recorded on the quote, if any (falls back to settings). */
  callOutFee?: number | null;
};

export type EstimateOptions = {
  bathrooms?: number;
  kitchens?: number;
  laundry?: boolean;
  addons?: { id: string; qty: number }[];
  publicHoliday?: boolean;
  afterHours?: boolean;
  urgent?: boolean;
  travelKm?: number;
};

export type EstimateLine = { label: string; detail?: string; amount: number };

export type Estimate = {
  lines: EstimateLine[];
  adjustments: EstimateLine[];
  total: number;
  gst: number;
  gstIncluded: boolean;
  callOutCredit: number;
  balance: number;
  deposit: number;
  warnings: string[];
};

/** All add-ons offered for a service category. */
export function addonsFor(
  config: PricingConfig,
  category: string,
): PriceItem[] {
  if (same(category, "Gardening")) return config.gardening.addons;
  if (same(category, "Mowing")) return config.mowing.addons;
  return config.cleaning.addons;
}

/** Quantities implied by the customer's answers, used as editable defaults. */
export function defaultCleaningCounts(details: QuoteDetails) {
  const areas = asList(details.areas);
  return {
    bathrooms:
      asCount(details.bathrooms) ??
      (areas.some((a) => same(a, "Bathroom")) ? 1 : 0),
    kitchens:
      asCount(details.kitchens) ??
      (areas.some((a) => same(a, "Kitchen")) ? 1 : 0),
    laundry: areas.some((a) => same(a, "Laundry")),
  };
}

export function estimateQuote(
  config: PricingConfig,
  input: EstimateInput,
  options: EstimateOptions = {},
): Estimate {
  const lines: EstimateLine[] = [];
  const adjustments: EstimateLine[] = [];
  const warnings: string[] = [];
  const details = input.details ?? {};
  const isMowing = same(input.category, "Mowing");
  const isGardening = same(input.category, "Gardening");

  if (isGardening) {
    const type = config.gardening.types.find((t) =>
      same(t.name, input.serviceType),
    );
    const size = config.gardening.sizes.find((s) =>
      same(s.name, String(details.gardenSize ?? "")),
    );
    if (!type) {
      warnings.push(
        `No gardening rate for "${input.serviceType || "unknown"}".`,
      );
    } else {
      const hours = Math.max(type.minimumHours, size?.estimatedHours ?? 0);
      lines.push({
        label: type.name,
        detail: `${hours} hr × ${formatMoney(type.hourlyRate)}${size ? ` · ${size.name} garden` : ""}`,
        amount: hours * type.hourlyRate,
      });
    }
    asList(details.tasks).forEach((taskName) => {
      const task = config.gardening.tasks.find((t) => same(t.name, taskName));
      if (task?.enabled && task.price > 0) {
        lines.push({ label: task.name, amount: task.price });
      }
    });
  } else if (isMowing) {
    const size = config.mowing.sizes.find((s) =>
      same(s.name, String(details.lawnSize ?? "")),
    );
    if (!size) {
      warnings.push(
        "No lawn size on this request — add a mowing rate manually.",
      );
    } else {
      lines.push({ label: `Lawn mowing (${size.name})`, amount: size.price });
    }
    asList(details.extras).forEach((extraName) => {
      const extra = config.mowing.extras.find((e) => same(e.name, extraName));
      if (extra?.enabled && extra.price > 0) {
        lines.push({ label: extra.name, amount: extra.price });
      }
    });
  } else {
    const type = config.cleaning.types.find((t) =>
      same(t.name, input.serviceType),
    );
    if (!type) {
      warnings.push(
        `No cleaning rate for "${input.serviceType || "unknown"}".`,
      );
    } else {
      lines.push({
        label: type.name,
        detail: `Includes ${type.includedRooms} room${type.includedRooms === 1 ? "" : "s"}`,
        amount: type.basePrice,
      });
      const rooms = asCount(details.rooms) ?? 0;
      const extraRooms = Math.max(0, rooms - type.includedRooms);
      if (extraRooms > 0) {
        lines.push({
          label: "Additional rooms",
          detail: `${extraRooms} × ${formatMoney(type.extraRoomPrice)}`,
          amount: extraRooms * type.extraRoomPrice,
        });
      }
    }

    const defaults = defaultCleaningCounts(details);
    const bathrooms = options.bathrooms ?? defaults.bathrooms;
    const kitchens = options.kitchens ?? defaults.kitchens;
    const laundry = options.laundry ?? defaults.laundry;

    if (bathrooms > 0) {
      lines.push({
        label: `Bathroom${bathrooms === 1 ? "" : "s"}`,
        detail: `${bathrooms} bathroom${bathrooms === 1 ? "" : "s"}`,
        amount: bathroomPrice(config, bathrooms),
      });
    }
    if (kitchens > 0) {
      lines.push({
        label: `Kitchen${kitchens === 1 ? "" : "s"}`,
        detail: `${kitchens} kitchen${kitchens === 1 ? "" : "s"}`,
        amount: kitchenPrice(config, kitchens),
      });
    }
    if (laundry) {
      lines.push({ label: "Laundry", amount: config.cleaning.laundry });
    }

    const property = String(details.property ?? "");
    const adjustment =
      config.cleaning.propertyAdjustments.find((p) => same(p.name, property)) ??
      (property
        ? config.cleaning.propertyAdjustments.find((p) => p.id === "other")
        : undefined);
    if (adjustment && adjustment.adjustPercent !== 0) {
      const base = lines.reduce((sum, line) => sum + line.amount, 0);
      lines.push({
        label: `${property || adjustment.name} adjustment`,
        detail: `${adjustment.adjustPercent > 0 ? "+" : ""}${adjustment.adjustPercent}%`,
        amount: (base * adjustment.adjustPercent) / 100,
      });
    }
  }

  const addonCatalog = addonsFor(config, input.category);
  (options.addons ?? []).forEach(({ id, qty }) => {
    const addon = addonCatalog.find((a) => a.id === id);
    if (!addon || qty <= 0) return;
    const unit = QTY_UNITS[addon.unit];
    lines.push({
      label: addon.name,
      detail:
        addon.unit === "flat"
          ? undefined
          : `${qty} ${unit}${qty === 1 || unit === "m²" ? "" : "s"} × ${formatMoney(addon.price)}`,
      amount: addon.unit === "flat" ? addon.price : qty * addon.price,
    });
  });

  const serviceSubtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  let running = serviceSubtotal;

  const frequency = config.frequencyDiscounts.find((f) =>
    same(f.name, input.frequency),
  );
  if (frequency && frequency.discountPercent > 0) {
    const amount = -(serviceSubtotal * frequency.discountPercent) / 100;
    adjustments.push({
      label: `${frequency.name} discount`,
      detail: `−${frequency.discountPercent}%`,
      amount,
    });
    running += amount;
  }

  const date = input.dateFrom ? new Date(`${input.dateFrom}T00:00:00`) : null;
  const weekend =
    date && !Number.isNaN(date.getTime()) && [0, 6].includes(date.getDay());
  const surchargeBase = running;
  const percentSurcharges: [boolean, string, number][] = [
    [Boolean(weekend), "Weekend rate", config.surcharges.weekendPercent],
    [
      Boolean(options.publicHoliday),
      "Public holiday rate",
      config.surcharges.publicHolidayPercent,
    ],
    [
      Boolean(options.afterHours),
      "After-hours rate",
      config.surcharges.afterHoursPercent,
    ],
  ];
  percentSurcharges.forEach(([applies, label, percent]) => {
    if (!applies || percent <= 0) return;
    const amount = (surchargeBase * percent) / 100;
    adjustments.push({ label, detail: `+${percent}%`, amount });
    running += amount;
  });

  if (options.urgent && config.surcharges.urgentFee > 0) {
    adjustments.push({
      label: "Urgent booking",
      amount: config.surcharges.urgentFee,
    });
    running += config.surcharges.urgentFee;
  }

  const travelKm = options.travelKm ?? 0;
  const chargeableKm = Math.max(0, travelKm - config.surcharges.travelFreeKm);
  if (chargeableKm > 0 && config.surcharges.travelPerKm > 0) {
    const amount = chargeableKm * config.surcharges.travelPerKm;
    adjustments.push({
      label: "Travel",
      detail: `${chargeableKm} km × ${formatMoney(config.surcharges.travelPerKm)}`,
      amount,
    });
    running += amount;
  }

  const minimum = isMowing
    ? Math.max(config.mowing.minimumCharge, config.general.minimumCharge)
    : config.general.minimumCharge;
  if (running > 0 && running < minimum) {
    adjustments.push({
      label: "Minimum charge top-up",
      detail: `Minimum ${formatMoney(minimum)}`,
      amount: minimum - running,
    });
    running = minimum;
  }

  const { gstRegistered, gstRate, pricesIncludeGst, roundTo } = config.general;
  let gst = 0;
  if (gstRegistered && gstRate > 0) {
    if (pricesIncludeGst) {
      gst = (running * gstRate) / (100 + gstRate);
    } else {
      gst = (running * gstRate) / 100;
      adjustments.push({ label: "GST", detail: `${gstRate}%`, amount: gst });
      running += gst;
    }
  }

  if (roundTo > 0 && running > 0) {
    const rounded = Math.round(running / roundTo) * roundTo;
    if (Math.abs(rounded - running) >= 0.01) {
      adjustments.push({
        label: "Rounding",
        detail: `Nearest ${formatMoney(roundTo)}`,
        amount: rounded - running,
      });
      running = rounded;
    }
  }

  const total = round2(Math.max(0, running));
  const callOutFee = input.callOutFee ?? config.callOut.amount;
  const { deductible, waiveAbove } = config.callOut;
  const waived = waiveAbove > 0 && total >= waiveAbove;
  const callOutCredit =
    input.quoteMode === "site-visit" &&
    input.callOutAccepted &&
    (deductible || waived)
      ? Math.min(total, callOutFee)
      : 0;

  return {
    lines: lines.map((line) => ({ ...line, amount: round2(line.amount) })),
    adjustments: adjustments.map((line) => ({
      ...line,
      amount: round2(line.amount),
    })),
    total,
    gst: round2(gst),
    gstIncluded: gstRegistered && pricesIncludeGst,
    callOutCredit: round2(callOutCredit),
    balance: round2(total - callOutCredit),
    deposit: round2((total * config.general.depositPercent) / 100),
    warnings,
  };
}
