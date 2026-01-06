"use client";

import { cn } from "@/lib/utils";

interface TimelineNodeProps {
  color: string;
  isFirst?: boolean;
  isLast?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "dot" | "ring" | "number";
  number?: number;
  className?: string;
}

/**
 * Timeline dot/node for connecting experience entries
 * Used in Cascade, Infographic, Timeline templates
 */
export function TimelineNode({
  color,
  isFirst = false,
  isLast = false,
  size = "md",
  variant = "dot",
  number,
  className,
}: TimelineNodeProps) {
  const sizes = {
    sm: { dot: "w-2 h-2", ring: "w-3 h-3", number: "w-5 h-5 text-[10px]" },
    md: { dot: "w-3 h-3", ring: "w-4 h-4", number: "w-6 h-6 text-xs" },
    lg: { dot: "w-4 h-4", ring: "w-5 h-5", number: "w-8 h-8 text-sm" },
  };

  const lineWidths = {
    sm: "w-0.5",
    md: "w-0.5",
    lg: "w-1",
  };

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      {/* Top line (if not first) */}
      {!isFirst && (
        <div
          className={cn("flex-1 min-h-2", lineWidths[size])}
          style={{ backgroundColor: `${color}30` }}
        />
      )}

      {/* Node */}
      {variant === "dot" && (
        <div
          className={cn("rounded-full flex-shrink-0", sizes[size].dot)}
          style={{ backgroundColor: color }}
        />
      )}

      {variant === "ring" && (
        <div
          className={cn(
            "rounded-full flex-shrink-0 border-2",
            sizes[size].ring
          )}
          style={{ borderColor: color, backgroundColor: `${color}20` }}
        />
      )}

      {variant === "number" && (
        <div
          className={cn(
            "rounded-full flex-shrink-0 flex items-center justify-center font-semibold text-white",
            sizes[size].number
          )}
          style={{ backgroundColor: color }}
        >
          {number}
        </div>
      )}

      {/* Bottom line (if not last) */}
      {!isLast && (
        <div
          className={cn("flex-1 min-h-4", lineWidths[size])}
          style={{ backgroundColor: `${color}30` }}
        />
      )}
    </div>
  );
}

interface TimelineContainerProps {
  children: React.ReactNode;
  color: string;
  className?: string;
}

/**
 * Container with vertical timeline line
 */
export function TimelineContainer({
  children,
  color,
  className,
}: TimelineContainerProps) {
  return (
    <div
      className={cn("relative pl-6", className)}
      style={{
        borderLeft: `2px solid ${color}20`,
      }}
    >
      {children}
    </div>
  );
}

interface TimelineEntryProps {
  children: React.ReactNode;
  color: string;
  isActive?: boolean;
  className?: string;
}

/**
 * Single timeline entry with dot marker
 */
export function TimelineEntry({
  children,
  color,
  isActive = false,
  className,
}: TimelineEntryProps) {
  return (
    <div className={cn("relative pb-6 last:pb-0", className)}>
      {/* Dot marker */}
      <div
        className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white"
        style={{
          borderColor: color,
          backgroundColor: isActive ? color : "white",
        }}
      />
      {children}
    </div>
  );
}
