import Link from "next/link";
import { navLinks, services, site } from "../lib/site";
import { ClockIcon, MailIcon, PhoneIcon, PinIcon } from "./icons";
import { Logo } from "./logo";

const contactItems = [
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

export function Footer() {
  return (
    <footer className="mt-auto">
      {/* CTA strip */}
      <div className="border-t border-brand-100 bg-linear-to-r from-brand-600 to-brand-700">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="text-center sm:text-left">
            <p className="text-lg font-semibold text-white">
              Ready for a cleaner, greener space?
            </p>
            <p className="mt-1 text-sm text-brand-100">
              Free quote in under a minute — no obligation.
            </p>
          </div>
          <Link
            href="/quote"
            className="shrink-0 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-lg shadow-brand-900/20 transition-colors hover:bg-brand-50"
          >
            Get a Free Quote
          </Link>
        </div>
      </div>

      {/* Main footer */}
      <div className="bg-linear-to-b from-brand-800 to-brand-900 text-brand-100">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Brand */}
            <div className="lg:col-span-4">
              <div className="inline-block rounded-xl bg-white px-3 py-2 shadow-sm">
                <Logo />
              </div>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-brand-100/80">
                {site.description}
              </p>
              <p className="mt-4 text-xs font-medium uppercase tracking-wider text-accent-400">
                {site.tagline}
              </p>
            </div>

            {/* Links */}
            <div className="grid gap-10 sm:grid-cols-2 lg:col-span-5 lg:gap-8">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                  Company
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-brand-100/70 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/quote"
                      className="text-sm font-medium text-accent-400 transition-colors hover:text-accent-300"
                    >
                      Get a Quote
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                  Popular Services
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {services.slice(0, 5).map((s) => (
                    <li key={s.title}>
                      <Link
                        href="/services"
                        className="text-sm text-brand-100/70 transition-colors hover:text-white"
                      >
                        {s.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Contact */}
            <div className="lg:col-span-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                Get in touch
              </h3>
              <ul className="mt-4 space-y-4">
                {contactItems.map((item) => (
                  <li key={item.label} className="flex gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-700/60 text-brand-50">
                      <item.icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 pt-0.5">
                      <span className="block text-xs font-medium text-brand-200/60">
                        {item.label}
                      </span>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="mt-0.5 block text-sm text-brand-50 transition-colors hover:text-white"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <span className="mt-0.5 block text-sm text-brand-50">
                          {item.value}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-brand-700/50">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-center text-xs text-brand-200/60 sm:flex-row sm:px-6 sm:text-left">
            <p>
              © {new Date().getFullYear()} {site.name}. All rights reserved.
            </p>
            <p>
              Serving Sydney &amp; surrounds ·{" "}
              <a
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                className="text-brand-100 transition-colors hover:text-white"
              >
                {site.phone}
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
