"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type {
  Availability,
  BankDetails,
  ComplianceDocs,
  ContactDetails,
  EmployeeRegistration,
  PersonalDetails,
  Training,
  WorkRights,
} from "../lib/types";

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
  buildPayload: () => EmployeeRegistration;
  resetForm: () => void;
};

const RegistrationContext = createContext<RegistrationContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function RegistrationProvider({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState(0);
  const [personal, setPersonal] = useState(emptyPersonal);
  const [contact, setContact] = useState(emptyContact);
  const [workRights, setWorkRights] = useState(emptyWorkRights);
  const [availability, setAvailability] = useState(emptyAvailability);
  const [compliance, setCompliance] = useState(emptyCompliance);
  const [training, setTraining] = useState(emptyTraining);
  const [bank, setBank] = useState(emptyBank);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const nextStep = useCallback(() => setStep((s) => s + 1), []);
  const prevStep = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  const updatePersonal = useCallback((d: Partial<PersonalDetails>) => setPersonal((p) => ({ ...p, ...d })), []);
  const updateContact = useCallback((d: Partial<ContactDetails>) => setContact((p) => ({ ...p, ...d })), []);
  const updateWorkRights = useCallback((d: Partial<WorkRights>) => setWorkRights((p) => ({ ...p, ...d })), []);
  const updateAvailability = useCallback((d: Partial<Availability>) => setAvailability((p) => ({ ...p, ...d })), []);
  const updateCompliance = useCallback((d: Partial<ComplianceDocs>) => setCompliance((p) => ({ ...p, ...d })), []);
  const updateTraining = useCallback((d: Partial<Training>) => setTraining((p) => ({ ...p, ...d })), []);
  const updateBank = useCallback((d: Partial<BankDetails>) => setBank((p) => ({ ...p, ...d })), []);

  const buildPayload = useCallback(
    (): EmployeeRegistration => ({
      personal,
      contact,
      workRights,
      availability,
      compliance,
      training,
      bank,
      agreedToTerms,
      submittedAt: new Date().toISOString(),
    }),
    [personal, contact, workRights, availability, compliance, training, bank, agreedToTerms],
  );

  const resetForm = useCallback(() => {
    setStep(0);
    setPersonal(emptyPersonal);
    setContact(emptyContact);
    setWorkRights(emptyWorkRights);
    setAvailability(emptyAvailability);
    setCompliance(emptyCompliance);
    setTraining(emptyTraining);
    setBank(emptyBank);
    setAgreedToTerms(false);
  }, []);

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
        updatePersonal,
        updateContact,
        updateWorkRights,
        updateAvailability,
        updateCompliance,
        updateTraining,
        updateBank,
        setAgreedToTerms,
        buildPayload,
        resetForm,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useRegistration() {
  const ctx = useContext(RegistrationContext);
  if (!ctx) throw new Error("useRegistration must be used inside <RegistrationProvider>");
  return ctx;
}
