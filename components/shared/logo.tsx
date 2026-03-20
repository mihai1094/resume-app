import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
  variant?: "full" | "icon";
}

export function Logo({ className, size = 40, variant = "full" }: LogoProps) {
  const src = variant === "icon" ? "/assets/icon.svg" : "/assets/logo.svg";

  return (
    <Image
      src={src}
      alt="ResumeZeus"
      width={size}
      height={size}
      className={cn(variant === "full" && "dark:invert", className)}
      style={{ width: size, height: "auto" }}
      priority
    />
  );
}
