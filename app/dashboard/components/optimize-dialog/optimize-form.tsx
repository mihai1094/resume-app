"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Target,
  Sparkles,
  ArrowRight,
  FileText,
  Briefcase,
  CheckCircle2,
  Calendar,
  AlertCircle,
  RotateCw,
  Info,
  ClipboardCheck,
  Building2,
} from "lucide-react";
import { calculateATSScore } from "@/lib/ai/mock-analyzer";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { format } from "date-fns";

import type { SavedResume } from "@/hooks/use-saved-resumes";
import type { AnalysisError } from "@/app/dashboard/hooks/use-optimize-flow";

interface OptimizeFormProps {
  resumes: SavedResume[];
  selectedResumeId: string;
  setSelectedResumeId: (id: string) => void;
  jobDescription: string;
  setJobDescription: (desc: string) => void;
  jobTitle: string;
  setJobTitle: (title: string) => void;
  companyName: string;
  setCompanyName: (name: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  analysisError?: AnalysisError | null;
  onRetry?: () => void;
}

export function OptimizeForm({
  resumes,
  selectedResumeId,
  setSelectedResumeId,
  jobDescription,
  setJobDescription,
  jobTitle,
  setJobTitle,
  companyName,
  setCompanyName,
  onAnalyze,
  isAnalyzing,
  analysisError,
  onRetry,
}: OptimizeFormProps) {
  const selectedResume = resumes.find((r) => r.id === selectedResumeId);
  const atsScore = selectedResume
    ? calculateATSScore(selectedResume.data)
    : null;

  const [charCount, setCharCount] = useState(0);
  const minChars = 100;
  const recommendedChars = 500;

  useEffect(() => {
    setCharCount(jobDescription.length);
  }, [jobDescription]);

  const getCharCountColor = () => {
    if (charCount < minChars) return "text-red-600";
    if (charCount < recommendedChars) return "text-yellow-600";
    return "text-green-600";
  };

  const canAnalyze =
    jobDescription.trim().length >= minChars && selectedResumeId;

  const step1Complete = !!selectedResumeId;
  const step2Complete = jobDescription.length >= minChars;

  return (
    <div className="space-y-4 md:space-y-6 mt-4 md:mt-6">
      {/* Step Indicator - Compact on mobile */}
      <div className="flex items-center justify-between gap-2 px-2 md:px-0">
        <div className="flex items-center gap-1.5 md:gap-2">
          <div
            className={cn(
              "w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs md:text-sm transition-colors",
              step1Complete
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {step1Complete ? <CheckCircle2 className="w-4 h-4" /> : "1"}
          </div>
          <span className="font-medium text-sm md:text-base hidden sm:inline">
            Resume
          </span>
        </div>
        <div className="flex-1 h-px bg-border max-w-8 md:max-w-none" />
        <div className="flex items-center gap-1.5 md:gap-2">
          <div
            className={cn(
              "w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs md:text-sm transition-colors",
              step2Complete
                ? "bg-primary text-primary-foreground"
                : step1Complete
                ? "bg-muted/80 text-foreground border-2 border-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {step2Complete ? <CheckCircle2 className="w-4 h-4" /> : "2"}
          </div>
          <span
            className={cn(
              "font-medium text-sm md:text-base hidden sm:inline",
              step2Complete || step1Complete
                ? "text-foreground"
                : "text-muted-foreground"
            )}
          >
            Job
          </span>
        </div>
        <div className="flex-1 h-px bg-border max-w-8 md:max-w-none" />
        <div className="flex items-center gap-1.5 md:gap-2">
          <div
            className={cn(
              "w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs md:text-sm transition-colors",
              canAnalyze
                ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <span
            className={cn(
              "font-medium text-sm md:text-base hidden sm:inline",
              canAnalyze ? "text-foreground" : "text-muted-foreground"
            )}
          >
            Analyze
          </span>
        </div>
      </div>

      {/* Resume Selection */}
      <Card className="p-4 md:p-6 border-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm md:text-base">Select Resume</h3>
            <p className="text-xs md:text-sm text-muted-foreground truncate">
              Choose which resume to analyze
            </p>
          </div>
        </div>

        <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
          <SelectTrigger className="h-11 md:h-12">
            <SelectValue placeholder="Choose a resume..." />
          </SelectTrigger>
          <SelectContent>
            {resumes.map((resume, index) => {
              const jobCount = resume.data.workExperience.length;
              const updatedAtFormatted = format(
                new Date(resume.updatedAt),
                "MMM d"
              );
              const isLatest = index === 0;

              return (
                <SelectItem key={resume.id} value={resume.id}>
                  <div className="flex flex-col gap-1 py-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{resume.name}</span>
                      {isLatest && (
                        <Badge variant="secondary" className="text-[10px]">
                          Latest
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="capitalize">{resume.templateId}</span>
                      <span>•</span>
                      <span>{updatedAtFormatted}</span>
                      <span>•</span>
                      <span>
                        {jobCount} job{jobCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Resume Completeness Check - NOT AI */}
        {selectedResume && atsScore && (
          <div className="mt-4 p-3 md:p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <div
                  className={cn(
                    "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0",
                    atsScore.score >= 80
                      ? "bg-green-100 dark:bg-green-950/30"
                      : atsScore.score >= 60
                      ? "bg-yellow-100 dark:bg-yellow-950/30"
                      : "bg-red-100 dark:bg-red-950/30"
                  )}
                >
                  <ClipboardCheck
                    className={cn(
                      "w-5 h-5 md:w-6 md:h-6",
                      atsScore.score >= 80
                        ? "text-green-600"
                        : atsScore.score >= 60
                        ? "text-yellow-600"
                        : "text-red-600"
                    )}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-semibold text-sm">
                      Resume Completeness
                    </h4>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-xs">
                            Basic check for contact info, work experience,
                            education, and skills. The AI analysis below
                            provides deeper job-specific insights.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {atsScore.score >= 80
                      ? "All essential sections filled"
                      : atsScore.score >= 60
                      ? "Some sections need attention"
                      : "Missing important information"}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div
                  className={cn(
                    "text-2xl md:text-3xl font-bold tabular-nums",
                    atsScore.score >= 80
                      ? "text-green-600"
                      : atsScore.score >= 60
                      ? "text-yellow-600"
                      : "text-red-600"
                  )}
                >
                  {atsScore.score}%
                </div>
              </div>
            </div>
            <Progress value={atsScore.score} className="h-1.5 mt-3" />
            {atsScore.issues.length > 0 && (
              <div className="mt-2 text-xs text-muted-foreground">
                {atsScore.issues.slice(0, 2).join(" • ")}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Job Details */}
      <Card className="p-4 md:p-6 border-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm md:text-base">Target Job</h3>
            <p className="text-xs md:text-sm text-muted-foreground truncate">
              Job title and company for your tailored resume
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Job Title
            </label>
            <Input
              placeholder="e.g., Software Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="h-10"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Company Name
            </label>
            <Input
              placeholder="e.g., Google"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="h-10"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mb-3">
          <label className="text-xs font-medium text-muted-foreground">
            Job Description
          </label>
          <Badge variant="outline" className="gap-1 text-[10px] shrink-0">
            <Target className="w-3 h-3" />
            Paste full posting
          </Badge>
        </div>

        <Textarea
          placeholder="Paste the complete job description here...

Include the job title, requirements, responsibilities, and qualifications for the best analysis."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="min-h-[180px] md:min-h-[280px] text-sm resize-none"
        />

        {/* Character Count & Guidance - Mobile Optimized */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs min-w-0">
              <span
                className={cn("font-medium tabular-nums", getCharCountColor())}
              >
                {charCount}
              </span>
              {charCount < minChars && (
                <span className="text-red-600 truncate">
                  Need {minChars - charCount} more
                </span>
              )}
              {charCount >= minChars && charCount < recommendedChars && (
                <span className="text-yellow-600 truncate">
                  +{recommendedChars - charCount} for best results
                </span>
              )}
              {charCount >= recommendedChars && (
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span className="truncate">Ready for analysis</span>
                </span>
              )}
            </div>
            <Progress
              value={Math.min((charCount / recommendedChars) * 100, 100)}
              className="w-20 md:w-32 h-1.5 shrink-0"
            />
          </div>
        </div>
      </Card>

      {/* Analyze Button */}
      <Button
        onClick={onAnalyze}
        disabled={!canAnalyze || isAnalyzing}
        className="w-full h-12 md:h-14 text-sm md:text-base font-semibold"
        size="lg"
      >
        {isAnalyzing ? (
          <>
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-2" />
            <span className="hidden sm:inline">
              Analyze Match & Get AI Recommendations
            </span>
            <span className="sm:hidden">Analyze with AI</span>
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
          </>
        )}
      </Button>

      {!canAnalyze && (
        <p className="text-xs md:text-sm text-center text-muted-foreground px-2">
          {!selectedResumeId
            ? "Select a resume to continue"
            : `Add ${minChars - charCount} more characters`}
        </p>
      )}

      {analysisError && (
        <div className="p-3 md:p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-2 md:gap-3">
            <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
                {analysisError.code === "RATE_LIMIT_EXCEEDED"
                  ? "Rate Limit Exceeded"
                  : analysisError.code === "TIMEOUT"
                  ? "Request Timed Out"
                  : analysisError.code === "VALIDATION_ERROR"
                  ? "Invalid Input"
                  : "Analysis Failed"}
              </p>
              <p className="text-xs md:text-sm text-red-600 dark:text-red-400">
                {analysisError.message}
              </p>
              {analysisError.retryable !== false && onRetry && (
                <Button
                  onClick={onRetry}
                  variant="outline"
                  size="sm"
                  className="mt-2 md:mt-3 h-8 text-xs border-red-300 hover:bg-red-100 dark:hover:bg-red-950/30"
                >
                  <RotateCw className="w-3 h-3 md:w-4 md:h-4 mr-1.5" />
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
