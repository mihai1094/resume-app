"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ATSResult } from "@/lib/ats/engine";
import { cn } from "@/lib/utils";

interface LiveAtsPanelProps {
  result: ATSResult;
  hasJobDescription: boolean;
  onOpenDetails: () => void;
}

function getScoreTone(score: number) {
  if (score >= 80) {
    return {
      text: "text-green-600",
      bar: "bg-green-500",
      label: "Strong ATS baseline",
    };
  }

  if (score >= 60) {
    return {
      text: "text-amber-600",
      bar: "bg-amber-500",
      label: "Good start, still fixable gaps",
    };
  }

  return {
    text: "text-red-600",
    bar: "bg-red-500",
    label: "Needs attention before export",
  };
}

export function LiveAtsPanel({
  result,
  hasJobDescription,
  onOpenDetails,
}: LiveAtsPanelProps) {
  const tone = getScoreTone(result.totalScore);
  const topIssues = result.issues
    .filter((issue) => issue.type !== "success")
    .slice(0, 3);
  const jobMatchScore = result.breakdown.jobMatch?.score ?? null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Target className="h-4 w-4 text-primary" />
              Live ATS score
            </div>
            <h3 className="text-lg font-semibold tracking-tight">
              {tone.label}
            </h3>
          </div>

          <div className="text-right">
            <div className={cn("text-3xl font-bold tabular-nums", tone.text)}>
              {result.totalScore}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              out of 100
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
            <div
              className={cn("h-full transition-all", tone.bar)}
              style={{ width: `${result.totalScore}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
            <div>Content {result.breakdown.content.score}/{result.breakdown.content.maxScore}</div>
            <div>Skills {result.breakdown.skills.score}/{result.breakdown.skills.maxScore}</div>
            <div>Structure {result.breakdown.structure.score}/{result.breakdown.structure.maxScore}</div>
            {jobMatchScore !== null && (
              <div className="sm:col-span-3">
                Job match {jobMatchScore}/{result.breakdown.jobMatch?.maxScore}
              </div>
            )}
          </div>
        </div>

        {topIssues.length > 0 ? (
          <div className="space-y-2">
            {topIssues.map((issue, index) => (
              <div
                key={`${issue.message}-${index}`}
                className="flex items-start gap-2 rounded-xl border bg-background/80 px-3 py-2 text-sm"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <span className="text-muted-foreground">{issue.message}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-xl border bg-background/80 px-3 py-2 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
            <span>
              No major ATS blockers detected right now. Keep refining your wording
              before export.
            </span>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {hasJobDescription
              ? "Job description context is included in this score."
              : "Add a job description for a more specific keyword-match score."}
          </p>
          <Button type="button" size="sm" variant="outline" onClick={onOpenDetails}>
            Open full analysis
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
