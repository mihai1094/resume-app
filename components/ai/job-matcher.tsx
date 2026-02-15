"use client";

import { useState } from "react";
import { ResumeData } from "@/lib/types/resume";
import { ATSAnalysisResult } from "@/lib/ai/content-generator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { aiLogger } from "@/lib/services/logger";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Lightbulb,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { authPost } from "@/lib/api/auth-fetch";
import { sanitizeResumeForAI } from "@/lib/ai/privacy";

interface JobMatcherProps {
  resumeData: ResumeData;
  onApplySuggestion?: (suggestionId: string) => void;
  buttonClassName?: string;
  variant?: "standard" | "icon";
  showLabelOnMobile?: boolean;
}

export function JobMatcher({
  resumeData,
  onApplySuggestion,
  buttonClassName,
  variant = "standard",
  showLabelOnMobile = false,
}: JobMatcherProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<ATSAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return;

    setIsAnalyzing(true);

    try {
      const sanitizedResumeData = sanitizeResumeForAI(resumeData, {
        profile: "ats",
      });
      const response = await authPost("/api/ai/analyze-ats", {
        resumeData: sanitizedResumeData,
        jobDescription,
        industry: resumeData.personalInfo.industry,
        seniorityLevel: resumeData.personalInfo.seniorityLevel,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to analyze ATS");
      }

      const data = await response.json();
      const { analysis: atsAnalysis, meta } = data;
      setAnalysis(atsAnalysis);

      // Show success toast
      toast.success("Analysis complete!", {
        description: `Your resume scored ${atsAnalysis.score}% match`,
      });

      if (meta?.fromCache) {
        aiLogger.debug('Cache hit', {
          action: 'analyze-ats',
          responseTime: meta.responseTime,
          hitRate: meta.cacheStats?.hitRate,
        });
      }
    } catch (error) {
      aiLogger.error('ATS analysis error', error, { action: 'analyze-ats' });

      // Show error toast with retry option
      toast.error("Analysis failed", {
        description: error instanceof Error
          ? error.message
          : "Could not analyze your resume. Please try again.",
        action: {
          label: "Retry",
          onClick: () => handleAnalyze(),
        },
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplySuggestion = async (
    suggestion: NonNullable<ATSAnalysisResult["suggestions"]>[number]
  ) => {
    if (onApplySuggestion) {
      onApplySuggestion(suggestion.id);
      return;
    }

    const copyText =
      suggestion.suggested ||
      suggestion.current ||
      suggestion.title ||
      suggestion.action ||
      suggestion.description;

    if (!copyText) return;

    try {
      await navigator.clipboard.writeText(copyText);
      toast.success("Suggestion copied — paste it into your resume.");
    } catch (err) {
      aiLogger.error('Failed to copy suggestion', err);
      toast.error("Could not copy. Please try again.");
    }
  };

  const handleCopyKeywords = async () => {
    if (!analysis?.missingKeywords?.length) return;
    try {
      await navigator.clipboard.writeText(analysis.missingKeywords.join(", "));
      toast.success("Missing keywords copied — add them to skills/experience.");
    } catch (err) {
      aiLogger.error('Failed to copy keywords', err);
      toast.error("Could not copy keywords. Please try again.");
    }
  };

  const isIconVariant = variant === "icon";
  const scoreValue = analysis?.score ?? 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size={isIconVariant ? "icon" : "sm"}
          className={cn(
            isIconVariant ? "rounded-full" : "gap-2 shadow-sm",
            buttonClassName
          )}
          variant="outline"
        >
          <Sparkles className="w-4 h-4 text-primary fill-primary/20" />
          {isIconVariant ? (
            showLabelOnMobile ? (
              <span className="ml-2 text-xs font-medium sm:hidden">
                AI Optimize
              </span>
            ) : (
              <span className="sr-only">AI Optimize</span>
            )
          ) : (
            <span>AI Optimize</span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-primary" />
            AI Resume Optimizer
          </DialogTitle>
          <DialogDescription>
            Paste a job description and get AI-powered suggestions to improve
            your resume match
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* ATS Score Card */}
          <Card className="p-6 border-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">Current ATS Score</h3>
                <p className="text-sm text-muted-foreground">
                  How well your resume passes applicant tracking systems
                </p>
              </div>
              <div className="text-right">
                <div
                  className={cn(
                    "text-4xl font-bold",
                    scoreValue >= 80
                      ? "text-green-600"
                      : scoreValue >= 60
                        ? "text-yellow-600"
                        : "text-red-600"
                  )}
                >
                  {scoreValue}
                </div>
                <div className="text-xs text-muted-foreground">out of 100</div>
              </div>
            </div>
            <Progress value={scoreValue} className="h-2" />
            {!analysis && (
              <div className="mt-3 text-sm text-muted-foreground">
                Paste a job description and run “Analyze Match” to get a live
                ATS score.
              </div>
            )}
          </Card>

          {/* Job Description Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Paste Job Description
              </label>
              <Badge variant="outline" className="text-xs">
                <Target className="w-3 h-3 mr-1" />
                Better matching = Higher callbacks
              </Badge>
            </div>
            <Textarea
              placeholder="Paste the full job description here...

Example:
We are seeking a Senior Full Stack Developer with 5+ years of experience in React, Node.js, and TypeScript. Must have experience with AWS, Docker, and CI/CD pipelines. Strong communication skills required..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
            <Button
              onClick={handleAnalyze}
              disabled={!jobDescription.trim() || isAnalyzing}
              className="w-full"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze Match
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* Match Score */}
              <Card
                className={cn(
                  "p-6 border-2",
                  analysis.score >= 80
                    ? "border-green-600/50 bg-green-50/50 dark:bg-green-950/20"
                    : analysis.score >= 60
                      ? "border-yellow-600/50 bg-yellow-50/50 dark:bg-yellow-950/20"
                      : "border-red-600/50 bg-red-50/50 dark:bg-red-950/20"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Job Match Score
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {analysis.score >= 80
                        ? "Excellent match! Your resume aligns well with this job."
                        : analysis.score >= 60
                          ? "Good match with room for improvement"
                          : "Consider optimizing your resume for better results"}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={cn(
                        "text-5xl font-bold",
                        analysis.score >= 80
                          ? "text-green-600"
                          : analysis.score >= 60
                            ? "text-yellow-600"
                            : "text-red-600"
                      )}
                    >
                      {analysis.score}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      match rate
                    </div>
                  </div>
                </div>
                <Progress value={analysis.score} className="mt-4 h-3" />
              </Card>

              {/* Strengths */}
              {analysis.strengths.length > 0 && (
                <Card className="p-6">
                  <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Your Strengths
                  </h3>
                  <div className="space-y-2">
                    {analysis.strengths.map((strength, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Missing Keywords */}
              {analysis.missingKeywords.length > 0 && (
                <Card className="p-6">
                  <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    Missing Keywords
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    These important keywords from the job description are
                    missing from your resume:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingKeywords.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="gap-1">
                        {keyword}
                        <button
                          className="ml-1 hover:text-primary"
                          onClick={async () => {
                            await navigator.clipboard.writeText(keyword);
                            toast.success(`Copied "${keyword}"`);
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyKeywords}
                    >
                      Copy all missing keywords
                    </Button>
                  </div>
                </Card>
              )}

              {/* AI Suggestions */}
              <Card className="p-6">
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  AI Suggestions ({analysis.suggestions.length})
                </h3>
                <div className="space-y-4">
                  {analysis.suggestions.map((suggestion, index) => {
                    const severity = (suggestion.severity || "medium") as
                      | "critical"
                      | "high"
                      | "medium"
                      | "low";
                    const severityTone =
                      severity === "critical"
                        ? "destructive"
                        : severity === "high"
                          ? "destructive"
                          : severity === "medium"
                            ? "secondary"
                            : "outline";
                    const borderTone =
                      severity === "critical"
                        ? "border-red-300 bg-red-50/60 dark:bg-red-950/30"
                        : severity === "high"
                          ? "border-red-200 bg-red-50/50 dark:bg-red-950/20"
                          : severity === "medium"
                            ? "border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20"
                            : "border-blue-200 bg-blue-50/50 dark:bg-blue-950/20";
                    return (
                      <div
                        key={suggestion.id}
                        className={cn(
                          "p-4 rounded-lg border-2 transition-colors",
                          borderTone
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={severityTone} className="text-xs">
                                {severity} priority
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {suggestion.type}
                              </Badge>
                            </div>
                            <div>
                              <h4 className="font-semibold">
                                {suggestion.title}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {suggestion.description}
                              </p>
                            </div>

                            {/* Before/After comparison */}
                            {(suggestion.current || suggestion.suggested) && (
                              <div className="mt-3 space-y-2">
                                {suggestion.current && (
                                  <div className="text-sm">
                                    <span className="font-medium text-muted-foreground">
                                      Current:
                                    </span>
                                    <p className="mt-1 p-2 bg-background rounded border italic">
                                      {suggestion.current}
                                    </p>
                                  </div>
                                )}
                                {suggestion.suggested && (
                                  <div className="text-sm">
                                    <span className="font-medium text-primary">
                                      Suggested:
                                    </span>
                                    <p className="mt-1 p-2 bg-primary/5 rounded border border-primary/20 font-medium">
                                      {suggestion.suggested}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex items-center gap-2 mt-3">
                              <ArrowRight className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {suggestion.action}
                              </span>
                            </div>
                          </div>

                          {onApplySuggestion && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApplySuggestion(suggestion)}
                            >
                              Apply
                            </Button>
                          )}
                          {!onApplySuggestion && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApplySuggestion(suggestion)}
                            >
                              Copy suggestion
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  onClick={() => {
                    setIsOpen(false);
                    // User can manually apply suggestions
                  }}
                >
                  Review My Resume
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setJobDescription("");
                    setAnalysis(null);
                  }}
                >
                  Analyze Another Job
                </Button>
              </div>
            </div>
          )}

          {/* Info Footer */}
          <div className="text-center text-xs text-muted-foreground pt-4 border-t">
            <Badge variant="outline" className="mb-2">
              <Sparkles className="w-3 h-3 mr-1" />
              Powered by AI (ATS)
            </Badge>
            <p>
              Paste a job description to get a live ATS score, missing keywords,
              and actionable fixes. Cache accelerates common roles.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
