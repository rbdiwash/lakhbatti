// Reusable form primitives used across all registration steps.
// Keeping them here avoids leaking register-specific styles into shared components.

import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

// ─── Shared class tokens ─────────────────────────────────────────────────────

export const fieldClass =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100 transition-colors";

export const labelClass = "block text-sm font-medium text-zinc-700 mb-1.5";

// ─── Field wrapper ───────────────────────────────────────────────────────────

export function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className={labelClass}>
        {label}
        {required && <span className="ml-0.5 text-brand-600">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Input ───────────────────────────────────────────────────────────────────

type InputProps = InputHTMLAttributes<HTMLInputElement> & { error?: boolean };

export function Input({ className, error, ...props }: InputProps) {
  return (
    <input
      className={`${fieldClass} ${error ? "border-red-400 focus:ring-red-100" : ""} ${className ?? ""}`}
      {...props}
    />
  );
}

// ─── Select ──────────────────────────────────────────────────────────────────

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: boolean;
};

export function Select({ options, placeholder, error, className, ...props }: SelectProps) {
  return (
    <select
      className={`${fieldClass} ${error ? "border-red-400" : ""} ${className ?? ""}`}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// ─── Textarea ────────────────────────────────────────────────────────────────

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      rows={3}
      className={`${fieldClass} resize-none ${className ?? ""}`}
      {...props}
    />
  );
}

// ─── Toggle chip (multi-select) ───────────────────────────────────────────────

export function MultiChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        selected
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-zinc-200 text-zinc-600 hover:border-brand-400 hover:text-brand-600"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Toggle (yes/no) ─────────────────────────────────────────────────────────

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-100 ${
        checked ? "bg-brand-600" : "bg-zinc-200"
      }`}
    >
      <span className="sr-only">{label}</span>
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// ─── Toggle row ──────────────────────────────────────────────────────────────

export function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-zinc-900">{label}</p>
        {description && <p className="text-xs text-zinc-500">{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

// ─── Step heading ─────────────────────────────────────────────────────────────

export function StepHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-zinc-900">{title}</h2>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
    </div>
  );
}

// ─── Section divider ─────────────────────────────────────────────────────────

export function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="h-px flex-1 bg-zinc-100" />
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        {label}
      </span>
      <div className="h-px flex-1 bg-zinc-100" />
    </div>
  );
}
