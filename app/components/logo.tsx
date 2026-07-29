import Image from "next/image";
import Link from "next/link";
import { site } from "../lib/site";

const LOGO_PATHS = {
  full: "/images/lakhbatti-logo.png",
  "logo-only": "/images/lakhbatti-logo-only.png",
} as const;

export function Logo({
  className = "",
  imageClassName,
  onClick,
  type = "full",
  width,
  height,
}: {
  className?: string;
  /** Applied to the image element (height/width in header, etc.) */
  imageClassName?: string;
  onClick?: () => void;
  type?: keyof typeof LOGO_PATHS;
  width?: number;
  height?: number;
}) {
  const src = LOGO_PATHS[type];
  const isIcon = type === "logo-only";
  const w = width ?? (isIcon ? 48 : 200);
  const h = height ?? (isIcon ? 48 : 80);
  const imgClass =
    imageClassName ??
    (isIcon ? "h-10 w-10 object-contain sm:h-11 sm:w-11" : "h-auto w-auto");

  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label={`${site.name} home`}
      className={`inline-flex shrink-0 items-center ${className}`}
    >
      <Image
        src={src}
        alt={`${site.name} logo`}
        width={w}
        height={h}
        priority
        unoptimized
        className={imgClass}
      />
    </Link>
  );
}
