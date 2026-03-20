import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
  variant?: "full" | "icon";
}

// Full logo SVG is 1875×214 (cropped to content), icon is 1500×1500 (1:1)
const LOGO_ASPECT = 214 / 1875;

export function Logo({ className, size = 40, variant = "full" }: LogoProps) {
  const src = variant === "icon" ? "/assets/icon.svg" : "/assets/logo.svg";
  const height = variant === "icon" ? size : Math.round(size * LOGO_ASPECT);

  return (
    <Image
      src={src}
      alt="ResumeZeus"
      width={size}
      height={height}
      className={cn(variant === "full" && "dark:invert", className)}
      style={{ width: size, height: "auto" }}
      priority
    />
  );
}
