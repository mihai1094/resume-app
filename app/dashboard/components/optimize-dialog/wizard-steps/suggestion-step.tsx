"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import { ImprovementWizardReturn } from "@/app/dashboard/hooks/use-improvement-wizard";
import { useImprovementOptionsCache } from "@/app/dashboard/hooks/use-improvement-options-cache";
import { ImprovementOption } from "@/lib/ai/content-types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCelebration } from "@/hooks/use-celebration";
import { useConfetti } from "@/hooks/use-confetti";

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

// Skeleton loader for options
function OptionsSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
      </div>
      {[1, 2].map((i) => (
        <div
          key={i}
          className="border rounded-lg p-3 md:p-4 space-y-2"
        >
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ))}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Generating improvement options...</span>
      </div>
    </div>
  );
}

export function SuggestionStep({ wizard, onSkipAll }: SuggestionStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<ImprovementOption[]>([]);
  const [explanation, setExplanation] = useState<string>("");
  const [showWhyThisMatters, setShowWhyThisMatters] = useState(false);

  const optionsCache = useImprovementOptionsCache();
  const { currentSuggestion, remainingSuggestions, analysis } = wizard;

  // Celebrations
  const { celebrateMilestone } = useCelebration();
  const { fire, cannon } = useConfetti();
  const celebratedMilestonesRef = useRef<Set<string>>(new Set());

  // Store stable references to avoid effect re-runs
  const wizardRef = useRef(wizard);
  const optionsCacheRef = useRef(optionsCache);
  wizardRef.current = wizard;
  optionsCacheRef.current = optionsCache;

  // Track which suggestions we've already started loading
  const loadingRef = useRef<string | null>(null);

  // Auto-generate options when suggestion changes
  useEffect(() => {
    if (!currentSuggestion) return;

    // Prevent duplicate loads for same suggestion
    if (loadingRef.current === currentSuggestion.id) return;

    // Check cache first
    const cached = optionsCacheRef.current.get(currentSuggestion.id);
    if (cached) {
      setOptions(cached.options);
      setExplanation(cached.explanation);
      setIsLoading(false);
      return;
    }

    // Mark as loading
    loadingRef.current = currentSuggestion.id;

    // Generate options automatically
    const generateOptions = async () => {
      setIsLoading(true);
      setOptions([]);
      setExplanation("");

      try {
        const result = await optionsCacheRef.current.fetchOptions(
          currentSuggestion,
          wizardRef.current.workingResume,
          wizardRef.current.jobDescription
        );
        setOptions(result.options);
        setExplanation(result.explanation);
      } catch (error) {
        console.error("Error generating options:", error);
        toast.error("Failed to generate options. You can regenerate or keep original.");
      } finally {
        setIsLoading(false);
        loadingRef.current = null;
      }
    };

    generateOptions();
  }, [currentSuggestion?.id]);

  // Prefetch next suggestion's options
  useEffect(() => {
    if (!currentSuggestion) return;

    const nextIndex = wizardRef.current.currentSuggestionIndex + 1;
    if (nextIndex < analysis.suggestions.length) {
      const nextSuggestion = analysis.suggestions[nextIndex];
      optionsCacheRef.current.prefetch(
        nextSuggestion,
        wizardRef.current.workingResume,
        wizardRef.current.jobDescription
      );
    }
  }, [currentSuggestion?.id, analysis.suggestions.length]);

  // Regenerate options
  const handleRegenerate = useCallback(async () => {
    if (!currentSuggestion) return;

    setIsLoading(true);
    setOptions([]);
    setExplanation("");

    try {
      const result = await optionsCache.fetchOptions(
        currentSuggestion,
        wizard.workingResume,
        wizard.jobDescription
      );
      setOptions(result.options);
      setExplanation(result.explanation);
    } catch (error) {
      console.error("Error regenerating options:", error);
      toast.error("Failed to regenerate options");
    } finally {
      setIsLoading(false);
    }
  }, [currentSuggestion, wizard.workingResume, wizard.jobDescription, optionsCache]);

  // Apply an option
  const handleApply = useCallback(
    (option: ImprovementOption) => {
      if (!currentSuggestion) return;

      wizard.applyImprovement(option, currentSuggestion.id);

      // First improvement celebration
      const appliedCount = wizard.appliedSuggestions.length + 1;
      const totalSuggestions = analysis.suggestions.length;

      if (appliedCount === 1 && !celebratedMilestonesRef.current.has("first")) {
        celebratedMilestonesRef.current.add("first");
        fire({ intensity: "medium", particleCount: 40 });
        toast.success("First improvement applied!", {
          description: `+${currentSuggestion.estimatedImpact || 5} points`,
        });
      } else if (
        appliedCount === Math.ceil(totalSuggestions / 2) &&
        totalSuggestions > 2 &&
        !celebratedMilestonesRef.current.has("halfway")
      ) {
        celebratedMilestonesRef.current.add("halfway");
        celebrateMilestone("Halfway there! Keep going!");
      } else {
        toast.success(`+${currentSuggestion.estimatedImpact || 5} points!`, {
          description: "Improvement applied",
        });
      }

      // Reset state and move to next
      setOptions([]);
      setExplanation("");
      setShowWhyThisMatters(false);
      wizard.nextSuggestion();

      // All suggestions complete celebration
      if (appliedCount === totalSuggestions && !celebratedMilestonesRef.current.has("complete")) {
        celebratedMilestonesRef.current.add("complete");
        setTimeout(() => {
          cannon("both", { particleCount: 50 });
        }, 300);
      }
    },
    [currentSuggestion, wizard, analysis.suggestions.length, fire, cannon, celebrateMilestone]
  );

  // Keep original (skip)
  const handleKeepOriginal = useCallback(() => {
    if (!currentSuggestion) return;

    wizard.skipSuggestion(currentSuggestion.id);
    setOptions([]);
    setExplanation("");
    setShowWhyThisMatters(false);

    // Check if this was the last suggestion
    if (remainingSuggestions <= 1) {
      wizard.goToStep("keywords");
    }
  }, [currentSuggestion, wizard, remainingSuggestions]);

  // No suggestions needed
  if (analysis.suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center px-2">
        <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 text-green-500 mb-3 md:mb-4" />
        <h3 className="text-lg md:text-xl font-semibold mb-2">No Suggestions Needed!</h3>
        <p className="text-sm text-muted-foreground mb-4 md:mb-6">
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
      <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center px-2">
        <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16 text-green-500 mb-3 md:mb-4" />
        <h3 className="text-lg md:text-xl font-semibold mb-2">Suggestions Complete!</h3>
        <p className="text-sm text-muted-foreground mb-2">
          Applied {wizard.appliedSuggestions.length} of {analysis.suggestions.length} suggestions
        </p>
        {wizard.skippedSuggestions.length > 0 && (
          <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6">
            ({wizard.skippedSuggestions.length} kept original)
          </p>
        )}
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
    <div className="space-y-4 md:space-y-6">
      {/* Current suggestion card */}
      <Card className={cn("border-2", severity.border)}>
        <CardHeader className={cn("pb-2 md:pb-3 px-3 md:px-6 pt-3 md:pt-6", severity.bg)}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
            <div className="flex items-start gap-2 md:gap-3">
              <div
                className={cn(
                  "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0",
                  severity.bg
                )}
              >
                <SeverityIcon className={cn("w-4 h-4 md:w-5 md:h-5", severity.color)} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 md:gap-2 mb-1 flex-wrap">
                  <Badge variant="outline" className={cn("text-[10px] md:text-xs", severity.color)}>
                    {severity.label}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] md:text-xs">
                    +{currentSuggestion.estimatedImpact || 5} pts
                  </Badge>
                </div>
                <CardTitle className="text-sm md:text-lg">{currentSuggestion.title}</CardTitle>
              </div>
            </div>
            <Badge variant="outline" className="shrink-0 text-xs w-fit">
              {wizard.currentSuggestionIndex + 1} / {analysis.suggestions.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-3 md:pt-4 px-3 md:px-6 pb-3 md:pb-6">
          <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
            {currentSuggestion.description}
          </p>

          {/* Why This Matters - Collapsible */}
          <Collapsible
            open={showWhyThisMatters}
            onOpenChange={setShowWhyThisMatters}
            className="mb-3 md:mb-4"
          >
            <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Why this matters for {wizard.jobTitle || "this role"}</span>
              <ChevronRight
                className={cn(
                  "w-3 h-3 transition-transform",
                  showWhyThisMatters && "rotate-90"
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-900 dark:text-blue-100">
                  <span className="font-medium">Recommended action: </span>
                  {currentSuggestion.action}
                </p>
                {currentSuggestion.current && (
                  <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      <span className="font-medium">Currently in your resume: </span>
                      "{currentSuggestion.current}"
                    </p>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Options - Auto-loaded */}
          {isLoading ? (
            <OptionsSkeleton />
          ) : options.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs md:text-sm font-medium">Choose an improvement:</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={isLoading}
                  className="gap-1 h-7 text-xs"
                >
                  <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} />
                  <span className="hidden sm:inline">Regenerate</span>
                </Button>
              </div>

              {options.map((option, index) => (
                <div
                  key={option.id}
                  className="border rounded-lg p-2 md:p-4 hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 md:gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className="text-[10px] md:text-xs">
                          Option {index + 1}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] md:text-xs capitalize">
                          {option.type.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground mb-2">
                        {option.preview}
                      </p>
                      <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded p-2">
                        <p className="text-xs md:text-sm font-mono break-words">{option.content}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleApply(option)}
                      className="shrink-0 gap-1 h-8 text-xs w-full sm:w-auto"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Apply
                    </Button>
                  </div>
                </div>
              ))}

              {explanation && (
                <p className="text-[10px] md:text-xs text-muted-foreground italic">
                  {explanation}
                </p>
              )}
            </div>
          ) : (
            // Error state - allow regenerate
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">
                Couldn't generate options. Try again or keep your original text.
              </p>
              <Button variant="outline" size="sm" onClick={handleRegenerate}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleKeepOriginal}
          className="gap-1.5 w-full sm:w-auto"
        >
          <Check className="w-4 h-4" />
          Keep Original
        </Button>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkipAll}
            className="w-full sm:w-auto text-muted-foreground"
          >
            Continue Without Applying
          </Button>
          {!isLoading && options.length > 0 && (
            <Button
              size="sm"
              onClick={() => handleApply(options[0])}
              className="gap-1 w-full sm:w-auto"
            >
              Apply & Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
