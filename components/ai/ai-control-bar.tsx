"use client";

import Link from "next/link";
import { ResumeData } from "@/lib/types/resume";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { JobMatcher } from "@/components/ai/job-matcher";
import { TailorResumeDialog } from "@/components/ai/tailor-resume-dialog";
import { InterviewPrepDialog } from "@/components/ai/interview-prep-dialog";
import {
  Sparkles,
  Target,
  ListChecks,
  FileText,
  ArrowRight,
} from "lucide-react";

interface AIControlBarProps {
  resumeData: ResumeData;
}

export function AIControlBar({ resumeData }: AIControlBarProps) {
  return (
    <Card className="p-4 mb-6 border-primary/20 bg-primary/5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="w-4 h-4 text-primary" />
          AI Actions
          <span className="text-xs text-muted-foreground font-normal">
            Optimize, tailor, pregătește interviul și generează cover letter
            rapid.
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <JobMatcher resumeData={resumeData} variant="standard" />
          <TailorResumeDialog
            resumeData={resumeData}
            trigger={
              <Button variant="outline" size="sm" className="gap-2">
                <Target className="w-4 h-4" />
                Tailor
              </Button>
            }
          />
          <InterviewPrepDialog
            resumeData={resumeData}
            trigger={
              <Button variant="outline" size="sm" className="gap-2">
                <ListChecks className="w-4 h-4" />
                Interview Prep
              </Button>
            }
          />
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link href="/cover-letter">
              <FileText className="w-4 h-4" />
              Cover Letter
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
      <Separator className="my-3" />
      <div className="text-xs text-muted-foreground flex flex-wrap gap-4">
        <span>
          Tip: Rulează ATS înainte de Tailor pentru a vedea keywords cheie.
        </span>
        <span>
          Practice mode în Interview Prep: ascunde răspunsurile și exersează.
        </span>
      </div>
    </Card>
  );
}
