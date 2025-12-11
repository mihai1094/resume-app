"use client";

import { useState, useEffect, useCallback } from "react";
import { ResumeData } from "@/lib/types/resume";
import { BatchUpdatePayload } from "@/hooks/use-resume";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Sparkles,
  Wand2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { authFetch } from "@/lib/api/auth-fetch";
import { cn } from "@/lib/utils";

interface BulletEnhancement {
  index: number;
  original: string;
  enhanced: string;
}

interface ExperienceEnhancement {
  experienceId: string;
  experienceTitle: string;
  bullets: BulletEnhancement[];
}

interface BatchEnhanceResult {
  summary?: {
    original: string;
    enhanced: string;
  };
  experiences: ExperienceEnhancement[];
  meta: {
    totalChanges: number;
    processingTimeMs: number;
  };
}

interface BatchEnhanceDialogProps {
  resumeData: ResumeData;
  jobDescription?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (payload: BatchUpdatePayload) => void;
}

export function BatchEnhanceDialog({
  resumeData,
  jobDescription,
  open,
  onOpenChange,
  onApply,
}: BatchEnhanceDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BatchEnhanceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Selection state
  const [selectedSummary, setSelectedSummary] = useState(true);
  const [selectedBullets, setSelectedBullets] = useState<Record<string, Set<number>>>({});
  const [expandedExperiences, setExpandedExperiences] = useState<Set<string>>(new Set());

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setResult(null);
      setError(null);
      setSelectedBullets({});
      setExpandedExperiences(new Set());
    }
  }, [open]);

  // Initialize selections when result arrives
  useEffect(() => {
    if (result) {
      // Select summary by default if available
      setSelectedSummary(!!result.summary);

      // Select all bullets by default
      const bulletSelections: Record<string, Set<number>> = {};
      const expanded = new Set<string>();
      for (const exp of result.experiences) {
        bulletSelections[exp.experienceId] = new Set(exp.bullets.map((b) => b.index));
        expanded.add(exp.experienceId);
      }
      setSelectedBullets(bulletSelections);
      setExpandedExperiences(expanded);
    }
  }, [result]);

  const handleEnhance = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await authFetch("/api/ai/batch-enhance", {
        method: "POST",
        body: JSON.stringify({
          resumeData,
          jobDescription,
          options: {
            enhanceSummary: true,
            enhanceBullets: true,
          },
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Enhancement failed");
      }

      const data: BatchEnhanceResult = await response.json();
      setResult(data);

      if (data.meta.totalChanges === 0) {
        toast.info("No improvements suggested - your content is already strong!");
      } else {
        toast.success(`Found ${data.meta.totalChanges} improvements in ${Math.round(data.meta.processingTimeMs / 1000)}s`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to enhance resume";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBullet = useCallback((experienceId: string, bulletIndex: number) => {
    setSelectedBullets((prev) => {
      const current = prev[experienceId] || new Set<number>();
      const next = new Set(current);
      if (next.has(bulletIndex)) {
        next.delete(bulletIndex);
      } else {
        next.add(bulletIndex);
      }
      return { ...prev, [experienceId]: next };
    });
  }, []);

  const toggleExperience = useCallback((experienceId: string) => {
    setExpandedExperiences((prev) => {
      const next = new Set(prev);
      if (next.has(experienceId)) {
        next.delete(experienceId);
      } else {
        next.add(experienceId);
      }
      return next;
    });
  }, []);

  const selectAllForExperience = useCallback((exp: ExperienceEnhancement, select: boolean) => {
    setSelectedBullets((prev) => {
      if (select) {
        return { ...prev, [exp.experienceId]: new Set(exp.bullets.map((b) => b.index)) };
      } else {
        return { ...prev, [exp.experienceId]: new Set<number>() };
      }
    });
  }, []);

  const countSelectedChanges = () => {
    let count = selectedSummary && result?.summary ? 1 : 0;
    for (const expId of Object.keys(selectedBullets)) {
      count += selectedBullets[expId]?.size || 0;
    }
    return count;
  };

  const handleApply = () => {
    if (!result) return;

    const payload: BatchUpdatePayload = {};

    // Apply summary if selected
    if (selectedSummary && result.summary) {
      payload.summary = result.summary.enhanced;
    }

    // Apply selected bullets
    if (Object.keys(selectedBullets).length > 0) {
      payload.bullets = {};

      for (const exp of result.experiences) {
        const selected = selectedBullets[exp.experienceId];
        if (!selected || selected.size === 0) continue;

        // Get current bullets for this experience
        const currentExp = resumeData.workExperience.find((e) => e.id === exp.experienceId);
        if (!currentExp) continue;

        // Create new bullets array with selected enhancements applied
        const newBullets = [...(currentExp.description || [])];
        for (const bullet of exp.bullets) {
          if (selected.has(bullet.index)) {
            newBullets[bullet.index] = bullet.enhanced;
          }
        }

        payload.bullets[exp.experienceId] = newBullets;
      }
    }

    onApply(payload);
    toast.success(`Applied ${countSelectedChanges()} improvements`);
    onOpenChange(false);
  };

  const selectedCount = countSelectedChanges();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            Enhance All Content
          </DialogTitle>
          <DialogDescription>
            AI will analyze and improve your summary and bullet points.
            {jobDescription && " Tailored to your target job description."}
          </DialogDescription>
        </DialogHeader>

        {!result && !isLoading && (
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-sm">What will be enhanced:</h4>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Professional summary - make it more impactful
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Work experience bullets - add metrics and achievements
                </li>
              </ul>
              {jobDescription && (
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                  Optimizations will be tailored to your saved job description
                </p>
              )}
            </div>

            <Button onClick={handleEnhance} className="w-full" size="lg">
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze & Enhance
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Analyzing your resume...</p>
            <p className="text-xs text-muted-foreground">This may take 10-20 seconds</p>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-sm">
            {error}
          </div>
        )}

        {result && result.meta.totalChanges > 0 && (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Review and select changes to apply
              </span>
              <Badge variant="secondary">
                {result.meta.totalChanges} suggestions
              </Badge>
            </div>

            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-2">
                {/* Summary Enhancement */}
                {result.summary && (
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="summary-check"
                        checked={selectedSummary}
                        onCheckedChange={(checked) => setSelectedSummary(!!checked)}
                      />
                      <Label
                        htmlFor="summary-check"
                        className="font-medium cursor-pointer"
                      >
                        Professional Summary
                      </Label>
                    </div>
                    <div className="grid gap-3 pl-7">
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Before:</span>
                        <p className="text-sm text-muted-foreground line-through">
                          {result.summary.original}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-green-600">After:</span>
                        <p className="text-sm">{result.summary.enhanced}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Experience Enhancements */}
                {result.experiences.map((exp) => {
                  const isExpanded = expandedExperiences.has(exp.experienceId);
                  const selectedCount = selectedBullets[exp.experienceId]?.size || 0;
                  const allSelected = selectedCount === exp.bullets.length;

                  return (
                    <div key={exp.experienceId} className="border rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleExperience(exp.experienceId)}
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          <span className="font-medium text-sm">{exp.experienceTitle}</span>
                          <Badge variant="outline" className="text-xs">
                            {selectedCount}/{exp.bullets.length} selected
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectAllForExperience(exp, !allSelected);
                          }}
                        >
                          {allSelected ? "Deselect all" : "Select all"}
                        </Button>
                      </button>

                      {isExpanded && (
                        <div className="border-t p-4 space-y-4">
                          {exp.bullets.map((bullet) => {
                            const isSelected = selectedBullets[exp.experienceId]?.has(bullet.index);
                            return (
                              <div
                                key={bullet.index}
                                className={cn(
                                  "space-y-2 p-3 rounded-lg transition-colors",
                                  isSelected ? "bg-green-50 dark:bg-green-950/20" : "bg-muted/30"
                                )}
                              >
                                <div className="flex items-start gap-3">
                                  <Checkbox
                                    id={`bullet-${exp.experienceId}-${bullet.index}`}
                                    checked={isSelected}
                                    onCheckedChange={() => toggleBullet(exp.experienceId, bullet.index)}
                                    className="mt-0.5"
                                  />
                                  <div className="flex-1 space-y-2">
                                    <div>
                                      <span className="text-xs font-medium text-muted-foreground">Before:</span>
                                      <p className="text-sm text-muted-foreground">{bullet.original}</p>
                                    </div>
                                    <div>
                                      <span className="text-xs font-medium text-green-600">After:</span>
                                      <p className="text-sm">{bullet.enhanced}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <Separator />

            <DialogFooter className="flex-row items-center justify-between sm:justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedCount} of {result.meta.totalChanges} changes selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleApply} disabled={selectedCount === 0}>
                  Apply {selectedCount} Changes
                </Button>
              </div>
            </DialogFooter>
          </>
        )}

        {result && result.meta.totalChanges === 0 && (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 mx-auto text-green-500" />
            <h3 className="font-medium">Your content looks great!</h3>
            <p className="text-sm text-muted-foreground">
              No significant improvements were found. Your resume content is already well-written.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
