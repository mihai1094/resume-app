import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className, size = 40 }: LogoProps) {
  return (
    <Image
      src="/assets/icon.svg"
      alt="ResumeZeus"
      width={size}
      height={size}
      className={cn(className)}
      style={{ width: size, height: "auto" }}
      priority
    />
  );
}
