import type { StepConfig } from "./types";

export const REGISTRATION_STEPS: StepConfig[] = [
  {
    id: "personal",
    title: "Personal Details",
    description: "Tell us a bit about yourself",
    icon: "LuUser",
  },
  {
    id: "contact",
    title: "Contact & Notifications",
    description: "How we and your employer can reach you",
    icon: "LuPhone",
  },
  {
    id: "work-rights",
    title: "Work Rights & Visa",
    description: "Your legal entitlement to work in Australia",
    icon: "LuShieldCheck",
  },
  {
    id: "availability",
    title: "Availability & Preferences",
    description: "When and how you prefer to work",
    icon: "LuCalendar",
  },
  {
    id: "compliance",
    title: "Compliance Documents",
    description: "Licences, checks, and insurance",
    icon: "LuClipboardCheck",
  },
  {
    id: "training",
    title: "Training & Experience",
    description: "Certificates, machines, and references",
    icon: "LuGraduationCap",
  },
  {
    id: "bank",
    title: "Bank & Super",
    description: "Where your pay goes",
    icon: "LuLandmark",
  },
  {
    id: "review",
    title: "Review & Submit",
    description: "Check everything then go live",
    icon: "LuCheckCircle",
  },
];

export const TOTAL_STEPS = REGISTRATION_STEPS.length;
