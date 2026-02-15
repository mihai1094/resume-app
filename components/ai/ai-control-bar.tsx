"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ResumeData } from "@/lib/types/resume";
import { BatchUpdatePayload } from "@/hooks/use-resume";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { JobMatcher } from "@/components/ai/job-matcher";
import { TailorResumeDialog } from "@/components/ai/tailor-resume-dialog";
import { BatchEnhanceDialog } from "@/components/ai/batch-enhance-dialog";
import {
  Sparkles,
  Target,
  ListChecks,
  FileText,
  ArrowRight,
  Wand2,
} from "lucide-react";
import { launchFlags } from "@/config/launch";

interface AIControlBarProps {
  resumeData: ResumeData;
  jobDescription?: string;
  onBatchUpdate?: (payload: BatchUpdatePayload) => void;
}

export function AIControlBar({
  resumeData,
  jobDescription,
  onBatchUpdate,
}: AIControlBarProps) {
  const [showBatchEnhance, setShowBatchEnhance] = useState(false);
  const [privacyMode, setPrivacyMode] = useState<"strict" | "standard">(
    "strict"
  );

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("ai_privacy_mode");
      if (stored === "standard" || stored === "strict") {
        setPrivacyMode(stored);
      }
    } catch {
      // Ignore storage errors and keep strict mode.
    }
  }, []);

  const onPrivacyModeChange = (mode: "strict" | "standard") => {
    setPrivacyMode(mode);
    try {
      window.localStorage.setItem("ai_privacy_mode", mode);
    } catch {
      // Ignore storage errors; mode still applies for this session.
    }
  };

  return (
    <Card className="p-4 mb-6 border-primary/20 bg-primary/5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="w-4 h-4 text-primary" />
          AI Actions
          <span className="text-xs text-muted-foreground font-normal">
            Generate better content quickly and keep your resume focused.
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {launchFlags.features.batchEnhance && onBatchUpdate && (
            <Button
              variant="default"
              size="sm"
              className="gap-2"
              onClick={() => setShowBatchEnhance(true)}
            >
              <Wand2 className="w-4 h-4" />
              Enhance All
            </Button>
          )}
          {launchFlags.features.resumeOptimize && (
            <JobMatcher resumeData={resumeData} variant="standard" />
          )}
          {launchFlags.features.tailorResume && (
            <TailorResumeDialog
              resumeData={resumeData}
              initialJobDescription={jobDescription}
              trigger={
                <Button variant="outline" size="sm" className="gap-2">
                  <Target className="w-4 h-4" />
                  Tailor
                </Button>
              }
            />
          )}
          {launchFlags.features.interviewPrep && (
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link href="/dashboard/interview-prep">
                <ListChecks className="w-4 h-4" />
                Interview Prep
              </Link>
            </Button>
          )}
          {launchFlags.features.coverLetter && (
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link href="/cover-letter">
                <FileText className="w-4 h-4" />
                Cover Letter
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
      <Separator className="my-3" />
      <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-4">
        <div className="inline-flex items-center gap-1 rounded-md border p-1 bg-background">
          <Button
            type="button"
            variant={privacyMode === "strict" ? "default" : "ghost"}
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => onPrivacyModeChange("strict")}
          >
            AI Privacy: Strict
          </Button>
          <Button
            type="button"
            variant={privacyMode === "standard" ? "default" : "ghost"}
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => onPrivacyModeChange("standard")}
          >
            Standard
          </Button>
        </div>
        <span>
          Tip: Keep bullets measurable and role-focused for better ATS results.
        </span>
      </div>

      {/* Batch Enhance Dialog */}
      {launchFlags.features.batchEnhance && onBatchUpdate && (
        <BatchEnhanceDialog
          resumeData={resumeData}
          jobDescription={jobDescription}
          open={showBatchEnhance}
          onOpenChange={setShowBatchEnhance}
          onApply={onBatchUpdate}
        />
      )}
    </Card>
  );
}
