import type { Metadata } from "next";
import { QuoteForm } from "../components/quote-form";
import { CheckIcon } from "../components/icons";
import { site } from "../lib/site";

export const metadata: Metadata = {
  title: "Get a Quote",
  description:
    "Request a free, no-obligation quote for cleaning, gardening or mowing services from Lakhbatti in just a few quick steps.",
};

const perks = [
  "Free & no-obligation",
  "Takes under a minute",
  "Quick response",
];

export default function QuotePage() {
  return (
    <section className="bg-linear-to-b from-brand-50 to-white">
      <div className="mx-auto max-w-2xl px-4 py-4">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            Get a quote
          </span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            Tell us what you need
          </h1>
          <p className="mx-auto mt-3 max-w-md text-lg leading-relaxed text-zinc-600">
            Answer a few quick questions and we&apos;ll send you a tailored
            quote.
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-zinc-600">
            {perks.map((perk) => (
              <span key={perk} className="inline-flex items-center gap-1.5">
                <CheckIcon className="h-4 w-4 text-accent-600" />
                {perk}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <QuoteForm />
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Prefer to talk? Call{" "}
          <a
            href={`tel:${site.phone.replace(/\s/g, "")}`}
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            {site.phone}
          </a>
        </p>
      </div>
    </section>
  );
}
