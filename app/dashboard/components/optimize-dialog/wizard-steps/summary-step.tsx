"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  AlignLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Edit3,
  Loader2,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { ImprovementWizardReturn } from "@/app/dashboard/hooks/use-improvement-wizard";
import { authPost } from "@/lib/api/auth-fetch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SummaryStepProps {
  wizard: ImprovementWizardReturn;
  onSkip: () => void;
}

export function SummaryStep({ wizard, onSkip }: SummaryStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);
  const [editedSummary, setEditedSummary] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  const currentSummary = wizard.workingResume.personalInfo?.summary || "";

  // Generate summary on mount if not already done
  useEffect(() => {
    if (!wizard.summaryApplied && !generatedSummary && !isLoading) {
      generateSummary();
    }
  }, []);

  const generateSummary = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await authPost("/api/ai/generate-improvement", {
        action: "generate_summary",
        resumeData: wizard.workingResume,
        jobDescription: wizard.jobDescription,
        jobTitle: wizard.jobTitle,
        companyName: wizard.companyName,
      });

      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }

      const data = await response.json();
      setGeneratedSummary(data.result as string);
      setEditedSummary(data.result as string);
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Failed to generate summary");
    } finally {
      setIsLoading(false);
    }
  }, [wizard.workingResume, wizard.jobDescription, wizard.jobTitle, wizard.companyName]);

  const handleApply = useCallback(() => {
    const summaryToApply = isEditing ? editedSummary : generatedSummary;
    if (summaryToApply) {
      wizard.applySummary(summaryToApply);
      toast.success("Summary updated!");
    }
  }, [wizard, generatedSummary, editedSummary, isEditing]);

  const handleEdit = useCallback(() => {
    setEditedSummary(generatedSummary || currentSummary);
    setIsEditing(true);
  }, [generatedSummary, currentSummary]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditedSummary(generatedSummary || "");
  }, [generatedSummary]);

  // Already applied
  if (wizard.summaryApplied) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Summary Updated!</h3>
        <p className="text-muted-foreground mb-4">
          Your professional summary has been optimized for this role.
        </p>
        <div className="max-w-lg bg-muted/50 rounded-lg p-4 mb-6">
          <p className="text-sm">{wizard.optimizedSummary}</p>
        </div>
        <Button onClick={() => wizard.goToStep("review")}>
          Continue to Review
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
          <AlignLeft className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Optimize Professional Summary</h3>
        <p className="text-sm text-muted-foreground">
          Tailor your summary to highlight relevant experience for this role.
        </p>
      </div>

      {/* Current summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Badge variant="outline">Current</Badge>
            Your existing summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentSummary ? (
            <p className="text-sm text-muted-foreground">{currentSummary}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No summary provided. We'll create one for you.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Loading state */}
      {isLoading && (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-3" />
              <p className="text-sm text-muted-foreground">
                Generating optimized summary...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated/edited summary */}
      {!isLoading && generatedSummary && (
        <Card className="border-2 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2 bg-green-50 dark:bg-green-950/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Badge className="bg-green-600">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Optimized
                </Badge>
                Tailored for {wizard.jobTitle || "this role"}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateSummary}
                  className="gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Regenerate
                </Button>
                {!isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEdit}
                    className="gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {isEditing ? (
              <div className="space-y-3">
                <Textarea
                  value={editedSummary}
                  onChange={(e) => setEditedSummary(e.target.value)}
                  rows={4}
                  className="resize-none"
                  placeholder="Write your professional summary..."
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {editedSummary.split(/\s+/).filter(Boolean).length} words
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="gap-1"
                    >
                      <X className="w-3 h-3" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleApply}
                      className="gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Apply Changes
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm mb-4">{generatedSummary}</p>
                <p className="text-xs text-muted-foreground mb-4">
                  {generatedSummary.split(/\s+/).filter(Boolean).length} words
                </p>
                <Button onClick={handleApply} className="w-full gap-2">
                  <Check className="w-4 h-4" />
                  Apply This Summary
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No summary generated yet */}
      {!isLoading && !generatedSummary && (
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center">
              <Button onClick={generateSummary} className="gap-2">
                <Sparkles className="w-4 h-4" />
                Generate Optimized Summary
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="ghost" onClick={() => wizard.goToStep("keywords")}>
          Back to Keywords
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onSkip}>
            Keep Current Summary
          </Button>
          <Button
            onClick={() => wizard.goToStep("review")}
            className="gap-1"
          >
            Continue to Review
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
