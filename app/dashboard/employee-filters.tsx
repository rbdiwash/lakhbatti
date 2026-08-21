"use client";

import { useState } from "react";
import type { EmployeeListParams } from "../lib/types";
import {
  DAY_OPTIONS,
  DAY_SHORT,
  VISA_OPTIONS,
  WORK_TYPE_OPTIONS,
} from "../lib/labels";

const EXPERIENCE_OPTIONS = ["0-1", "1-2", "2-5", "5-10", "10+"] as const;
const BOOL_OPTIONS = [
  { value: "", label: "Any" },
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
] as const;

export type EmployeeFilterState = {
  search: string;
  status: string;
  workType: string;
  visaStatus: string;
  preferredDays: string[];
  minPay: string;
  maxPay: string;
  willingToTravel: string;
  hasDriverLicense: string;
  hasPoliceCheck: string;
  hasWorkingWithChildren: string;
  yearsExperience: string;
};

type FilterKey = Exclude<keyof EmployeeFilterState, "search">;

const FILTER_META: { key: FilterKey; label: string }[] = [
  { key: "status", label: "Status" },
  { key: "workType", label: "Work type" },
  { key: "visaStatus", label: "Visa" },
  { key: "yearsExperience", label: "Experience" },
  { key: "minPay", label: "Min pay" },
  { key: "maxPay", label: "Max pay" },
  { key: "willingToTravel", label: "Travel" },
  { key: "hasDriverLicense", label: "Licence" },
  { key: "hasPoliceCheck", label: "Police check" },
  { key: "hasWorkingWithChildren", label: "WWC" },
  { key: "preferredDays", label: "Preferred days" },
];

export const emptyEmployeeFilters: EmployeeFilterState = {
  search: "",
  status: "",
  workType: "",
  visaStatus: "",
  preferredDays: [],
  minPay: "",
  maxPay: "",
  willingToTravel: "",
  hasDriverLicense: "",
  hasPoliceCheck: "",
  hasWorkingWithChildren: "",
  yearsExperience: "",
};

function emptyValueFor(key: FilterKey): string | string[] {
  return key === "preferredDays" ? [] : "";
}

export function toListParams(
  filters: EmployeeFilterState,
  pageIndex: number,
  pageSize: number,
): EmployeeListParams {
  return {
    page: pageIndex + 1,
    pageSize,
    search: filters.search || undefined,
    status: (filters.status || undefined) as EmployeeListParams["status"],
    workType: (filters.workType || undefined) as EmployeeListParams["workType"],
    visaStatus: (filters.visaStatus ||
      undefined) as EmployeeListParams["visaStatus"],
    preferredDays: filters.preferredDays.length
      ? filters.preferredDays.join(",")
      : undefined,
    minPay: filters.minPay || undefined,
    maxPay: filters.maxPay || undefined,
    willingToTravel:
      filters.willingToTravel === ""
        ? undefined
        : filters.willingToTravel === "true",
    hasDriverLicense:
      filters.hasDriverLicense === ""
        ? undefined
        : filters.hasDriverLicense === "true",
    hasPoliceCheck:
      filters.hasPoliceCheck === ""
        ? undefined
        : filters.hasPoliceCheck === "true",
    hasWorkingWithChildren:
      filters.hasWorkingWithChildren === ""
        ? undefined
        : filters.hasWorkingWithChildren === "true",
    yearsExperience: filters.yearsExperience || undefined,
  };
}

type Props = {
  value: EmployeeFilterState;
  onChange: (next: EmployeeFilterState) => void;
};

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex min-w-36 flex-1 flex-col gap-1 text-xs font-medium text-zinc-600">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-sm text-zinc-800"
      >
        {children}
      </select>
    </label>
  );
}

function FilterChip({
  label,
  onRemove,
  children,
}: {
  label: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-end gap-1.5">
      <div className="min-w-0 flex-1">{children}</div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="mb-0.5 rounded-md px-1.5 py-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
      >
        ×
      </button>
    </div>
  );
}

export function EmployeeFilters({ value, onChange }: Props) {
  const [active, setActive] = useState<FilterKey[]>([]);

  function patch(partial: Partial<EmployeeFilterState>) {
    onChange({ ...value, ...partial });
  }

  function toggleDay(day: string) {
    const selected = value.preferredDays.includes(day)
      ? value.preferredDays.filter((d) => d !== day)
      : [...value.preferredDays, day];
    patch({ preferredDays: selected });
  }

  function addFilter(key: FilterKey) {
    setActive((prev) => (prev.includes(key) ? prev : [...prev, key]));
  }

  function removeFilter(key: FilterKey) {
    setActive((prev) => prev.filter((k) => k !== key));
    onChange({ ...value, [key]: emptyValueFor(key) });
  }

  function clearAll() {
    setActive([]);
    onChange(emptyEmployeeFilters);
  }

  const available = FILTER_META.filter((f) => !active.includes(f.key));
  const hasActiveFilters = active.length > 0 || Boolean(value.search.trim());

  function renderFilter(key: FilterKey) {
    const meta = FILTER_META.find((f) => f.key === key);
    if (!meta) return null;

    const remove = () => removeFilter(key);

    switch (key) {
      case "status":
        return (
          <FilterChip key={key} label={meta.label} onRemove={remove}>
            <SelectField
              label={meta.label}
              value={value.status}
              onChange={(status) => patch({ status })}
            >
              <option value="">Any</option>
              {["PENDING", "REVIEWING", "APPROVED", "REJECTED"].map(
                (option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ),
              )}
            </SelectField>
          </FilterChip>
        );
      case "workType":
        return (
          <FilterChip key={key} label={meta.label} onRemove={remove}>
            <SelectField
              label={meta.label}
              value={value.workType}
              onChange={(workType) => patch({ workType })}
            >
              <option value="">Any</option>
              {WORK_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </FilterChip>
        );
      case "visaStatus":
        return (
          <FilterChip key={key} label={meta.label} onRemove={remove}>
            <SelectField
              label={meta.label}
              value={value.visaStatus}
              onChange={(visaStatus) => patch({ visaStatus })}
            >
              <option value="">Any</option>
              {VISA_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </FilterChip>
        );
      case "yearsExperience":
        return (
          <FilterChip key={key} label={meta.label} onRemove={remove}>
            <SelectField
              label={meta.label}
              value={value.yearsExperience}
              onChange={(yearsExperience) => patch({ yearsExperience })}
            >
              <option value="">Any</option>
              {EXPERIENCE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </SelectField>
          </FilterChip>
        );
      case "minPay":
        return (
          <FilterChip key={key} label={meta.label} onRemove={remove}>
            <label className="flex w-28 flex-col gap-1 text-xs font-medium text-zinc-600">
              Min pay
              <input
                type="number"
                min={0}
                step="0.5"
                value={value.minPay}
                onChange={(e) => patch({ minPay: e.target.value })}
                className="rounded-lg border border-zinc-200 px-2.5 py-2 text-sm"
              />
            </label>
          </FilterChip>
        );
      case "maxPay":
        return (
          <FilterChip key={key} label={meta.label} onRemove={remove}>
            <label className="flex w-28 flex-col gap-1 text-xs font-medium text-zinc-600">
              Max pay
              <input
                type="number"
                min={0}
                step="0.5"
                value={value.maxPay}
                onChange={(e) => patch({ maxPay: e.target.value })}
                className="rounded-lg border border-zinc-200 px-2.5 py-2 text-sm"
              />
            </label>
          </FilterChip>
        );
      case "willingToTravel":
        return (
          <FilterChip key={key} label={meta.label} onRemove={remove}>
            <SelectField
              label={meta.label}
              value={value.willingToTravel}
              onChange={(willingToTravel) => patch({ willingToTravel })}
            >
              {BOOL_OPTIONS.map((option) => (
                <option key={option.value || "any"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </FilterChip>
        );
      case "hasDriverLicense":
        return (
          <FilterChip key={key} label={meta.label} onRemove={remove}>
            <SelectField
              label={meta.label}
              value={value.hasDriverLicense}
              onChange={(hasDriverLicense) => patch({ hasDriverLicense })}
            >
              {BOOL_OPTIONS.map((option) => (
                <option key={option.value || "any"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </FilterChip>
        );
      case "hasPoliceCheck":
        return (
          <FilterChip key={key} label={meta.label} onRemove={remove}>
            <SelectField
              label={meta.label}
              value={value.hasPoliceCheck}
              onChange={(hasPoliceCheck) => patch({ hasPoliceCheck })}
            >
              {BOOL_OPTIONS.map((option) => (
                <option key={option.value || "any"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </FilterChip>
        );
      case "hasWorkingWithChildren":
        return (
          <FilterChip key={key} label={meta.label} onRemove={remove}>
            <SelectField
              label={meta.label}
              value={value.hasWorkingWithChildren}
              onChange={(hasWorkingWithChildren) =>
                patch({ hasWorkingWithChildren })
              }
            >
              {BOOL_OPTIONS.map((option) => (
                <option key={option.value || "any"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </FilterChip>
        );
      case "preferredDays":
        return (
          <FilterChip key={key} label={meta.label} onRemove={remove}>
            <div>
              <p className="mb-1.5 text-xs font-medium text-zinc-600">
                Preferred days
              </p>
              <div className="flex flex-wrap gap-1.5">
                {DAY_OPTIONS.map((day) => {
                  const dayActive = value.preferredDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        dayActive
                          ? "bg-brand-600 text-white"
                          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                      }`}
                    >
                      {DAY_SHORT[day.value]}
                    </button>
                  );
                })}
              </div>
            </div>
          </FilterChip>
        );
      default:
        return null;
    }
  }

  return (
    <div className="mb-4 space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-56 flex-1 flex-col gap-1 text-xs font-medium text-zinc-600">
          Search
          <input
            value={value.search}
            onChange={(e) => patch({ search: e.target.value })}
            placeholder="Name, email, phone, suburb…"
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800"
          />
        </label>

        {available.length > 0 ? (
          <label className="flex min-w-44 flex-col gap-1 text-xs font-medium text-zinc-600">
            Add filter
            <select
              value=""
              onChange={(e) => {
                const next = e.target.value as FilterKey;
                if (next) addFilter(next);
              }}
              className="rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-sm text-zinc-800"
            >
              <option value="">Choose filter…</option>
              {available.map((filter) => (
                <option key={filter.key} value={filter.key}>
                  {filter.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clearAll}
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {active.length > 0 ? (
        <div className="flex flex-wrap items-end gap-3">
          {active.map((key) => renderFilter(key))}
        </div>
      ) : null}
    </div>
  );
}
