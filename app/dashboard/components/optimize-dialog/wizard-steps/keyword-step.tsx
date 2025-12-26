"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Hash,
  Loader2,
  Plus,
  Sparkles,
  Zap,
} from "lucide-react";
import { ImprovementWizardReturn } from "@/app/dashboard/hooks/use-improvement-wizard";
import { ImprovementOption, KeywordPlacement } from "@/lib/ai/content-types";
import { authPost } from "@/lib/api/auth-fetch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { generateId } from "@/lib/utils";

interface KeywordStepProps {
  wizard: ImprovementWizardReturn;
  onSkipAll: () => void;
}

export function KeywordStep({ wizard, onSkipAll }: KeywordStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isApplyingBatch, setIsApplyingBatch] = useState(false);
  const [placements, setPlacements] = useState<KeywordPlacement[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const { remainingKeywords, addedKeywords, analysis } = wizard;

  // Generate keyword placements on mount
  useEffect(() => {
    if (remainingKeywords.length > 0 && !hasGenerated && !isLoading) {
      generatePlacements();
    }
  }, [remainingKeywords.length]);

  const generatePlacements = useCallback(async () => {
    if (remainingKeywords.length === 0) return;

    setIsLoading(true);

    try {
      const response = await authPost("/api/ai/generate-improvement", {
        action: "generate_keyword_placements",
        keywords: remainingKeywords.slice(0, 10), // Limit to 10 at a time
        resumeData: wizard.workingResume,
        jobDescription: wizard.jobDescription,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate placements");
      }

      const data = await response.json();
      if (data.result && Array.isArray(data.result)) {
        setPlacements(data.result as KeywordPlacement[]);
      }
      setHasGenerated(true);
    } catch (error) {
      console.error("Error generating placements:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate keyword suggestions. You can still add keywords manually.");
      setHasGenerated(true); // Allow manual add even if AI fails
    } finally {
      setIsLoading(false);
    }
  }, [remainingKeywords, wizard.workingResume, wizard.jobDescription]);

  // Add keyword with specific placement
  const handleAddKeyword = useCallback(
    (keyword: string, placement: KeywordPlacement["placements"][0]) => {
      const option: ImprovementOption = {
        id: generateId(),
        type: placement.type === "skill" ? "add_keyword_to_skills" : "add_keyword_to_bullet",
        content: placement.suggestedContent,
        preview: placement.preview,
        targetSection: placement.type === "skill" ? "skills" : "experience",
        targetId: placement.targetId,
      };

      wizard.addKeyword(keyword, option);
      toast.success(`Added "${keyword}"`);

      // Remove from placements
      setPlacements((prev) => prev.filter((p) => p.keyword !== keyword));
    },
    [wizard]
  );

  // Quick add to skills
  const handleQuickAdd = useCallback(
    (keyword: string) => {
      const option: ImprovementOption = {
        id: generateId(),
        type: "add_keyword_to_skills",
        content: keyword,
        preview: `Add "${keyword}" to skills`,
        targetSection: "skills",
      };

      wizard.addKeyword(keyword, option);
      toast.success(`Added "${keyword}" to skills`);

      // Remove from placements
      setPlacements((prev) => prev.filter((p) => p.keyword !== keyword));
    },
    [wizard]
  );

  // Batch add all keywords to skills
  const handleAddAllToSkills = useCallback(async () => {
    if (remainingKeywords.length === 0) return;

    setIsApplyingBatch(true);

    // Add all remaining keywords with staggered visual effect
    for (const keyword of remainingKeywords) {
      const option: ImprovementOption = {
        id: generateId(),
        type: "add_keyword_to_skills",
        content: keyword,
        preview: `Add "${keyword}" to skills`,
        targetSection: "skills",
      };

      wizard.addKeyword(keyword, option);
      await new Promise((resolve) => setTimeout(resolve, 100)); // Stagger for visual effect
    }

    setPlacements([]);
    setIsApplyingBatch(false);
    toast.success(`Added ${remainingKeywords.length} keywords to skills!`);
  }, [remainingKeywords, wizard]);

  // Batch apply AI's first suggestion for each keyword
  const handleApplyAISuggestions = useCallback(async () => {
    if (placements.length === 0) return;

    setIsApplyingBatch(true);
    let appliedCount = 0;

    for (const placement of placements) {
      if (placement.placements.length > 0) {
        const firstSuggestion = placement.placements[0];
        const option: ImprovementOption = {
          id: generateId(),
          type: firstSuggestion.type === "skill" ? "add_keyword_to_skills" : "add_keyword_to_bullet",
          content: firstSuggestion.suggestedContent,
          preview: firstSuggestion.preview,
          targetSection: firstSuggestion.type === "skill" ? "skills" : "experience",
          targetId: firstSuggestion.targetId,
        };

        wizard.addKeyword(placement.keyword, option);
        appliedCount++;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    setPlacements([]);
    setIsApplyingBatch(false);

    if (appliedCount > 0) {
      toast.success(`Applied AI suggestions for ${appliedCount} keywords!`);
    }
  }, [placements, wizard]);

  // No keywords to add
  if (analysis.missingKeywords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center px-2">
        <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 text-green-500 mb-3 md:mb-4" />
        <h3 className="text-lg md:text-xl font-semibold mb-2">No Missing Keywords!</h3>
        <p className="text-sm text-muted-foreground mb-4 md:mb-6">
          Your resume already contains the key terms from the job description.
        </p>
        <Button onClick={() => wizard.goToStep("summary")}>
          Continue to Summary
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    );
  }

  // All keywords added
  if (remainingKeywords.length === 0 && addedKeywords.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center px-2">
        <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 text-green-500 mb-3 md:mb-4" />
        <h3 className="text-lg md:text-xl font-semibold mb-2">Keywords Added!</h3>
        <p className="text-sm text-muted-foreground mb-2">
          Added {addedKeywords.length} keywords to your resume.
        </p>
        <div className="flex flex-wrap justify-center gap-2 mb-4 md:mb-6 max-w-md px-2">
          {addedKeywords.map((kw) => (
            <Badge key={kw} variant="secondary" className="gap-1 text-xs">
              <Check className="w-3 h-3" />
              {kw}
            </Badge>
          ))}
        </div>
        <Button onClick={() => wizard.goToStep("summary")}>
          Continue to Summary
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="text-center mb-4 md:mb-6">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-2 md:mb-3">
          <Hash className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="text-base md:text-lg font-semibold mb-1">Add Missing Keywords</h3>
        <p className="text-xs md:text-sm text-muted-foreground px-2">
          These keywords appear in the job description but are missing from your resume.
        </p>
      </div>

      {/* Batch Actions Bar */}
      {!isLoading && remainingKeywords.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-3 bg-muted/50 rounded-lg border">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{remainingKeywords.length}</span> keywords to add
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddAllToSkills}
              disabled={isApplyingBatch}
              className="gap-1.5 text-xs"
            >
              {isApplyingBatch ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Zap className="w-3 h-3" />
              )}
              Add All to Skills
            </Button>
            {placements.length > 0 && placements.some(p => p.placements.length > 0) && (
              <Button
                size="sm"
                onClick={handleApplyAISuggestions}
                disabled={isApplyingBatch}
                className="gap-1.5 text-xs"
              >
                {isApplyingBatch ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                Apply AI Suggestions
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-6 md:py-8">
          <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin text-purple-600" />
          <span className="ml-2 md:ml-3 text-xs md:text-sm text-muted-foreground">Generating suggestions...</span>
        </div>
      )}

      {/* Keywords list */}
      {!isLoading && (
        <div className="space-y-3">
          {/* Already added keywords */}
          {addedKeywords.length > 0 && (
            <div className="mb-3 md:mb-4">
              <p className="text-xs md:text-sm text-muted-foreground mb-2">Added keywords:</p>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {addedKeywords.map((kw) => (
                  <Badge key={kw} variant="default" className="gap-1 bg-green-600 text-xs">
                    <Check className="w-3 h-3" />
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Remaining keywords with placements */}
          {placements.map((placement) => (
            <Card key={placement.keyword} className="overflow-hidden">
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3">
                  <Badge variant="outline" className="font-mono text-xs w-fit">
                    {placement.keyword}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleQuickAdd(placement.keyword)}
                    className="shrink-0 gap-1 h-8 text-xs w-full sm:w-auto"
                  >
                    <Plus className="w-3 h-3" />
                    Quick Add to Skills
                  </Button>
                </div>

                {placement.placements.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">AI suggestions:</p>
                    {placement.placements.map((p, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 p-2 md:p-3 rounded-lg",
                          "bg-muted/50 hover:bg-muted transition-colors"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-[10px] md:text-xs capitalize">
                              {p.type}
                            </Badge>
                          </div>
                          <p className="text-xs md:text-sm">{p.suggestedContent}</p>
                          <p className="text-[10px] md:text-xs text-muted-foreground mt-1">{p.preview}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddKeyword(placement.keyword, p)}
                          className="shrink-0 h-8 text-xs w-full sm:w-auto"
                        >
                          Apply
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Keywords without generated placements */}
          {remainingKeywords
            .filter((kw) => !placements.some((p) => p.keyword === kw))
            .map((keyword) => (
              <Card key={keyword}>
                <CardContent className="p-3 md:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <Badge variant="outline" className="font-mono text-xs w-fit">
                      {keyword}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => handleQuickAdd(keyword)}
                      className="gap-1 h-8 text-xs w-full sm:w-auto"
                    >
                      <Plus className="w-3 h-3" />
                      Add to Skills
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t">
        <Button variant="ghost" size="sm" onClick={() => wizard.goToStep("suggestions")} className="w-full sm:w-auto">
          Back to Suggestions
        </Button>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkipAll}
            className="w-full sm:w-auto text-muted-foreground"
          >
            Continue Without Adding
          </Button>
          <Button size="sm" onClick={() => wizard.goToStep("summary")} className="gap-1 w-full sm:w-auto">
            Continue
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
