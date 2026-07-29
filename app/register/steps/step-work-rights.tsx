"use client";

import { useState } from "react";
import { useRegistration } from "../context";
import { Field, Input, SectionDivider, StepHeading, ToggleRow } from "../ui";
import { StepNav } from "../wizard";
import type { VisaStatus } from "../../lib/types";

const VISA_OPTIONS: { value: VisaStatus; label: string }[] = [
  { value: "australian-citizen", label: "Australian Citizen" },
  { value: "permanent-resident", label: "Permanent Resident" },
  { value: "temporary-work-visa", label: "Temporary Work Visa" },
  { value: "student-visa", label: "Student Visa" },
  { value: "working-holiday", label: "Working Holiday Visa" },
  { value: "other", label: "Other" },
];

const VISA_REQUIRES_EXPIRY: VisaStatus[] = [
  "temporary-work-visa",
  "student-visa",
  "working-holiday",
  "other",
];

type Errors = Partial<Record<"tfn" | "visaExpiry" | "visaOther", string>>;

export function StepWorkRights() {
  const { workRights, updateWorkRights, nextStep, prevStep } = useRegistration();
  const [errors, setErrors] = useState<Errors>({});

  const needsExpiry = VISA_REQUIRES_EXPIRY.includes(workRights.visaStatus);
  const isOther = workRights.visaStatus === "other";
  const visaOther = workRights.visaOther;

  function handleNext() {
    const e: Errors = {};
    if (!workRights.tfn.trim()) e.tfn = "Tax File Number is required.";
    if (needsExpiry && !workRights.visaExpiry) e.visaExpiry = "Visa expiry date is required.";
    if (isOther && !visaOther.trim()) e.visaOther = "Please specify your visa type.";
    setErrors(e);
    if (Object.keys(e).length === 0) nextStep();
  }

  return (
    <div>
      <StepHeading
        title="Work Rights & Visa"
        description="This information ensures we match you to jobs you're legally able to take."
      />

      <SectionDivider label="Visa status" />

      <div className="mt-4 grid gap-3">
        {VISA_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() =>
              updateWorkRights({
                visaStatus: opt.value,
                visaOther: opt.value === "other" ? workRights.visaOther : "",
              })
            }
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
              workRights.visaStatus === opt.value
                ? "border-brand-600 bg-brand-50 text-brand-700"
                : "border-zinc-200 text-zinc-700 hover:border-brand-300"
            }`}
          >
            <span
              className={`h-4 w-4 rounded-full border-2 flex-shrink-0 ${
                workRights.visaStatus === opt.value
                  ? "border-brand-600 bg-brand-600"
                  : "border-zinc-300"
              }`}
            />
            {opt.label}
          </button>
        ))}
      </div>

      {/* Ask which visa when "Other" is selected */}
      {isOther && (
        <div className="mt-4">
          <Field label="Please specify your visa type" required error={errors.visaOther}>
            <Input
              value={visaOther}
              onChange={(e) => updateWorkRights({ visaOther: e.target.value })}
              placeholder="e.g. Bridging Visa A, Spouse Visa 820…"
              error={!!errors.visaOther}
            />
          </Field>
        </div>
      )}

      {needsExpiry && (
        <div className="mt-4">
          <Field label="Visa expiry date" required error={errors.visaExpiry}>
            <Input
              type="date"
              value={workRights.visaExpiry}
              onChange={(e) => updateWorkRights({ visaExpiry: e.target.value })}
              error={!!errors.visaExpiry}
            />
          </Field>
        </div>
      )}

      <div className="mt-6">
        <SectionDivider label="Tax & ABN" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Tax File Number (TFN)" required error={errors.tfn}>
            <Input
              value={workRights.tfn}
              onChange={(e) => updateWorkRights({ tfn: e.target.value })}
              placeholder="123 456 789"
              maxLength={11}
              error={!!errors.tfn}
            />
          </Field>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <ToggleRow
          label="I have an ABN (Australian Business Number)"
          description="Required for independent contractors"
          checked={workRights.hasAbn}
          onChange={(v) => updateWorkRights({ hasAbn: v, abn: v ? workRights.abn : "" })}
        />
        {workRights.hasAbn && (
          <Field label="ABN">
            <Input
              value={workRights.abn}
              onChange={(e) => updateWorkRights({ abn: e.target.value })}
              placeholder="12 345 678 901"
              maxLength={14}
            />
          </Field>
        )}
      </div>

      <StepNav onBack={prevStep} onNext={handleNext} />
    </div>
  );
}
