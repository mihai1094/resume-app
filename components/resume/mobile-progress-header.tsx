"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

interface MobileProgressHeaderProps {
  title: string;
  description: string;
  currentIndex: number;
  totalSections: number;
  completedFields?: number;
  totalFields?: number;
  isComplete?: boolean;
}

export function MobileProgressHeader({
  title,
  description,
  currentIndex,
  totalSections,
  completedFields,
  totalFields,
  isComplete = false,
}: MobileProgressHeaderProps) {
  const sectionProgress = ((currentIndex + 1) / totalSections) * 100;
  const fieldProgress = totalFields ? (completedFields || 0) / totalFields * 100 : 0;

  return (
    <div className="lg:hidden mb-6">
      {/* Section title and progress ring */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground truncate">
              {title}
            </h2>
            {isComplete && (
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>

        {/* Circular progress indicator */}
        <div className="relative shrink-0">
          <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
            {/* Background circle */}
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              className="stroke-muted"
              strokeWidth="3"
            />
            {/* Progress circle */}
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              className={cn(
                "transition-all duration-500 ease-out",
                isComplete ? "stroke-green-500" : "stroke-primary"
              )}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${sectionProgress}, 100`}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn(
              "text-xs font-bold",
              isComplete ? "text-green-600" : "text-primary"
            )}>
              {currentIndex + 1}/{totalSections}
            </span>
          </div>
        </div>
      </div>

      {/* Field completion bar (if available) */}
      {totalFields !== undefined && totalFields > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {completedFields || 0} of {totalFields} fields complete
            </span>
            <span className={cn(
              "font-semibold",
              fieldProgress === 100 ? "text-green-600" : "text-foreground"
            )}>
              {Math.round(fieldProgress)}%
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300 ease-out",
                fieldProgress === 100 ? "bg-green-500" : "bg-primary"
              )}
              style={{ width: `${fieldProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
