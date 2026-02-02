"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { ProgressState, formatTimeRemaining } from "@/lib/ai/progress-tracker";
import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  progress: ProgressState | null;
  onCancel?: () => void;
  className?: string;
  compact?: boolean;
}

export function ProgressIndicator({
  progress,
  onCancel,
  className,
  compact = false,
}: ProgressIndicatorProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  // Update elapsed time every second
  useEffect(() => {
    if (!progress || progress.isComplete || progress.isCancelled) {
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime(Date.now() - progress.startTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [progress]);

  // Reset elapsed time when progress starts
  useEffect(() => {
    if (progress && !progress.isComplete && !progress.isCancelled) {
      setElapsedTime(Date.now() - progress.startTime);
    }
  }, [progress]);

  if (!progress) {
    return null;
  }

  const currentStage = progress.stages[progress.currentStage];

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium">
              {progress.isCancelled
                ? "Cancelled"
                : progress.isComplete
                  ? "Complete!"
                  : currentStage?.label || "Processing..."}
            </span>
            <span className="text-xs text-muted-foreground">
              {progress.progress}%
            </span>
          </div>
          <Progress value={progress.progress} className="h-1.5" />
        </div>
        {onCancel && !progress.isComplete && !progress.isCancelled && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Cancel</span>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with progress percentage */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {progress.isCancelled ? (
            <Badge variant="destructive" className="gap-1">
              <X className="w-3 h-3" />
              Cancelled
            </Badge>
          ) : progress.isComplete ? (
            <Badge variant="default" className="gap-1 bg-green-600">
              <CheckCircle2 className="w-3 h-3" />
              Complete
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Processing
            </Badge>
          )}
          <span className="text-sm font-medium text-muted-foreground">
            {progress.progress}%
          </span>
        </div>
        {!progress.isComplete && !progress.isCancelled && (
          <span className="text-xs text-muted-foreground">
            {formatTimeRemaining(progress.estimatedTimeRemaining)}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <Progress value={progress.progress} className="h-2" />

      {/* Current stage */}
      <div className="space-y-2">
        <p className="text-sm font-medium">
          {progress.isCancelled
            ? "Operation cancelled"
            : progress.isComplete
              ? "All done!"
              : currentStage?.label || "Processing..."}
        </p>

        {/* Stage list */}
        {!compact && progress.stages.length > 1 && (
          <div className="space-y-1.5">
            {progress.stages.map((stage, index) => {
              const isCompleted = index < progress.currentStage;
              const isCurrent = index === progress.currentStage;
              const isPending =
                index > progress.currentStage &&
                !progress.isComplete &&
                !progress.isCancelled;

              return (
                <div
                  key={stage.id}
                  className={cn(
                    "flex items-center gap-2 text-xs",
                    isCompleted && "text-green-600",
                    isCurrent && "text-primary font-medium",
                    isPending && "text-muted-foreground"
                  )}
                >
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {isCurrent && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  {isPending && (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-muted" />
                  )}
                  <span>{stage.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel button */}
      {onCancel && !progress.isComplete && !progress.isCancelled && (
        <div className="flex justify-end pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Cancel Operation
          </Button>
        </div>
      )}
    </div>
  );
}
