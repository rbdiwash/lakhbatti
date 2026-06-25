import Image from "next/image";
import Link from "next/link";
import { projects, services, site } from "./lib/site";
import { ServiceCard } from "./components/service-card";
import { CtaBanner } from "./components/cta";
import {
  CheckIcon,
  ClockIcon,
  HeartIcon,
  ShieldIcon,
} from "./components/icons";

const features = [
  {
    icon: ShieldIcon,
    title: "Trusted & insured",
    description: "Vetted, professional staff you can feel safe welcoming in.",
  },
  {
    icon: ClockIcon,
    title: "Flexible scheduling",
    description: "One-off or regular bookings that fit around your routine.",
  },
  {
    icon: HeartIcon,
    title: "Satisfaction first",
    description: "We're not happy until your space looks and feels its best.",
  },
];

const stats = [
  { value: "500+", label: "Happy clients" },
  { value: "10+", label: "Years experience" },
  { value: "100%", label: "Satisfaction focus" },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-brand-50 to-white">
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-brand-100 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-accent-500/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-brand-700 shadow-sm ring-1 ring-brand-100">
              <span className="h-2 w-2 rounded-full bg-accent-500" />
              Cleaning & Gardening across Sydney
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
              Affordable, quality{" "}
              <span className="text-brand-600">cleaning & gardening</span>{" "}
              services
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-600">
              Reliable, detailed care for your home and office — from routine
              cleaning and deep cleans to lawn mowing and landscaping. Beautiful
              spaces, made easy.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/quote"
                className="rounded-full bg-brand-600 px-7 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-colors hover:bg-brand-700"
              >
                Get a Free Quote
              </Link>
              <Link
                href="/services"
                className="rounded-full border border-zinc-200 bg-white px-7 py-3.5 text-center text-sm font-semibold text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
              >
                Explore Services
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-600">
              {["No-obligation quotes", "Eco-friendly products", "Local team"].map(
                (item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <CheckIcon className="h-4 w-4 text-accent-600" />
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-2xl bg-accent-500/20" />
            <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-brand-200/60" />
            <div className="relative overflow-hidden rounded-3xl shadow-2xl shadow-brand-900/10 ring-1 ring-zinc-100">
              <Image
                src="/images/portfolio/home-cleaning.png"
                alt="Professional cleaner mopping a home floor"
                width={800}
                height={1000}
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-[460px] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 left-6 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-zinc-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-500/15 text-accent-600">
                  <HeartIcon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-zinc-900">Loved by locals</p>
                  <p className="text-xs text-zinc-500">500+ happy clients</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-zinc-100 bg-white">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-6 px-4 py-10 sm:px-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-brand-600 sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            What we do
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Services tailored to your needs
          </h2>
          <p className="mt-4 text-zinc-600">
            From everyday cleaning to garden care, our skilled team handles it
            all with a focus on quality and customer satisfaction.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 6).map((service) => (
            <ServiceCard key={service.title} service={service} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            View all services
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* Portfolio */}
      <section className="bg-zinc-50">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              Our work
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Recent projects
            </h2>
            <p className="mt-4 text-zinc-600">
              A glimpse of the spaces we&apos;ve helped transform across Sydney.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.title}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-100 transition-shadow hover:shadow-lg"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-zinc-900">
                    {project.title}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    {project.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -left-4 -top-4 h-24 w-24 rounded-2xl bg-brand-100" />
            <div className="relative overflow-hidden rounded-3xl shadow-xl ring-1 ring-zinc-100">
              <Image
                src="/images/portfolio/office-cleaning.png"
                alt="Cleaner wiping down an office desk"
                width={800}
                height={1000}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-[440px] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 right-6 rounded-2xl bg-brand-600 px-5 py-4 text-white shadow-xl">
              <p className="text-2xl font-bold">10+ yrs</p>
              <p className="text-xs text-brand-100">of trusted service</p>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <span className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              Why Lakhbatti
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              A team that genuinely cares
            </h2>
            <p className="mt-4 text-zinc-600">
              We help create inviting spaces that enhance the appeal and
              functionality of your premises. With attention to detail and a
              friendly approach, we make quality care effortless.
            </p>
            <div className="mt-8 space-y-6">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900">{feature.title}</h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/quote"
                className="rounded-full bg-brand-600 px-7 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Get a Quote
              </Link>
              <span className="text-sm text-zinc-500">
                or call{" "}
                <a
                  href={`tel:${site.phone.replace(/\s/g, "")}`}
                  className="font-semibold text-brand-600 hover:text-brand-700"
                >
                  {site.phone}
                </a>
              </span>
            </div>
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
