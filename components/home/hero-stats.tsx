"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutTemplate,
  ShieldCheck,
  Timer,
  FileOutput,
  type LucideIcon,
} from "lucide-react";
import { TEMPLATES } from "@/lib/constants";

interface StatConfig {
  id: string;
  type: "number" | "text";
  value?: number;
  prefix?: string;
  suffix?: string;
  text?: string;
  label: string;
  icon: LucideIcon;
  note?: React.ReactNode;
}

// Count templates with excellent or good ATS compatibility
const atsFriendlyCount = TEMPLATES.filter(
  (t) =>
    t.features.atsCompatibility === "excellent" ||
    t.features.atsCompatibility === "good",
).length;

const HERO_STATS: StatConfig[] = [
  {
    id: "templates",
    type: "number",
    value: TEMPLATES.length,
    label: "Resume Templates",
    icon: LayoutTemplate,
    note: "Layouts built for real job applications",
  },
  {
    id: "ats",
    type: "number",
    value: atsFriendlyCount,
    label: "ATS-Ready Templates",
    icon: ShieldCheck,
    note: <>Rated Good or Excellent for <strong>A</strong>pplicant <strong>T</strong>racking <strong>S</strong>ystem</>,
  },
  {
    id: "speed",
    type: "number",
    value: 5,
    prefix: "<",
    suffix: " min",
    label: "To First Resume",
    icon: Timer,
    note: "From blank page to strong first version",
  },
  {
    id: "exports",
    type: "text",
    text: "3",
    label: "Export Formats",
    icon: FileOutput,
    note: "PDF, DOCX, and JSON backup",
  },
];

function useCountUp(target: number, active: boolean, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let frame: number;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active, duration]);

  return value;
}

function AnimatedNumber({
  value,
  isActive,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  value: number;
  isActive: boolean;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const animatedValue = useCountUp(value, isActive);
  const formatted = useMemo(
    () =>
      animatedValue.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
    [animatedValue, decimals],
  );

  return (
    <span className="tabular-nums">
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

export function HeroStats() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-12">
      {/* Section Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
          Built to impress. Designed to deliver.
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium tracking-tight leading-[1.1]">
          The Ultimate <span className="text-orange-500 italic">Resume Experience</span>
        </h2>
      </div>

      {/* Stats Grid */}
      <div
        ref={containerRef}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
      >
        {HERO_STATS.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.id}
              className={cn(
                "relative overflow-hidden rounded-2xl border bg-background/70 p-4 py-6 sm:p-4 sm:py-6 md:p-5 md:py-8 transition-colors duration-300 cursor-default flex flex-col items-center justify-center text-center gap-2 sm:gap-0",
                "border-border hover:border-primary/40",
              )}
            >
              <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-border bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                <Icon className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-[10px] sm:text-xs sm:mt-3 uppercase tracking-wide text-muted-foreground break-words">
                {stat.label}
              </p>
              <div className="my-2 sm:my-4 text-xl sm:text-2xl md:text-3xl font-semibold text-foreground">
                {stat.type === "number" && stat.value !== undefined && (
                  <AnimatedNumber
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    isActive={hasAnimated}
                  />
                )}
                {stat.type === "text" && <span>{stat.text}</span>}
              </div>
              {stat.note && (
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {stat.note}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
