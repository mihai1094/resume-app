"use client";

import { useEffect, useMemo, useState } from "react";
import { ResumeData } from "@/lib/types/resume";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clipboard,
  Clock,
  Eye,
  EyeOff,
  GraduationCap,
  Lightbulb,
  ListChecks,
  MessageSquare,
  Sparkles,
  Target,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { InterviewQuestion } from "@/lib/ai/content-generator";
import { Industry, SeniorityLevel, SkillGap } from "@/lib/ai/content-types";
import { INDUSTRY_OPTIONS, SENIORITY_OPTIONS } from "@/lib/ai/interview-options";
import { useAiProgress } from "@/hooks/use-ai-progress";
import { AI_OPERATION_STAGES } from "@/lib/ai/progress-tracker";
import { ProgressIndicator } from "@/components/ui/progress-indicator";
import { authFetch } from "@/lib/api/auth-fetch";

interface InterviewPrepDialogProps {
  resumeData: ResumeData;
  trigger?: React.ReactNode;
  /** Pre-populate with JD from context */
  initialJobDescription?: string;
  /** Control open state externally */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
}

export function InterviewPrepDialog({
  resumeData,
  trigger,
  initialJobDescription,
  open: controlledOpen,
  onOpenChange,
}: InterviewPrepDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [jobDescription, setJobDescription] = useState(initialJobDescription || "");
  const [seniorityLevel, setSeniorityLevel] = useState<SeniorityLevel>("mid");
  const [industry, setIndustry] = useState<Industry>("other");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [overallReadiness, setOverallReadiness] = useState<number>(0);
  const [strengthsToHighlight, setStrengthsToHighlight] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAnswers, setShowAnswers] = useState(true);
  const [activeTab, setActiveTab] = useState<"questions" | "gaps">("questions");

  // Sync with initialJobDescription when it changes and dialog opens
  useEffect(() => {
    if (open && initialJobDescription && !jobDescription) {
      setJobDescription(initialJobDescription);
    }
  }, [open, initialJobDescription, jobDescription]);

  // Progress tracking
  const aiProgress = useAiProgress({
    stages: AI_OPERATION_STAGES.INTERVIEW_PREP,
    onCancel: () => {
      setIsLoading(false);
      toast.info("Interview prep generation cancelled");
    },
  });

  const handleGenerate = async () => {
    if (!jobDescription.trim() || jobDescription.trim().length < 50) {
      toast.error("Add a job description (minimum 50 characters).");
      return;
    }

    setIsLoading(true);
    setQuestions([]);
    setSkillGaps([]);
    setOverallReadiness(0);
    setStrengthsToHighlight([]);

    // Start progress tracking
    aiProgress.start();

    try {
      // Stage 1: Analyzing resume and job
      const response = await authFetch("/api/ai/interview-prep", {
        method: "POST",
        body: JSON.stringify({ resumeData, jobDescription, seniorityLevel, industry }),
        signal: aiProgress.getSignal(),
      });

      // Stage 2: Generating questions
      aiProgress.nextStage();

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate interview prep");
      }

      const data = await response.json();

      // Stage 3: Creating answers
      aiProgress.nextStage();

      // Check if cancelled
      if (aiProgress.isCancelled()) {
        return;
      }

      setQuestions(data.questions || []);
      setSkillGaps(data.skillGaps || []);
      setOverallReadiness(data.overallReadiness || 0);
      setStrengthsToHighlight(data.strengthsToHighlight || []);

      // Complete
      aiProgress.complete();

      if (data.meta?.fromCache) {
        toast.success(
          `Loaded from cache in ${data.meta.responseTime}ms (${data.meta.cacheStats?.hitRate} hit rate)`
        );
      } else {
        toast.success(`Generated in ${data.meta?.responseTime}ms`);
      }
    } catch (error) {
      // Check if error is due to cancellation
      if (error instanceof Error && error.name === "AbortError") {
        aiProgress.reset();
        return;
      }

      console.error("Interview prep error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate prep"
      );
      aiProgress.reset();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string, label: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch (err) {
      console.error("Clipboard error", err);
      toast.error("Failed to copy. Please try again.");
    }
  };

  const exportText = useMemo(() => {
    if (!questions.length) return "";
    return questions
      .map(
        (q, idx) =>
          `Q${idx + 1} (${q.type}): ${q.question}\nANSWER: ${
            q.sampleAnswer
          }\nKEY POINTS: ${q.keyPoints.join(
            ", "
          )}\nFOLLOW-UPS: ${q.followUps.join(" | ")}\n`
      )
      .join("\n");
  }, [questions]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <ListChecks className="w-4 h-4" />
            Interview Prep
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Interview Prep Generator
          </DialogTitle>
          <DialogDescription>
            Generate 8-10 interview questions (behavioral/technical/situational)
            with answers based on your resume.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Job Description</label>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description (minimum 50 characters)…"
              className="min-h-[160px] font-mono text-sm"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{jobDescription.trim().length} characters</span>
              <span>Include requirements, responsibilities, tech stack</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Seniority Level</label>
              <Select
                value={seniorityLevel}
                onValueChange={(v) => setSeniorityLevel(v as SeniorityLevel)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {SENIORITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Industry</label>
              <Select
                value={industry}
                onValueChange={(v) => setIndustry(v as Industry)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isLoading || jobDescription.trim().length < 50}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Interview Prep
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
            {!isLoading && questions.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAnswers((v) => !v)}
                  className="gap-2"
                  aria-pressed={!showAnswers}
                  aria-label={showAnswers ? "Hide answers" : "Show answers"}
                >
                  {showAnswers ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Hide answers
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Show answers
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(exportText, "Prep set")}
                  className="gap-2"
                >
                  <Clipboard className="w-4 h-4" />
                  Copy all
                </Button>
              </>
            )}
          </div>

          {/* Progress Indicator */}
          {isLoading && aiProgress.progress && (
            <div className="space-y-3">
              <Separator />
              <ProgressIndicator
                progress={aiProgress.progress}
                onCancel={aiProgress.cancel}
              />
            </div>
          )}

          {(questions.length > 0 || skillGaps.length > 0) && (
            <div className="space-y-4">
              <Separator />

              {/* Readiness Score & Strengths */}
              {overallReadiness > 0 && (
                <div className="p-4 border rounded-lg bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <span className="font-semibold">Interview Readiness</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            overallReadiness >= 80
                              ? "bg-green-500"
                              : overallReadiness >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${overallReadiness}%` }}
                        />
                      </div>
                      <span className="font-bold text-lg">{overallReadiness}%</span>
                    </div>
                  </div>
                  {strengthsToHighlight.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Strengths to Highlight
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {strengthsToHighlight.map((s, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab Navigation */}
              <div className="flex gap-2 border-b">
                <button
                  onClick={() => setActiveTab("questions")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "questions"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ListChecks className="w-4 h-4 inline mr-2" />
                  Questions ({questions.length})
                </button>
                <button
                  onClick={() => setActiveTab("gaps")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "gaps"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  Skill Gaps ({skillGaps.length})
                  {skillGaps.filter((g) => g.learnable).length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-[10px]">
                      {skillGaps.filter((g) => g.learnable).length} learnable
                    </Badge>
                  )}
                </button>
              </div>

              {/* Questions Tab */}
              {activeTab === "questions" && questions.length > 0 && (
                <div className="grid gap-3">
                  {questions.map((q, idx) => (
                    <div
                      key={q.id || idx}
                      className="p-4 border rounded-lg bg-muted/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {q.type}
                          </Badge>
                          <Badge
                            variant={
                              q.difficulty === "hard"
                                ? "destructive"
                                : q.difficulty === "easy"
                                ? "secondary"
                                : "outline"
                            }
                            className="capitalize"
                          >
                            {q.difficulty}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Q{idx + 1}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(q.question, "Question")}
                            className="h-8 text-xs"
                          >
                            <Clipboard className="w-3 h-3 mr-1" />
                            Copy Q
                          </Button>
                          {q.sampleAnswer && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleCopy(q.sampleAnswer, "Answer")
                              }
                              className="h-8 text-xs"
                            >
                              <Clipboard className="w-3 h-3 mr-1" />
                              Copy A
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="font-medium text-sm">{q.question}</p>
                      {showAnswers && q.sampleAnswer && (
                        <p className="text-sm text-muted-foreground leading-6">
                          {q.sampleAnswer}
                        </p>
                      )}
                      {q.keyPoints?.length > 0 && (
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {q.keyPoints.map((kp, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-[10px]"
                            >
                              {kp}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {q.followUps?.length > 0 && (
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            Follow-ups
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {q.followUps.map((f, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-[11px]"
                              >
                                {f}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Skill Gaps Tab */}
              {activeTab === "gaps" && skillGaps.length > 0 && (
                <div className="grid gap-3">
                  {skillGaps.map((gap, idx) => (
                    <div
                      key={gap.id || idx}
                      className={`p-4 border rounded-lg space-y-3 ${
                        gap.learnable
                          ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
                          : "bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{gap.skill}</span>
                          <Badge
                            variant={
                              gap.importance === "critical"
                                ? "destructive"
                                : gap.importance === "important"
                                ? "default"
                                : "secondary"
                            }
                            className="text-[10px]"
                          >
                            {gap.importance}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {gap.category}
                          </Badge>
                        </div>
                        {gap.learnable && (
                          <Badge className="bg-green-500 text-white text-[10px]">
                            <GraduationCap className="w-3 h-3 mr-1" />
                            Can learn before interview
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <span>Current:</span>
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {gap.currentLevel}
                          </Badge>
                        </div>
                        <ArrowRight className="w-3 h-3" />
                        <div className="flex items-center gap-1">
                          <span>Required:</span>
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {gap.requiredLevel}
                          </Badge>
                        </div>
                        {gap.timeToLearn && (
                          <div className="flex items-center gap-1 ml-auto">
                            <Clock className="w-3 h-3" />
                            {gap.timeToLearn}
                          </div>
                        )}
                      </div>

                      {gap.learningPath && (
                        <div className="p-3 bg-background rounded border space-y-1">
                          <div className="flex items-center gap-1 text-xs font-medium">
                            <BookOpen className="w-3 h-3" />
                            Learning Path
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {gap.learningPath}
                          </p>
                        </div>
                      )}

                      {gap.interviewTip && (
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-900 space-y-1">
                          <div className="flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                            <Lightbulb className="w-3 h-3" />
                            Interview Tip
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {gap.interviewTip}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "gaps" && skillGaps.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="font-medium">No significant skill gaps found!</p>
                  <p className="text-sm">Your resume matches the job requirements well.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Target className="w-3.5 h-3.5" />
            Practice mode: hide answers and go through questions out loud.
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

