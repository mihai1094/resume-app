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
        throw new Error("Failed to generate placements");
      }

      const data = await response.json();
      setPlacements(data.result as KeywordPlacement[]);
      setHasGenerated(true);
    } catch (error) {
      console.error("Error generating placements:", error);
      toast.error("Failed to generate keyword suggestions");
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

  // No keywords to add
  if (analysis.missingKeywords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Missing Keywords!</h3>
        <p className="text-muted-foreground mb-6">
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
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Keywords Added!</h3>
        <p className="text-muted-foreground mb-2">
          Added {addedKeywords.length} keywords to your resume.
        </p>
        <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-md">
          {addedKeywords.map((kw) => (
            <Badge key={kw} variant="secondary" className="gap-1">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-3">
          <Hash className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Add Missing Keywords</h3>
        <p className="text-sm text-muted-foreground">
          These keywords appear in the job description but are missing from your resume.
        </p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <span className="ml-3 text-muted-foreground">Generating suggestions...</span>
        </div>
      )}

      {/* Keywords list */}
      {!isLoading && (
        <div className="space-y-3">
          {/* Already added keywords */}
          {addedKeywords.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">Added keywords:</p>
              <div className="flex flex-wrap gap-2">
                {addedKeywords.map((kw) => (
                  <Badge key={kw} variant="default" className="gap-1 bg-green-600">
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
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {placement.keyword}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleQuickAdd(placement.keyword)}
                    className="shrink-0 gap-1"
                  >
                    <Plus className="w-4 h-4" />
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
                          "flex items-start justify-between gap-3 p-3 rounded-lg",
                          "bg-muted/50 hover:bg-muted transition-colors"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs capitalize">
                              {p.type}
                            </Badge>
                          </div>
                          <p className="text-sm">{p.suggestedContent}</p>
                          <p className="text-xs text-muted-foreground mt-1">{p.preview}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddKeyword(placement.keyword, p)}
                          className="shrink-0"
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
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono">
                      {keyword}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => handleQuickAdd(keyword)}
                      className="gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add to Skills
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="ghost" onClick={() => wizard.goToStep("suggestions")}>
          Back to Suggestions
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onSkipAll}>
            Skip Keywords
          </Button>
          <Button onClick={() => wizard.goToStep("summary")} className="gap-1">
            Continue
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
