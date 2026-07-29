"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRegistration } from "../context";
import { SectionDivider, StepHeading, ToggleRow } from "../ui";
import { StepNav } from "../wizard";
import { submitRegistration } from "../../lib/api";

// ─── Mini summary row ─────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: string | boolean | number }) {
  const display =
    typeof value === "boolean"
      ? value ? "Yes" : "No"
      : value || "—";

  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right font-medium text-zinc-900">{String(display)}</span>
    </div>
  );
}

// ─── Step component ───────────────────────────────────────────────────────────

export function StepReview() {
  const {
    personal,
    contact,
    workRights,
    availability,
    compliance,
    training,
    bank,
    agreedToTerms,
    setAgreedToTerms,
    prevStep,
    buildPayload,
    resetForm,
  } = useRegistration();

  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: submitRegistration,
    onSuccess: () => setSubmitted(true),
  });

  function handleSubmit() {
    if (!agreedToTerms) return;
    mutation.mutate(buildPayload());
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-4xl">
          🎉
        </div>
        <h2 className="mt-5 text-2xl font-bold text-zinc-900">You&apos;re registered!</h2>
        <p className="mt-3 max-w-sm text-sm text-zinc-500">
          Welcome to the Lakhbatti platform. Our team will review your profile and start
          matching you to suitable jobs. You&apos;ll hear from us via{" "}
          {contact.notifyBySms ? "SMS" : "email"} shortly.
        </p>
        <div className="mt-6 rounded-xl bg-brand-50 px-5 py-3 text-sm font-medium text-brand-700">
          Application ID: #{mutation.data?.id ?? "—"}
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="mt-6 text-sm text-zinc-500 underline hover:text-zinc-700"
        >
          Register another employee
        </button>
      </div>
    );
  }

  const DAY_LABELS: Record<string, string> = {
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
  };

  const availabilityWindows = (() => {
    const slots = availability.daySlots ?? {};
    const entries = Object.keys(slots);
    if (entries.length === 0) return "—";

    return entries
      .map((day) => {
        const ranges = slots[day as keyof typeof slots] ?? [];
        const label = DAY_LABELS[day] ?? day;
        const pretty = ranges
          .map((r) => (r.from && r.to ? `${r.from}–${r.to}` : null))
          .filter(Boolean)
          .join(", ");
        return `${label}: ${pretty || "—"}`;
      })
      .join(" | ");
  })();

  const visaDisplay =
    workRights.visaStatus === "other" && workRights.visaOther.trim()
      ? `Other (${workRights.visaOther.trim()})`
      : workRights.visaStatus;

  return (
    <div>
      <StepHeading
        title="Review & Submit"
        description="Make sure everything looks right before submitting."
      />

      {/* Personal */}
      <SectionDivider label="Personal details" />
      <div className="divide-y divide-zinc-100">
        <Row label="Full name" value={`${personal.firstName} ${personal.lastName}`} />
        <Row label="Date of birth" value={personal.dateOfBirth} />
        <Row label="Gender" value={personal.gender} />
      </div>

      {/* Contact */}
      <div className="mt-4">
        <SectionDivider label="Contact" />
        <div className="divide-y divide-zinc-100">
          <Row label="Email" value={contact.email} />
          <Row label="Phone" value={contact.phone} />
          <Row label="Address" value={`${contact.address}, ${contact.suburb} ${contact.state} ${contact.postcode}`} />
          <Row label="SMS notifications" value={contact.notifyBySms} />
          <Row label="Email notifications" value={contact.notifyByEmail} />
        </div>
      </div>

      {/* Work rights */}
      <div className="mt-4">
        <SectionDivider label="Work rights" />
        <div className="divide-y divide-zinc-100">
          <Row label="Visa status" value={visaDisplay} />
          <Row label="TFN provided" value={!!workRights.tfn} />
          <Row label="Has ABN" value={workRights.hasAbn} />
        </div>
      </div>

      {/* Availability */}
      <div className="mt-4">
        <SectionDivider label="Availability" />
        <div className="divide-y divide-zinc-100">
          <Row label="Work type" value={availability.workType} />
          <Row label="Available windows" value={availabilityWindows} />
          <Row label="Urgency" value={availability.urgency} />
          <Row label="Pay rate ($/hr)" value={`$${availability.expectedPayRate}`} />
        </div>
      </div>

      {/* Training */}
      <div className="mt-4">
        <SectionDivider label="Training & experience" />
        <div className="divide-y divide-zinc-100">
          <Row label="Experience" value={training.yearsExperience} />
          <Row label="Certifications" value={training.certifications.length > 0 ? training.certifications.join(", ") : "None"} />
          <Row label="Machines" value={training.machinesHandled.length > 0 ? training.machinesHandled.join(", ") : "None"} />
        </div>
      </div>

      {/* Bank */}
      <div className="mt-4">
        <SectionDivider label="Bank & super" />
        <div className="divide-y divide-zinc-100">
          <Row label="Account name" value={bank.accountName} />
          <Row label="BSB" value={bank.bsb} />
          <Row label="Account number" value={bank.accountNumber.replace(/.(?=.{4})/g, "*")} />
          <Row label="Super fund" value={bank.superFundName} />
        </div>
      </div>

      {/* Terms */}
      <div className="mt-6">
        <ToggleRow
          label="I confirm all information is accurate and I agree to the terms & conditions"
          checked={agreedToTerms}
          onChange={setAgreedToTerms}
        />
      </div>

      {/* Error */}
      {mutation.isError && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          Something went wrong. Please check your connection and try again.
        </div>
      )}

      {!agreedToTerms && (
        <p className="mt-2 text-xs text-amber-600">
          You must agree to the terms before submitting.
        </p>
      )}

      <StepNav
        onBack={prevStep}
        onNext={handleSubmit}
        nextLabel="Submit Application"
        isLast
        loading={mutation.isPending}
      />
    </div>
  );
}
