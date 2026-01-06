"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  color: string;
  variant?: "filled" | "outline" | "minimal";
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Metric highlight card for displaying key stats
 * Used in Infographic template
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  color,
  variant = "filled",
  size = "md",
  className,
}: StatCardProps) {
  const sizes = {
    sm: {
      container: "p-2",
      icon: "w-4 h-4",
      value: "text-lg font-bold",
      label: "text-[10px]",
    },
    md: {
      container: "p-3",
      icon: "w-5 h-5",
      value: "text-xl font-bold",
      label: "text-xs",
    },
    lg: {
      container: "p-4",
      icon: "w-6 h-6",
      value: "text-2xl font-bold",
      label: "text-sm",
    },
  };

  const variants = {
    filled: {
      container: "text-white",
      bg: color,
      border: undefined as string | undefined,
      iconBg: "rgba(255,255,255,0.2)",
    },
    outline: {
      container: "",
      bg: "transparent",
      border: color,
      iconBg: `${color}15`,
    },
    minimal: {
      container: "",
      bg: `${color}10`,
      border: undefined as string | undefined,
      iconBg: `${color}20`,
    },
  };

  const s = sizes[size];
  const v = variants[variant];

  return (
    <div
      className={cn(
        "rounded-lg flex items-center gap-3",
        s.container,
        v.container,
        variant === "outline" && "border-2",
        className
      )}
      style={{
        backgroundColor: v.bg,
        borderColor: v.border,
        color: variant === "filled" ? "white" : color,
      }}
    >
      {Icon && (
        <div
          className={cn("rounded-full p-2 flex-shrink-0")}
          style={{ backgroundColor: v.iconBg }}
        >
          <Icon className={s.icon} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className={s.value}>{value}</div>
        <div
          className={cn(s.label, "truncate")}
          style={{ opacity: variant === "filled" ? 0.9 : 0.7 }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

/**
 * Circular progress indicator for skills
 * Used in Infographic template
 */
export function CircularProgress({
  percentage,
  size = 60,
  strokeWidth = 4,
  color,
  label,
  showPercentage = true,
  className,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`${color}20`}
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500"
          />
        </svg>
        {showPercentage && (
          <div
            className="absolute inset-0 flex items-center justify-center font-semibold"
            style={{ fontSize: size * 0.22, color }}
          >
            {percentage}%
          </div>
        )}
      </div>
      {label && (
        <span className="text-xs text-center truncate max-w-full">{label}</span>
      )}
    </div>
  );
}
