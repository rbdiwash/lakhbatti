"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type {
  Availability,
  BankDetails,
  ComplianceDocs,
  ContactDetails,
  EmployeeRegistration,
  PersonalDetails,
  RegistrationStatus,
  Training,
  WorkRights,
} from "../lib/types";

// ─── Dev dummy data toggle ───────────────────────────────────────────────────
// Flip to `false` (or delete this block) when you want a blank registration form.
const USE_DUMMY_DATA = true;

// ─── Initial/empty state ─────────────────────────────────────────────────────

const emptyPersonal: PersonalDetails = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  profilePhoto: "",
};

const emptyContact: ContactDetails = {
  email: "",
  phone: "",
  address: "",
  suburb: "",
  state: "",
  postcode: "",
  notifyBySms: true,
  notifyByEmail: true,
  emergencyContactName: "",
  emergencyContactPhone: "",
};

const emptyWorkRights: WorkRights = {
  visaStatus: "australian-citizen",
  visaOther: "",
  visaExpiry: "",
  hasWorkingRights: true,
  tfn: "",
  hasAbn: false,
  abn: "",
};

const emptyAvailability: Availability = {
  workType: "casual",
  preferredDays: [],
  preferredTimeSlots: [],
  daySlots: {},
  urgency: "flexible",
  expectedPayRate: "",
  willingToTravel: false,
  hasDriverLicense: false,
  maxTravelKm: "",
  hasSickLeave: false,
  hasAnnualLeave: false,
  hasPublicHolidayRate: false,
  hasRegisteredVehicle: false,
  vehicleRegistrationNumber: "",
};

const emptyCompliance: ComplianceDocs = {
  hasPoliceCheck: false,
  policeCheckExpiry: "",
  hasWorkingWithChildren: false,
  wwcExpiry: "",
  hasPublicLiability: false,
  insuranceExpiry: "",
  hasCovidVaccination: false,
  otherDocs: "",
};

const emptyTraining: Training = {
  certifications: [],
  machinesHandled: [],
  yearsExperience: "",
  specialisations: [],
  references: [{ name: "", company: "", phone: "", relationship: "" }],
};

const emptyBank: BankDetails = {
  accountName: "",
  bsb: "",
  accountNumber: "",
  superFundName: "",
  superMemberNumber: "",
  paymentMethod: "bank-transfer",
};

// ─── Dummy data (local testing only) ─────────────────────────────────────────

const dummyPersonal: PersonalDetails = {
  firstName: "Priya",
  lastName: "Sharma",
  dateOfBirth: "1994-06-15",
  gender: "female",
  profilePhoto: "",
};

const dummyContact: ContactDetails = {
  email: "priya.sharma@example.com",
  phone: "0412345678",
  address: "42 Marion Street",
  suburb: "Bankstown",
  state: "NSW",
  postcode: "2200",
  notifyBySms: true,
  notifyByEmail: true,
  emergencyContactName: "Amit Sharma",
  emergencyContactPhone: "0498765432",
};

const dummyWorkRights: WorkRights = {
  visaStatus: "permanent-resident",
  visaOther: "",
  visaExpiry: "",
  hasWorkingRights: true,
  tfn: "123456789",
  hasAbn: true,
  abn: "51824753556",
};

const dummyAvailability: Availability = {
  workType: "casual",
  preferredDays: ["monday", "wednesday", "friday", "saturday"],
  preferredTimeSlots: ["morning", "afternoon"],
  daySlots: {
    monday: [{ from: "08:00", to: "14:00" }],
    wednesday: [{ from: "09:00", to: "17:00" }],
    friday: [{ from: "08:00", to: "12:00" }],
    saturday: [{ from: "07:00", to: "13:00" }],
  },
  urgency: "within-1-week",
  expectedPayRate: "32.50",
  willingToTravel: true,
  hasDriverLicense: true,
  maxTravelKm: "25",
  hasSickLeave: true,
  hasAnnualLeave: false,
  hasPublicHolidayRate: true,
  hasRegisteredVehicle: true,
  vehicleRegistrationNumber: "ABC123",
};

const dummyCompliance: ComplianceDocs = {
  hasPoliceCheck: true,
  policeCheckExpiry: "2027-03-01",
  hasWorkingWithChildren: true,
  wwcExpiry: "2027-08-15",
  hasPublicLiability: true,
  insuranceExpiry: "2026-12-31",
  hasCovidVaccination: true,
  otherDocs: "OH&S induction completed",
};

const dummyTraining: Training = {
  certifications: [
    "White Card (Construction Induction)",
    "First Aid Certificate",
    "Manual Handling Training",
  ],
  machinesHandled: ["Commercial Vacuum", "Floor Scrubber/Polisher", "Carpet Extractor"],
  yearsExperience: "2-5",
  specialisations: ["Domestic Cleaning", "End of Lease / Bond", "Carpet Cleaning"],
  references: [
    {
      name: "Sarah Nguyen",
      company: "Spotless Homes",
      phone: "0411002200",
      relationship: "Former supervisor",
    },
  ],
};

const dummyBank: BankDetails = {
  accountName: "Priya Sharma",
  bsb: "062000",
  accountNumber: "12345678",
  superFundName: "Australian Super",
  superMemberNumber: "AS-998877",
  paymentMethod: "bank-transfer",
};

// ─── Context Shape ───────────────────────────────────────────────────────────

type RegistrationState = {
  step: number;
  personal: PersonalDetails;
  contact: ContactDetails;
  workRights: WorkRights;
  availability: Availability;
  compliance: ComplianceDocs;
  training: Training;
  bank: BankDetails;
  agreedToTerms: boolean;
  status: RegistrationStatus;
  mode: "create" | "edit";
  employeeId: string | null;
};

type RegistrationSeeds = {
  personal: PersonalDetails;
  contact: ContactDetails;
  workRights: WorkRights;
  availability: Availability;
  compliance: ComplianceDocs;
  training: Training;
  bank: BankDetails;
  agreedToTerms: boolean;
  status?: RegistrationStatus;
};

type RegistrationContextValue = RegistrationState & {
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updatePersonal: (data: Partial<PersonalDetails>) => void;
  updateContact: (data: Partial<ContactDetails>) => void;
  updateWorkRights: (data: Partial<WorkRights>) => void;
  updateAvailability: (data: Partial<Availability>) => void;
  updateCompliance: (data: Partial<ComplianceDocs>) => void;
  updateTraining: (data: Partial<Training>) => void;
  updateBank: (data: Partial<BankDetails>) => void;
  setAgreedToTerms: (v: boolean) => void;
  setStatus: (status: RegistrationStatus) => void;
  buildPayload: () => EmployeeRegistration;
  resetForm: () => void;
  onSuccess?: (result: { id: string; message: string }) => void;
};

const RegistrationContext = createContext<RegistrationContextValue | null>(
  null,
);

// ─── Provider ────────────────────────────────────────────────────────────────

export function RegistrationProvider({
  children,
  useDummyData = USE_DUMMY_DATA,
  onSuccess,
  mode = "create",
  employeeId = null,
  initialSeeds,
}: {
  children: React.ReactNode;
  /** Override the module-level dummy data toggle (dashboard create uses blank). */
  useDummyData?: boolean;
  onSuccess?: (result: { id: string; message: string }) => void;
  mode?: "create" | "edit";
  employeeId?: string | null;
  initialSeeds?: RegistrationSeeds;
}) {
  const seedPersonal =
    initialSeeds?.personal ??
    (useDummyData ? dummyPersonal : emptyPersonal);
  const seedContact =
    initialSeeds?.contact ?? (useDummyData ? dummyContact : emptyContact);
  const seedWorkRights =
    initialSeeds?.workRights ??
    (useDummyData ? dummyWorkRights : emptyWorkRights);
  const seedAvailability =
    initialSeeds?.availability ??
    (useDummyData ? dummyAvailability : emptyAvailability);
  const seedCompliance =
    initialSeeds?.compliance ??
    (useDummyData ? dummyCompliance : emptyCompliance);
  const seedTraining =
    initialSeeds?.training ?? (useDummyData ? dummyTraining : emptyTraining);
  const seedBank =
    initialSeeds?.bank ?? (useDummyData ? dummyBank : emptyBank);
  const seedAgreed = initialSeeds?.agreedToTerms ?? useDummyData;
  const seedStatus = initialSeeds?.status ?? "PENDING";

  const [step, setStep] = useState(0);
  const [personal, setPersonal] = useState(seedPersonal);
  const [contact, setContact] = useState(seedContact);
  const [workRights, setWorkRights] = useState(seedWorkRights);
  const [availability, setAvailability] = useState(seedAvailability);
  const [compliance, setCompliance] = useState(seedCompliance);
  const [training, setTraining] = useState(seedTraining);
  const [bank, setBank] = useState(seedBank);
  const [agreedToTerms, setAgreedToTerms] = useState(seedAgreed);
  const [status, setStatus] = useState<RegistrationStatus>(seedStatus);

  const nextStep = useCallback(() => setStep((s) => s + 1), []);
  const prevStep = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  const updatePersonal = useCallback(
    (d: Partial<PersonalDetails>) => setPersonal((p) => ({ ...p, ...d })),
    [],
  );
  const updateContact = useCallback(
    (d: Partial<ContactDetails>) => setContact((p) => ({ ...p, ...d })),
    [],
  );
  const updateWorkRights = useCallback(
    (d: Partial<WorkRights>) => setWorkRights((p) => ({ ...p, ...d })),
    [],
  );
  const updateAvailability = useCallback(
    (d: Partial<Availability>) => setAvailability((p) => ({ ...p, ...d })),
    [],
  );
  const updateCompliance = useCallback(
    (d: Partial<ComplianceDocs>) => setCompliance((p) => ({ ...p, ...d })),
    [],
  );
  const updateTraining = useCallback(
    (d: Partial<Training>) => setTraining((p) => ({ ...p, ...d })),
    [],
  );
  const updateBank = useCallback(
    (d: Partial<BankDetails>) => setBank((p) => ({ ...p, ...d })),
    [],
  );

  const buildPayload = useCallback(
    (): EmployeeRegistration => ({
      ...personal,
      ...contact,
      ...workRights,
      ...availability,
      ...compliance,
      ...training,
      ...bank,
      agreedToTerms,
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    [
      personal,
      contact,
      workRights,
      availability,
      compliance,
      training,
      bank,
      agreedToTerms,
    ],
  );

  const resetForm = useCallback(() => {
    setStep(0);
    setPersonal(seedPersonal);
    setContact(seedContact);
    setWorkRights(seedWorkRights);
    setAvailability(seedAvailability);
    setCompliance(seedCompliance);
    setTraining(seedTraining);
    setBank(seedBank);
    setAgreedToTerms(seedAgreed);
    setStatus(seedStatus);
  }, [
    seedPersonal,
    seedContact,
    seedWorkRights,
    seedAvailability,
    seedCompliance,
    seedTraining,
    seedBank,
    seedAgreed,
    seedStatus,
  ]);

  return (
    <RegistrationContext.Provider
      value={{
        step,
        setStep,
        nextStep,
        prevStep,
        personal,
        contact,
        workRights,
        availability,
        compliance,
        training,
        bank,
        agreedToTerms,
        status,
        mode,
        employeeId,
        updatePersonal,
        updateContact,
        updateWorkRights,
        updateAvailability,
        updateCompliance,
        updateTraining,
        updateBank,
        setAgreedToTerms,
        setStatus,
        buildPayload,
        resetForm,
        onSuccess,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useRegistration() {
  const ctx = useContext(RegistrationContext);
  if (!ctx)
    throw new Error(
      "useRegistration must be used inside <RegistrationProvider>",
    );
  return ctx;
}
