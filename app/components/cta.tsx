import Link from "next/link";
import { site } from "../lib/site";
import { PhoneIcon } from "./icons";

export function CtaBanner() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-brand-600 px-6 py-14 text-center sm:px-12">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-500/40" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-brand-700/40" />
        <div className="relative">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready for a cleaner, greener space?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-50">
            Get a free, no-obligation quote tailored to your home or office. It
            only takes a minute.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/quote"
              className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
            >
              Get a Quote
            </Link>
            <a
              href={`tel:${site.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <PhoneIcon className="h-4 w-4" />
              {site.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
