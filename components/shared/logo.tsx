import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
  variant?: "full" | "icon";
}

// Both logo SVGs use a 2:1 aspect ratio (2000×1000).
const LOGO_ASPECT = 0.5;

export function Logo({ className, size = 40, variant = "full" }: LogoProps) {
  const src =
    variant === "icon" ? "/assets/logos/3.svg" : "/assets/logos/2.svg";
  const height = Math.round(size * LOGO_ASPECT);

  return (
    <Image
      src={src}
      alt="ResumeZeus"
      width={size}
      height={height}
      className={cn("shrink-0", className)}
      priority
    />
  );
}
