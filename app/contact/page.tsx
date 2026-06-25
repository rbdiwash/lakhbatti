import type { Metadata } from "next";
import Link from "next/link";
import { site } from "../lib/site";
import { ClockIcon, MailIcon, PhoneIcon, PinIcon } from "../components/icons";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Lakhbatti for cleaning and gardening services. Call, email, or request a free quote.",
};

const details = [
  {
    icon: PinIcon,
    label: "Address",
    value: site.address,
  },
  {
    icon: PhoneIcon,
    label: "Phone",
    value: site.phone,
    href: `tel:${site.phone.replace(/\s/g, "")}`,
  },
  {
    icon: MailIcon,
    label: "Email",
    value: site.email,
    href: `mailto:${site.email}`,
  },
  {
    icon: ClockIcon,
    label: "Hours",
    value: site.hours,
  },
];

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-wide text-brand-600">
          Contact us
        </span>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          We&apos;d love to hear from you
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-zinc-600">
          Have a question or ready to book? Reach out and our friendly team will
          get back to you as soon as possible.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-3xl gap-5 sm:grid-cols-2">
        {details.map((detail) => (
          <div
            key={detail.label}
            className="flex items-start gap-4 rounded-2xl border border-zinc-100 bg-white p-6"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <detail.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900">{detail.label}</p>
              {detail.href ? (
                <a
                  href={detail.href}
                  className="mt-1 block text-sm text-zinc-600 hover:text-brand-600"
                >
                  {detail.value}
                </a>
              ) : (
                <p className="mt-1 text-sm text-zinc-600">{detail.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-12 max-w-3xl rounded-3xl bg-brand-600 px-6 py-12 text-center sm:px-12">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Prefer to get a price first?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-brand-50">
          Request a free, no-obligation quote and we&apos;ll tailor it to your
          needs.
        </p>
        <Link
          href="/quote"
          className="mt-6 inline-block rounded-full bg-white px-7 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
        >
          Get a Quote
        </Link>
      </div>
    </section>
  );
}
