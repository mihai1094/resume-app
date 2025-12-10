"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResumeData } from "@/lib/types/resume";
import {
  analyzeResumeReadiness,
  ReadinessResult,
} from "@/lib/services/resume-readiness";
import {
  analyzeJobMatch,
  JobMatchResult,
  getMatchColor,
  getMatchBgColor,
} from "@/lib/services/job-match";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ListChecks,
  Target,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Search,
  ChevronRight,
  Lightbulb,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ReadinessCheckItem } from "./readiness-check-item";

interface ReadinessDashboardProps {
  resumeData: ResumeData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJumpToSection?: (sectionId: string) => void;
  initialTab?: "job-match" | "checklist";
}

export function ReadinessDashboard({
  resumeData,
  open,
  onOpenChange,
  onJumpToSection,
  initialTab = "job-match",
}: ReadinessDashboardProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // Analyze resume readiness (local, instant)
  const readinessResult = useMemo(
    () => analyzeResumeReadiness(resumeData),
    [resumeData]
  );

  // Analyze job match (only when JD is provided)
  const jobMatchResult = useMemo(() => {
    if (!jobDescription.trim()) return null;
    return analyzeJobMatch(resumeData, jobDescription);
  }, [resumeData, jobDescription]);

  const handleAnalyze = useCallback(() => {
    if (jobDescription.trim()) {
      setHasAnalyzed(true);
    }
  }, [jobDescription]);

  const handleFix = useCallback(
    (sectionId: string) => {
      if (onJumpToSection) {
        onJumpToSection(sectionId);
        onOpenChange(false);
      }
    },
    [onJumpToSection, onOpenChange]
  );

  // Separate required and recommended checks
  const requiredChecks = readinessResult.checks.filter(
    (c) => c.priority === "required"
  );
  const recommendedChecks = readinessResult.checks.filter(
    (c) => c.priority === "recommended"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ListChecks className="w-5 h-5 text-primary" />
            Resume Readiness
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={initialTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="job-match" className="gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Job Match</span>
              <span className="sm:hidden">Match</span>
            </TabsTrigger>
            <TabsTrigger value="checklist" className="gap-2">
              <ListChecks className="w-4 h-4" />
              <span className="hidden sm:inline">Checklist</span>
              <span className="sm:hidden">Check</span>
              {!readinessResult.isReady && (
                <Badge variant="destructive" className="ml-1 text-[10px] h-4 px-1">
                  {readinessResult.summary.required.total -
                    readinessResult.summary.required.passed}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Job Match Tab */}
          <TabsContent
            value="job-match"
            className="flex-1 overflow-y-auto space-y-4 mt-4"
          >
            {/* Job Description Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Paste the job description
              </label>
              <Textarea
                placeholder="Paste the job description here to see how well your resume matches..."
                value={jobDescription}
                onChange={(e) => {
                  setJobDescription(e.target.value);
                  setHasAnalyzed(false);
                }}
                className="min-h-[120px] resize-none"
              />
              <Button
                onClick={handleAnalyze}
                disabled={!jobDescription.trim()}
                className="w-full gap-2"
              >
                <Search className="w-4 h-4" />
                Analyze Match
              </Button>
            </div>

            {/* Results */}
            {hasAnalyzed && jobMatchResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Match Score */}
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Keyword Match
                      </h3>
                      <p
                        className={cn(
                          "text-3xl font-bold",
                          getMatchColor(jobMatchResult.matchPercentage)
                        )}
                      >
                        {jobMatchResult.matchPercentage}%
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>
                        {jobMatchResult.keywordsFound.length} of{" "}
                        {jobMatchResult.totalKeywords}
                      </p>
                      <p>keywords found</p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={cn(
                        "h-full rounded-full",
                        getMatchBgColor(jobMatchResult.matchPercentage)
                      )}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${jobMatchResult.matchPercentage}%`,
                      }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {jobMatchResult.summary}
                  </p>
                </div>

                {/* Info disclaimer */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm">
                  <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">
                    This score is based on keyword overlap only. A 75-85% match
                    is considered optimal. 100% may indicate keyword stuffing.
                  </p>
                </div>

                {/* Found Keywords */}
                {jobMatchResult.keywordsFound.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Found Keywords ({jobMatchResult.keywordsFound.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {jobMatchResult.keywordsFound.map((kw, idx) => (
                        <Badge
                          key={idx}
                          variant={
                            kw.importance === "high" ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {kw.keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Keywords */}
                {jobMatchResult.keywordsMissing.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      Missing Keywords ({jobMatchResult.keywordsMissing.length})
                    </h4>
                    <div className="space-y-2">
                      {jobMatchResult.keywordsMissing
                        .slice(0, 10)
                        .map((kw, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 p-2 rounded-lg bg-red-500/5 border border-red-500/20"
                          >
                            <Badge
                              variant="outline"
                              className={cn(
                                "flex-shrink-0 text-xs",
                                kw.importance === "high"
                                  ? "border-red-500 text-red-600"
                                  : ""
                              )}
                            >
                              {kw.keyword}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground">
                                {kw.tip}
                              </p>
                            </div>
                          </div>
                        ))}
                      {jobMatchResult.keywordsMissing.length > 10 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{jobMatchResult.keywordsMissing.length - 10} more
                          missing keywords
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Empty State */}
            {!hasAnalyzed && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Target className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <h3 className="text-sm font-medium mb-1">
                  Match your resume to a job
                </h3>
                <p className="text-xs text-muted-foreground max-w-[280px]">
                  Paste a job description above to see how well your resume
                  matches and get specific suggestions for improvement.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Checklist Tab */}
          <TabsContent
            value="checklist"
            className="flex-1 overflow-y-auto space-y-4 mt-4"
          >
            {/* Summary Badges */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Badge
                variant={readinessResult.isReady ? "default" : "destructive"}
                className="gap-1"
              >
                {readinessResult.isReady ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                Required: {readinessResult.summary.required.passed}/
                {readinessResult.summary.required.total}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Lightbulb className="w-3 h-3" />
                Tips: {readinessResult.summary.recommended.passed}/
                {readinessResult.summary.recommended.total}
              </Badge>
            </div>

            {/* Required Checks */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                {readinessResult.summary.required.passed ===
                readinessResult.summary.required.total ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                Required Checks
              </h3>
              <div className="space-y-2">
                {requiredChecks.map((check, idx) => (
                  <ReadinessCheckItem
                    key={check.id}
                    check={check}
                    onFix={handleFix}
                    index={idx}
                  />
                ))}
              </div>
            </div>

            {/* Recommended Checks */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Recommended Improvements
              </h3>
              <div className="space-y-2">
                {recommendedChecks.map((check, idx) => (
                  <ReadinessCheckItem
                    key={check.id}
                    check={check}
                    onFix={handleFix}
                    index={idx + requiredChecks.length}
                  />
                ))}
              </div>
            </div>

            {/* All Checks Passed */}
            {readinessResult.isReady &&
              readinessResult.summary.recommended.passed ===
                readinessResult.summary.recommended.total && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center"
                >
                  <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h3 className="font-medium text-green-700 dark:text-green-400">
                    All checks passed!
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your resume looks great. Try the Job Match tab to tailor it
                    for a specific position.
                  </p>
                </motion.div>
              )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
