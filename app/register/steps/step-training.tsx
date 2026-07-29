"use client";

import { useRegistration } from "../context";
import {
  Field,
  Input,
  MultiChip,
  SectionDivider,
  Select,
  StepHeading,
} from "../ui";
import { StepNav } from "../wizard";

const CERTIFICATIONS = [
  "White Card (Construction Induction)",
  "First Aid Certificate",
  "CPR Certificate",
  "RSA (Responsible Service of Alcohol)",
  "Food Handler Certificate",
  "Forklift Licence",
  "Manual Handling Training",
  "Chemical Handling (SDS)",
  "WHMIS / Hazardous Materials",
];

const MACHINES = [
  "Ride-on Mower",
  "Commercial Vacuum",
  "Steam Cleaner",
  "Floor Scrubber/Polisher",
  "Pressure Washer",
  "Carpet Extractor",
  "Scissor Lift / EWP",
  "High-Reach Equipment",
  "Forklift",
];

const SPECIALISATIONS = [
  "Domestic Cleaning",
  "Housekeeping",
  "Commercial Cleaning",
  "End of Lease / Bond",
  "Carpet Cleaning",
  "Gardening & Landscaping",
  "High-Rise / Window Cleaning",
  "Aged Care Facilities",
  "Hospital / Medical Sites",
  "Industrial Sites",
];

const EXPERIENCE_OPTIONS = [
  { value: "0-1", label: "Less than 1 year" },
  { value: "1-2", label: "1–2 years" },
  { value: "2-5", label: "2–5 years" },
  { value: "5-10", label: "5–10 years" },
  { value: "10+", label: "10+ years" },
];

export function StepTraining() {
  const { training, updateTraining, nextStep, prevStep } = useRegistration();

  function toggle(
    field: "certifications" | "machinesHandled" | "specialisations",
    val: string,
  ) {
    const list = training[field];
    updateTraining({
      [field]: list.includes(val)
        ? list.filter((v) => v !== val)
        : [...list, val],
    });
  }

  function updateRef(index: number, key: string, value: string) {
    const refs = training.references.map((r, i) =>
      i === index ? { ...r, [key]: value } : r,
    );
    updateTraining({ references: refs });
  }

  function addRef() {
    updateTraining({
      references: [
        ...training.references,
        { name: "", company: "", phone: "", relationship: "" },
      ],
    });
  }

  function removeRef(index: number) {
    updateTraining({
      references: training.references.filter((_, i) => i !== index),
    });
  }

  return (
    <div>
      <StepHeading
        title="Training & Experience"
        description="Your skills and experience help us match you to the best jobs."
      />

      <SectionDivider label="Years of experience" />
      <div className="mt-3">
        <Select
          value={training.yearsExperience}
          onChange={(e) => updateTraining({ yearsExperience: e.target.value })}
          options={EXPERIENCE_OPTIONS}
          placeholder="Select experience"
        />
      </div>

      <div className="mt-6">
        <SectionDivider label="Certifications & licences" />
        <div className="mt-3 flex flex-wrap gap-2">
          {CERTIFICATIONS.map((cert) => (
            <MultiChip
              key={cert}
              label={cert}
              selected={training.certifications.includes(cert)}
              onClick={() => toggle("certifications", cert)}
            />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <SectionDivider label="Equipment & machines" />
        <div className="mt-3 flex flex-wrap gap-2">
          {MACHINES.map((m) => (
            <MultiChip
              key={m}
              label={m}
              selected={training.machinesHandled.includes(m)}
              onClick={() => toggle("machinesHandled", m)}
            />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <SectionDivider label="Specialisations" />
        <div className="mt-3 flex flex-wrap gap-2">
          {SPECIALISATIONS.map((s) => (
            <MultiChip
              key={s}
              label={s}
              selected={training.specialisations.includes(s)}
              onClick={() => toggle("specialisations", s)}
            />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <SectionDivider label="References" />
        {training.references.map((ref, i) => (
          <div
            key={i}
            className="mt-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-700">
                Reference {i + 1}
              </p>
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => removeRef(i)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full name">
                <Input
                  value={ref.name}
                  onChange={(e) => updateRef(i, "name", e.target.value)}
                  placeholder="John Doe"
                />
              </Field>
              <Field label="Company">
                <Input
                  value={ref.company}
                  onChange={(e) => updateRef(i, "company", e.target.value)}
                  placeholder="CleanCo Pty Ltd"
                />
              </Field>
              <Field label="Phone">
                <Input
                  type="tel"
                  value={ref.phone}
                  onChange={(e) => updateRef(i, "phone", e.target.value)}
                  placeholder="04xx xxx xxx"
                />
              </Field>
              <Field label="Relationship">
                <Input
                  value={ref.relationship}
                  onChange={(e) => updateRef(i, "relationship", e.target.value)}
                  placeholder="Supervisor / Manager"
                />
              </Field>
            </div>
          </div>
        ))}
        {training.references.length < 3 && (
          <button
            type="button"
            onClick={addRef}
            className="mt-3 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            + Add another reference
          </button>
        )}
      </div>

      <StepNav onBack={prevStep} onNext={nextStep} />
    </div>
  );
}
