import { describe, expect, it } from "vitest";
import { bathroomPrice, estimateQuote, kitchenPrice } from "../pricing";
import type { PricingConfig } from "../types";

const config: PricingConfig = {
  general: {
    gstRegistered: true,
    gstRate: 10,
    pricesIncludeGst: true,
    minimumCharge: 99,
    roundTo: 0,
    quoteValidityDays: 14,
    depositPercent: 20,
    paymentTermsDays: 7,
    cancellationNoticeHours: 24,
    cancellationFee: 50,
  },
  callOut: {
    enabled: true,
    amount: 49,
    deductible: true,
    waiveAbove: 0,
    notes: "",
  },
  cleaning: {
    types: [
      {
        id: "general",
        name: "General Cleaning",
        basePrice: 120,
        includedRooms: 2,
        extraRoomPrice: 25,
        enabled: true,
      },
    ],
    bathroomTiers: [
      { count: 1, price: 45 },
      { count: 2, price: 80 },
    ],
    bathroomAdditional: 30,
    kitchenFirst: 50,
    kitchenAdditional: 40,
    laundry: 25,
    propertyAdjustments: [
      { id: "house", name: "House", adjustPercent: 0 },
      { id: "office", name: "Office", adjustPercent: 10 },
      { id: "other", name: "Other", adjustPercent: 0 },
    ],
    addons: [
      {
        id: "oven",
        name: "Oven clean",
        price: 60,
        unit: "per_item",
        enabled: true,
      },
      {
        id: "balcony",
        name: "Balcony",
        price: 35,
        unit: "flat",
        enabled: true,
      },
    ],
  },
  gardening: {
    types: [
      {
        id: "light",
        name: "Light Gardening",
        hourlyRate: 60,
        minimumHours: 2,
        enabled: true,
      },
    ],
    sizes: [{ id: "large", name: "Large", estimatedHours: 5 }],
    tasks: [
      {
        id: "hedge",
        name: "Hedge trimming",
        price: 40,
        unit: "flat",
        enabled: true,
      },
    ],
    addons: [],
  },
  mowing: {
    sizes: [{ id: "small", name: "Small", price: 50 }],
    extras: [
      { id: "edging", name: "Edging", price: 10, unit: "flat", enabled: true },
    ],
    addons: [],
    minimumCharge: 50,
  },
  frequencyDiscounts: [
    { id: "one-off", name: "One-off", discountPercent: 0 },
    { id: "weekly", name: "Weekly", discountPercent: 10 },
  ],
  surcharges: {
    weekendPercent: 20,
    publicHolidayPercent: 50,
    afterHoursPercent: 20,
    urgentFee: 40,
    travelFreeKm: 15,
    travelPerKm: 2,
  },
};

const cleaning = {
  category: "Cleaning",
  serviceType: "General Cleaning",
  details: { property: "House", areas: ["Bathroom", "Kitchen"], rooms: 3 },
  frequency: "One-off",
  dateFrom: "2026-09-23", // Wednesday
  quoteMode: "digital",
  callOutAccepted: false,
};

describe("bathroomPrice / kitchenPrice", () => {
  it("uses exact tiers, then top tier plus each additional", () => {
    expect(bathroomPrice(config, 0)).toBe(0);
    expect(bathroomPrice(config, 1)).toBe(45);
    expect(bathroomPrice(config, 2)).toBe(80);
    expect(bathroomPrice(config, 4)).toBe(80 + 2 * 30);
  });

  it("charges first kitchen then additional ones", () => {
    expect(kitchenPrice(config, 1)).toBe(50);
    expect(kitchenPrice(config, 3)).toBe(50 + 2 * 40);
  });
});

describe("estimateQuote", () => {
  it("prices a cleaning request from its answers", () => {
    const estimate = estimateQuote(config, cleaning);
    // base 120 + 1 extra room 25 + bathroom 45 + kitchen 50
    expect(estimate.total).toBe(240);
    expect(estimate.gstIncluded).toBe(true);
    expect(estimate.gst).toBeCloseTo(240 / 11, 2);
    expect(estimate.deposit).toBe(48);
    expect(estimate.warnings).toEqual([]);
  });

  it("applies admin overrides, add-ons and property adjustment", () => {
    const estimate = estimateQuote(
      config,
      { ...cleaning, details: { ...cleaning.details, property: "Office" } },
      {
        bathrooms: 2,
        laundry: true,
        addons: [
          { id: "oven", qty: 2 },
          { id: "balcony", qty: 5 },
        ],
      },
    );
    // 120 + 25 + 80 + 50 + 25 = 300, +10% office = 330, + oven 120 + balcony 35 (flat)
    expect(estimate.total).toBe(485);
  });

  it("discounts recurring work and adds weekend + travel surcharges", () => {
    const estimate = estimateQuote(
      config,
      { ...cleaning, frequency: "Weekly", dateFrom: "2026-09-26" }, // Saturday
      { travelKm: 20 },
    );
    // 240 − 10% = 216, +20% weekend = 259.2, + 5 km × $2 = 269.2
    expect(estimate.total).toBe(269.2);
    expect(estimate.adjustments.map((a) => a.label)).toEqual([
      "Weekly discount",
      "Weekend rate",
      "Travel",
    ]);
  });

  it("adds GST on top when prices exclude GST, then rounds", () => {
    const estimate = estimateQuote(
      {
        ...config,
        general: { ...config.general, pricesIncludeGst: false, roundTo: 5 },
      },
      cleaning,
    );
    // 240 + 24 GST = 264 → rounds to 265
    expect(estimate.total).toBe(265);
    expect(estimate.gst).toBe(24);
  });

  it("tops up to the minimum charge", () => {
    const estimate = estimateQuote(config, {
      ...cleaning,
      category: "Mowing",
      serviceType: "Lawn Mowing",
      details: { lawnSize: "Small", extras: ["Edging"] },
    });
    expect(estimate.total).toBe(99);
  });

  it("prices gardening by hours and tasks", () => {
    const estimate = estimateQuote(config, {
      ...cleaning,
      category: "Gardening",
      serviceType: "Light Gardening",
      details: { gardenSize: "Large", tasks: ["Hedge trimming", "Weeding"] },
    });
    expect(estimate.total).toBe(5 * 60 + 40);
  });

  it("credits the call-out fee on accepted site visits", () => {
    const estimate = estimateQuote(config, {
      ...cleaning,
      quoteMode: "site-visit",
      callOutAccepted: true,
      callOutFee: 49,
    });
    expect(estimate.callOutCredit).toBe(49);
    expect(estimate.balance).toBe(191);
  });

  it("warns when the service has no rate", () => {
    const estimate = estimateQuote(config, {
      ...cleaning,
      serviceType: "Carpet",
    });
    expect(estimate.warnings).toHaveLength(1);
  });
});
