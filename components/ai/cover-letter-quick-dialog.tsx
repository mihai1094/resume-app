"use client";

import { useState } from "react";
import { ResumeData } from "@/lib/types/resume";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CoverLetterOutput } from "@/lib/ai/content-generator";
import { toast } from "sonner";
import { ArrowRight, Clipboard, Sparkles } from "lucide-react";
import { useAiProgress } from "@/hooks/use-ai-progress";
import { AI_OPERATION_STAGES } from "@/lib/ai/progress-tracker";
import { ProgressIndicator } from "@/components/ui/progress-indicator";

interface CoverLetterQuickDialogProps {
  resumeData: ResumeData;
  trigger?: React.ReactNode;
}

export function CoverLetterQuickDialog({
  resumeData,
  trigger,
}: CoverLetterQuickDialogProps) {
  const [open, setOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [positionTitle, setPositionTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [hiringManagerName, setHiringManagerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState<CoverLetterOutput | null>(null);

  // Progress tracking
  const aiProgress = useAiProgress({
    stages: AI_OPERATION_STAGES.COVER_LETTER,
    onCancel: () => {
      setIsLoading(false);
      toast.info("Cover letter generation cancelled");
    },
  });

  const handleGenerate = async () => {
    if (
      !companyName.trim() ||
      !positionTitle.trim() ||
      jobDescription.trim().length < 50
    ) {
      toast.error(
        "Completează compania, poziția și un JD de minim 50 caractere."
      );
      return;
    }
    setIsLoading(true);
    setOutput(null);

    // Start progress tracking
    aiProgress.start();

    try {
      // Stage 1: Analyzing
      const response = await fetch("/api/ai/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData,
          jobDescription,
          companyName,
          positionTitle,
          hiringManagerName: hiringManagerName.trim() || undefined,
        }),
        signal: aiProgress.getSignal(),
      });

      // Move to stage 2: Generating
      aiProgress.nextStage();

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate cover letter");
      }

      const data = await response.json();

      // Move to stage 3: Refining
      aiProgress.nextStage();

      // Check if cancelled during processing
      if (aiProgress.isCancelled()) {
        return;
      }

      setOutput(data.coverLetter);

      // Complete progress
      aiProgress.complete();

      if (data.meta?.fromCache) {
        toast.success(
          `Cover letter din cache în ${data.meta.responseTime}ms (${data.meta.cacheStats?.hitRate} hit rate)`
        );
      } else {
        toast.success(`Cover letter generat în ${data.meta?.responseTime}ms`);
      }
    } catch (error) {
      // Check if error is due to cancellation
      if (error instanceof Error && error.name === "AbortError") {
        aiProgress.reset();
        return;
      }

      console.error("Cover letter AI error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Nu am putut genera cover letter"
      );
      aiProgress.reset();
    } finally {
      setIsLoading(false);
    }
  };

  const copyAll = async () => {
    if (!output) return;
    const text = [
      output.salutation,
      "",
      output.introduction,
      "",
      ...output.bodyParagraphs,
      "",
      output.closing,
      "",
      output.signature,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Cover letter copiat");
    } catch (err) {
      console.error("Clipboard error", err);
      toast.error("Nu am putut copia. Încearcă din nou.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Sparkles className="w-4 h-4" />
            AI Cover Letter
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Generate Cover Letter (from this CV)
          </DialogTitle>
          <DialogDescription>
            Folosește CV-ul curent + JD pentru a genera o scrisoare
            personalizată.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Company</Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex: Acme Corp"
              />
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <Input
                value={positionTitle}
                onChange={(e) => setPositionTitle(e.target.value)}
                placeholder="Ex: Product Manager"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Hiring Manager (opțional)</Label>
            <Input
              value={hiringManagerName}
              onChange={(e) => setHiringManagerName(e.target.value)}
              placeholder="Ex: Ana Ionescu"
            />
          </div>
          <div className="space-y-2">
            <Label>Job Description</Label>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste JD (minim 50 caractere)…"
              className="min-h-[140px]"
            />
            <div className="text-xs text-muted-foreground">
              {jobDescription.trim().length} caractere
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading || jobDescription.trim().length < 50}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate with AI
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          {/* Progress Indicator */}
          {isLoading && aiProgress.progress && (
            <div className="space-y-3">
              <Separator />
              <ProgressIndicator
                progress={aiProgress.progress}
                onCancel={aiProgress.cancel}
              />
            </div>
          )}

          {output && (
            <div className="space-y-3">
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Preview</Badge>
                  <span className="text-sm text-muted-foreground">
                    Copiază și editează în /cover-letter
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAll}
                  className="gap-2"
                >
                  <Clipboard className="w-4 h-4" />
                  Copiază tot
                </Button>
              </div>
              <div className="space-y-2 text-sm leading-6 bg-muted/40 p-4 rounded-lg border">
                <p className="font-medium">{output.salutation}</p>
                <p>{output.introduction}</p>
                {output.bodyParagraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                <p>{output.closing}</p>
                <p className="font-medium whitespace-pre-line">
                  {output.signature}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <p className="text-xs text-muted-foreground">
            După generare, poți deschide editorul de cover letter pentru
            fine-tuning.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
