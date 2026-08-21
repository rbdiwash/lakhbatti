import type {
  DayOfWeek,
  EmployeeRecord,
  EmployeeRow,
  TimeRange,
} from "../lib/types";
import {
  DAY_SHORT,
  humanizeSlug,
  labelPreferredDays,
  labelUrgency,
  labelVisaStatus,
  labelWorkType,
} from "../lib/labels";

const DAY_LABELS = DAY_SHORT;

function display(value: string | number | boolean | null | undefined) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function formatLabel(value: string) {
  return humanizeSlug(value);
}

function maskAccount(value: string) {
  if (!value || value.length < 4) return display(value);
  return value.replace(/.(?=.{4})/g, "•");
}

function isPhotoSrc(value: string) {
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  );
}

function formatDaySlots(daySlots: unknown) {
  if (!daySlots || typeof daySlots !== "object") return [];
  return (Object.keys(daySlots) as DayOfWeek[])
    .map((day) => {
      const ranges = (daySlots as Partial<Record<DayOfWeek, TimeRange[]>>)[day] ?? [];
      const windows = ranges
        .map((range) =>
          range.from && range.to ? `${range.from}–${range.to}` : null,
        )
        .filter(Boolean)
        .join(", ");
      if (!windows) return null;
      return `${DAY_LABELS[day] ?? day}: ${windows}`;
    })
    .filter(Boolean) as string[];
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | number | boolean | null | undefined;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-sm font-medium text-zinc-800">
        {display(value)}
      </dd>
    </div>
  );
}

function ChipList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-zinc-400">—</p>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-800"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function Section({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-zinc-100 bg-white p-3 shadow-sm ${className}`}
    >
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </h4>
      {children}
    </section>
  );
}

function Avatar({ employee }: { employee: EmployeeRow }) {
  const photo = employee.raw.profilePhoto?.trim() ?? "";
  const initials =
    `${employee.firstName?.[0] ?? ""}${employee.lastName?.[0] ?? ""}`.toUpperCase() ||
    "?";

  if (photo && isPhotoSrc(photo)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo}
        alt={employee.fullName}
        className="h-20 w-20 rounded-2xl object-cover ring-2 ring-brand-100"
      />
    );
  }

  return (
    <div className="flex h-20 w-20 flex-col items-center justify-center rounded-2xl bg-brand-100 text-brand-800 ring-2 ring-brand-50">
      <span className="text-xl font-bold">{initials}</span>
      {photo ? (
        <span className="mt-1 max-w-18 truncate px-1 text-[9px] text-brand-700/80">
          {photo}
        </span>
      ) : null}
    </div>
  );
}

export function EmployeeDetailPanel({
  employee,
  hideSummary = false,
}: {
  employee: EmployeeRow;
  hideSummary?: boolean;
}) {
  const raw: EmployeeRecord = employee.raw;
  const dayWindows = formatDaySlots(raw.daySlots);
  const certifications = Array.isArray(raw.certifications)
    ? raw.certifications
    : [];
  const machines = Array.isArray(raw.machinesHandled) ? raw.machinesHandled : [];
  const specialisations = Array.isArray(raw.specialisations)
    ? raw.specialisations
    : [];
  const references = Array.isArray(raw.references) ? raw.references : [];

  return (
    <div className={`w-full ${hideSummary ? "" : "bg-zinc-50/80 p-3 sm:p-4"}`}>
      {hideSummary ? null : (
        <div className="mb-3 flex flex-wrap items-start gap-4 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
          <Avatar employee={employee} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-zinc-900">
                {employee.fullName || "Unnamed employee"}
              </h3>
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                {employee.status}
              </span>
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
                {employee.jobsCount} job{employee.jobsCount === 1 ? "" : "s"}
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              {labelWorkType(employee.workType)} ·{" "}
              {labelVisaStatus(employee.visaStatus)} ·{" "}
              {employee.yearsExperience
                ? `${employee.yearsExperience} yrs exp`
                : "Experience n/a"}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-700">
              <a
                href={`mailto:${employee.email}`}
                className="hover:text-brand-700"
              >
                {employee.email || "—"}
              </a>
              <a
                href={employee.phone ? `tel:${employee.phone}` : undefined}
                className="hover:text-brand-700"
              >
                {employee.phone || "—"}
              </a>
              <span>
                {[
                  raw.address,
                  employee.suburb,
                  employee.state,
                  employee.postcode,
                ]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-3">
        <Section title="Contact & personal">
          <dl className="grid grid-cols-2 gap-3">
            <Field label="DOB" value={raw.dateOfBirth} />
            <Field label="Gender" value={formatLabel(raw.gender)} />
            <Field label="SMS alerts" value={raw.notifyBySms} />
            <Field label="Email alerts" value={raw.notifyByEmail} />
            <Field label="Emergency" value={raw.emergencyContactName} />
            <Field label="Emergency phone" value={raw.emergencyContactPhone} />
          </dl>
        </Section>

        <Section title="Work rights">
          <dl className="grid grid-cols-2 gap-3">
            <Field label="Visa" value={labelVisaStatus(raw.visaStatus)} />
            <Field label="Visa expiry" value={raw.visaExpiry} />
            <Field label="Working rights" value={raw.hasWorkingRights} />
            <Field label="TFN" value={raw.tfn ? "Provided" : "—"} />
            <Field label="Has ABN" value={raw.hasAbn} />
            <Field label="ABN" value={raw.abn} />
          </dl>
        </Section>

        <Section title="Availability">
          <dl className="grid grid-cols-2 gap-3">
            <Field label="Work type" value={labelWorkType(raw.workType)} />
            <Field label="Urgency" value={labelUrgency(raw.urgency)} />
            <Field
              label="Preferred days"
              value={labelPreferredDays(raw.preferredDays)}
            />
            <Field label="Pay rate" value={raw.expectedPayRate ? `$${raw.expectedPayRate}/hr` : "—"} />
            <Field label="Travel" value={raw.willingToTravel} />
            <Field label="Licence" value={raw.hasDriverLicense} />
            <Field label="Max km" value={raw.maxTravelKm} />
            <Field label="Vehicle" value={raw.hasRegisteredVehicle} />
            <Field label="Rego" value={raw.vehicleRegistrationNumber} />
          </dl>
          {dayWindows.length > 0 ? (
            <div className="mt-3 border-t border-zinc-100 pt-3">
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                Windows
              </p>
              <div className="flex flex-wrap gap-1.5">
                {dayWindows.map((window) => (
                  <span
                    key={window}
                    className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-700"
                  >
                    {window}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </Section>

        <Section title="Compliance">
          <dl className="grid grid-cols-2 gap-3">
            <Field label="Police check" value={raw.hasPoliceCheck} />
            <Field label="Expiry" value={raw.policeCheckExpiry} />
            <Field label="WWC" value={raw.hasWorkingWithChildren} />
            <Field label="WWC expiry" value={raw.wwcExpiry} />
            <Field label="Insurance" value={raw.hasPublicLiability} />
            <Field label="Ins. expiry" value={raw.insuranceExpiry} />
            <Field label="COVID vax" value={raw.hasCovidVaccination} />
            <Field label="Other docs" value={raw.otherDocs} />
          </dl>
        </Section>

        <Section title="Training" className="lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                Certifications
              </p>
              <ChipList items={certifications} />
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                Machines
              </p>
              <ChipList items={machines} />
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                Specialisations
              </p>
              <ChipList items={specialisations} />
            </div>
          </div>
          {references.length > 0 ? (
            <div className="mt-3 border-t border-zinc-100 pt-3">
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                References
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {references.map((ref, index) => {
                  const item =
                    ref && typeof ref === "object"
                      ? (ref as {
                          name?: string;
                          company?: string;
                          phone?: string;
                          relationship?: string;
                        })
                      : {};
                  return (
                    <div
                      key={`${item.name ?? "ref"}-${index}`}
                      className="rounded-lg bg-zinc-50 px-3 py-2 text-sm"
                    >
                      <p className="font-medium text-zinc-800">
                        {item.name || "—"}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {[item.company, item.relationship, item.phone]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </Section>

        <Section title="Bank & super" className="lg:col-span-2">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Field label="Account name" value={raw.accountName} />
            <Field label="BSB" value={raw.bsb} />
            <Field label="Account" value={maskAccount(raw.accountNumber)} />
            <Field label="Super fund" value={raw.superFundName} />
            <Field label="Member no." value={raw.superMemberNumber} />
            <Field label="Payment" value={formatLabel(raw.paymentMethod)} />
          </dl>
        </Section>

        <Section title="Leave & meta">
          <dl className="grid grid-cols-2 gap-3">
            <Field label="Sick leave" value={raw.hasSickLeave} />
            <Field label="Annual leave" value={raw.hasAnnualLeave} />
            <Field label="PH rate" value={raw.hasPublicHolidayRate} />
            <Field
              label="Submitted"
              value={
                employee.submittedAt
                  ? new Date(employee.submittedAt).toLocaleString()
                  : "—"
              }
            />
          </dl>
        </Section>
      </div>
    </div>
  );
}
