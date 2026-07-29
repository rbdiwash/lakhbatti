import Image from "next/image";
import Link from "next/link";
import { site } from "../lib/site";

export function Logo({
  className = "",
  onClick,
  type = "full",
  width = 1100,
  height = 280,
}: {
  className?: string;
  onClick?: () => void;
  type?: "full" | "logo-only";
  width?: number;
  height?: number;
}) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label={`${site.name} home`}
      className={`inline-flex items-center gap-3 ${className}`}
    >
      <Image
        src={
          type === "full"
            ? "/images/lakhbatti-logo.png"
            : "/images/lakhbatti-logo-only.png"
        }
        alt={`${site.name} logo`}
        width={width}
        height={height}
        priority
        unoptimized
        // className={`h-12 w-auto sm:h-14`}
      />
      <span className="sr-only">{site.name}</span>
    </Link>
  );
}
