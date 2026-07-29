"use client";

import { useState } from "react";
import { useRegistration } from "../context";
import { Field, Input, SectionDivider, StepHeading } from "../ui";
import { StepNav } from "../wizard";

type Errors = Partial<Record<"accountName" | "bsb" | "accountNumber" | "superFundName", string>>;

function validate(b: ReturnType<typeof useRegistration>["bank"]): Errors {
  const e: Errors = {};
  if (!b.accountName.trim()) e.accountName = "Account name is required.";
  if (!/^\d{6}$/.test(b.bsb.replace(/-/g, ""))) e.bsb = "BSB must be 6 digits.";
  if (!b.accountNumber.trim()) e.accountNumber = "Account number is required.";
  if (!b.superFundName.trim()) e.superFundName = "Super fund name is required.";
  return e;
}

export function StepBank() {
  const { bank, updateBank, nextStep, prevStep } = useRegistration();
  const [errors, setErrors] = useState<Errors>({});

  function handleNext() {
    const e = validate(bank);
    setErrors(e);
    if (Object.keys(e).length === 0) nextStep();
  }

  return (
    <div>
      <StepHeading
        title="Bank & Superannuation"
        description="Your pay will be deposited here. All information is encrypted and kept secure."
      />

      <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3">
        <span className="text-lg">🔒</span>
        <p className="text-xs text-amber-800">
          Your banking details are encrypted in transit and stored securely. They are only used to process payroll.
        </p>
      </div>

      <SectionDivider label="Bank account" />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Account name" required error={errors.accountName}>
          <Input
            value={bank.accountName}
            onChange={(e) => updateBank({ accountName: e.target.value })}
            placeholder="Jane Smith"
            error={!!errors.accountName}
          />
        </Field>

        <Field label="BSB" required error={errors.bsb}>
          <Input
            value={bank.bsb}
            onChange={(e) => updateBank({ bsb: e.target.value })}
            placeholder="012-345"
            maxLength={7}
            error={!!errors.bsb}
          />
        </Field>

        <Field label="Account number" required error={errors.accountNumber}>
          <Input
            value={bank.accountNumber}
            onChange={(e) => updateBank({ accountNumber: e.target.value })}
            placeholder="123456789"
            error={!!errors.accountNumber}
          />
        </Field>

        <Field label="Payment method">
          <div className="flex gap-3">
            {(["bank-transfer", "cheque"] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => updateBank({ paymentMethod: method })}
                className={`flex-1 rounded-xl border py-3 text-sm font-medium transition-colors ${
                  bank.paymentMethod === method
                    ? "border-brand-600 bg-brand-50 text-brand-700"
                    : "border-zinc-200 text-zinc-600 hover:border-brand-300"
                }`}
              >
                {method === "bank-transfer" ? "Bank Transfer" : "Cheque"}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <div className="mt-6">
        <SectionDivider label="Superannuation" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Super fund name" required error={errors.superFundName}>
            <Input
              value={bank.superFundName}
              onChange={(e) => updateBank({ superFundName: e.target.value })}
              placeholder="Australian Super"
              error={!!errors.superFundName}
            />
          </Field>
          <Field label="Member number">
            <Input
              value={bank.superMemberNumber}
              onChange={(e) => updateBank({ superMemberNumber: e.target.value })}
              placeholder="123456789"
            />
          </Field>
        </div>
      </div>

      <StepNav onBack={prevStep} onNext={handleNext} />
    </div>
  );
}
