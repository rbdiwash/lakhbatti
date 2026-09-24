"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { IconType } from "react-icons";
import {
  LuBell,
  LuBuilding2,
  LuCalculator,
  LuCar,
  LuClock,
  LuCreditCard,
  LuGlobe,
  LuKeyRound,
  LuLeaf,
  LuMail,
  LuPercent,
  LuPlug,
  LuReceipt,
  LuScissors,
  LuShieldCheck,
  LuSparkles,
  LuUser,
} from "react-icons/lu";
import {
  PricingAdjustmentSettings,
  PricingCalculator,
  PricingCallOutSettings,
  PricingCleaningSettings,
  PricingGardeningSettings,
  PricingGeneralSettings,
  PricingMowingSettings,
  PricingProvider,
} from "./pricing-sections";
import {
  BillingSettingsPanel,
  BusinessHoursSettingsForm,
  CompanySettings,
  EmailSettings,
  IntegrationsSettingsForm,
  NotificationSettingsForm,
  PasswordSettings,
  ProfileSettings,
  RegionalSettingsForm,
  SecuritySettingsForm,
} from "./settings-sections";

type TabId =
  | "profile"
  | "password"
  | "security"
  | "pricing"
  | "call-out"
  | "cleaning"
  | "gardening"
  | "mowing"
  | "adjustments"
  | "calculator"
  | "company"
  | "hours"
  | "regional"
  | "email"
  | "notifications"
  | "billing"
  | "integrations";

type NavItem = {
  id: TabId;
  label: string;
  description: string;
  icon: IconType;
  render: () => React.ReactNode;
  wide?: boolean;
};

const NAV: { title: string; items: NavItem[] }[] = [
  {
    title: "Account",
    items: [
      {
        id: "profile",
        label: "Profile",
        description: "Your admin name, email, and job title.",
        icon: LuUser,
        render: () => <ProfileSettings />,
      },
      {
        id: "password",
        label: "Password",
        description: "Change the password used to sign in.",
        icon: LuKeyRound,
        render: () => <PasswordSettings />,
      },
      {
        id: "security",
        label: "Security",
        description: "Sessions, 2FA, and login alerts.",
        icon: LuShieldCheck,
        render: () => <SecuritySettingsForm />,
      },
    ],
  },
  {
    title: "Pricing",
    items: [
      {
        id: "pricing",
        label: "Tax & terms",
        description:
          "GST, minimum charge, rounding, deposits, and cancellation terms.",
        icon: LuReceipt,
        render: () => <PricingGeneralSettings />,
        wide: true,
      },
      {
        id: "call-out",
        label: "Call-out fee",
        description:
          "Fee for on-site quote visits and when it's credited back.",
        icon: LuCar,
        render: () => <PricingCallOutSettings />,
        wide: true,
      },
      {
        id: "cleaning",
        label: "Cleaning rates",
        description:
          "Service base prices, bathrooms, kitchens, laundry, and cleaning add-ons.",
        icon: LuSparkles,
        render: () => <PricingCleaningSettings />,
        wide: true,
      },
      {
        id: "gardening",
        label: "Gardening rates",
        description: "Hourly rates, garden sizes, tasks, and disposal extras.",
        icon: LuLeaf,
        render: () => <PricingGardeningSettings />,
        wide: true,
      },
      {
        id: "mowing",
        label: "Mowing rates",
        description:
          "Per-mow prices by lawn size, extras, and lawn care add-ons.",
        icon: LuScissors,
        render: () => <PricingMowingSettings />,
        wide: true,
      },
      {
        id: "adjustments",
        label: "Discounts & surcharges",
        description:
          "Recurring discounts, weekend and holiday rates, urgency, and travel.",
        icon: LuPercent,
        render: () => <PricingAdjustmentSettings />,
        wide: true,
      },
      {
        id: "calculator",
        label: "Price calculator",
        description: "Test a sample job against your rates before saving.",
        icon: LuCalculator,
        render: () => <PricingCalculator />,
        wide: true,
      },
    ],
  },
  {
    title: "Business",
    items: [
      {
        id: "company",
        label: "Company profile",
        description: "Public business details, ABN, and address.",
        icon: LuBuilding2,
        render: () => <CompanySettings />,
      },
      {
        id: "hours",
        label: "Business hours",
        description: "When the team is available for jobs and quotes.",
        icon: LuClock,
        render: () => <BusinessHoursSettingsForm />,
      },
      {
        id: "regional",
        label: "Regional",
        description: "Timezone, currency, date and distance formats.",
        icon: LuGlobe,
        render: () => <RegionalSettingsForm />,
      },
    ],
  },
  {
    title: "Communications",
    items: [
      {
        id: "email",
        label: "Email",
        description: "SMTP, from address, and quote inbox.",
        icon: LuMail,
        render: () => <EmailSettings />,
      },
      {
        id: "notifications",
        label: "Notifications",
        description: "Email and SMS alerts for quotes, staff, and jobs.",
        icon: LuBell,
        render: () => <NotificationSettingsForm />,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        id: "billing",
        label: "Billing",
        description: "Plan and billing contact.",
        icon: LuCreditCard,
        render: () => <BillingSettingsPanel />,
      },
      {
        id: "integrations",
        label: "Integrations",
        description: "Web3Forms, Maps, Stripe, Slack, and more.",
        icon: LuPlug,
        render: () => <IntegrationsSettingsForm />,
      },
    ],
  },
];

const ALL_TABS = NAV.flatMap((group) => group.items);

function isTab(value: string | null): value is TabId {
  return ALL_TABS.some((tab) => tab.id === value);
}

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: TabId = isTab(tabParam) ? tabParam : "profile";
  const active = ALL_TABS.find((item) => item.id === tab) ?? ALL_TABS[0];
  const activeGroup = NAV.find((group) => group.items.includes(active));

  function setTab(next: TabId) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "profile") params.delete("tab");
    else params.set("tab", next);
    const qs = params.toString();
    router.replace(qs ? `/dashboard/settings?${qs}` : "/dashboard/settings", {
      scroll: false,
    });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage your account, pricing, business details, and integrations.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Mobile: compact picker */}
        <label className="block lg:hidden">
          <span className="sr-only">Settings section</span>
          <select
            value={tab}
            onChange={(e) => setTab(e.target.value as TabId)}
            className="h-11 w-full cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
          >
            {NAV.map((group) => (
              <optgroup key={group.title} label={group.title}>
                {group.items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        {/* Desktop: grouped nav */}
        <aside className="hidden w-60 shrink-0 lg:sticky lg:top-24 lg:block">
          <nav
            aria-label="Settings"
            className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm"
          >
            {NAV.map((group) => (
              <div key={group.title}>
                <p className="mb-1 px-2 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                  {group.title}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const selected = tab === item.id;
                    const Icon = item.icon;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          aria-current={selected ? "page" : undefined}
                          onClick={() => setTab(item.id)}
                          className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors ${
                            selected
                              ? "bg-brand-50 text-brand-800"
                              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                          }`}
                        >
                          <Icon
                            className={`h-4 w-4 shrink-0 ${
                              selected ? "text-brand-700" : "text-zinc-400"
                            }`}
                            aria-hidden
                          />
                          {item.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-5">
            <p className="text-xs font-semibold tracking-wider text-brand-700 uppercase">
              {activeGroup?.title}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-900">
              {active.label}
            </h2>
            <p className="mt-0.5 text-sm text-zinc-500">{active.description}</p>
          </div>

          <div className={active.wide ? "max-w-4xl" : "max-w-2xl"}>
            {active.render()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={<p className="text-sm text-zinc-500">Loading settings…</p>}
    >
      <PricingProvider>
        <SettingsContent />
      </PricingProvider>
    </Suspense>
  );
}
