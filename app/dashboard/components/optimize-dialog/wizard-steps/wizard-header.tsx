"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Undo2, Sparkles, Briefcase, Building2 } from "lucide-react";
import { WizardStep } from "@/lib/ai/content-types";

interface WizardHeaderProps {
  step: WizardStep;
  jobTitle: string;
  companyName: string;
  onCancel: () => void;
  canUndo: boolean;
  onUndo: () => void;
}

const stepTitles: Record<WizardStep, string> = {
  suggestions: "Apply Suggestions",
  keywords: "Add Keywords",
  summary: "Optimize Summary",
  review: "Review Changes",
};

const stepDescriptions: Record<WizardStep, string> = {
  suggestions: "Review and apply AI-powered improvements to your resume",
  keywords: "Add missing keywords to boost ATS compatibility",
  summary: "Tailor your professional summary for this role",
  review: "Review all changes before saving",
};

export function WizardHeader({
  step,
  jobTitle,
  companyName,
  onCancel,
  canUndo,
  onUndo,
}: WizardHeaderProps) {
  return (
    <div className="border-b bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 px-4 md:px-6 py-4">
      {/* Top row: Title and actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{stepTitles[step]}</h2>
            <p className="text-sm text-muted-foreground hidden md:block">
              {stepDescriptions[step]}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canUndo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onUndo}
              className="gap-1.5"
            >
              <Undo2 className="w-4 h-4" />
              <span className="hidden sm:inline">Undo</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="shrink-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Target job info */}
      {(jobTitle || companyName) && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-xs text-muted-foreground">Optimizing for:</span>
          {jobTitle && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <Briefcase className="w-3 h-3" />
              {jobTitle}
            </Badge>
          )}
          {companyName && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <Building2 className="w-3 h-3" />
              {companyName}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
