"use client";

import { Eye, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomBarProps {
  showPreview: boolean;
  onTogglePreview: () => void;
  issuesCount?: number;
  isReady?: boolean;
  hasUserInteracted?: boolean;
  onShowIssues?: () => void;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  isFirstSection?: boolean;
  isLastSection?: boolean;
}

export function MobileBottomBar({
  showPreview,
  onTogglePreview,
  issuesCount = 0,
  isReady = false,
  hasUserInteracted = false,
  onShowIssues,
  onBack,
  onNext,
  nextLabel = "Next",
  isFirstSection = false,
  isLastSection = false,
}: MobileBottomBarProps) {
  const hasIssues = issuesCount > 0;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t safe-area-bottom">
      <div className="grid grid-cols-[1fr_auto_auto_1fr] h-14 px-2 gap-1.5 items-center">
        {/* Back Button - Primary navigation */}
        <button
          onClick={onBack}
          disabled={isFirstSection}
          aria-label="Go to previous section"
          className={cn(
            "flex items-center justify-center gap-1.5 h-11 rounded-xl transition-colors",
            isFirstSection
              ? "bg-muted/50 text-muted-foreground/40 cursor-not-allowed"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Status Button */}
        <button
          onClick={onShowIssues}
          aria-label={hasIssues ? `${issuesCount} issues` : "Status"}
          className={cn(
            "flex items-center justify-center h-11 w-11 rounded-xl transition-colors relative",
            !hasUserInteracted
              ? "bg-muted text-muted-foreground"
              : hasIssues
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              : "bg-green-500/10 text-green-600 dark:text-green-400"
          )}
        >
          {!hasUserInteracted ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : hasIssues ? (
            <>
              <AlertCircle className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-white text-[11px] font-bold flex items-center justify-center">
                {issuesCount}
              </span>
            </>
          ) : (
            <CheckCircle2 className="w-6 h-6" />
          )}
        </button>

        {/* Preview Button */}
        <button
          onClick={onTogglePreview}
          aria-label="Preview resume"
          className={cn(
            "flex items-center justify-center h-11 w-11 rounded-xl transition-colors",
            showPreview
              ? "bg-primary/15 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Eye className="w-6 h-6" />
        </button>

        {/* Next Button - Primary navigation */}
        <button
          onClick={onNext}
          className={cn(
            "flex items-center justify-center gap-1.5 h-11 rounded-xl font-medium text-sm transition-colors",
            isLastSection
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-primary hover:bg-primary/90 text-primary-foreground"
          )}
        >
          <span>{nextLabel}</span>
          {isLastSection ? (
            <Check className="w-4 h-4" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
