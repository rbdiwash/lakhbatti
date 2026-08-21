"use client";

import { useMemo, useState } from "react";
import { useRegistration } from "../context";
import {
  Field,
  Input,
  SectionDivider,
  Select,
  StepHeading,
  ToggleRow,
} from "../ui";
import { StepNav } from "../wizard";
import type {
  DayOfWeek,
  TimeRange,
  TimeSlot,
  UrgencyLevel,
  WorkType,
} from "../../lib/types";
import {
  DAY_OPTIONS,
  URGENCY_OPTIONS,
  WORK_TYPE_OPTIONS,
} from "../../lib/labels";

const WORK_TYPES = WORK_TYPE_OPTIONS;
const ALL_DAYS = DAY_OPTIONS.map((d) => d.value);
const DAY_LABELS = Object.fromEntries(
  DAY_OPTIONS.map((d) => [d.value, d.label]),
) as Record<DayOfWeek, string>;

type Errors = Partial<
  Record<"workType" | "days" | "urgency" | "expectedPayRate", string>
>;

function toTimeSlot(from: string): TimeSlot | null {
  const [hh] = from.split(":");
  const hour = Number(hh);
  if (Number.isNaN(hour)) return null;

  // Simple approximation for categorical matching.
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 22) return "evening";
  return "overnight";
}

function derivePreferredTimeSlots(
  daySlots: Partial<Record<DayOfWeek, TimeRange[]>>,
): TimeSlot[] {
  const set = new Set<TimeSlot>();
  for (const day of Object.keys(daySlots) as DayOfWeek[]) {
    for (const range of daySlots[day] ?? []) {
      if (range.from) {
        const slot = toTimeSlot(range.from);
        if (slot) set.add(slot);
      }
    }
  }
  return Array.from(set);
}

export function StepAvailability() {
  const { availability, updateAvailability, nextStep, prevStep } =
    useRegistration();
  const [errors, setErrors] = useState<Errors>({});

  const daySlots = availability.daySlots ?? {};

  const derivedPreferredDays = useMemo(
    () => Object.keys(daySlots) as DayOfWeek[],
    [daySlots],
  );

  function commitDaySlots(next: Partial<Record<DayOfWeek, TimeRange[]>>) {
    const preferredTimeSlots = derivePreferredTimeSlots(next);
    const preferredDays = Object.keys(next) as DayOfWeek[];
    updateAvailability({
      daySlots: next,
      preferredDays,
      preferredTimeSlots,
    });
  }

  function toggleDay(day: DayOfWeek) {
    const current = daySlots;
    if (current[day] && current[day].length > 0) {
      const { [day]: _, ...rest } = current;
      commitDaySlots(rest);
      return;
    }
    commitDaySlots({
      ...current,
      [day]: [{ from: "09:00", to: "17:00" }],
    });
  }

  function addRange(day: DayOfWeek) {
    const ranges = daySlots[day] ?? [];
    commitDaySlots({
      ...daySlots,
      [day]: [...ranges, { from: "", to: "" }],
    });
  }

  function removeRange(day: DayOfWeek, index: number) {
    const ranges = daySlots[day] ?? [];
    const nextRanges = ranges.filter((_, i) => i !== index);

    // If no ranges remain, remove the day entirely.
    if (nextRanges.length === 0) {
      const { [day]: _, ...rest } = daySlots;
      commitDaySlots(rest);
      return;
    }

    commitDaySlots({
      ...daySlots,
      [day]: nextRanges,
    });
  }

  function updateRange(
    day: DayOfWeek,
    index: number,
    patch: Partial<TimeRange>,
  ) {
    const ranges = daySlots[day] ?? [];
    const nextRanges = ranges.map((r, i) =>
      i === index ? { ...r, ...patch } : r,
    );
    commitDaySlots({
      ...daySlots,
      [day]: nextRanges,
    });
  }

  function formatRanges(ranges: TimeRange[]) {
    if (!ranges || ranges.length === 0) return "";
    return ranges
      .map((r) => (r.from && r.to ? `${r.from}–${r.to}` : null))
      .filter(Boolean)
      .join(", ");
  }

  function handleNext() {
    const e: Errors = {};
    if (!availability.workType) e.workType = "Please select a work type.";
    if (derivedPreferredDays.length === 0)
      e.days = "Add at least one available day.";

    // Validate ranges for each selected day.
    if (Object.keys(daySlots).length > 0) {
      for (const day of Object.keys(daySlots) as DayOfWeek[]) {
        const ranges = daySlots[day] ?? [];
        if (ranges.length === 0) {
          e.days = "Please add at least one time range for each selected day.";
          break;
        }
        const hasInvalid = ranges.some(
          (r) => !r.from || !r.to || r.from === r.to,
        );
        if (hasInvalid) {
          e.days =
            "Please enter valid start/end times (you can add multiple ranges per day).";
          break;
        }
      }
    }

    if (!availability.urgency)
      e.urgency = "Please select your start availability.";
    if (!availability.expectedPayRate.trim())
      e.expectedPayRate = "Expected pay rate is required.";

    setErrors(e);
    if (Object.keys(e).length === 0) nextStep();
  }

  return (
    <div>
      <StepHeading
        title="Availability & Preferences"
        description="Add multiple time windows per day. (Example: Monday 5–8 and 12–16)"
      />

      <SectionDivider label="Type of work" />
      {errors.workType && (
        <p className="mb-2 text-xs text-red-500">{errors.workType}</p>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        {WORK_TYPES.map((wt) => (
          <button
            key={wt.value}
            type="button"
            onClick={() => updateAvailability({ workType: wt.value })}
            className={`flex flex-col rounded-xl border p-4 text-left transition-colors ${
              availability.workType === wt.value
                ? "border-brand-600 bg-brand-50"
                : "border-zinc-200 hover:border-brand-300"
            }`}
          >
            <span className="text-sm font-semibold text-zinc-900">
              {wt.label}
            </span>
            <span className="text-xs text-zinc-500">{wt.description}</span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        <SectionDivider label="When are you available?" />
        <p className="mb-3 text-xs text-zinc-500">
          Tap a day to add it, then add as many time ranges as you need.
        </p>
        {errors.days && (
          <p className="mb-2 text-xs text-red-500">{errors.days}</p>
        )}

        <div className="grid gap-3">
          {ALL_DAYS.map((day) => {
            const ranges = daySlots[day] ?? [];
            const active = ranges.length > 0;
            const summary = formatRanges(ranges);

            return (
              <div
                key={day}
                className={`rounded-xl border transition-colors ${
                  active
                    ? "border-brand-300 bg-brand-50"
                    : "border-zinc-200 bg-white"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleDay(day)}
                  className="flex w-full items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                        active
                          ? "border-brand-600 bg-brand-600 text-white"
                          : "border-zinc-300 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                    <span
                      className={`text-sm font-semibold ${active ? "text-brand-700" : "text-zinc-700"}`}
                    >
                      {DAY_LABELS[day]}
                    </span>
                  </div>
                  {active && (
                    <span className="text-xs text-brand-600">
                      {summary || "Set times"}
                    </span>
                  )}
                </button>

                {active && (
                  <div className="border-t border-brand-100 px-4 py-3">
                    <div className="space-y-3">
                      {ranges.map((r, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="flex flex-1 items-center gap-2">
                            <label className="text-xs text-zinc-500 w-10">
                              From
                            </label>
                            <input
                              type="time"
                              value={r.from}
                              onChange={(e) =>
                                updateRange(day, idx, { from: e.target.value })
                              }
                              className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
                            />
                          </div>
                          <span className="text-zinc-400">→</span>
                          <div className="flex flex-1 items-center gap-2">
                            <label className="text-xs text-zinc-500 w-6">
                              To
                            </label>
                            <input
                              type="time"
                              value={r.to}
                              onChange={(e) =>
                                updateRange(day, idx, { to: e.target.value })
                              }
                              className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => removeRange(day, idx)}
                            className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
                            aria-label={
                              ranges.length === 1
                                ? "Remove day"
                                : "Remove time range"
                            }
                            title={
                              ranges.length === 1
                                ? "Remove day"
                                : "Remove time range"
                            }
                          >
                            {ranges.length === 1 ? "Remove" : "×"}
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => addRange(day)}
                      className="mt-3 text-sm font-semibold text-brand-600 hover:text-brand-700"
                    >
                      + Add another time range
                    </button>

                    <p className="mt-3 text-xs text-zinc-500">
                      Overnight shifts are allowed (example: 22:00–02:00).
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Field label="When can you start?" required error={errors.urgency}>
          <Select
            value={availability.urgency}
            onChange={(e) =>
              updateAvailability({ urgency: e.target.value as UrgencyLevel })
            }
            options={URGENCY_OPTIONS}
            placeholder="Select urgency"
          />
        </Field>

        <Field
          label="Expected pay rate ($/hr)"
          required
          error={errors.expectedPayRate}
        >
          <Input
            type="number"
            min="15"
            step="0.5"
            value={availability.expectedPayRate}
            onChange={(e) =>
              updateAvailability({ expectedPayRate: e.target.value })
            }
            placeholder="28.00"
            error={!!errors.expectedPayRate}
          />
        </Field>
      </div>
      <div className="mt-6">
        <SectionDivider label="Travel & entitlements" />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <ToggleRow
          label="Willing to travel"
          description="Travel to different job sites"
          checked={availability.willingToTravel}
          onChange={(v) =>
            updateAvailability({
              willingToTravel: v,
              maxTravelKm: v ? availability.maxTravelKm : "",
            })
          }
        />
        {availability.willingToTravel && (
          <Field label="Max travel distance (km)">
            <Input
              type="number"
              value={availability.maxTravelKm}
              onChange={(e) =>
                updateAvailability({ maxTravelKm: e.target.value })
              }
              placeholder="30"
            />
          </Field>
        )}
        <ToggleRow
          label="Has a valid driver's license"
          checked={availability.hasDriverLicense}
          description="This is a great advantage for our clients."
          onChange={(v) => updateAvailability({ hasDriverLicense: v })}
        />{" "}
        <ToggleRow
          label="Has a registered vehicle"
          checked={availability.hasRegisteredVehicle}
          description="The chances are higher if you have a registered vehicle."
          onChange={(v) => updateAvailability({ hasRegisteredVehicle: v })}
        />
        {availability.hasRegisteredVehicle && (
          <Input
            type="text"
            value={availability.vehicleRegistrationNumber}
            onChange={(e) =>
              updateAvailability({ vehicleRegistrationNumber: e.target.value })
            }
            placeholder="Vehicle Registration Number"
          />
        )}
        {/* <ToggleRow
          label="Entitled to sick leave"
          checked={availability.hasSickLeave}
          onChange={(v) => updateAvailability({ hasSickLeave: v })}
        />
        <ToggleRow
          label="Entitled to annual leave"
          checked={availability.hasAnnualLeave}
          onChange={(v) => updateAvailability({ hasAnnualLeave: v })}
        />
        <ToggleRow
          label="Entitled to public holiday rate"
          checked={availability.hasPublicHolidayRate}
          onChange={(v) => updateAvailability({ hasPublicHolidayRate: v })}
        /> */}
      </div>

      <StepNav onBack={prevStep} onNext={handleNext} />
    </div>
  );
}
