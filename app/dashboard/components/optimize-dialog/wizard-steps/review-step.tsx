"use client";

import { useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Edit3,
  FileText,
  Hash,
  Minus,
  Plus,
  Save,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { ImprovementWizardReturn } from "@/app/dashboard/hooks/use-improvement-wizard";
import { cn } from "@/lib/utils";
import { useConfetti } from "@/hooks/use-confetti";
import { toast } from "sonner";

interface ReviewStepProps {
  wizard: ImprovementWizardReturn;
  onComplete: () => void;
  onBack: () => void;
}

export function ReviewStep({ wizard, onComplete, onBack }: ReviewStepProps) {
  const { changes, appliedSuggestions, addedKeywords, summaryApplied, analysis } = wizard;
  const { celebrate } = useConfetti();

  // Handle complete with celebration
  const handleComplete = useCallback(() => {
    if (changes.length > 0) {
      // Full celebration for completing with changes
      celebrate();
      toast.success("Resume optimized successfully!", {
        description: `Applied ${changes.length} improvements`,
        duration: 4000,
      });
    }
    onComplete();
  }, [changes.length, onComplete, celebrate]);

  // Calculate estimated score improvement
  const estimatedImprovement = useMemo(() => {
    let improvement = 0;

    // From applied suggestions
    appliedSuggestions.forEach((id) => {
      const suggestion = analysis.suggestions.find((s) => s.id === id);
      if (suggestion?.estimatedImpact) {
        improvement += suggestion.estimatedImpact;
      } else {
        improvement += 5; // Default improvement per suggestion
      }
    });

    // From keywords (roughly 2 points per keyword)
    improvement += addedKeywords.length * 2;

    // From summary optimization
    if (summaryApplied) {
      improvement += 5;
    }

    return Math.min(improvement, 50); // Cap at 50 points
  }, [appliedSuggestions, addedKeywords, summaryApplied, analysis.suggestions]);

  const estimatedNewScore = Math.min(100, analysis.score + estimatedImprovement);

  // Group changes by type
  const groupedChanges = useMemo(() => {
    const groups: Record<string, typeof changes> = {
      skills: [],
      experience: [],
      summary: [],
    };

    changes.forEach((change) => {
      if (change.section in groups) {
        groups[change.section].push(change);
      }
    });

    return groups;
  }, [changes]);

  // No changes made
  if (changes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <X className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Changes Made</h3>
        <p className="text-muted-foreground mb-6">
          You haven't applied any improvements yet. Go back and apply some suggestions.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => wizard.goToStep("suggestions")}>
            Back to Suggestions
          </Button>
          <Button onClick={handleComplete}>
            Save Without Changes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
          <ClipboardCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Review Your Changes</h3>
        <p className="text-sm text-muted-foreground">
          Review all improvements before saving your tailored resume.
        </p>
      </div>

      {/* Score improvement card */}
      <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Estimated Score</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-muted-foreground">
                  {analysis.score}%
                </span>
                <ArrowUpRight className="w-5 h-5 text-green-600" />
                <span className="text-3xl font-bold text-green-600">
                  {estimatedNewScore}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  +{estimatedImprovement}
                </p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4 text-center">
            <FileText className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold">{appliedSuggestions.length}</p>
            <p className="text-xs text-muted-foreground">Suggestions Applied</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Hash className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold">{addedKeywords.length}</p>
            <p className="text-xs text-muted-foreground">Keywords Added</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <Sparkles className="w-6 h-6 mx-auto mb-2 text-amber-600" />
            <p className="text-2xl font-bold">{summaryApplied ? "Yes" : "No"}</p>
            <p className="text-xs text-muted-foreground">Summary Updated</p>
          </CardContent>
        </Card>
      </div>

      {/* Changes diff */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            Changes Made ({changes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {/* Skills changes */}
              {groupedChanges.skills.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Badge variant="secondary">Skills</Badge>
                  </h4>
                  <div className="space-y-2">
                    {groupedChanges.skills.map((change) => (
                      <div
                        key={change.id}
                        className="flex items-start gap-2 text-sm"
                      >
                        <Plus className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-green-700 dark:text-green-400">
                          {change.after}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience changes */}
              {groupedChanges.experience.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Badge variant="secondary">Experience</Badge>
                  </h4>
                  <div className="space-y-3">
                    {groupedChanges.experience.map((change) => (
                      <div key={change.id} className="space-y-1">
                        {change.before && (
                          <div className="flex items-start gap-2 text-sm">
                            <Minus className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <span className="text-red-600 dark:text-red-400 line-through">
                              {change.before}
                            </span>
                          </div>
                        )}
                        <div className="flex items-start gap-2 text-sm">
                          <Plus className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                          <span className="text-green-700 dark:text-green-400">
                            {change.after}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary changes */}
              {groupedChanges.summary.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Badge variant="secondary">Summary</Badge>
                  </h4>
                  {groupedChanges.summary.map((change) => (
                    <div key={change.id} className="space-y-2">
                      {change.before && (
                        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Minus className="w-3 h-3 text-red-500" />
                            <span className="text-xs text-red-600 font-medium">
                              Before
                            </span>
                          </div>
                          <p className="text-sm text-red-700 dark:text-red-400">
                            {change.before}
                          </p>
                        </div>
                      )}
                      <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Plus className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-600 font-medium">
                            After
                          </span>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-400">
                          {change.after}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="ghost" onClick={onBack}>
          Back to Summary
        </Button>

        <Button
          onClick={handleComplete}
          size="lg"
          className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Save className="w-5 h-5" />
          Save Tailored Resume
          <CheckCircle2 className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
