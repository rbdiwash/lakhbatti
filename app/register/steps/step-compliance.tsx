"use client";

import { useRegistration } from "../context";
import { Field, Input, SectionDivider, StepHeading, ToggleRow } from "../ui";
import { StepNav } from "../wizard";

export function StepCompliance() {
  const { compliance, updateCompliance, nextStep, prevStep } = useRegistration();

  return (
    <div>
      <StepHeading
        title="Compliance Documents"
        description="Let us know which checks and licences you hold. These affect which jobs you can be matched to."
      />

      <div className="grid gap-4">
        <SectionDivider label="Background checks" />

        <ToggleRow
          label="National Police Check"
          description="Certificate issued within the last 3 years"
          checked={compliance.hasPoliceCheck}
          onChange={(v) => updateCompliance({ hasPoliceCheck: v, policeCheckExpiry: v ? compliance.policeCheckExpiry : "" })}
        />
        {compliance.hasPoliceCheck && (
          <Field label="Police check expiry">
            <Input
              type="date"
              value={compliance.policeCheckExpiry}
              onChange={(e) => updateCompliance({ policeCheckExpiry: e.target.value })}
            />
          </Field>
        )}

        <ToggleRow
          label="Working With Children Check"
          description="Required for some aged care and school sites"
          checked={compliance.hasWorkingWithChildren}
          onChange={(v) => updateCompliance({ hasWorkingWithChildren: v, wwcExpiry: v ? compliance.wwcExpiry : "" })}
        />
        {compliance.hasWorkingWithChildren && (
          <Field label="WWC expiry">
            <Input
              type="date"
              value={compliance.wwcExpiry}
              onChange={(e) => updateCompliance({ wwcExpiry: e.target.value })}
            />
          </Field>
        )}

        <SectionDivider label="Insurance" />

        <ToggleRow
          label="Public Liability Insurance"
          description="Required for independent contractors"
          checked={compliance.hasPublicLiability}
          onChange={(v) => updateCompliance({ hasPublicLiability: v, insuranceExpiry: v ? compliance.insuranceExpiry : "" })}
        />
        {compliance.hasPublicLiability && (
          <Field label="Insurance expiry">
            <Input
              type="date"
              value={compliance.insuranceExpiry}
              onChange={(e) => updateCompliance({ insuranceExpiry: e.target.value })}
            />
          </Field>
        )}

        <SectionDivider label="Health & safety" />

        <ToggleRow
          label="COVID-19 Vaccination"
          description="Required for aged care, hospitals, and some government sites"
          checked={compliance.hasCovidVaccination}
          onChange={(v) => updateCompliance({ hasCovidVaccination: v })}
        />

        <SectionDivider label="Other documents" />
        <Field label="List any other certificates or licences">
          <textarea
            value={compliance.otherDocs}
            onChange={(e) => updateCompliance({ otherDocs: e.target.value })}
            placeholder="e.g. White Card (OH&S), First Aid Certificate, RSA…"
            rows={3}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100 resize-none"
          />
        </Field>
      </div>

      <StepNav onBack={prevStep} onNext={nextStep} />
    </div>
  );
}
