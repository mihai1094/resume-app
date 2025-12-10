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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  CheckCircle2,
  Clipboard,
  ListChecks,
  Sparkles,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { useAiProgress } from "@/hooks/use-ai-progress";
import { AI_OPERATION_STAGES } from "@/lib/ai/progress-tracker";
import { ProgressIndicator } from "@/components/ui/progress-indicator";

type TailorResult = {
  summary: string;
  enhancedBullets: Record<string, string[]>;
  addedKeywords: string[];
  changes: string[];
};

interface TailorResumeDialogProps {
  resumeData: ResumeData;
  trigger?: React.ReactNode;
}

export function TailorResumeDialog({
  resumeData,
  trigger,
}: TailorResumeDialogProps) {
  const [open, setOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<TailorResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Progress tracking
  const aiProgress = useAiProgress({
    stages: AI_OPERATION_STAGES.RESUME_TAILOR,
    onCancel: () => {
      setIsLoading(false);
      toast.info("Resume tailoring cancelled");
    },
  });

  const handleTailor = async () => {
    if (!jobDescription.trim()) {
      toast.error("Adaugă job description (minim 50 caractere).");
      return;
    }
    if (jobDescription.trim().length < 50) {
      toast.error("Job description trebuie să aibă cel puțin 50 de caractere.");
      return;
    }

    setIsLoading(true);
    setResult(null);

    // Start progress tracking
    aiProgress.start();

    try {
      // Stage 1: Analyzing job requirements
      const response = await fetch("/api/ai/tailor-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData, jobDescription }),
        signal: aiProgress.getSignal(),
      });

      // Stage 2: Matching skills
      aiProgress.nextStage();

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Tailoring failed");
      }

      const data = await response.json();

      // Stage 3: Optimizing bullets
      aiProgress.nextStage();

      // Check if cancelled
      if (aiProgress.isCancelled()) {
        return;
      }

      setResult(data.result);

      // Stage 4: Finalizing
      aiProgress.nextStage();

      // Complete
      aiProgress.complete();

      if (data.meta?.fromCache) {
        toast.success(
          `Tailor din cache în ${data.meta.responseTime}ms (${data.meta.cacheStats?.hitRate} hit rate)`
        );
      } else {
        toast.success(`Tailor generat în ${data.meta?.responseTime}ms`);
      }
    } catch (error) {
      // Check if error is due to cancellation
      if (error instanceof Error && error.name === "AbortError") {
        aiProgress.reset();
        return;
      }

      console.error("Tailor error:", error);
      toast.error(
        error instanceof Error ? error.message : "Nu s-a putut genera tailor"
      );
      aiProgress.reset();
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copiat`);
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
            <Target className="w-4 h-4" />
            Tailor Resume
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Tailor Resume Assistant
          </DialogTitle>
          <DialogDescription>
            Rulează un tailoring complet pentru un job description și vezi
            rezumatul, bullets optimizate, keywords și change log.
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
              <span>
                Recomandat: includeti cerințe, responsabilități, tech stack
              </span>
            </div>
          </div>

          <Button
            onClick={handleTailor}
            disabled={isLoading || jobDescription.trim().length < 50}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Tailoring…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Tailor Resume
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

          {result && (
            <div className="space-y-6">
              <Separator />

              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Rezumat Tailored</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyText(result.summary, "Rezumat")}
                >
                  <Clipboard className="w-4 h-4 mr-2" />
                  Copiază
                </Button>
              </div>
              <p className="text-sm leading-6 bg-muted/40 p-3 rounded-md border">
                {result.summary || "—"}
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Bullets îmbunătățite</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      copyText(
                        Object.values(result.enhancedBullets || {})
                          .flat()
                          .join("\n"),
                        "Bullets"
                      )
                    }
                  >
                    <Clipboard className="w-4 h-4 mr-2" />
                    Copiază toate
                  </Button>
                </div>
                {Object.keys(result.enhancedBullets || {}).length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nicio schimbare generată.
                  </p>
                )}
                <div className="space-y-4">
                  {Object.entries(result.enhancedBullets || {}).map(
                    ([expId, bullets]) => (
                      <div key={expId} className="space-y-2">
                        <div className="text-xs font-semibold text-muted-foreground">
                          {expId}
                        </div>
                        <ul className="space-y-1 list-disc list-inside text-sm">
                          {bullets.map((b, idx) => (
                            <li key={idx}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Keywords adăugate</h3>
                  <Badge variant="outline">
                    {result.addedKeywords?.length || 0}
                  </Badge>
                </div>
                {result.addedKeywords?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {result.addedKeywords.map((kw, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Niciun keyword nou.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">Change log</h3>
                  <ListChecks className="w-4 h-4 text-primary" />
                </div>
                {result.changes?.length ? (
                  <ul className="space-y-1 list-disc list-inside text-sm">
                    {result.changes.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nicio schimbare raportată.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Tailoring păstrează factualitatea — editează înainte de a
            salva/exporta.
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

