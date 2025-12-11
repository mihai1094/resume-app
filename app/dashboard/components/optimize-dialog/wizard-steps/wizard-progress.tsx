"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Check, FileText, Hash, AlignLeft, ClipboardCheck } from "lucide-react";
import { WizardStep } from "@/lib/ai/content-types";
import { cn } from "@/lib/utils";

interface WizardProgressProps {
  step: WizardStep;
  progress: number;
  appliedCount: number;
  skippedCount: number;
  totalSuggestions: number;
  addedKeywords: number;
  totalKeywords: number;
  summaryApplied: boolean;
}

const steps: { key: WizardStep; label: string; icon: React.ElementType }[] = [
  { key: "suggestions", label: "Suggestions", icon: FileText },
  { key: "keywords", label: "Keywords", icon: Hash },
  { key: "summary", label: "Summary", icon: AlignLeft },
  { key: "review", label: "Review", icon: ClipboardCheck },
];

export function WizardProgress({
  step,
  progress,
  appliedCount,
  skippedCount,
  totalSuggestions,
  addedKeywords,
  totalKeywords,
  summaryApplied,
}: WizardProgressProps) {
  const currentStepIndex = steps.findIndex((s) => s.key === step);

  const getStepStatus = (stepKey: WizardStep, index: number) => {
    if (index < currentStepIndex) return "completed";
    if (index === currentStepIndex) return "current";
    return "upcoming";
  };

  const getStepBadge = (stepKey: WizardStep) => {
    switch (stepKey) {
      case "suggestions":
        if (appliedCount > 0 || skippedCount > 0) {
          return `${appliedCount}/${totalSuggestions}`;
        }
        return totalSuggestions.toString();
      case "keywords":
        if (addedKeywords > 0) {
          return `${addedKeywords}/${totalKeywords}`;
        }
        return totalKeywords.toString();
      case "summary":
        return summaryApplied ? "Done" : "1";
      case "review":
        return null;
    }
  };

  return (
    <div className="border-b px-4 md:px-6 py-3 bg-muted/30">
      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Overall progress</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {steps.map((s, index) => {
          const status = getStepStatus(s.key, index);
          const Icon = s.icon;
          const badge = getStepBadge(s.key);

          return (
            <div
              key={s.key}
              className={cn(
                "flex items-center gap-2",
                status === "upcoming" && "opacity-50"
              )}
            >
              {/* Step icon */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                  status === "completed" &&
                    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                  status === "current" &&
                    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                  status === "upcoming" &&
                    "bg-muted text-muted-foreground"
                )}
              >
                {status === "completed" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              {/* Step label (hidden on mobile) */}
              <div className="hidden md:block">
                <p
                  className={cn(
                    "text-sm font-medium",
                    status === "current" && "text-purple-700 dark:text-purple-400"
                  )}
                >
                  {s.label}
                </p>
                {badge && (
                  <Badge
                    variant={status === "current" ? "default" : "secondary"}
                    className="text-[10px] h-4 px-1.5 mt-0.5"
                  >
                    {badge}
                  </Badge>
                )}
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "hidden md:block w-8 lg:w-16 h-0.5 mx-2",
                    index < currentStepIndex
                      ? "bg-green-500"
                      : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
