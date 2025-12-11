"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Loader2,
  RefreshCw,
  SkipForward,
  Sparkles,
  Zap,
} from "lucide-react";
import { ImprovementWizardReturn } from "@/app/dashboard/hooks/use-improvement-wizard";
import { ImprovementOption, GenerateImprovementResult } from "@/lib/ai/content-types";
import { authPost } from "@/lib/api/auth-fetch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SuggestionStepProps {
  wizard: ImprovementWizardReturn;
  onSkipAll: () => void;
}

const severityConfig = {
  critical: {
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    icon: AlertTriangle,
    label: "Critical",
  },
  high: {
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200 dark:border-orange-800",
    icon: Zap,
    label: "High",
  },
  medium: {
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    border: "border-yellow-200 dark:border-yellow-800",
    icon: Sparkles,
    label: "Medium",
  },
  low: {
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    icon: CheckCircle2,
    label: "Low",
  },
};

export function SuggestionStep({ wizard, onSkipAll }: SuggestionStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<ImprovementOption[]>([]);
  const [explanation, setExplanation] = useState<string>("");
  const [hasGenerated, setHasGenerated] = useState(false);

  const { currentSuggestion, remainingSuggestions, analysis } = wizard;

  // Generate improvement options for current suggestion
  const generateOptions = useCallback(async () => {
    if (!currentSuggestion) return;

    setIsLoading(true);
    setOptions([]);
    setExplanation("");

    try {
      const response = await authPost("/api/ai/generate-improvement", {
        action: "generate_improvement",
        suggestion: currentSuggestion,
        resumeData: wizard.workingResume,
        jobDescription: wizard.jobDescription,
      });

      if (!response.ok) {
        throw new Error("Failed to generate options");
      }

      const data = await response.json();
      const result = data.result as GenerateImprovementResult;

      setOptions(result.options);
      setExplanation(result.explanation);
      setHasGenerated(true);
    } catch (error) {
      console.error("Error generating options:", error);
      toast.error("Failed to generate improvement options");
    } finally {
      setIsLoading(false);
    }
  }, [currentSuggestion, wizard.workingResume, wizard.jobDescription]);

  // Apply an option
  const handleApply = useCallback(
    (option: ImprovementOption) => {
      if (!currentSuggestion) return;

      wizard.applyImprovement(option, currentSuggestion.id);
      toast.success("Improvement applied!");

      // Move to next suggestion
      setOptions([]);
      setHasGenerated(false);
      wizard.nextSuggestion();
    },
    [currentSuggestion, wizard]
  );

  // Skip current suggestion
  const handleSkip = useCallback(() => {
    if (!currentSuggestion) return;

    wizard.skipSuggestion(currentSuggestion.id);
    setOptions([]);
    setHasGenerated(false);

    // Check if this was the last suggestion
    if (remainingSuggestions <= 1) {
      wizard.goToStep("keywords");
    }
  }, [currentSuggestion, wizard, remainingSuggestions]);

  // No suggestions
  if (analysis.suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Suggestions Needed!</h3>
        <p className="text-muted-foreground mb-6">
          Your resume already matches the job requirements well.
        </p>
        <Button onClick={() => wizard.goToStep("keywords")}>
          Continue to Keywords
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    );
  }

  // All suggestions processed
  if (!currentSuggestion) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Suggestions Complete!</h3>
        <p className="text-muted-foreground mb-2">
          Applied {wizard.appliedSuggestions.length} of {analysis.suggestions.length} suggestions
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          {wizard.skippedSuggestions.length > 0 &&
            `(${wizard.skippedSuggestions.length} skipped)`}
        </p>
        <Button onClick={() => wizard.goToStep("keywords")}>
          Continue to Keywords
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    );
  }

  const severity = severityConfig[currentSuggestion.severity];
  const SeverityIcon = severity.icon;

  return (
    <div className="space-y-6">
      {/* Current suggestion card */}
      <Card className={cn("border-2", severity.border)}>
        <CardHeader className={cn("pb-3", severity.bg)}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  severity.bg
                )}
              >
                <SeverityIcon className={cn("w-5 h-5", severity.color)} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={cn("text-xs", severity.color)}>
                    {severity.label}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    +{currentSuggestion.estimatedImpact || 5} pts
                  </Badge>
                </div>
                <CardTitle className="text-lg">{currentSuggestion.title}</CardTitle>
              </div>
            </div>
            <Badge variant="outline" className="shrink-0">
              {wizard.currentSuggestionIndex + 1} / {analysis.suggestions.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-muted-foreground mb-4">{currentSuggestion.description}</p>

          <div className="bg-muted/50 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium mb-1">Recommended Action:</p>
            <p className="text-sm text-muted-foreground">{currentSuggestion.action}</p>
          </div>

          {/* Generate or show options */}
          {!hasGenerated ? (
            <Button
              onClick={generateOptions}
              disabled={isLoading}
              className="w-full gap-2"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Options...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Fix Options
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Choose an option to apply:</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateOptions}
                  disabled={isLoading}
                  className="gap-1"
                >
                  <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} />
                  Regenerate
                </Button>
              </div>

              {options.map((option, index) => (
                <div
                  key={option.id}
                  className="border rounded-lg p-4 hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          Option {index + 1}
                        </Badge>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {option.type.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{option.preview}</p>
                      <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded p-2">
                        <p className="text-sm font-mono">{option.content}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleApply(option)}
                      className="shrink-0 gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Apply
                    </Button>
                  </div>
                </div>
              ))}

              {explanation && (
                <p className="text-xs text-muted-foreground italic">{explanation}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="ghost" onClick={handleSkip} className="gap-1">
          <SkipForward className="w-4 h-4" />
          Skip This
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onSkipAll}>
            Skip All Suggestions
          </Button>
          {hasGenerated && options.length > 0 && (
            <Button onClick={() => handleApply(options[0])} className="gap-1">
              Apply First & Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
