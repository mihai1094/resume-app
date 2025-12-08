"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  ShieldCheck,
  Timer,
  Users,
  type LucideIcon,
} from "lucide-react";

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

const HERO_STATS: StatConfig[] = [
  {
    id: "callbacks",
    type: "range",
    from: 40,
    to: 60,
    suffix: "%",
    label: "Higher callback rate",
    icon: TrendingUp,
    progress: 0.65,
    note: "Compared to generic templates",
  },
  {
    id: "ats",
    type: "number",
    value: 100,
    suffix: "%",
    label: "ATS Parsing Score",
    icon: ShieldCheck,
    progress: 1,
    note: "Scans pass major ATS systems",
  },
  {
    id: "speed",
    type: "number",
    value: 5,
    prefix: "<",
    suffix: "min",
    label: "Creation time",
    icon: Timer,
    progress: 0.2,
    note: "Average first draft time",
  },
  {
    id: "users",
    type: "text",
    text: "10k+",
    label: "Resumes Built",
    icon: Users,
    progress: 1,
    note: "Trusted by job seekers",
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
  );
}
