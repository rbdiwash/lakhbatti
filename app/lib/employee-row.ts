import type { EmployeeRecord, EmployeeRow } from "./types";

function joinList(value: unknown): string {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(", ");
  }
  return typeof value === "string" ? value : "";
}

/** Maps a flat API / Prisma employee record into a dashboard table row. */
export function toEmployeeRow(record: EmployeeRecord): EmployeeRow {
  return {
    id: record.id,
    firstName: record.firstName ?? "",
    lastName: record.lastName ?? "",
    fullName: `${record.firstName ?? ""} ${record.lastName ?? ""}`.trim(),
    email: record.email ?? "",
    phone: record.phone ?? "",
    suburb: record.suburb ?? "",
    state: record.state ?? "",
    postcode: record.postcode ?? "",
    gender: record.gender ?? "",
    visaStatus: record.visaStatus ?? "",
    workType: record.workType ?? "",
    preferredDays: joinList(record.preferredDays),
    preferredTimeSlots: joinList(record.preferredTimeSlots),
    urgency: record.urgency ?? "",
    expectedPayRate: record.expectedPayRate ?? "",
    willingToTravel: Boolean(record.willingToTravel),
    hasDriverLicense: Boolean(record.hasDriverLicense),
    maxTravelKm: record.maxTravelKm ?? "",
    hasPoliceCheck: Boolean(record.hasPoliceCheck),
    hasWorkingWithChildren: Boolean(record.hasWorkingWithChildren),
    hasPublicLiability: Boolean(record.hasPublicLiability),
    hasCovidVaccination: Boolean(record.hasCovidVaccination),
    certifications: joinList(record.certifications),
    machinesHandled: joinList(record.machinesHandled),
    specialisations: joinList(record.specialisations),
    yearsExperience: record.yearsExperience ?? "",
    status: record.status,
    jobsCount: record._count?.jobs ?? 0,
    submittedAt: record.submittedAt,
    raw: record,
  };
}
