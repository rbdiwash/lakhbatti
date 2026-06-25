import type { Metadata } from "next";
import Image from "next/image";
import { CtaBanner } from "../components/cta";
import {
  CheckIcon,
  HeartIcon,
  LeafIcon,
  ShieldIcon,
} from "../components/icons";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Lakhbatti — a local team providing reliable, affordable cleaning and gardening services across Sydney.",
};

const values = [
  {
    icon: ShieldIcon,
    title: "Reliability",
    description:
      "We show up on time and do what we say. Consistent, dependable service every visit.",
  },
  {
    icon: HeartIcon,
    title: "Care",
    description:
      "We treat every home and garden as if it were our own, with attention to the details.",
  },
  {
    icon: LeafIcon,
    title: "Quality",
    description:
      "A focus on doing the job right, using effective and eco-friendly products.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-linear-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            About us
          </span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            Quality care for your home & garden
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600">
            Lakhbatti provides reliable and detailed cleaning and gardening
            services, ensuring a clean, welcoming, and beautifully maintained
            environment for every client.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
              Our story
            </h2>
            <div className="mt-4 space-y-4 text-zinc-600">
              <p>
                At Lakhbatti Pty Ltd, we specialize in Domestic House Cleaning
                and Gardening Services, which form the core of our business
                operations since the company’s inception. We pride ourselves on
                delivering exceptional services to ensure clean, hygienic, and
                visually appealing homes and gardens. Over the years, we have
                expanded our reach by partnering with NDIS providers, while also
                catering to a diverse range of clients, including individuals,
                real estate agencies, offices, and more. Our mission is to
                create hygienic living environments and attractive outdoor
                spaces for all our clients. Whether it’s maintaining a spotless
                interior or transforming front and backyard spaces, we are
                committed to excellence and customer satisfaction in every
                project we undertake. Choose Lakhbatti Pty Ltd for professional
                cleaning and gardening services tailored to your needs.
              </p>
            </div>
            <ul className="mt-6 space-y-3">
              {[
                "Friendly, vetted local professionals",
                "Cleaning and gardening in one place",
                "Affordable, transparent pricing",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-zinc-700"
                >
                  <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative order-1 lg:order-2">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-2xl bg-accent-500/20" />
            <div className="relative overflow-hidden rounded-3xl shadow-xl ring-1 ring-zinc-100">
              <Image
                src="/images/portfolio/carpet-cleaning.png"
                alt="Cleaner steam cleaning a carpet"
                width={800}
                height={1000}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-[440px] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 left-6 max-w-[14rem] rounded-2xl bg-brand-600 px-5 py-4 text-white shadow-xl">
              <p className="text-sm font-semibold">Our Mission</p>
              <p className="mt-1 text-xs text-brand-100">
                Affordable, quality services that make your spaces shine.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-zinc-50">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
              What we stand for
            </h2>
            <p className="mt-4 text-zinc-600">
              The values that guide everything we do.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-zinc-100 bg-white p-6 text-center"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-zinc-900">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-500">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
