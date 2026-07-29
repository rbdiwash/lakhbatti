"use client";

import { useState } from "react";
import { useRegistration } from "../context";
import { Field, Input, Select, StepHeading } from "../ui";
import { StepNav } from "../wizard";

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

type Errors = Partial<Record<"firstName" | "lastName" | "dateOfBirth" | "gender", string>>;

function validate(data: ReturnType<typeof useRegistration>["personal"]): Errors {
  const e: Errors = {};
  if (!data.firstName.trim()) e.firstName = "First name is required.";
  if (!data.lastName.trim()) e.lastName = "Last name is required.";
  if (!data.dateOfBirth) e.dateOfBirth = "Date of birth is required.";
  if (!data.gender) e.gender = "Please select your gender.";
  return e;
}

export function StepPersonal() {
  const { personal, updatePersonal, nextStep } = useRegistration();
  const [errors, setErrors] = useState<Errors>({});

  function handleNext() {
    const e = validate(personal);
    setErrors(e);
    if (Object.keys(e).length === 0) nextStep();
  }

  return (
    <div>
      <StepHeading
        title="Personal Details"
        description="Let's start with the basics. This is how employers will identify you."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" required error={errors.firstName}>
          <Input
            value={personal.firstName}
            onChange={(e) => updatePersonal({ firstName: e.target.value })}
            placeholder="Jane"
            error={!!errors.firstName}
          />
        </Field>

        <Field label="Last name" required error={errors.lastName}>
          <Input
            value={personal.lastName}
            onChange={(e) => updatePersonal({ lastName: e.target.value })}
            placeholder="Smith"
            error={!!errors.lastName}
          />
        </Field>

        <Field label="Date of birth" required error={errors.dateOfBirth}>
          <Input
            type="date"
            value={personal.dateOfBirth}
            onChange={(e) => updatePersonal({ dateOfBirth: e.target.value })}
            error={!!errors.dateOfBirth}
          />
        </Field>

        <Field label="Gender" required error={errors.gender}>
          <Select
            value={personal.gender}
            onChange={(e) => updatePersonal({ gender: e.target.value })}
            options={GENDER_OPTIONS}
            placeholder="Select gender"
            error={!!errors.gender}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Profile photo (optional)">
          <input
            type="file"
            accept="image/*"
            className="block w-full text-sm text-zinc-500 file:mr-4 file:rounded-full file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) updatePersonal({ profilePhoto: file.name });
            }}
          />
        </Field>
      </div>

      <StepNav isFirst onNext={handleNext} />
    </div>
  );
}
