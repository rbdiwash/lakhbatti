"use client";

import type { IconType } from "react-icons";
import {
  LuBadgeCheck,
  LuBell,
  LuCalendarDays,
  LuClipboardList,
  LuGraduationCap,
  LuShieldCheck,
  LuSparkles,
  LuWallet,
} from "react-icons/lu";
import {
  getProgressNudge,
  STEP_MOTIVATION,
  type MotivationIconKey,
} from "../lib/register-motivation";
import { REGISTRATION_STEPS, TOTAL_STEPS } from "../lib/steps";
import { useRegistration } from "./context";
import { StepPersonal } from "./steps/step-personal";
import { StepContact } from "./steps/step-contact";
import { StepWorkRights } from "./steps/step-work-rights";
import { StepAvailability } from "./steps/step-availability";
import { StepCompliance } from "./steps/step-compliance";
import { StepTraining } from "./steps/step-training";
import { StepBank } from "./steps/step-bank";
import { StepReview } from "./steps/step-review";

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

const MOTIVATION_ICON_META: Record<
  MotivationIconKey,
  { Icon: IconType; boxClass: string }
> = {
  sparkles: {
    Icon: LuSparkles,
    boxClass: "bg-brand-600 shadow-brand-600/25",
  },
  bell: {
    Icon: LuBell,
    boxClass: "bg-sky-600 shadow-sky-600/25",
  },
  shield: {
    Icon: LuShieldCheck,
    boxClass: "bg-emerald-600 shadow-emerald-600/25",
  },
  calendar: {
    Icon: LuCalendarDays,
    boxClass: "bg-violet-600 shadow-violet-600/25",
  },
  clipboard: {
    Icon: LuClipboardList,
    boxClass: "bg-amber-600 shadow-amber-600/25",
  },
  graduation: {
    Icon: LuGraduationCap,
    boxClass: "bg-indigo-600 shadow-indigo-600/25",
  },
  wallet: {
    Icon: LuWallet,
    boxClass: "bg-teal-700 shadow-teal-700/25",
  },
  "badge-check": {
    Icon: LuBadgeCheck,
    boxClass: "bg-accent-600 shadow-accent-600/25",
  },
};

export function RegistrationWizard() {
  const { step } = useRegistration();
  const ActiveStep = STEP_COMPONENTS[step];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {/* Sidebar progress (desktop) + top bar (mobile) */}
      <WizardProgress currentStep={step} />

      <MotivationBanner step={step} />

      {/* Step card */}
      <div className="mt-6 rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm sm:p-8">
        {ActiveStep ? <ActiveStep /> : null}
      </div>
    </div>
  );
}

// ─── Motivation & assurance ───────────────────────────────────────────────────

function MotivationBanner({ step }: { step: number }) {
  const copy = STEP_MOTIVATION[step] ?? STEP_MOTIVATION[0];
  const nudge = getProgressNudge(step, TOTAL_STEPS);
  const { Icon, boxClass } = MOTIVATION_ICON_META[copy.icon];

  return (
    <div
      className="mt-6 overflow-hidden rounded-2xl border border-brand-100 bg-linear-to-br from-brand-50 via-white to-accent-400/10"
      role="status"
      aria-live="polite"
    >
      <div className="flex gap-4 p-4 sm:p-5">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${boxClass}`}
          aria-hidden
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          {nudge && (
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              {nudge}
            </p>
          )}
          <p className={`font-semibold text-zinc-900 ${nudge ? "mt-1" : ""}`}>
            {copy.headline}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-zinc-600">{copy.body}</p>
        </div>
      </div>
      <p className="border-t border-brand-100/80 bg-white/60 px-4 py-2.5 text-center text-xs text-zinc-500 sm:px-5">
        Stuck on something?{" "}
        <span className="font-medium text-brand-700">
          Take your time — there's no timer, and every section gets you closer to paid shifts.
        </span>
      </p>
    </div>
  );
}

// ─── Progress component ───────────────────────────────────────────────────────

function WizardProgress({ currentStep }: { currentStep: number }) {
  const pct = Math.round(((currentStep + 1) / TOTAL_STEPS) * 100);

  return (
    <div>
      {/* Mobile: linear bar */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
          <span>{REGISTRATION_STEPS[currentStep]?.title}</span>
          <span>
            {currentStep + 1} / {TOTAL_STEPS}
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Desktop: step pills */}
      <ol className="hidden flex-wrap gap-x-2 gap-y-3 sm:flex">
        {REGISTRATION_STEPS.map((s, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <li key={s.id} className="flex items-center gap-1.5">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ring-2 transition-all ${
                  done
                    ? "bg-brand-600 text-white ring-brand-600"
                    : active
                      ? "bg-white text-brand-600 ring-brand-600"
                      : "bg-zinc-100 text-zinc-400 ring-zinc-100"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={`text-xs font-medium ${
                  active ? "text-brand-700" : done ? "text-zinc-600" : "text-zinc-400"
                }`}
              >
                {s.title}
              </span>
              {i < TOTAL_STEPS - 1 && (
                <span className="mx-1 text-zinc-200">›</span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ─── Shared nav buttons used by every step ────────────────────────────────────

export function StepNav({
  onBack,
  onNext,
  nextLabel = "Continue",
  backLabel = "Back",
  isFirst = false,
  isLast = false,
  loading = false,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  backLabel?: string;
  isFirst?: boolean;
  isLast?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3">
      {!isFirst ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-50"
        >
          ← {backLabel}
        </button>
      ) : (
        <div />
      )}
      <button
        type={isLast ? "submit" : "button"}
        onClick={isLast ? undefined : onNext}
        disabled={loading}
        className="rounded-full bg-brand-600 px-7 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-300"
      >
        {loading ? "Submitting…" : `${nextLabel} ${isLast ? "" : "→"}`}
      </button>
    </div>
  );
}
