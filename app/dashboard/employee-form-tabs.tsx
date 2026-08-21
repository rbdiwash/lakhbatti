"use client";

import { RegistrationProvider, useRegistration } from "../register/context";
import { REGISTRATION_STEPS } from "../lib/steps";
import { StepPersonal } from "../register/steps/step-personal";
import { StepContact } from "../register/steps/step-contact";
import { StepWorkRights } from "../register/steps/step-work-rights";
import { StepAvailability } from "../register/steps/step-availability";
import { StepCompliance } from "../register/steps/step-compliance";
import { StepTraining } from "../register/steps/step-training";
import { StepBank } from "../register/steps/step-bank";
import { StepReview } from "../register/steps/step-review";
import type { ComponentProps } from "react";

const STEP_COMPONENTS = [
  StepPersonal,
  StepContact,
  StepWorkRights,
  StepAvailability,
  StepCompliance,
  StepTraining,
  StepBank,
  StepReview,
];

const TAB_LABELS = [
  "Personal",
  "Contact",
  "Work rights",
  "Availability",
  "Compliance",
  "Training",
  "Bank",
  "Review",
];

function EmployeeFormTabsInner() {
  const { step, setStep } = useRegistration();
  const ActiveStep = STEP_COMPONENTS[step];
  const meta = REGISTRATION_STEPS[step];

  return (
    <div>
      <div className="border-b border-zinc-200">
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {TAB_LABELS.map((label, index) => {
            const active = step === index;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setStep(index)}
                className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium ${
                  active
                    ? "border-brand-600 text-brand-700"
                    : "border-transparent text-zinc-500 hover:border-zinc-200 hover:text-zinc-800"
                }`}
              >
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
        {meta ? (
          <p className="mb-4 text-sm text-zinc-500">{meta.description}</p>
        ) : null}
        {ActiveStep ? <ActiveStep /> : null}
      </div>
    </div>
  );
}

type ProviderProps = ComponentProps<typeof RegistrationProvider>;

export function EmployeeFormTabs(props: Omit<ProviderProps, "children">) {
  return (
    <RegistrationProvider {...props}>
      <EmployeeFormTabsInner />
    </RegistrationProvider>
  );
}
