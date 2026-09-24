"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changeAdminPassword,
  getAdminProfile,
  getBillingSettings,
  getBusinessHours,
  getCompanyProfile,
  getEmailConfig,
  getIntegrationSettings,
  getNotificationSettings,
  getRegionalSettings,
  getSecuritySettings,
  updateAdminProfile,
  updateBusinessHours,
  updateCompanyProfile,
  updateEmailConfig,
  updateIntegrationSettings,
  updateNotificationSettings,
  updateRegionalSettings,
  updateSecuritySettings,
} from "../../lib/api";
import { site } from "../../lib/site";
import type {
  BusinessHoursDay,
  BusinessHoursSettings,
  ChangePasswordPayload,
  CompanyProfileSettings,
  EmailConfigSettings,
  IntegrationSettings,
  NotificationSettings,
  RegionalSettings,
  SecuritySettings,
  UpdateAdminProfilePayload,
  UpdateEmailConfigPayload,
} from "../../lib/types";

export const inputClass =
  "mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
export const labelClass = "block text-xs font-medium text-zinc-600";

function ApiHint({ path }: { path: string }) {
  return (
    <p className="text-xs text-zinc-400">
      Backend: <code className="text-zinc-600">{path}</code>
    </p>
  );
}

function ApiMissing({ path, fallback }: { path: string; fallback?: string }) {
  return (
    <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
      API not available yet (<code className="text-amber-900">{path}</code>).
      {fallback
        ? ` ${fallback}`
        : " Form is ready for when you wire the route."}
    </p>
  );
}

function StatusMessage({
  message,
  successWords = ["saved", "updated", "changed"],
}: {
  message: string | null;
  successWords?: string[];
}) {
  if (!message) return null;
  const ok = successWords.some((word) => message.toLowerCase().includes(word));
  return (
    <p className={`text-sm ${ok ? "text-emerald-700" : "text-red-600"}`}>
      {message}
    </p>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-zinc-200 px-3 py-3 hover:border-brand-300">
      <span>
        <span className="block text-sm font-medium text-zinc-800">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs text-zinc-500">
            {description}
          </span>
        ) : null}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-500"
      />
    </label>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      {children}
    </div>
  );
}

function SaveButton({
  pending,
  label = "Save changes",
}: {
  pending: boolean;
  label?: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

export function ProfileSettings() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["settings", "profile"],
    queryFn: getAdminProfile,
    retry: false,
  });
  const [form, setForm] = useState<UpdateAdminProfilePayload>({
    name: "",
    email: "",
    phone: "",
    jobTitle: "Admin",
  });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!query.data) return;
    setForm({
      name: query.data.name ?? "",
      email: query.data.email ?? "",
      phone: query.data.phone ?? "",
      jobTitle: query.data.jobTitle ?? "Admin",
    });
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: updateAdminProfile,
    onSuccess: async (data) => {
      await queryClient.setQueryData(["settings", "profile"], data);
      setMessage("Profile saved.");
    },
    onError: () => setMessage("Could not save profile."),
  });

  return (
    <Panel>
      {query.isError ? <ApiMissing path="GET /api/settings/profile" /> : null}
      {query.isLoading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(form);
          }}
        >
          {(
            [
              ["name", "Full name", "text"],
              ["email", "Email", "email"],
              ["phone", "Phone", "tel"],
              ["jobTitle", "Job title", "text"],
            ] as const
          ).map(([key, label, type]) => (
            <div key={key}>
              <label className={labelClass}>{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => {
                  setMessage(null);
                  setForm((c) => ({ ...c, [key]: e.target.value }));
                }}
                className={inputClass}
              />
            </div>
          ))}
          {query.data?.role ? (
            <p className="text-xs text-zinc-500">
              Role:{" "}
              <span className="font-medium text-zinc-700">
                {query.data.role}
              </span>
            </p>
          ) : null}
          <StatusMessage message={message} />
          <SaveButton pending={mutation.isPending} />
          <ApiHint path="PUT /api/settings/profile" />
        </form>
      )}
    </Panel>
  );
}

export function PasswordSettings() {
  const [form, setForm] = useState<ChangePasswordPayload>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: changeAdminPassword,
    onSuccess: (data) => {
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setMessage(data.message || "Password updated.");
    },
    onError: () => setMessage("Could not change password."),
  });

  return (
    <Panel>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (form.newPassword.length < 8) {
            setMessage("New password must be at least 8 characters.");
            return;
          }
          if (form.newPassword !== form.confirmPassword) {
            setMessage("New password and confirmation do not match.");
            return;
          }
          mutation.mutate(form);
        }}
      >
        {(
          [
            ["currentPassword", "Current password"],
            ["newPassword", "New password"],
            ["confirmPassword", "Confirm new password"],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <label className={labelClass}>{label}</label>
            <input
              type="password"
              value={form[key]}
              onChange={(e) => {
                setMessage(null);
                setForm((c) => ({ ...c, [key]: e.target.value }));
              }}
              className={inputClass}
            />
          </div>
        ))}
        <StatusMessage message={message} />
        <SaveButton pending={mutation.isPending} label="Change password" />
        <ApiHint path="PUT /api/settings/password" />
      </form>
    </Panel>
  );
}

const emptyCompany = (): CompanyProfileSettings => ({
  legalName: site.name,
  tradingName: site.name,
  abn: "",
  email: site.email,
  phone: site.phone,
  website: "",
  address: site.address,
  suburb: "Bankstown",
  state: "NSW",
  postcode: "2200",
  logoUrl: "",
  about: site.description,
});

export function CompanySettings() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["settings", "company"],
    queryFn: getCompanyProfile,
    retry: false,
  });
  const [form, setForm] = useState<CompanyProfileSettings>(emptyCompany);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (query.data) setForm(query.data);
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: updateCompanyProfile,
    onSuccess: async (data) => {
      await queryClient.setQueryData(["settings", "company"], data);
      setMessage("Company profile saved.");
    },
    onError: () => setMessage("Could not save company profile."),
  });

  return (
    <Panel>
      {query.isError ? (
        <ApiMissing
          path="GET /api/settings/company"
          fallback="Using website defaults until the API is ready."
        />
      ) : null}
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate(form);
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["legalName", "Legal name"],
              ["tradingName", "Trading name"],
              ["abn", "ABN"],
              ["email", "Public email"],
              ["phone", "Public phone"],
              ["website", "Website"],
              ["address", "Street address"],
              ["suburb", "Suburb"],
              ["state", "State"],
              ["postcode", "Postcode"],
              ["logoUrl", "Logo URL"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className={key === "address" ? "sm:col-span-2" : ""}>
              <label className={labelClass}>{label}</label>
              <input
                value={form[key]}
                onChange={(e) => {
                  setMessage(null);
                  setForm((c) => ({ ...c, [key]: e.target.value }));
                }}
                className={inputClass}
              />
            </div>
          ))}
        </div>
        <div>
          <label className={labelClass}>About / short bio</label>
          <textarea
            rows={3}
            value={form.about}
            onChange={(e) => {
              setMessage(null);
              setForm((c) => ({ ...c, about: e.target.value }));
            }}
            className={inputClass}
          />
        </div>
        <StatusMessage message={message} />
        <SaveButton pending={mutation.isPending} />
        <ApiHint path="PUT /api/settings/company" />
      </form>
    </Panel>
  );
}

const emptyEmail = (): UpdateEmailConfigPayload => ({
  fromName: site.name,
  fromEmail: site.email,
  replyToEmail: site.email,
  smtpHost: "",
  smtpPort: 587,
  smtpUser: "",
  smtpPassword: "",
  useTls: true,
  quoteNotificationEmail: site.email,
});

export function EmailSettings() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["settings", "email"],
    queryFn: getEmailConfig,
    retry: false,
  });
  const [form, setForm] = useState<UpdateEmailConfigPayload>(emptyEmail);
  const [passwordSet, setPasswordSet] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!query.data) return;
    const data: EmailConfigSettings = query.data;
    setForm({
      fromName: data.fromName,
      fromEmail: data.fromEmail,
      replyToEmail: data.replyToEmail,
      smtpHost: data.smtpHost,
      smtpPort: data.smtpPort,
      smtpUser: data.smtpUser,
      smtpPassword: "",
      useTls: data.useTls,
      quoteNotificationEmail: data.quoteNotificationEmail,
    });
    setPasswordSet(data.smtpPasswordSet);
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: updateEmailConfig,
    onSuccess: async (data) => {
      await queryClient.setQueryData(["settings", "email"], data);
      setPasswordSet(data.smtpPasswordSet);
      setForm((c) => ({ ...c, smtpPassword: "" }));
      setMessage("Email settings saved.");
    },
    onError: () => setMessage("Could not save email settings."),
  });

  return (
    <Panel>
      {query.isError ? <ApiMissing path="GET /api/settings/email" /> : null}
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const payload = { ...form };
          if (!payload.smtpPassword) delete payload.smtpPassword;
          mutation.mutate(payload);
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["fromName", "From name"],
              ["fromEmail", "From email"],
              ["replyToEmail", "Reply-to email"],
              ["quoteNotificationEmail", "Quote inbox"],
              ["smtpHost", "SMTP host"],
              ["smtpUser", "SMTP username"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className={labelClass}>{label}</label>
              <input
                value={form[key]}
                onChange={(e) => {
                  setMessage(null);
                  setForm((c) => ({ ...c, [key]: e.target.value }));
                }}
                className={inputClass}
              />
            </div>
          ))}
          <div>
            <label className={labelClass}>SMTP port</label>
            <input
              type="number"
              value={form.smtpPort}
              onChange={(e) => {
                setMessage(null);
                setForm((c) => ({
                  ...c,
                  smtpPort: Number(e.target.value) || 0,
                }));
              }}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              SMTP password{passwordSet ? " (leave blank to keep)" : ""}
            </label>
            <input
              type="password"
              value={form.smtpPassword ?? ""}
              onChange={(e) => {
                setMessage(null);
                setForm((c) => ({ ...c, smtpPassword: e.target.value }));
              }}
              className={inputClass}
              placeholder={passwordSet ? "••••••••" : ""}
            />
          </div>
        </div>
        <ToggleRow
          label="Use TLS"
          description="Recommended for port 587 / 465."
          checked={form.useTls}
          onChange={(useTls) => setForm((c) => ({ ...c, useTls }))}
        />
        <StatusMessage message={message} />
        <SaveButton pending={mutation.isPending} />
        <ApiHint path="PUT /api/settings/email" />
      </form>
    </Panel>
  );
}

const emptyNotifications = (): NotificationSettings => ({
  emailOnNewQuote: true,
  emailOnNewEmployee: true,
  emailOnJobAssigned: true,
  emailOnJobCompleted: false,
  smsOnNewQuote: false,
  smsOnJobReminder: false,
  dailyDigest: true,
  digestTime: "08:00",
});

export function NotificationSettingsForm() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["settings", "notifications"],
    queryFn: getNotificationSettings,
    retry: false,
  });
  const [form, setForm] = useState<NotificationSettings>(emptyNotifications);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (query.data) setForm(query.data);
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: updateNotificationSettings,
    onSuccess: async (data) => {
      await queryClient.setQueryData(["settings", "notifications"], data);
      setMessage("Notification settings saved.");
    },
    onError: () => setMessage("Could not save notifications."),
  });

  return (
    <Panel>
      {query.isError ? (
        <ApiMissing path="GET /api/settings/notifications" />
      ) : null}
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate(form);
        }}
      >
        <ToggleRow
          label="Email on new quote"
          checked={form.emailOnNewQuote}
          onChange={(emailOnNewQuote) =>
            setForm((c) => ({ ...c, emailOnNewQuote }))
          }
        />
        <ToggleRow
          label="Email on new employee registration"
          checked={form.emailOnNewEmployee}
          onChange={(emailOnNewEmployee) =>
            setForm((c) => ({ ...c, emailOnNewEmployee }))
          }
        />
        <ToggleRow
          label="Email when a job is assigned"
          checked={form.emailOnJobAssigned}
          onChange={(emailOnJobAssigned) =>
            setForm((c) => ({ ...c, emailOnJobAssigned }))
          }
        />
        <ToggleRow
          label="Email when a job is completed"
          checked={form.emailOnJobCompleted}
          onChange={(emailOnJobCompleted) =>
            setForm((c) => ({ ...c, emailOnJobCompleted }))
          }
        />
        <ToggleRow
          label="SMS on new quote"
          checked={form.smsOnNewQuote}
          onChange={(smsOnNewQuote) =>
            setForm((c) => ({ ...c, smsOnNewQuote }))
          }
        />
        <ToggleRow
          label="SMS job reminders"
          checked={form.smsOnJobReminder}
          onChange={(smsOnJobReminder) =>
            setForm((c) => ({ ...c, smsOnJobReminder }))
          }
        />
        <ToggleRow
          label="Daily digest email"
          checked={form.dailyDigest}
          onChange={(dailyDigest) => setForm((c) => ({ ...c, dailyDigest }))}
        />
        <div>
          <label className={labelClass}>Digest time</label>
          <input
            type="time"
            value={form.digestTime}
            onChange={(e) =>
              setForm((c) => ({ ...c, digestTime: e.target.value }))
            }
            className={inputClass}
          />
        </div>
        <StatusMessage message={message} />
        <SaveButton pending={mutation.isPending} />
        <ApiHint path="PUT /api/settings/notifications" />
      </form>
    </Panel>
  );
}

const defaultDays = (): BusinessHoursDay[] =>
  [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ].map((day) => ({
    day,
    closed: day === "sunday",
    open: "09:00",
    close: day === "saturday" ? "13:00" : "17:00",
  }));

export function BusinessHoursSettingsForm() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["settings", "business-hours"],
    queryFn: getBusinessHours,
    retry: false,
  });
  const [form, setForm] = useState<BusinessHoursSettings>({
    timezone: "Australia/Sydney",
    days: defaultDays(),
  });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (query.data) setForm(query.data);
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: updateBusinessHours,
    onSuccess: async (data) => {
      await queryClient.setQueryData(["settings", "business-hours"], data);
      setMessage("Business hours saved.");
    },
    onError: () => setMessage("Could not save business hours."),
  });

  function patchDay(index: number, partial: Partial<BusinessHoursDay>) {
    setMessage(null);
    setForm((current) => ({
      ...current,
      days: current.days.map((day, i) =>
        i === index ? { ...day, ...partial } : day,
      ),
    }));
  }

  return (
    <Panel>
      {query.isError ? (
        <ApiMissing path="GET /api/settings/business-hours" />
      ) : null}
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate(form);
        }}
      >
        <div>
          <label className={labelClass}>Timezone</label>
          <input
            value={form.timezone}
            onChange={(e) =>
              setForm((c) => ({ ...c, timezone: e.target.value }))
            }
            className={inputClass}
            placeholder="Australia/Sydney"
          />
        </div>
        <div className="space-y-2">
          {form.days.map((day, index) => (
            <div
              key={day.day}
              className="grid grid-cols-[7rem_1fr_1fr_auto] items-center gap-2 rounded-xl border border-zinc-100 px-3 py-2"
            >
              <span className="text-sm font-medium capitalize text-zinc-800">
                {day.day.slice(0, 3)}
              </span>
              <input
                type="time"
                disabled={day.closed}
                value={day.open}
                onChange={(e) => patchDay(index, { open: e.target.value })}
                className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm disabled:bg-zinc-50"
              />
              <input
                type="time"
                disabled={day.closed}
                value={day.close}
                onChange={(e) => patchDay(index, { close: e.target.value })}
                className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm disabled:bg-zinc-50"
              />
              <label className="flex items-center gap-1.5 text-xs text-zinc-600">
                <input
                  type="checkbox"
                  checked={day.closed}
                  onChange={(e) =>
                    patchDay(index, { closed: e.target.checked })
                  }
                />
                Closed
              </label>
            </div>
          ))}
        </div>
        <StatusMessage message={message} />
        <SaveButton pending={mutation.isPending} />
        <ApiHint path="PUT /api/settings/business-hours" />
      </form>
    </Panel>
  );
}

export function RegionalSettingsForm() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["settings", "regional"],
    queryFn: getRegionalSettings,
    retry: false,
  });
  const [form, setForm] = useState<RegionalSettings>({
    timezone: "Australia/Sydney",
    currency: "AUD",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "12h",
    locale: "en-AU",
    distanceUnit: "km",
  });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (query.data) setForm(query.data);
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: updateRegionalSettings,
    onSuccess: async (data) => {
      await queryClient.setQueryData(["settings", "regional"], data);
      setMessage("Regional settings saved.");
    },
    onError: () => setMessage("Could not save regional settings."),
  });

  return (
    <Panel>
      {query.isError ? <ApiMissing path="GET /api/settings/regional" /> : null}
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate(form);
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Timezone</label>
            <input
              value={form.timezone}
              onChange={(e) =>
                setForm((c) => ({ ...c, timezone: e.target.value }))
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Locale</label>
            <input
              value={form.locale}
              onChange={(e) =>
                setForm((c) => ({ ...c, locale: e.target.value }))
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Date format</label>
            <select
              value={form.dateFormat}
              onChange={(e) =>
                setForm((c) => ({
                  ...c,
                  dateFormat: e.target.value as RegionalSettings["dateFormat"],
                }))
              }
              className={inputClass}
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Time format</label>
            <select
              value={form.timeFormat}
              onChange={(e) =>
                setForm((c) => ({
                  ...c,
                  timeFormat: e.target.value as RegionalSettings["timeFormat"],
                }))
              }
              className={inputClass}
            >
              <option value="12h">12-hour</option>
              <option value="24h">24-hour</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Currency</label>
            <input
              value="AUD"
              disabled
              className={`${inputClass} bg-zinc-50`}
            />
          </div>
          <div>
            <label className={labelClass}>Distance unit</label>
            <select
              value={form.distanceUnit}
              onChange={(e) =>
                setForm((c) => ({
                  ...c,
                  distanceUnit: e.target
                    .value as RegionalSettings["distanceUnit"],
                }))
              }
              className={inputClass}
            >
              <option value="km">Kilometres</option>
              <option value="mi">Miles</option>
            </select>
          </div>
        </div>
        <StatusMessage message={message} />
        <SaveButton pending={mutation.isPending} />
        <ApiHint path="PUT /api/settings/regional" />
      </form>
    </Panel>
  );
}

export function SecuritySettingsForm() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["settings", "security"],
    queryFn: getSecuritySettings,
    retry: false,
  });
  const [form, setForm] = useState<SecuritySettings>({
    sessionTimeoutMinutes: 60,
    requireStrongPassword: true,
    twoFactorEnabled: false,
    loginAlerts: true,
  });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (query.data) setForm(query.data);
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: updateSecuritySettings,
    onSuccess: async (data) => {
      await queryClient.setQueryData(["settings", "security"], data);
      setMessage("Security settings saved.");
    },
    onError: () => setMessage("Could not save security settings."),
  });

  return (
    <Panel>
      {query.isError ? <ApiMissing path="GET /api/settings/security" /> : null}
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate(form);
        }}
      >
        <div>
          <label className={labelClass}>Session timeout (minutes)</label>
          <input
            type="number"
            min={5}
            value={form.sessionTimeoutMinutes}
            onChange={(e) =>
              setForm((c) => ({
                ...c,
                sessionTimeoutMinutes: Number(e.target.value) || 0,
              }))
            }
            className={inputClass}
          />
        </div>
        <ToggleRow
          label="Require strong passwords"
          checked={form.requireStrongPassword}
          onChange={(requireStrongPassword) =>
            setForm((c) => ({ ...c, requireStrongPassword }))
          }
        />
        <ToggleRow
          label="Two-factor authentication"
          description="Placeholder — wire your 2FA provider later."
          checked={form.twoFactorEnabled}
          onChange={(twoFactorEnabled) =>
            setForm((c) => ({ ...c, twoFactorEnabled }))
          }
        />
        <ToggleRow
          label="Email alerts on new login"
          checked={form.loginAlerts}
          onChange={(loginAlerts) => setForm((c) => ({ ...c, loginAlerts }))}
        />
        <StatusMessage message={message} />
        <SaveButton pending={mutation.isPending} />
        <ApiHint path="PUT /api/settings/security" />
      </form>
    </Panel>
  );
}

export function BillingSettingsPanel() {
  const query = useQuery({
    queryKey: ["settings", "billing"],
    queryFn: getBillingSettings,
    retry: false,
  });

  return (
    <Panel>
      {query.isError ? <ApiMissing path="GET /api/settings/billing" /> : null}
      {query.isLoading ? (
        <p className="text-sm text-zinc-500">Loading billing…</p>
      ) : query.data ? (
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-zinc-500">Plan</dt>
            <dd className="font-medium text-zinc-900">{query.data.planName}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Status</dt>
            <dd className="font-medium text-zinc-900">{query.data.status}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Billing email</dt>
            <dd className="font-medium text-zinc-900">
              {query.data.billingEmail}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Next billing date</dt>
            <dd className="font-medium text-zinc-900">
              {query.data.nextBillingDate ?? "—"}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="text-sm text-zinc-500">
          Billing details will appear here once the API is connected.
        </p>
      )}
      <ApiHint path="GET /api/settings/billing" />
    </Panel>
  );
}

export function IntegrationsSettingsForm() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["settings", "integrations"],
    queryFn: getIntegrationSettings,
    retry: false,
  });
  const [form, setForm] = useState<IntegrationSettings>({
    web3formsEnabled: true,
    googleMapsEnabled: false,
    stripeEnabled: false,
    slackWebhookEnabled: false,
    notes: "",
  });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (query.data) setForm(query.data);
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: updateIntegrationSettings,
    onSuccess: async (data) => {
      await queryClient.setQueryData(["settings", "integrations"], data);
      setMessage("Integrations saved.");
    },
    onError: () => setMessage("Could not save integrations."),
  });

  return (
    <Panel>
      {query.isError ? (
        <ApiMissing path="GET /api/settings/integrations" />
      ) : null}
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate(form);
        }}
      >
        <ToggleRow
          label="Web3Forms (quote emails)"
          description="Public quote form submissions."
          checked={form.web3formsEnabled}
          onChange={(web3formsEnabled) =>
            setForm((c) => ({ ...c, web3formsEnabled }))
          }
        />
        <ToggleRow
          label="Google Maps"
          description="Address autocomplete / maps on jobs."
          checked={form.googleMapsEnabled}
          onChange={(googleMapsEnabled) =>
            setForm((c) => ({ ...c, googleMapsEnabled }))
          }
        />
        <ToggleRow
          label="Stripe"
          description="Payments and call-out fee collection."
          checked={form.stripeEnabled}
          onChange={(stripeEnabled) =>
            setForm((c) => ({ ...c, stripeEnabled }))
          }
        />
        <ToggleRow
          label="Slack webhook"
          description="Notify a channel on new quotes / jobs."
          checked={form.slackWebhookEnabled}
          onChange={(slackWebhookEnabled) =>
            setForm((c) => ({ ...c, slackWebhookEnabled }))
          }
        />
        <div>
          <label className={labelClass}>Internal notes</label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm((c) => ({ ...c, notes: e.target.value }))}
            className={inputClass}
          />
        </div>
        <StatusMessage message={message} />
        <SaveButton pending={mutation.isPending} />
        <ApiHint path="PUT /api/settings/integrations" />
      </form>
    </Panel>
  );
}
