import type {
  Availability,
  BankDetails,
  ComplianceDocs,
  ContactDetails,
  DayOfWeek,
  EmployeeRecord,
  EmployeeRegistration,
  PersonalDetails,
  RegistrationStatus,
  TimeSlot,
  Training,
  UrgencyLevel,
  VisaStatus,
  WorkRights,
  WorkType,
} from "./types";

export function personalFromEmployee(e: EmployeeRecord): PersonalDetails {
  return {
    firstName: e.firstName ?? "",
    lastName: e.lastName ?? "",
    dateOfBirth: e.dateOfBirth ?? "",
    gender: e.gender ?? "",
    profilePhoto: e.profilePhoto ?? "",
  };
}

export function contactFromEmployee(e: EmployeeRecord): ContactDetails {
  return {
    email: e.email ?? "",
    phone: e.phone ?? "",
    address: e.address ?? "",
    suburb: e.suburb ?? "",
    state: e.state ?? "",
    postcode: e.postcode ?? "",
    notifyBySms: Boolean(e.notifyBySms),
    notifyByEmail: Boolean(e.notifyByEmail),
    emergencyContactName: e.emergencyContactName ?? "",
    emergencyContactPhone: e.emergencyContactPhone ?? "",
  };
}

export function workRightsFromEmployee(e: EmployeeRecord): WorkRights {
  return {
    visaStatus: (e.visaStatus || "australian-citizen") as VisaStatus,
    visaOther: e.visaOther ?? "",
    visaExpiry: e.visaExpiry ?? "",
    hasWorkingRights: Boolean(e.hasWorkingRights),
    tfn: e.tfn ?? "",
    hasAbn: Boolean(e.hasAbn),
    abn: e.abn ?? "",
  };
}

export function availabilityFromEmployee(e: EmployeeRecord): Availability {
  return {
    workType: (e.workType || "casual") as WorkType,
    preferredDays: (Array.isArray(e.preferredDays)
      ? e.preferredDays
      : []) as DayOfWeek[],
    preferredTimeSlots: (Array.isArray(e.preferredTimeSlots)
      ? e.preferredTimeSlots
      : []) as TimeSlot[],
    daySlots:
      e.daySlots && typeof e.daySlots === "object"
        ? (e.daySlots as Availability["daySlots"])
        : {},
    urgency: (e.urgency || "flexible") as UrgencyLevel,
    expectedPayRate: e.expectedPayRate ?? "",
    willingToTravel: Boolean(e.willingToTravel),
    hasDriverLicense: Boolean(e.hasDriverLicense),
    maxTravelKm: e.maxTravelKm ?? "",
    hasSickLeave: Boolean(e.hasSickLeave),
    hasAnnualLeave: Boolean(e.hasAnnualLeave),
    hasPublicHolidayRate: Boolean(e.hasPublicHolidayRate),
    hasRegisteredVehicle: Boolean(e.hasRegisteredVehicle),
    vehicleRegistrationNumber: e.vehicleRegistrationNumber ?? "",
  };
}

export function complianceFromEmployee(e: EmployeeRecord): ComplianceDocs {
  return {
    hasPoliceCheck: Boolean(e.hasPoliceCheck),
    policeCheckExpiry: e.policeCheckExpiry ?? "",
    hasWorkingWithChildren: Boolean(e.hasWorkingWithChildren),
    wwcExpiry: e.wwcExpiry ?? "",
    hasPublicLiability: Boolean(e.hasPublicLiability),
    insuranceExpiry: e.insuranceExpiry ?? "",
    hasCovidVaccination: Boolean(e.hasCovidVaccination),
    otherDocs: e.otherDocs ?? "",
  };
}

export function trainingFromEmployee(e: EmployeeRecord): Training {
  const emptyRef = { name: "", company: "", phone: "", relationship: "" };
  const references = (
    Array.isArray(e.references) ? e.references : []
  ) as Training["references"];

  return {
    certifications: Array.isArray(e.certifications) ? e.certifications : [],
    machinesHandled: Array.isArray(e.machinesHandled) ? e.machinesHandled : [],
    yearsExperience: e.yearsExperience ?? "",
    specialisations: Array.isArray(e.specialisations) ? e.specialisations : [],
    references: references.length > 0 ? references : [emptyRef],
  };
}

export function bankFromEmployee(e: EmployeeRecord): BankDetails {
  return {
    accountName: e.accountName ?? "",
    bsb: e.bsb ?? "",
    accountNumber: e.accountNumber ?? "",
    superFundName: e.superFundName ?? "",
    superMemberNumber: e.superMemberNumber ?? "",
    paymentMethod: e.paymentMethod ?? "bank-transfer",
  };
}

export function registrationSeedsFromEmployee(e: EmployeeRecord) {
  return {
    personal: personalFromEmployee(e),
    contact: contactFromEmployee(e),
    workRights: workRightsFromEmployee(e),
    availability: availabilityFromEmployee(e),
    compliance: complianceFromEmployee(e),
    training: trainingFromEmployee(e),
    bank: bankFromEmployee(e),
    agreedToTerms: Boolean(e.agreedToTerms),
    status: e.status as RegistrationStatus,
  };
}

/** Payload suitable for PUT /api/employee/:id (omit create-only timestamps noise). */
export function updatePayloadFromRegistration(
  data: EmployeeRegistration,
  status: RegistrationStatus,
) {
  const {
    submittedAt: _s,
    createdAt: _c,
    updatedAt: _u,
    ...rest
  } = data;
  return { ...rest, status };
}
