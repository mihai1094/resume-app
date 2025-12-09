"use client";

import { useMemo, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  Clipboard,
  Eye,
  EyeOff,
  ListChecks,
  MessageSquare,
  Sparkles,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { InterviewQuestion } from "@/lib/ai/content-generator";
import { useAiProgress } from "@/hooks/use-ai-progress";
import { AI_OPERATION_STAGES } from "@/lib/ai/progress-tracker";
import { ProgressIndicator } from "@/components/ui/progress-indicator";

interface InterviewPrepDialogProps {
  resumeData: ResumeData;
  trigger?: React.ReactNode;
}

export function InterviewPrepDialog({
  resumeData,
  trigger,
}: InterviewPrepDialogProps) {
  const [open, setOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAnswers, setShowAnswers] = useState(true);

  // Progress tracking
  const aiProgress = useAiProgress({
    stages: AI_OPERATION_STAGES.INTERVIEW_PREP,
    onCancel: () => {
      setIsLoading(false);
      toast.info("Interview prep generation cancelled");
    },
  });

  const handleGenerate = async () => {
    if (!jobDescription.trim() || jobDescription.trim().length < 50) {
      toast.error("Adaugă un job description (minim 50 caractere).");
      return;
    }

    setIsLoading(true);
    setQuestions([]);

    // Start progress tracking
    aiProgress.start();

    try {
      // Stage 1: Analyzing resume and job
      const response = await fetch("/api/ai/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData, jobDescription }),
        signal: aiProgress.getSignal(),
      });

      // Stage 2: Generating questions
      aiProgress.nextStage();

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate interview prep");
      }

      const data = await response.json();

      // Stage 3: Creating answers
      aiProgress.nextStage();

      // Check if cancelled
      if (aiProgress.isCancelled()) {
        return;
      }

      setQuestions(data.questions || []);

      // Complete
      aiProgress.complete();

      if (data.meta?.fromCache) {
        toast.success(
          `Prep din cache în ${data.meta.responseTime}ms (${data.meta.cacheStats?.hitRate} hit rate)`
        );
      } else {
        toast.success(`Prep generat în ${data.meta?.responseTime}ms`);
      }
    } catch (error) {
      // Check if error is due to cancellation
      if (error instanceof Error && error.name === "AbortError") {
        aiProgress.reset();
        return;
      }

      console.error("Interview prep error:", error);
      toast.error(
        error instanceof Error ? error.message : "Nu am putut genera prep"
      );
      aiProgress.reset();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string, label: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copiat`);
    } catch (err) {
      console.error("Clipboard error", err);
      toast.error("Nu am putut copia. Încearcă din nou.");
    }
  };

  const exportText = useMemo(() => {
    if (!questions.length) return "";
    return questions
      .map(
        (q, idx) =>
          `Q${idx + 1} (${q.type}): ${q.question}\nANSWER: ${
            q.sampleAnswer
          }\nKEY POINTS: ${q.keyPoints.join(
            ", "
          )}\nFOLLOW-UPS: ${q.followUps.join(" | ")}\n`
      )
      .join("\n");
  }, [questions]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <ListChecks className="w-4 h-4" />
            Interview Prep
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Interview Prep Generator
          </DialogTitle>
          <DialogDescription>
            Generează 8-10 întrebări (behavioral/technical/situational) cu
            răspunsuri bazate pe CV.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Job Description</label>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste JD (minim 50 caractere)…"
              className="min-h-[160px] font-mono text-sm"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{jobDescription.trim().length} caractere</span>
              <span>Include cerințe, responsabilități, tech stack</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isLoading || jobDescription.trim().length < 50}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Interview Prep
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
            {!isLoading && questions.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAnswers((v) => !v)}
                  className="gap-2"
                >
                  {showAnswers ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Ascunde răspunsurile
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Arată răspunsurile
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(exportText, "Set pregătire")}
                  className="gap-2"
                >
                  <Clipboard className="w-4 h-4" />
                  Copiază setul
                </Button>
              </>
            )}
          </div>

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

          {questions.length > 0 && (
            <div className="space-y-4">
              <Separator />
              <div className="grid gap-3">
                {questions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-4 border rounded-lg bg-muted/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {q.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Q{idx + 1}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(q.question, "Întrebare")}
                          className="h-8 text-xs"
                        >
                          <Clipboard className="w-3 h-3 mr-1" />
                          Copiază Q
                        </Button>
                        {q.sampleAnswer && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleCopy(q.sampleAnswer, "Răspuns")
                            }
                            className="h-8 text-xs"
                          >
                            <Clipboard className="w-3 h-3 mr-1" />
                            Copiază A
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="font-medium text-sm">{q.question}</p>
                    {showAnswers && q.sampleAnswer && (
                      <p className="text-sm text-muted-foreground leading-6">
                        {q.sampleAnswer}
                      </p>
                    )}
                    {q.keyPoints?.length > 0 && (
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {q.keyPoints.map((kp, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-[10px]"
                          >
                            {kp}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {q.followUps?.length > 0 && (
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          Follow-ups
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {q.followUps.map((f, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-[11px]"
                            >
                              {f}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Target className="w-3.5 h-3.5" />
            Practice mode: ascunde răspunsurile și parcurge întrebările cu voce
            tare.
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
