"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Hash,
  AlignLeft,
  ClipboardCheck,
  ArrowRight,
  Clock,
  TrendingUp,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { ATSAnalysisResult } from "@/lib/ai/content-types";
import { cn } from "@/lib/utils";

interface WizardPreviewCardProps {
  analysis: ATSAnalysisResult;
  onStartWizard: () => void;
}

const steps = [
  {
    key: "suggestions",
    label: "Apply Suggestions",
    icon: FileText,
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    key: "keywords",
    label: "Add Keywords",
    icon: Hash,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    key: "summary",
    label: "Optimize Summary",
    icon: AlignLeft,
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
  },
  {
    key: "review",
    label: "Review & Save",
    icon: ClipboardCheck,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
];

export function WizardPreviewCard({
  analysis,
  onStartWizard,
}: WizardPreviewCardProps) {
  // Calculate estimated points gain
  const estimatedPoints = useMemo(() => {
    let points = 0;

    // From suggestions (use estimatedImpact or default 5)
    analysis.suggestions.forEach((s) => {
      points += s.estimatedImpact || 5;
    });

    // From keywords (~2 points each)
    points += analysis.missingKeywords.length * 2;

    // From summary optimization
    points += 5;

    return Math.min(points, 50); // Cap at 50
  }, [analysis]);

  // Calculate estimated time (in minutes)
  const estimatedTime = useMemo(() => {
    const suggestionTime = analysis.suggestions.length * 0.5; // 30 sec per suggestion
    const keywordTime = analysis.missingKeywords.length * 0.2; // 12 sec per keyword
    const summaryTime = 1; // 1 min for summary
    const reviewTime = 0.5; // 30 sec for review

    const totalMinutes = Math.ceil(
      suggestionTime + keywordTime + summaryTime + reviewTime
    );
    return Math.max(2, Math.min(totalMinutes, 10)); // Between 2-10 min
  }, [analysis]);

  // Count critical/high priority suggestions
  const criticalCount = analysis.suggestions.filter(
    (s) => s.severity === "critical" || s.severity === "high"
  ).length;

  return (
    <Card className="p-4 md:p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-purple-950/20 dark:via-background dark:to-blue-950/20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-base md:text-lg">
            Your Optimization Plan
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            AI-guided improvements for this job
          </p>
        </div>
      </div>

      {/* Step Timeline */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mb-1.5",
                  step.bgColor
                )}
              >
                <Icon className={cn("w-4 h-4 md:w-5 md:h-5", step.color)} />
              </div>
              <span className="text-[10px] md:text-xs text-center text-muted-foreground leading-tight">
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute translate-x-[60px] translate-y-4 w-8 h-0.5 bg-gray-200 dark:bg-gray-700" />
              )}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="space-y-2 mb-5">
        {/* Suggestions */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/80 dark:bg-gray-900/50 border">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium">Content suggestions</span>
            {criticalCount > 0 && (
              <Badge variant="destructive" className="text-[10px] h-5">
                {criticalCount} important
              </Badge>
            )}
          </div>
          <span className="text-sm font-bold text-purple-600">
            {analysis.suggestions.length}
          </span>
        </div>

        {/* Keywords */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/80 dark:bg-gray-900/50 border">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">Missing keywords</span>
          </div>
          <span className="text-sm font-bold text-blue-600">
            {analysis.missingKeywords.length}
          </span>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/80 dark:bg-gray-900/50 border">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium">Summary optimization</span>
          </div>
          <span className="text-sm font-bold text-amber-600">1</span>
        </div>
      </div>

      {/* Estimates */}
      <div className="flex items-center justify-center gap-6 mb-5 py-3 border-y border-dashed">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">~{estimatedTime} min</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="text-green-600 font-semibold">
            +{estimatedPoints} pts potential
          </span>
        </div>
      </div>

      {/* CTA */}
      <Button
        size="lg"
        className="w-full h-12 text-sm font-semibold gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-md"
        onClick={onStartWizard}
      >
        <Sparkles className="w-5 h-5" />
        Start Guided Improvements
        <ArrowRight className="w-5 h-5" />
      </Button>

      <p className="text-[11px] text-muted-foreground mt-3 text-center">
        Review each suggestion and choose what to apply
      </p>
    </Card>
  );
}
