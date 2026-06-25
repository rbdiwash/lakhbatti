import Image from "next/image";
import Link from "next/link";
import { site } from "../lib/site";

export function Logo({
  className = "",
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label={`${site.name} home`}
      className={`inline-flex items-center ${className}`}
    >
      <Image
        src="/images/logo.jpeg"
        alt={`${site.name} logo`}
        width={990}
        height={369}
        priority
        className="h-16 w-auto"
      />
    </Link>
  );
}
