import type { Metadata } from "next";
import Image from "next/image";
import { services } from "../lib/site";
import { ServiceCard } from "../components/service-card";
import { CtaBanner } from "../components/cta";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore our full range of cleaning and gardening services — house cleaning, end of lease, carpet cleaning, lawn mowing, landscaping and more.",
};

export default function ServicesPage() {
  const cleaning = services.filter((s) => s.category === "Cleaning");
  const gardening = services.filter((s) => s.category === "Gardening");

  return (
    <>
      <section className="relative overflow-hidden bg-linear-to-b from-brand-50 to-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              Our services
            </span>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
              Everything to keep your space at its best
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-600">
              Choose from a wide range of cleaning and gardening services, each
              tailored to your needs. Not sure what you need? Just ask for a
              quote.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -left-4 -top-4 h-24 w-24 rounded-2xl bg-accent-500/20" />
            <div className="relative overflow-hidden rounded-3xl shadow-xl ring-1 ring-zinc-100">
              <Image
                src="/images/portfolio/office-cleaning.png"
                alt="Professional cleaning service in action"
                width={800}
                height={1000}
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-[380px] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
          Cleaning services
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cleaning.map((service) => (
            <ServiceCard key={service.title} service={service} />
          ))}
        </div>

        <h2 className="mt-16 text-2xl font-bold tracking-tight text-zinc-900">
          Gardening services
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gardening.map((service) => (
            <ServiceCard key={service.title} service={service} />
          ))}
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
