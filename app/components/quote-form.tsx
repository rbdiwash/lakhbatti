"use client";

import { useRef, useState } from "react";
import type { ComponentType } from "react";
import {
  ArrowLeftIcon,
  BuildingIcon,
  CalendarIcon,
  CheckIcon,
  DotsIcon,
  HomeIcon,
  LeafIcon,
  RepeatIcon,
  ScissorsIcon,
  SparkleIcon,
  UserIcon,
} from "./icons";

type IconType = ComponentType<{ className?: string }>;

type ListField = "areas" | "gardenTasks" | "mowingExtras";

type QuoteData = {
  category: string;
  // Cleaning
  cleaningType: string;
  property: string;
  propertyOther: string;
  areas: string[];
  rooms: number;
  // Gardening
  gardeningType: string;
  gardenTasks: string[];
  gardenSize: string;
  // Mowing
  lawnSize: string;
  mowingExtras: string[];
  // Shared
  dateFrom: string;
  dateTo: string;
  frequency: string;
  name: string;
  email: string;
  phone: string;
  address: string;
};

const initialData: QuoteData = {
  category: "",
  cleaningType: "",
  property: "",
  propertyOther: "",
  areas: [],
  rooms: 1,
  gardeningType: "",
  gardenTasks: [],
  gardenSize: "",
  lawnSize: "",
  mowingExtras: [],
  dateFrom: "",
  dateTo: "",
  frequency: "",
  name: "",
  email: "",
  phone: "",
  address: "",
};

// Each category has its own sequence of steps. "category", "schedule" and
// "contact" are shared; the middle steps are specific to the service.
const flows: Record<string, string[]> = {
  Cleaning: [
    "category",
    "cleaningType",
    "property",
    "areas",
    "schedule",
    "contact",
  ],
  Gardening: [
    "category",
    "gardeningType",
    "gardenDetails",
    "schedule",
    "contact",
  ],
  Mowing: ["category", "lawnSize", "mowingExtras", "schedule", "contact"],
};

const titles: Record<string, string> = {
  category: "What do you need?",
  cleaningType: "Type of cleaning",
  property: "Your property",
  areas: "What should we clean?",
  gardeningType: "Type of gardening",
  gardenDetails: "Garden details",
  lawnSize: "Lawn size",
  mowingExtras: "Mowing extras",
  schedule: "When works for you?",
  contact: "Your details",
};

const categories: {
  value: string;
  label: string;
  description: string;
  icon: IconType;
}[] = [
  {
    value: "Cleaning",
    label: "Cleaning",
    description: "Homes, offices & end of lease",
    icon: SparkleIcon,
  },
  {
    value: "Gardening",
    label: "Gardening",
    description: "Tidy-ups, pruning & landscaping",
    icon: LeafIcon,
  },
  {
    value: "Mowing",
    label: "Mowing",
    description: "Lawn mowing & edging",
    icon: ScissorsIcon,
  },
];

const cleaningTypes = [
  { value: "General Cleaning", description: "Routine top-to-bottom clean" },
  { value: "End of Lease Cleaning", description: "Bond clean for inspections" },
  { value: "Deep Cleaning", description: "Intensive, detailed clean" },
];

const properties: { value: string; icon: IconType }[] = [
  { value: "House", icon: HomeIcon },
  { value: "Apartment", icon: BuildingIcon },
  { value: "Office", icon: BuildingIcon },
  { value: "Other", icon: DotsIcon },
];

const areaOptions = ["Bathroom", "Kitchen", "Laundry"];

const gardeningTypes = [
  { value: "Light Gardening", description: "Weeding, pruning & tidy-ups" },
  { value: "Landscaping", description: "Design & garden transformation" },
  { value: "Garden Maintenance", description: "Ongoing care & upkeep" },
];

const gardenTaskOptions = [
  "Weeding",
  "Pruning",
  "Hedge trimming",
  "Planting",
  "Rubbish removal",
];

const gardenSizes = ["Small", "Medium", "Large"];

const lawnSizes = [
  { value: "Small", description: "Courtyard or small yard" },
  { value: "Medium", description: "Standard suburban lawn" },
  { value: "Large", description: "Large block or acreage" },
];

const mowingExtraOptions = [
  "Edging",
  "Whipper snipping",
  "Green waste removal",
];

const frequencies = ["One-off", "Weekly", "Fortnightly", "Monthly"];

// Web3Forms access key (https://web3forms.com) — safe to expose in the client.
// Add it to .env.local as NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY and restart `next dev`.
const WEB3FORMS_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
console.log(process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY);

const inputClass =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClass = "block text-sm font-medium text-zinc-700";

export function QuoteForm() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<QuoteData>(initialData);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const otherRef = useRef<HTMLInputElement>(null);

  const flow = flows[data.category] ?? flows.Cleaning;
  const currentKey = flow[Math.min(step, flow.length - 1)];

  function update(partial: Partial<QuoteData>) {
    setData((d) => ({ ...d, ...partial }));
  }

  function next() {
    setStep((s) => Math.min(s + 1, flow.length - 1));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function toggleList(key: ListField, value: string) {
    setData((d) => {
      const list = d[key];
      return {
        ...d,
        [key]: list.includes(value)
          ? list.filter((v) => v !== value)
          : [...list, value],
      };
    });
  }

  function selectCategory(value: string) {
    update({ category: value });
    setStep(1);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: { name?: string; email?: string } = {};
    if (!data.name.trim()) nextErrors.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      nextErrors.email = "Please enter a valid email.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (!WEB3FORMS_ACCESS_KEY) {
      setSubmitError(
        "Email service isn't configured yet. Please call us or try again later.",
      );
      return;
    }

    setSending(true);
    setSubmitError(null);
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `New ${data.category || "service"} quote request — ${data.name}`,
          from_name: "Lakhbatti Website",
          replyto: data.email,
          ...buildEmailFields(data),
        }),
      });
      const result = await response.json();
      if (result.success) {
        setSubmitted(true);
      } else {
        setSubmitError(
          "Sorry, we couldn't send your request. Please try again or call us.",
        );
      }
    } catch {
      setSubmitError(
        "Network error. Please check your connection and try again.",
      );
    } finally {
      setSending(false);
    }
  }

  function reset() {
    setData(initialData);
    setErrors({});
    setSubmitError(null);
    setStep(0);
    setSubmitted(false);
  }

  if (submitted) {
    return <SuccessView data={data} onReset={reset} />;
  }

  return (
    <div className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm sm:p-8">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
          <span>
            Step {step + 1} of {flow.length}
          </span>
          <span>{titles[currentKey]}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-300"
            style={{ width: `${((step + 1) / flow.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Category (shared) */}
      {currentKey === "category" && (
        <Step
          title={titles.category}
          subtitle="Choose a service to get started."
        >
          <div className="grid gap-3">
            {categories.map((cat) => (
              <OptionCard
                key={cat.value}
                icon={cat.icon}
                title={cat.label}
                description={cat.description}
                selected={data.category === cat.value}
                onClick={() => selectCategory(cat.value)}
              />
            ))}
          </div>
        </Step>
      )}

      {/* Cleaning: type */}
      {currentKey === "cleaningType" && (
        <Step
          title={titles.cleaningType}
          subtitle="Pick the option that best fits your needs."
        >
          <div className="grid gap-3">
            {cleaningTypes.map((type) => (
              <OptionCard
                key={type.value}
                icon={SparkleIcon}
                title={type.value}
                description={type.description}
                selected={data.cleaningType === type.value}
                onClick={() => {
                  update({ cleaningType: type.value });
                  next();
                }}
              />
            ))}
          </div>
        </Step>
      )}

      {/* Cleaning: property */}
      {currentKey === "property" && (
        <Step
          title={titles.property}
          subtitle="What type of place are we cleaning?"
        >
          <div className="grid grid-cols-3 gap-3">
            {properties.map((prop) => (
              <OptionTile
                key={prop.value}
                icon={prop.icon}
                title={prop.value}
                selected={data.property === prop.value}
                onClick={() => {
                  if (prop.value === "Other") {
                    update({ property: "Other" });
                    setTimeout(() => otherRef.current?.focus(), 50);
                  } else {
                    update({ property: prop.value, propertyOther: "" });
                    next();
                  }
                }}
              />
            ))}
          </div>

          {data.property === "Other" && (
            <div className="mt-5">
              <label htmlFor="propertyOther" className={labelClass}>
                Tell us about your property
              </label>
              <input
                id="propertyOther"
                ref={otherRef}
                type="text"
                value={data.propertyOther}
                onChange={(e) => update({ propertyOther: e.target.value })}
                placeholder="e.g. Townhouse, studio, granny flat..."
                className={`mt-1.5 ${inputClass}`}
              />
              <NextButton
                disabled={!data.propertyOther.trim()}
                onClick={next}
              />
            </div>
          )}
        </Step>
      )}

      {/* Cleaning: areas + rooms */}
      {currentKey === "areas" && (
        <Step
          title={titles.areas}
          subtitle="Select the areas and number of rooms."
        >
          <p className="text-sm font-medium text-zinc-700">Areas to clean</p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {areaOptions.map((area) => (
              <ToggleChip
                key={area}
                label={area}
                selected={data.areas.includes(area)}
                onClick={() => toggleList("areas", area)}
              />
            ))}
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-zinc-700">Number of rooms</p>
            <div className="mt-3 flex items-center gap-4">
              <Stepper
                value={data.rooms}
                onDecrement={() =>
                  update({ rooms: Math.max(1, data.rooms - 1) })
                }
                onIncrement={() =>
                  update({ rooms: Math.min(20, data.rooms + 1) })
                }
              />
              <span className="text-sm text-zinc-500">
                {data.rooms} {data.rooms === 1 ? "room" : "rooms"}
              </span>
            </div>
          </div>

          <NextButton onClick={next} />
        </Step>
      )}

      {/* Gardening: type */}
      {currentKey === "gardeningType" && (
        <Step
          title={titles.gardeningType}
          subtitle="Pick the option that best fits your garden."
        >
          <div className="grid gap-3">
            {gardeningTypes.map((type) => (
              <OptionCard
                key={type.value}
                icon={LeafIcon}
                title={type.value}
                description={type.description}
                selected={data.gardeningType === type.value}
                onClick={() => {
                  update({ gardeningType: type.value });
                  next();
                }}
              />
            ))}
          </div>
        </Step>
      )}

      {/* Gardening: tasks + size */}
      {currentKey === "gardenDetails" && (
        <Step
          title={titles.gardenDetails}
          subtitle="Tell us what's involved and how big the garden is."
        >
          <p className="text-sm font-medium text-zinc-700">Tasks needed</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {gardenTaskOptions.map((task) => (
              <ToggleChip
                key={task}
                label={task}
                selected={data.gardenTasks.includes(task)}
                onClick={() => toggleList("gardenTasks", task)}
              />
            ))}
          </div>

          <div className="mt-6">
            <p className={labelClass}>Garden size</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {gardenSizes.map((size) => (
                <PillButton
                  key={size}
                  label={size}
                  selected={data.gardenSize === size}
                  onClick={() => update({ gardenSize: size })}
                />
              ))}
            </div>
          </div>

          <NextButton disabled={!data.gardenSize} onClick={next} />
        </Step>
      )}

      {/* Mowing: lawn size */}
      {currentKey === "lawnSize" && (
        <Step title={titles.lawnSize} subtitle="Roughly how big is the lawn?">
          <div className="grid gap-3">
            {lawnSizes.map((size) => (
              <OptionCard
                key={size.value}
                icon={ScissorsIcon}
                title={size.value}
                description={size.description}
                selected={data.lawnSize === size.value}
                onClick={() => {
                  update({ lawnSize: size.value });
                  next();
                }}
              />
            ))}
          </div>
        </Step>
      )}

      {/* Mowing: extras */}
      {currentKey === "mowingExtras" && (
        <Step
          title={titles.mowingExtras}
          subtitle="Add any extras you'd like (optional)."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {mowingExtraOptions.map((extra) => (
              <ToggleChip
                key={extra}
                label={extra}
                selected={data.mowingExtras.includes(extra)}
                onClick={() => toggleList("mowingExtras", extra)}
              />
            ))}
          </div>
          <NextButton onClick={next} />
        </Step>
      )}

      {/* Schedule (shared) */}
      {currentKey === "schedule" && (
        <Step
          title={titles.schedule}
          subtitle="Give us a rough date range — we'll confirm with you."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="dateFrom" className={labelClass}>
                Preferred from
              </label>
              <input
                id="dateFrom"
                type="date"
                value={data.dateFrom}
                onChange={(e) => update({ dateFrom: e.target.value })}
                className={`mt-1.5 ${inputClass}`}
              />
            </div>
            <div>
              <label htmlFor="dateTo" className={labelClass}>
                By (optional)
              </label>
              <input
                id="dateTo"
                type="date"
                value={data.dateTo}
                onChange={(e) => update({ dateTo: e.target.value })}
                className={`mt-1.5 ${inputClass}`}
              />
            </div>
          </div>

          <div className="mt-6">
            <p className={labelClass}>How often?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {frequencies.map((freq) => (
                <PillButton
                  key={freq}
                  label={freq}
                  selected={data.frequency === freq}
                  onClick={() => update({ frequency: freq })}
                />
              ))}
            </div>
          </div>

          <NextButton onClick={next} />
        </Step>
      )}

      {/* Contact (shared) */}
      {currentKey === "contact" && (
        <Step
          title={titles.contact}
          subtitle="Almost done — where should we send your quote?"
        >
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <label htmlFor="name" className={labelClass}>
                Full name <span className="text-brand-600">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={data.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="Jane Smith"
                className={`mt-1.5 ${inputClass}`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>
                Email <span className="text-brand-600">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => update({ email: e.target.value })}
                placeholder="you@example.com"
                className={`mt-1.5 ${inputClass}`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="phone" className={labelClass}>
                Phone (optional)
              </label>
              <input
                id="phone"
                type="tel"
                value={data.phone}
                onChange={(e) => update({ phone: e.target.value })}
                placeholder="04xx xxx xxx"
                className={`mt-1.5 ${inputClass}`}
              />
            </div>
            <div>
              <label htmlFor="address" className={labelClass}>
                Address (optional)
              </label>
              <input
                id="address"
                type="text"
                value={data.address}
                onChange={(e) => update({ address: e.target.value })}
                placeholder="Street, suburb"
                className={`mt-1.5 ${inputClass}`}
              />
            </div>

            {submitError && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">
                {submitError}
              </p>
            )}
            <button
              type="submit"
              disabled={sending}
              className="mt-2 w-full rounded-full bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-400"
            >
              {sending ? "Sending..." : "Request My Quote"}
            </button>
            <p className="text-center text-xs text-zinc-400">
              No obligation, no spam. We&apos;ll only use your details to send
              your quote.
            </p>
          </form>
        </Step>
      )}

      {/* Back */}
      {step > 0 && (
        <button
          type="button"
          onClick={back}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </button>
      )}
    </div>
  );
}

function Step({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-zinc-900">{title}</h2>
      <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function OptionCard({
  icon: Icon,
  title,
  description,
  selected,
  onClick,
}: {
  icon: IconType;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
        selected
          ? "border-brand-600 bg-brand-50"
          : "border-zinc-200 hover:border-brand-300 hover:bg-brand-50/40"
      }`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          selected ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-600"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="flex-1">
        <span className="block font-semibold text-zinc-900">{title}</span>
        <span className="mt-0.5 block text-sm text-zinc-500">
          {description}
        </span>
      </span>
      {selected && <CheckIcon className="h-5 w-5 text-brand-600" />}
    </button>
  );
}

function OptionTile({
  icon: Icon,
  title,
  selected,
  onClick,
}: {
  icon: IconType;
  title: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all ${
        selected
          ? "border-brand-600 bg-brand-50"
          : "border-zinc-200 hover:border-brand-300 hover:bg-brand-50/40"
      }`}
    >
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          selected ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-600"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-sm font-semibold text-zinc-900">{title}</span>
    </button>
  );
}

function ToggleChip({
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
      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
        selected
          ? "border-brand-600 bg-brand-50 text-brand-700"
          : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
      }`}
    >
      {selected && <CheckIcon className="h-4 w-4 text-brand-600" />}
      {label}
    </button>
  );
}

function PillButton({
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
          : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
      }`}
    >
      {label}
    </button>
  );
}

function Stepper({
  value,
  onDecrement,
  onIncrement,
}: {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-zinc-200">
      <button
        type="button"
        onClick={onDecrement}
        aria-label="Decrease rooms"
        className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-semibold text-zinc-600 hover:bg-zinc-50"
      >
        −
      </button>
      <span className="w-8 text-center text-sm font-semibold text-zinc-900">
        {value}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label="Increase rooms"
        className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-semibold text-zinc-600 hover:bg-zinc-50"
      >
        +
      </button>
    </div>
  );
}

function NextButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="mt-6 w-full rounded-full bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
    >
      Continue
    </button>
  );
}

// Flat, human-readable fields for the quote email (sent via Web3Forms).
function buildEmailFields(data: QuoteData): Record<string, string> {
  const fields: Record<string, string> = {
    Service: data.category,
    Name: data.name,
    Email: data.email,
    Phone: data.phone || "—",
    Address: data.address || "—",
    "Preferred dates":
      [data.dateFrom, data.dateTo].filter(Boolean).join(" → ") || "Flexible",
    Frequency: data.frequency || "One-off",
  };

  if (data.category === "Gardening") {
    fields["Gardening type"] = data.gardeningType;
    fields["Tasks"] = data.gardenTasks.join(", ") || "—";
    fields["Garden size"] = data.gardenSize || "—";
  } else if (data.category === "Mowing") {
    fields["Lawn size"] = data.lawnSize || "—";
    fields["Extras"] = data.mowingExtras.join(", ") || "None";
  } else {
    fields["Cleaning type"] = data.cleaningType;
    fields["Property"] =
      data.property === "Other" ? data.propertyOther || "Other" : data.property;
    fields["Areas"] = data.areas.join(", ") || "—";
    fields["Rooms"] = String(data.rooms);
  }

  fields["message"] = Object.entries(fields)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  return fields;
}

function buildSummary(
  data: QuoteData,
): { label: string; value: string; icon: IconType }[] {
  const shared: { label: string; value: string; icon: IconType }[] = [
    {
      label: "When",
      value:
        [data.dateFrom, data.dateTo].filter(Boolean).join(" → ") || "Flexible",
      icon: CalendarIcon,
    },
    {
      label: "Frequency",
      value: data.frequency || "One-off",
      icon: RepeatIcon,
    },
    { label: "Contact", value: data.name, icon: UserIcon },
  ];

  if (data.category === "Gardening") {
    return [
      { label: "Service", value: data.gardeningType, icon: LeafIcon },
      {
        label: "Details",
        value:
          [...data.gardenTasks, data.gardenSize && `${data.gardenSize} garden`]
            .filter(Boolean)
            .join(", ") || "—",
        icon: CheckIcon,
      },
      ...shared,
    ];
  }

  if (data.category === "Mowing") {
    return [
      {
        label: "Service",
        value: `Lawn mowing${data.lawnSize ? ` (${data.lawnSize})` : ""}`,
        icon: ScissorsIcon,
      },
      {
        label: "Extras",
        value: data.mowingExtras.join(", ") || "None",
        icon: CheckIcon,
      },
      ...shared,
    ];
  }

  return [
    { label: "Service", value: data.cleaningType, icon: SparkleIcon },
    {
      label: "Property",
      value:
        data.property === "Other"
          ? data.propertyOther || "Other"
          : data.property,
      icon: HomeIcon,
    },
    {
      label: "Areas",
      value:
        [...data.areas, `${data.rooms} ${data.rooms === 1 ? "room" : "rooms"}`]
          .filter(Boolean)
          .join(", ") || "—",
      icon: CheckIcon,
    },
    ...shared,
  ];
}

function SuccessView({
  data,
  onReset,
}: {
  data: QuoteData;
  onReset: () => void;
}) {
  const summary = buildSummary(data);

  return (
    <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white">
          <CheckIcon className="h-7 w-7" />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-zinc-900">
          Thanks, {data.name.split(" ")[0] || "there"}!
        </h2>
        <p className="mx-auto mt-2 max-w-md text-zinc-600">
          We&apos;ve got your request and will email a tailored quote to{" "}
          <span className="font-medium text-zinc-900">{data.email}</span>{" "}
          shortly.
        </p>
      </div>

      <div className="mt-6 rounded-2xl bg-zinc-50 p-5">
        <p className="text-sm font-semibold text-zinc-900">Your request</p>
        <ul className="mt-3 space-y-3">
          {summary.map((item) => (
            <li key={item.label} className="flex items-start gap-3 text-sm">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 ring-1 ring-zinc-100">
                <item.icon className="h-4 w-4" />
              </span>
              <span>
                <span className="text-zinc-500">{item.label}: </span>
                <span className="font-medium text-zinc-900">{item.value}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-6 w-full rounded-full border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
      >
        Start a new request
      </button>
    </div>
  );
}
