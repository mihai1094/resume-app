"use client";

import { useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { ResumeData } from "@/lib/types/resume";
import {
  analyzeResumeReadiness,
} from "@/lib/services/resume-readiness";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  ListChecks,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Lightbulb,
  Info,
} from "lucide-react";
import { ReadinessCheckItem } from "./readiness-check-item";
import { useDismissedChecks } from "@/hooks/use-dismissed-checks";

interface ReadinessDashboardProps {
  resumeData: ResumeData;
  resumeId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJumpToSection?: (sectionId: string) => void;
}

export function ReadinessDashboard({
  resumeData,
  resumeId,
  open,
  onOpenChange,
  onJumpToSection,
}: ReadinessDashboardProps) {
  // Dismissed checks (shared with dashboard via localStorage)
  const { dismissedIds, dismissCheck, restoreCheck, resetAll, hasDismissed } = useDismissedChecks(resumeId);

  // Analyze resume readiness (local, instant)
  const readinessResult = useMemo(
    () => analyzeResumeReadiness(resumeData),
    [resumeData]
  );

  const handleFix = useCallback(
    (sectionId: string) => {
      if (onJumpToSection) {
        onJumpToSection(sectionId);
        onOpenChange(false);
      }
    },
    [onJumpToSection, onOpenChange]
  );

  // Separate required and recommended checks (filter out dismissed recommended)
  const requiredChecks = readinessResult.checks
    .filter((c) => c.priority === "required")
    .sort((a, b) => {
      if (a.status === "fail" && b.status === "pass") return -1;
      if (a.status === "pass" && b.status === "fail") return 1;
      return 0;
    });
  const recommendedChecks = readinessResult.checks
    .filter((c) => c.priority === "recommended" && !dismissedIds.has(c.id))
    .sort((a, b) => {
      if (a.status === "fail" && b.status === "pass") return -1;
      if (a.status === "pass" && b.status === "fail") return 1;
      return 0;
    });
  const dismissedChecks = readinessResult.checks.filter(
    (c) => c.priority === "recommended" && dismissedIds.has(c.id)
  );

  // Calculate if effectively ready (all required pass, dismissed recommended don't count)
  const isEffectivelyReady = requiredChecks.every((c) => c.status === "pass");

  // Calculate actual summary counts
  const actualSummary = useMemo(() => {
    const allRecommended = readinessResult.checks.filter(c => c.priority === "recommended");
    return {
      required: {
        passed: requiredChecks.filter(c => c.status === "pass").length,
        total: requiredChecks.length
      },
      recommended: {
        passed: allRecommended.filter(c => c.status === "pass").length + dismissedChecks.length,
        total: allRecommended.length
      }
    };
  }, [readinessResult, requiredChecks, dismissedChecks]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ListChecks className="w-5 h-5 text-primary" />
            Resume Readiness
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 mt-2">
          {/* Summary Badges */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Badge
              variant={isEffectivelyReady ? "default" : "destructive"}
              className="gap-1"
            >
              {isEffectivelyReady ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <XCircle className="w-3 h-3" />
              )}
              Required: {actualSummary.required.passed}/
              {actualSummary.required.total}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Lightbulb className="w-3 h-3" />
              Tips: {actualSummary.recommended.passed}/
              {actualSummary.recommended.total}
            </Badge>
            {hasDismissed && (
              <button
                onClick={resetAll}
                className="text-xs text-muted-foreground hover:text-foreground underline ml-auto"
              >
                Reset dismissed
              </button>
            )}
          </div>

          {/* Required Checks */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              {isEffectivelyReady ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              Required Checks
            </h3>
            <div className="space-y-2">
              {requiredChecks.map((check, idx) => (
                <ReadinessCheckItem
                  key={check.id}
                  check={check}
                  onFix={handleFix}
                  index={idx}
                />
              ))}
            </div>
          </div>

          {/* Recommended Checks */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Recommended Improvements
            </h3>
            <div className="space-y-2">
              {recommendedChecks.map((check, idx) => (
                <ReadinessCheckItem
                  key={check.id}
                  check={check}
                  onFix={handleFix}
                  index={idx + requiredChecks.length}
                  onDismiss={resumeId ? () => dismissCheck(check.id) : undefined}
                />
              ))}
            </div>
          </div>

          {/* Dismissed Checks */}
          {dismissedChecks.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                <Info className="w-4 h-4" />
                Dismissed Tips ({dismissedChecks.length})
              </h3>
              <div className="space-y-1">
                {dismissedChecks.map((check) => (
                  <div
                    key={check.id}
                    className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/30 text-sm"
                  >
                    <span className="text-muted-foreground line-through">
                      {check.label}
                    </span>
                    <button
                      onClick={() => restoreCheck(check.id)}
                      className="text-xs text-primary hover:underline"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Checks Passed */}
          {isEffectivelyReady &&
            actualSummary.recommended.passed ===
            actualSummary.recommended.total && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center"
              >
                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-medium text-green-700 dark:text-green-400">
                  All checks passed!
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your resume looks great and is ready to send.
                </p>
              </motion.div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
