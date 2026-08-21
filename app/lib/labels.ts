import type {
  DayOfWeek,
  UrgencyLevel,
  VisaStatus,
  WorkType,
} from "./types";

export type Option<T extends string> = { value: T; label: string };

export const WORK_TYPE_OPTIONS: (Option<WorkType> & { description?: string })[] =
  [
    { value: "full-time", label: "Full-time", description: "38 hrs/week" },
    {
      value: "part-time",
      label: "Part-time",
      description: "Less than 38 hrs",
    },
    {
      value: "casual",
      label: "Casual",
      description: "Flexible, as-needed shifts",
    },
    {
      value: "independent-contractor",
      label: "Independent Contractor",
      description: "ABN required",
    },
    {
      value: "company",
      label: "Company",
      description: "Registered business",
    },
  ];

export const VISA_OPTIONS: Option<VisaStatus>[] = [
  { value: "australian-citizen", label: "Australian Citizen" },
  { value: "permanent-resident", label: "Permanent Resident" },
  { value: "temporary-work-visa", label: "Temporary Work Visa" },
  { value: "student-visa", label: "Student Visa" },
  { value: "working-holiday", label: "Working Holiday Visa" },
  { value: "other", label: "Other" },
];

export const URGENCY_OPTIONS: Option<UrgencyLevel>[] = [
  { value: "immediately", label: "Immediately" },
  { value: "within-1-week", label: "Within 1 week" },
  { value: "within-2-weeks", label: "Within 2 weeks" },
  { value: "within-1-month", label: "Within 1 month" },
  { value: "flexible", label: "Flexible / Not urgent" },
];

export const DAY_OPTIONS: Option<DayOfWeek>[] = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

export const DAY_SHORT: Record<DayOfWeek, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

function labelFromOptions<T extends string>(
  options: Option<T>[],
  value: string | null | undefined,
): string {
  if (!value) return "—";
  return options.find((o) => o.value === value)?.label ?? humanizeSlug(value);
}

/** Fallback for unknown kebab/snake values. */
export function humanizeSlug(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function labelWorkType(value: string | null | undefined) {
  return labelFromOptions(WORK_TYPE_OPTIONS, value);
}

export function labelVisaStatus(value: string | null | undefined) {
  return labelFromOptions(VISA_OPTIONS, value);
}

export function labelUrgency(value: string | null | undefined) {
  return labelFromOptions(URGENCY_OPTIONS, value);
}

export function labelDay(value: string | null | undefined) {
  return labelFromOptions(DAY_OPTIONS, value);
}

export function labelPreferredDays(
  days: string[] | string | null | undefined,
): string {
  const list = Array.isArray(days)
    ? days
    : typeof days === "string" && days.trim()
      ? days.split(",").map((d) => d.trim()).filter(Boolean)
      : [];
  if (list.length === 0) return "—";
  return list.map((d) => labelDay(d)).join(", ");
}

export function labelPreferredDaysShort(
  days: string[] | string | null | undefined,
): string {
  const list = Array.isArray(days)
    ? days
    : typeof days === "string" && days.trim()
      ? days.split(",").map((d) => d.trim()).filter(Boolean)
      : [];
  if (list.length === 0) return "—";
  return list
    .map((d) => DAY_SHORT[d as DayOfWeek] ?? labelDay(d).slice(0, 3))
    .join(", ");
}
