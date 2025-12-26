"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutTemplate,
  ShieldCheck,
  Timer,
  Eye,
  type LucideIcon,
} from "lucide-react";
import { TEMPLATES } from "@/lib/constants";

type StatConfig =
  | {
    id: string;
    type: "range";
    from: number;
    to: number;
    suffix?: string;
    label: string;
    icon: LucideIcon;
    progress: number;
    note?: string;
  }
  | {
    id: string;
    type: "number";
    value: number;
    prefix?: string;
    suffix?: string;
    label: string;
    icon: LucideIcon;
    progress: number;
    note?: string;
  }
  | {
    id: string;
    type: "text";
    text: string;
    label: string;
    icon: LucideIcon;
    progress: number;
    note?: string;
  };

// Count templates with excellent ATS compatibility
const atsExcellentCount = TEMPLATES.filter(
  (t) => t.features.atsCompatibility === "excellent"
).length;

const HERO_STATS: StatConfig[] = [
  {
    id: "templates",
    type: "number",
    value: TEMPLATES.length,
    label: "Professional Templates",
    icon: LayoutTemplate,
    progress: 0.9,
    note: "Designed for every industry",
  },
  {
    id: "ats",
    type: "text",
    text: "95%+",
    label: "ATS Parse Rate",
    icon: ShieldCheck,
    progress: 1,
    note: `${atsExcellentCount} templates with excellent compatibility`,
  },
  {
    id: "speed",
    type: "text",
    text: "<5min",
    label: "To First Draft",
    icon: Timer,
    progress: 0.3,
    note: "From blank page to polished CV",
  },
  {
    id: "preview",
    type: "text",
    text: "Live",
    label: "Real-time Preview",
    icon: Eye,
    progress: 0.85,
    note: "See changes as you type",
  },
];

function useCountUp(target: number, active: boolean, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
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
    [animatedValue, decimals]
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
  const [featuredIndex, setFeaturedIndex] = useState(0);

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
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasAnimated) return;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % HERO_STATS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [hasAnimated]);

  return (
    <div className="space-y-10">
      {/* Section Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl font-serif font-medium tracking-tight">
          Built for Results
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Everything you need to create job-winning resumes, nothing you don&apos;t.
        </p>
      </div>

      {/* Stats Grid */}
      <div
        ref={containerRef}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
      >
      {HERO_STATS.map((stat, index) => {
        const Icon = stat.icon;
        const isFeatured = featuredIndex === index;

        const progressWidth = `${Math.min(Math.max(stat.progress, 0), 1) * 100}%`;

        return (
          <div
            key={stat.id}
            className={cn(
              "relative rounded-2xl border bg-background/70 p-4 md:p-5 transition-all duration-500",
              isFeatured
                ? "shadow-lg shadow-primary/10 border-primary/40 ring-2 ring-primary/30"
                : "border-border hover:border-primary/30"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white/70",
                  isFeatured && "border-primary/30 bg-primary/5"
                )}
              >
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div
                className={cn(
                  "text-2xl md:text-3xl font-semibold transition-colors",
                  isFeatured
                    ? "bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent animate-pulse"
                    : "text-foreground"
                )}
              >
                {stat.type === "range" && (
                  <span className="flex items-baseline gap-1">
                    <AnimatedNumber
                      value={stat.from}
                      suffix={stat.suffix}
                      isActive={hasAnimated}
                    />
                    <span className="text-lg text-muted-foreground">-</span>
                    <AnimatedNumber
                      value={stat.to}
                      suffix={stat.suffix}
                      isActive={hasAnimated}
                    />
                  </span>
                )}
                {stat.type === "number" && (
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
                <p className="mt-1 text-xs text-muted-foreground">{stat.note}</p>
              )}
            </div>

            <div className="mt-4 h-px w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full bg-primary/60 transition-all duration-700",
                  isFeatured && "bg-primary"
                )}
                style={{ width: progressWidth }}
              />
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
