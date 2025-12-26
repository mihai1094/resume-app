"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  EyeOff,
  ListChecks,
  Loader2,
  MessageSquare,
  RotateCcw,
  SkipForward,
  Sparkles,
  Target,
  ThumbsDown,
  ThumbsUp,
  Trophy,
  X,
} from "lucide-react";
import { useInterviewPrepSession } from "@/hooks/use-interview-prep-session";
import { useInterviewPrepHistory } from "@/hooks/use-interview-prep-history";
import { useQuestionTimer } from "@/hooks/use-question-timer";
import { useSavedResumes } from "@/hooks/use-saved-resumes";
import { useUser } from "@/hooks/use-user";
import { ProgressIndicator } from "@/components/ui/progress-indicator";
import { cn } from "@/lib/utils";
import type { PracticeQuestion } from "@/lib/types/interview-prep";
import { SENIORITY_OPTIONS } from "@/lib/ai/interview-options";

// STAR method answer parser and formatter (reused from dialog)
function parseStarAnswer(answer: string): {
  type: "star";
  sections: { label: string; content: string; color: string; bg: string }[];
} | { type: "plain"; content: string } {
  const cleaned = answer.replace(/^\s*\(STAR Method\)\s*/i, "").trim();
  const starLabels = [
    { key: "S:", label: "Situation", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30" },
    { key: "T:", label: "Task", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30" },
    { key: "A:", label: "Action", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/30" },
    { key: "R:", label: "Result", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/30" },
  ];
  const hasStarFormat = starLabels.every(({ key }) => cleaned.includes(key));
  if (!hasStarFormat) return { type: "plain", content: answer };

  const sections: { label: string; content: string; color: string; bg: string }[] = [];
  starLabels.forEach(({ key, label, color, bg }, index) => {
    const startIndex = cleaned.indexOf(key);
    if (startIndex === -1) return;
    const nextKey = starLabels[index + 1]?.key;
    const endIndex = nextKey ? cleaned.indexOf(nextKey) : cleaned.length;
    if (endIndex > startIndex) {
      const content = cleaned.substring(startIndex + key.length, endIndex).trim();
      sections.push({ label, content, color, bg });
    }
  });
  if (sections.length === 0) return { type: "plain", content: answer };
  return { type: "star", sections };
}

function FormattedAnswer({ answer }: { answer: string }) {
  const parsed = parseStarAnswer(answer);
  if (parsed.type === "plain") {
    return (
      <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
        {parsed.content}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-medium">STAR Method Response</span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className="grid gap-2">
        {parsed.sections.map((section, i) => (
          <div key={i} className={`rounded-lg border p-3 ${section.bg}`}>
            <div className="flex items-start gap-2">
              <span className={`text-xs font-semibold uppercase tracking-wide ${section.color} shrink-0 w-16`}>
                {section.label}
              </span>
              <p className="text-sm text-foreground/80 leading-relaxed flex-1">
                {section.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Setup Phase Component
function SetupPhase({
  session,
  resumes,
  isGenerating,
  error,
  aiProgress,
  onUpdateConfig,
  onGenerate,
}: {
  session: NonNullable<ReturnType<typeof useInterviewPrepSession>["session"]>;
  resumes: ReturnType<typeof useSavedResumes>["resumes"];
  isGenerating: boolean;
  error: string | null;
  aiProgress: ReturnType<typeof useInterviewPrepSession>["aiProgress"];
  onUpdateConfig: ReturnType<typeof useInterviewPrepSession>["updateConfig"];
  onGenerate: () => void;
}) {
  const isValid =
    session.config.resumeId &&
    session.config.jobDescription.trim().length >= 50;

  return (
    <div className="space-y-6">
      {/* Resume Selection */}
      <div className="space-y-2">
        <Label htmlFor="resume-select">Select Resume</Label>
        <Select
          value={session.config.resumeId}
          onValueChange={(value) => onUpdateConfig({ resumeId: value })}
        >
          <SelectTrigger id="resume-select" className="w-full">
            <SelectValue placeholder="Choose a resume..." />
          </SelectTrigger>
          <SelectContent>
            {resumes.map((resume) => (
              <SelectItem key={resume.id} value={resume.id}>
                {resume.name || "Untitled Resume"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Job Description */}
      <div className="space-y-2">
        <Label htmlFor="job-description">Job Description</Label>
        <Textarea
          id="job-description"
          value={session.config.jobDescription}
          onChange={(e) => onUpdateConfig({ jobDescription: e.target.value })}
          placeholder="Paste the job description here (minimum 50 characters)..."
          className="min-h-[200px] font-mono text-sm"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span
            className={cn(
              session.config.jobDescription.trim().length < 50 &&
                "text-destructive"
            )}
          >
            {session.config.jobDescription.trim().length} / 50 min characters
          </span>
          <span>Include requirements, responsibilities, tech stack</span>
        </div>
      </div>

      {/* Seniority Level */}
      <div className="space-y-2">
        <Label htmlFor="seniority">
          Seniority Level
          <span className="text-muted-foreground font-normal ml-1">
            (optional)
          </span>
        </Label>
        <Select
          value={session.config.seniorityLevel}
          onValueChange={(value) =>
            onUpdateConfig({
              seniorityLevel: value as typeof session.config.seniorityLevel,
            })
          }
        >
          <SelectTrigger id="seniority" className="w-full sm:w-[280px]">
            <SelectValue placeholder="Auto-detect from resume" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto-detect from resume</SelectItem>
            {SENIORITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Timer Settings */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="space-y-0.5">
          <Label htmlFor="timer-toggle" className="text-base">
            Practice Timer
          </Label>
          <p className="text-sm text-muted-foreground">
            {session.config.timerMinutes} minutes per question
          </p>
        </div>
        <Switch
          id="timer-toggle"
          checked={session.config.timerEnabled}
          onCheckedChange={(checked) => onUpdateConfig({ timerEnabled: checked })}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Progress Indicator */}
      {isGenerating && aiProgress.progress && (
        <ProgressIndicator
          progress={aiProgress.progress}
          onCancel={aiProgress.cancel}
        />
      )}

      {/* Generate Button */}
      <Button
        onClick={onGenerate}
        disabled={!isValid || isGenerating}
        className="w-full gap-2"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating Questions...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate 15-20 Questions
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </div>
  );
}

// Practice Phase Component
function PracticePhase({
  session,
  currentQuestion,
  progress,
  canGoNext,
  canGoPrevious,
  timer,
  onUpdateAnswer,
  onToggleShowAnswer,
  onAssess,
  onNext,
  onPrevious,
  onSkip,
  onComplete,
}: {
  session: NonNullable<ReturnType<typeof useInterviewPrepSession>["session"]>;
  currentQuestion: PracticeQuestion;
  progress: { completed: number; total: number; percentage: number };
  canGoNext: boolean;
  canGoPrevious: boolean;
  timer: ReturnType<typeof useQuestionTimer>;
  onUpdateAnswer: (answer: string) => void;
  onToggleShowAnswer: () => void;
  onAssess: (assessment: "nailed" | "needs-practice") => void;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onComplete: () => void;
}) {
  const questionIndex = session.currentQuestionIndex;
  const isLastQuestion = questionIndex === session.questions.length - 1;
  const allAssessed = session.questions.every((q) => q.assessment !== null);

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          Question {questionIndex + 1} of {session.questions.length}
        </span>
        <span className="text-muted-foreground">
          {progress.completed} answered
        </span>
      </div>
      <Progress value={progress.percentage} className="h-2" />

      {/* Question Card */}
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "capitalize",
                  currentQuestion.type === "behavioral" &&
                    "border-blue-500 text-blue-600",
                  currentQuestion.type === "technical" &&
                    "border-green-500 text-green-600",
                  currentQuestion.type === "situational" &&
                    "border-purple-500 text-purple-600"
                )}
              >
                {currentQuestion.type}
              </Badge>
              <Badge
                variant={
                  currentQuestion.difficulty === "hard"
                    ? "destructive"
                    : currentQuestion.difficulty === "easy"
                    ? "secondary"
                    : "outline"
                }
                className="capitalize"
              >
                {currentQuestion.difficulty}
              </Badge>
            </div>
            {session.config.timerEnabled && (
              <div
                className={cn(
                  "flex items-center gap-1.5 text-sm font-mono",
                  timer.percentageRemaining < 25 && "text-destructive",
                  timer.percentageRemaining < 50 &&
                    timer.percentageRemaining >= 25 &&
                    "text-amber-500"
                )}
              >
                <Clock className="w-4 h-4" />
                {timer.formattedTime}
              </div>
            )}
          </div>

          {/* Question */}
          <p className="text-lg font-medium leading-relaxed">
            {currentQuestion.question}
          </p>

          {/* Answer Input */}
          <div className="space-y-2">
            <Label htmlFor="answer">Your Answer</Label>
            <Textarea
              id="answer"
              value={currentQuestion.userAnswer}
              onChange={(e) => onUpdateAnswer(e.target.value)}
              placeholder="Type your answer here... (for self-practice)"
              className="min-h-[120px]"
            />
          </div>

          {/* Sample Answer */}
          <Collapsible
            open={currentQuestion.showAnswer}
            onOpenChange={onToggleShowAnswer}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full gap-2 justify-between"
              >
                <span className="flex items-center gap-2">
                  {currentQuestion.showAnswer ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  {currentQuestion.showAnswer
                    ? "Hide Sample Answer"
                    : "Reveal Sample Answer"}
                </span>
                {currentQuestion.showAnswer ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-4">
              <div className="p-4 border rounded-lg bg-muted/30">
                <FormattedAnswer answer={currentQuestion.sampleAnswer} />
              </div>

              {/* Key Points */}
              {currentQuestion.keyPoints.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    Key Points to Emphasize
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {currentQuestion.keyPoints.map((kp, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {kp}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Follow-ups */}
              {currentQuestion.followUps.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Potential Follow-up Questions
                  </div>
                  <div className="space-y-1">
                    {currentQuestion.followUps.map((f, i) => (
                      <div
                        key={i}
                        className="text-xs text-muted-foreground pl-3 border-l-2 border-muted"
                      >
                        "{f}"
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Self Assessment */}
              {currentQuestion.showAnswer && !currentQuestion.assessment && (
                <div className="pt-4 border-t space-y-3">
                  <p className="text-sm font-medium text-center">
                    How did you do?
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      className="gap-2 flex-1 max-w-[160px] border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                      onClick={() => onAssess("nailed")}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Nailed It
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2 flex-1 max-w-[160px] border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                      onClick={() => onAssess("needs-practice")}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      Need Practice
                    </Button>
                  </div>
                </div>
              )}

              {/* Assessment indicator */}
              {currentQuestion.assessment && (
                <div
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium",
                    currentQuestion.assessment === "nailed" &&
                      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                    currentQuestion.assessment === "needs-practice" &&
                      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                    currentQuestion.assessment === "skipped" &&
                      "bg-muted text-muted-foreground"
                  )}
                >
                  {currentQuestion.assessment === "nailed" && (
                    <>
                      <Check className="w-4 h-4" />
                      Marked as Nailed
                    </>
                  )}
                  {currentQuestion.assessment === "needs-practice" && (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      Marked for Practice
                    </>
                  )}
                  {currentQuestion.assessment === "skipped" && (
                    <>
                      <SkipForward className="w-4 h-4" />
                      Skipped
                    </>
                  )}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        <Button variant="ghost" onClick={onSkip} className="gap-2">
          <SkipForward className="w-4 h-4" />
          Skip
        </Button>

        {isLastQuestion && allAssessed ? (
          <Button onClick={onComplete} className="gap-2">
            <Trophy className="w-4 h-4" />
            Complete Session
          </Button>
        ) : (
          <Button
            onClick={onNext}
            disabled={!canGoNext}
            className="gap-2"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Summary Phase Component
function SummaryPhase({
  session,
  onPracticeWeak,
  onNewSession,
  onBackToDashboard,
}: {
  session: NonNullable<ReturnType<typeof useInterviewPrepSession>["session"]>;
  onPracticeWeak: () => void;
  onNewSession: () => void;
  onBackToDashboard: () => void;
}) {
  const { stats } = session;
  const weakQuestions = session.questions.filter(
    (q) => q.assessment === "needs-practice" || q.assessment === "skipped"
  );
  const nailedPercentage =
    stats.totalQuestions > 0
      ? Math.round((stats.nailedCount / stats.totalQuestions) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="p-6 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center mx-auto">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Session Complete!</h2>
            <p className="text-muted-foreground">
              You nailed {stats.nailedCount} out of {stats.totalQuestions}{" "}
              questions
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-primary">
              {nailedPercentage}%
            </div>
            <Progress value={nailedPercentage} className="h-3" />
          </div>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Nailed: {stats.nailedCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Need Practice: {stats.needsPracticeCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-muted" />
              <span>Skipped: {stats.skippedCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown by Type */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Breakdown by Type</h3>
          <div className="space-y-2">
            {(["behavioral", "technical", "situational"] as const).map(
              (type) => {
                const data = stats.byType[type];
                const percentage =
                  data.total > 0
                    ? Math.round((data.nailed / data.total) * 100)
                    : 0;
                return (
                  <div key={type} className="flex items-center gap-3">
                    <span className="capitalize text-sm w-24">{type}</span>
                    <Progress value={percentage} className="flex-1 h-2" />
                    <span className="text-sm text-muted-foreground w-16 text-right">
                      {data.nailed}/{data.total}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weak Questions */}
      {weakQuestions.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Questions to Review</h3>
            <div className="space-y-2">
              {weakQuestions.slice(0, 5).map((q, i) => (
                <div
                  key={q.id}
                  className="text-sm p-2 bg-muted/50 rounded-lg"
                >
                  <span className="text-muted-foreground mr-2">
                    Q{session.questions.indexOf(q) + 1}:
                  </span>
                  {q.question.length > 80
                    ? q.question.slice(0, 80) + "..."
                    : q.question}
                </div>
              ))}
              {weakQuestions.length > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{weakQuestions.length - 5} more
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {weakQuestions.length > 0 && (
          <Button
            variant="default"
            className="flex-1 gap-2"
            onClick={onPracticeWeak}
          >
            <RotateCcw className="w-4 h-4" />
            Practice Weak Questions ({weakQuestions.length})
          </Button>
        )}
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={onNewSession}
        >
          <Sparkles className="w-4 h-4" />
          New Session
        </Button>
        <Button
          variant="ghost"
          className="flex-1 gap-2"
          onClick={onBackToDashboard}
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Button>
      </div>
    </div>
  );
}

// Main Session Content Component
export default function InterviewPrepSessionContent({
  sessionId,
}: {
  sessionId: string;
}) {
  const router = useRouter();
  const { user } = useUser();
  const { resumes } = useSavedResumes(user?.id ?? null);
  const { saveSession, createNewSession } = useInterviewPrepHistory();

  const getResumeData = useCallback(
    (resumeId: string) => {
      const resume = resumes.find((r) => r.id === resumeId);
      return resume?.data || null;
    },
    [resumes]
  );

  const {
    session,
    isLoading,
    isGenerating,
    error,
    currentQuestion,
    progress,
    canGoNext,
    canGoPrevious,
    aiProgress,
    updateConfig,
    generateQuestions,
    updateAnswer,
    toggleShowAnswer,
    assessQuestion,
    goToNext,
    goToPrevious,
    skipQuestion,
    completeSession,
    practiceWeakQuestions,
  } = useInterviewPrepSession({
    sessionId,
    getResumeData,
    onSave: saveSession,
  });

  const timer = useQuestionTimer({
    enabled: session?.config.timerEnabled || false,
    durationMinutes: session?.config.timerMinutes || 3,
  });

  const handleBack = () => {
    router.push("/dashboard/interview-prep");
  };

  const handleNewSession = () => {
    const newId = createNewSession();
    router.push(`/dashboard/interview-prep/${newId}`);
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Session not found</h2>
          <Button onClick={handleBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="container max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-semibold flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-primary" />
                  {session.status === "setup"
                    ? "New Session"
                    : session.status === "practicing"
                    ? "Practice Mode"
                    : "Session Complete"}
                </h1>
                {session.config.jobTitle && (
                  <p className="text-sm text-muted-foreground">
                    {session.config.jobTitle}
                  </p>
                )}
              </div>
            </div>
            {session.status === "practicing" && (
              <Badge variant="outline" className="gap-1">
                <Target className="w-3 h-3" />
                {session.overallReadiness}% ready
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-3xl mx-auto px-4 py-6">
        {session.status === "setup" && (
          <SetupPhase
            session={session}
            resumes={resumes}
            isGenerating={isGenerating}
            error={error}
            aiProgress={aiProgress}
            onUpdateConfig={updateConfig}
            onGenerate={generateQuestions}
          />
        )}

        {session.status === "practicing" && currentQuestion && (
          <PracticePhase
            session={session}
            currentQuestion={currentQuestion}
            progress={progress}
            canGoNext={canGoNext}
            canGoPrevious={canGoPrevious}
            timer={timer}
            onUpdateAnswer={updateAnswer}
            onToggleShowAnswer={toggleShowAnswer}
            onAssess={assessQuestion}
            onNext={goToNext}
            onPrevious={goToPrevious}
            onSkip={skipQuestion}
            onComplete={completeSession}
          />
        )}

        {session.status === "completed" && (
          <SummaryPhase
            session={session}
            onPracticeWeak={practiceWeakQuestions}
            onNewSession={handleNewSession}
            onBackToDashboard={handleBackToDashboard}
          />
        )}
      </main>
    </div>
  );
}
