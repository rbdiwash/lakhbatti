// ─── Employee Registration Types ────────────────────────────────────────────
// All fields across the 8-step registration wizard.

export type WorkType = "full-time" | "part-time" | "casual" | "independent-contractor" | "company";

export type VisaStatus =
  | "australian-citizen"
  | "permanent-resident"
  | "temporary-work-visa"
  | "student-visa"
  | "working-holiday"
  | "other";

export type UrgencyLevel = "immediately" | "within-1-week" | "within-2-weeks" | "within-1-month" | "flexible";

export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export type TimeRange = { from: string; to: string };

export type TimeSlot = "morning" | "afternoon" | "evening" | "overnight";

// ─── Step 1: Personal Details ────────────────────────────────────────────────
export type PersonalDetails = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  profilePhoto: string; // file name / base64 preview label
};

// ─── Step 2: Contact & Notifications ────────────────────────────────────────
export type ContactDetails = {
  email: string;
  phone: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  notifyBySms: boolean;
  notifyByEmail: boolean;
  emergencyContactName: string;
  emergencyContactPhone: string;
};

// ─── Step 3: Work Rights & Visa ─────────────────────────────────────────────
export type WorkRights = {
  visaStatus: VisaStatus;
  visaOther: string;          // Only used when visaStatus === "other"
  visaExpiry: string;          // date string, empty if citizen/PR
  hasWorkingRights: boolean;
  tfn: string;                 // Tax File Number
  hasAbn: boolean;
  abn: string;
};

// ─── Step 4: Availability & Work Preference ─────────────────────────────────
export type Availability = {
  workType: WorkType;
  preferredDays: DayOfWeek[];
  // Kept for backwards compatibility with any matching logic that uses
  // time-slot categories. UI also stores exact per-day time windows in daySlots.
  preferredTimeSlots: TimeSlot[];
  daySlots: Partial<Record<DayOfWeek, TimeRange[]>>; // Exact availability windows per day
  urgency: UrgencyLevel;
  expectedPayRate: string;     // e.g. "25.50" per hour
  willingToTravel: boolean;
  hasDriverLicense: boolean;
  maxTravelKm: string;
  hasSickLeave: boolean;
  hasAnnualLeave: boolean;
  hasPublicHolidayRate: boolean;
};

// ─── Step 5: Compliance Documents ───────────────────────────────────────────
export type ComplianceDocs = {
  hasPoliceCheck: boolean;
  policeCheckExpiry: string;
  hasWorkingWithChildren: boolean;
  wwcExpiry: string;
  hasPublicLiability: boolean;
  insuranceExpiry: string;
  hasCovidVaccination: boolean;
  otherDocs: string;           // free-text, e.g. "OH&S cert"
};

// ─── Step 6: Training & Equipment ───────────────────────────────────────────
export type Training = {
  certifications: string[];    // multi-select list
  machinesHandled: string[];   // multi-select list
  yearsExperience: string;
  specialisations: string[];
  references: {
    name: string;
    company: string;
    phone: string;
    relationship: string;
  }[];
};

// ─── Step 7: Bank & Superannuation ──────────────────────────────────────────
export type BankDetails = {
  accountName: string;
  bsb: string;
  accountNumber: string;
  superFundName: string;
  superMemberNumber: string;
  paymentMethod: "bank-transfer" | "cheque";
};

// ─── Full Registration Payload ───────────────────────────────────────────────
export type EmployeeRegistration = {
  personal: PersonalDetails;
  contact: ContactDetails;
  workRights: WorkRights;
  availability: Availability;
  compliance: ComplianceDocs;
  training: Training;
  bank: BankDetails;
  agreedToTerms: boolean;
  submittedAt: string;
};

// ─── Wizard Step Config ──────────────────────────────────────────────────────
export type StepConfig = {
  id: string;
  title: string;
  description: string;
  icon: string;
};
