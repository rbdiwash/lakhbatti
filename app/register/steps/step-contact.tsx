"use client";

import { useState } from "react";
import { useRegistration } from "../context";
import { Field, Input, SectionDivider, StepHeading, ToggleRow } from "../ui";
import { StepNav } from "../wizard";

const AU_STATES = [
  { value: "NSW", label: "New South Wales" },
  { value: "VIC", label: "Victoria" },
  { value: "QLD", label: "Queensland" },
  { value: "WA", label: "Western Australia" },
  { value: "SA", label: "South Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "ACT", label: "Australian Capital Territory" },
  { value: "NT", label: "Northern Territory" },
];

type Errors = Partial<Record<"email" | "phone" | "address" | "suburb" | "state" | "postcode", string>>;

function validate(c: ReturnType<typeof useRegistration>["contact"]): Errors {
  const e: Errors = {};
  if (!c.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) e.email = "Valid email required.";
  if (!c.phone.trim()) e.phone = "Phone number is required.";
  if (!c.address.trim()) e.address = "Street address is required.";
  if (!c.suburb.trim()) e.suburb = "Suburb is required.";
  if (!c.state) e.state = "State is required.";
  if (!c.postcode || !/^\d{4}$/.test(c.postcode)) e.postcode = "Valid 4-digit postcode required.";
  return e;
}

export function StepContact() {
  const { contact, updateContact, nextStep, prevStep } = useRegistration();
  const [errors, setErrors] = useState<Errors>({});

  function handleNext() {
    const e = validate(contact);
    setErrors(e);
    if (Object.keys(e).length === 0) nextStep();
  }

  return (
    <div>
      <StepHeading
        title="Contact & Notifications"
        description="We'll use this to send job matches, roster updates, and payslips."
      />

      <SectionDivider label="Contact info" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" required error={errors.email}>
          <Input
            type="email"
            value={contact.email}
            onChange={(e) => updateContact({ email: e.target.value })}
            placeholder="jane@example.com"
            error={!!errors.email}
          />
        </Field>

        <Field label="Mobile phone" required error={errors.phone}>
          <Input
            type="tel"
            value={contact.phone}
            onChange={(e) => updateContact({ phone: e.target.value })}
            placeholder="04xx xxx xxx"
            error={!!errors.phone}
          />
        </Field>

        <Field label="Street address" required error={errors.address} >
          <Input
            value={contact.address}
            onChange={(e) => updateContact({ address: e.target.value })}
            placeholder="123 Main Street"
            error={!!errors.address}
          />
        </Field>

        <Field label="Suburb" required error={errors.suburb}>
          <Input
            value={contact.suburb}
            onChange={(e) => updateContact({ suburb: e.target.value })}
            placeholder="Bankstown"
            error={!!errors.suburb}
          />
        </Field>

        <Field label="State" required error={errors.state}>
          <select
            value={contact.state}
            onChange={(e) => updateContact({ state: e.target.value })}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            <option value="">Select state</option>
            {AU_STATES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Postcode" required error={errors.postcode}>
          <Input
            value={contact.postcode}
            onChange={(e) => updateContact({ postcode: e.target.value })}
            placeholder="2200"
            maxLength={4}
            error={!!errors.postcode}
          />
        </Field>
      </div>

      <div className="mt-6 grid gap-3">
        <SectionDivider label="Notifications" />
        <ToggleRow
          label="SMS notifications"
          description="Receive job alerts and updates via text"
          checked={contact.notifyBySms}
          onChange={(v) => updateContact({ notifyBySms: v })}
        />
        <ToggleRow
          label="Email notifications"
          description="Receive schedules and payslips via email"
          checked={contact.notifyByEmail}
          onChange={(v) => updateContact({ notifyByEmail: v })}
        />
      </div>

      <div className="mt-6">
        <SectionDivider label="Emergency contact" />
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <Input
              value={contact.emergencyContactName}
              onChange={(e) => updateContact({ emergencyContactName: e.target.value })}
              placeholder="Full name"
            />
          </Field>
          <Field label="Phone">
            <Input
              type="tel"
              value={contact.emergencyContactPhone}
              onChange={(e) => updateContact({ emergencyContactPhone: e.target.value })}
              placeholder="04xx xxx xxx"
            />
          </Field>
        </div>
      </div>

      <StepNav onBack={prevStep} onNext={handleNext} />
    </div>
  );
}
