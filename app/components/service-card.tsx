import Image from "next/image";
import Link from "next/link";
import { LeafIcon, SparkleIcon } from "./icons";
import type { Service } from "../lib/site";

export function ServiceCard({ service }: { service: Service }) {
  const Icon = service.category === "Gardening" ? LeafIcon : SparkleIcon;

  return (
    <Link
      href="/quote"
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all hover:border-brand-200 hover:shadow-lg hover:shadow-brand-100/50"
    >
      <div className="relative h-44 overflow-hidden">
        <Image
          src={service.image}
          alt={service.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/10 to-transparent" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand-600 shadow-sm backdrop-blur-sm">
          <Icon className="h-3.5 w-3.5" />
          {service.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-brand-700">
          {service.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-500">
          {service.description}
        </p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 group-hover:text-brand-700">
          Get a quote
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
