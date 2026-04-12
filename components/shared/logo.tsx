import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
  variant?: "full" | "icon";
}

// Full logo SVG is 1875×214 (cropped to content), icon is 1500×1500 (1:1)
const LOGO_ASPECT = 214 / 1875;
const BRAND_ORANGE = "#f97316";

export function Logo({ className, size = 40, variant = "full" }: LogoProps) {
  const height = variant === "icon" ? size : Math.round(size * LOGO_ASPECT);
  const iconSize = variant === "icon" ? size : height;

  if (variant === "full") {
    const gap = Math.max(4, Math.round(height * 0.28));
    const fontSize = Math.max(12, Math.round(height * 0.95));

    return (
      <span
        className={cn("inline-flex items-center", className)}
        style={{ width: size, gap }}
      >
        <Image
          src="/assets/icon.svg"
          alt=""
          width={iconSize}
          height={iconSize}
          className="shrink-0"
          aria-hidden="true"
          priority
        />
        <span
          className="inline-flex items-baseline leading-none font-black tracking-[-0.06em] uppercase"
          style={{ fontSize }}
          aria-hidden="true"
        >
          <span className="text-foreground dark:text-white">Zeus</span>
          <span
            className="italic"
            style={{ color: BRAND_ORANGE, marginLeft: Math.max(3, Math.round(fontSize * 0.12)) }}
          >
            Resume
          </span>
        </span>
        {/* Accessible brand name. The visible wordmark is aria-hidden because
            it's styled as "Zeus Resume" (two visible words) — screen readers
            should hear the canonical "ResumeZeus" single token instead. */}
        <span className="sr-only">ResumeZeus</span>
      </span>
    );
  }

  return (
    <Image
      src="/assets/icon.svg"
      alt="ResumeZeus"
      width={size}
      height={iconSize}
      className={className}
      style={{ width: size, height: "auto" }}
      priority
    />
  );
}
