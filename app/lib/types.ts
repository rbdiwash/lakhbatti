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
  hasRegisteredVehicle: boolean;
  vehicleRegistrationNumber: string;
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

// ─── Full Registration Payload (flat — matches Prisma / API) ─────────────────
export type EmployeeRegistration = PersonalDetails &
  ContactDetails &
  WorkRights &
  Availability &
  ComplianceDocs &
  Training &
  BankDetails & {
    agreedToTerms: boolean;
    submittedAt: string;
    createdAt?: string;
    updatedAt?: string;
  };

export type RegistrationStatus =
  | "PENDING"
  | "REVIEWING"
  | "APPROVED"
  | "REJECTED";

export type JobStatus =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export type EmployeeRecord = EmployeeRegistration & {
  id: string;
  status: RegistrationStatus;
  createdAt: string;
  updatedAt: string;
  _count?: { jobs: number };
};

export type JobEmployeeSummary = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type JobRecord = {
  id: string;
  title: string;
  category: string;
  description: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  scheduledDate: string | null;
  startTime: string;
  endTime: string;
  payRate: string;
  notes: string;
  status: JobStatus;
  employeeId: string | null;
  employee?: JobEmployeeSummary | null;
  createdAt: string;
  updatedAt: string;
};

export type InvoiceRecord = {
  id: string;
  number: string;
  amount: string;
  status: InvoiceStatus;
  dueDate: string | null;
  notes: string;
  employeeId: string;
  jobId: string | null;
  job: { id: string; title: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type PaymentRecord = {
  id: string;
  amount: string;
  method: string;
  status: PaymentStatus;
  paidAt: string;
  reference: string;
  employeeId: string;
  invoiceId: string | null;
  invoice: { id: string; number: string } | null;
  createdAt: string;
};

export type EmployeeDetailRecord = EmployeeRecord & {
  jobs: JobRecord[];
  invoices: InvoiceRecord[];
  payments: PaymentRecord[];
};

export type CreateJobPayload = {
  title: string;
  category: string;
  description: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  payRate: string;
  notes: string;
  employeeId: string;
};

export type EmployeeListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: RegistrationStatus | "";
  workType?: WorkType | "";
  visaStatus?: VisaStatus | "";
  preferredDays?: string;
  minPay?: string;
  maxPay?: string;
  willingToTravel?: boolean | "";
  hasDriverLicense?: boolean | "";
  hasPoliceCheck?: boolean | "";
  hasWorkingWithChildren?: boolean | "";
  yearsExperience?: string;
};

export type EmployeeListResponse = {
  data: EmployeeRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  message?: string;
};

export type EmployeeRow = {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  suburb: string;
  state: string;
  postcode: string;
  gender: string;
  visaStatus: string;
  workType: string;
  preferredDays: string;
  preferredTimeSlots: string;
  urgency: string;
  expectedPayRate: string;
  willingToTravel: boolean;
  hasDriverLicense: boolean;
  maxTravelKm: string;
  hasPoliceCheck: boolean;
  hasWorkingWithChildren: boolean;
  hasPublicLiability: boolean;
  hasCovidVaccination: boolean;
  certifications: string;
  machinesHandled: string;
  specialisations: string;
  yearsExperience: string;
  status: RegistrationStatus;
  jobsCount: number;
  submittedAt: string;
  raw: EmployeeRecord;
};

// ─── Wizard Step Config ──────────────────────────────────────────────────────
export type StepConfig = {
  id: string;
  title: string;
  description: string;
  icon: string;
};
