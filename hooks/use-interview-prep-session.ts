import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { storageConfig } from "@/config/storage";
import { authFetch } from "@/lib/api/auth-fetch";
import { useAiProgress } from "@/hooks/use-ai-progress";
import { AI_OPERATION_STAGES } from "@/lib/ai/progress-tracker";
import type { ResumeData } from "@/lib/types/resume";
import type { SeniorityLevel } from "@/lib/ai/content-types";
import type {
  InterviewPrepSession,
  PracticeQuestion,
  QuestionAssessment,
  SessionConfig,
} from "@/lib/types/interview-prep";
import {
  createNewSession,
  computeSessionStats,
  toPracticeQuestion,
} from "@/lib/types/interview-prep";

interface UseInterviewPrepSessionProps {
  /** Session ID */
  sessionId: string;
  /** Pre-selected resume ID from navigation */
  initialResumeId?: string;
  /** Function to get resume data by ID */
  getResumeData: (resumeId: string) => ResumeData | null;
  /** Callback when session is saved */
  onSave?: (session: InterviewPrepSession) => void;
}

interface UseInterviewPrepSessionReturn {
  /** Current session state */
  session: InterviewPrepSession | null;
  /** Whether the session is loading from storage */
  isLoading: boolean;
  /** Whether questions are being generated */
  isGenerating: boolean;
  /** Generation error message */
  error: string | null;

  /** Current question being practiced */
  currentQuestion: PracticeQuestion | null;
  /** Progress info */
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  /** Navigation state */
  canGoNext: boolean;
  canGoPrevious: boolean;

  /** AI progress state for UI */
  aiProgress: ReturnType<typeof useAiProgress>;

  // Setup actions
  updateConfig: (updates: Partial<SessionConfig>) => void;
  generateQuestions: () => Promise<void>;

  // Practice actions
  updateAnswer: (answer: string) => void;
  toggleShowAnswer: () => void;
  assessQuestion: (assessment: QuestionAssessment) => void;
  goToQuestion: (index: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  skipQuestion: () => void;
  addTimeSpent: (seconds: number) => void;

  // Session actions
  completeSession: () => void;
  practiceWeakQuestions: () => void;
  resetSession: () => void;
}

/**
 * Main hook for managing an interview prep practice session
 */
export function useInterviewPrepSession({
  sessionId,
  initialResumeId,
  getResumeData,
  onSave,
}: UseInterviewPrepSessionProps): UseInterviewPrepSessionReturn {
  const [session, setSession] = useState<InterviewPrepSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep onSave ref updated
  const onSaveRef = useRef(onSave);
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  // Progress tracking for AI generation
  const aiProgress = useAiProgress({
    stages: AI_OPERATION_STAGES.INTERVIEW_PREP,
    onCancel: () => {
      setIsGenerating(false);
      toast.info("Question generation cancelled");
    },
  });

  // Load session from storage or create new
  useEffect(() => {
    const loadSession = () => {
      try {
        const key = storageConfig.keys.interviewPrepSession(sessionId);
        const stored = localStorage.getItem(key);

        if (stored) {
          const parsed = JSON.parse(stored) as InterviewPrepSession;
          setSession(parsed);
        } else {
          // Create new session
          const newSession = createNewSession(
            sessionId,
            initialResumeId || ""
          );
          setSession(newSession);
        }
      } catch (err) {
        console.error("Error loading session:", err);
        const newSession = createNewSession(sessionId, initialResumeId || "");
        setSession(newSession);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [sessionId, initialResumeId]);

  // Save session to storage whenever it changes
  const saveSession = useCallback(
    (updatedSession: InterviewPrepSession) => {
      try {
        const key = storageConfig.keys.interviewPrepSession(sessionId);
        const sessionToSave = {
          ...updatedSession,
          updatedAt: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify(sessionToSave));
        onSaveRef.current?.(sessionToSave);
      } catch (err) {
        console.error("Error saving session:", err);
      }
    },
    [sessionId]
  );

  // Update config
  const updateConfig = useCallback(
    (updates: Partial<SessionConfig>) => {
      setSession((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          config: { ...prev.config, ...updates },
        };
        saveSession(updated);
        return updated;
      });
    },
    [saveSession]
  );

  // Generate questions via API
  const generateQuestions = useCallback(async () => {
    if (!session) return;

    const resumeData = getResumeData(session.config.resumeId);
    if (!resumeData) {
      setError("Please select a resume first");
      return;
    }

    if (
      !session.config.jobDescription ||
      session.config.jobDescription.trim().length < 50
    ) {
      setError("Job description must be at least 50 characters");
      return;
    }

    setIsGenerating(true);
    setError(null);
    aiProgress.start();

    try {
      const response = await authFetch("/api/ai/interview-prep", {
        method: "POST",
        body: JSON.stringify({
          resumeData,
          jobDescription: session.config.jobDescription,
          ...(session.config.seniorityLevel !== "auto" && {
            seniorityLevel: session.config.seniorityLevel as SeniorityLevel,
          }),
        }),
        signal: aiProgress.getSignal(),
      });

      aiProgress.nextStage();

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate questions");
      }

      const data = await response.json();
      aiProgress.nextStage();

      if (aiProgress.isCancelled()) {
        return;
      }

      // Convert to practice questions
      const practiceQuestions: PracticeQuestion[] = (data.questions || []).map(
        toPracticeQuestion
      );

      // Update session with results
      setSession((prev) => {
        if (!prev) return prev;
        const updated: InterviewPrepSession = {
          ...prev,
          status: "practicing",
          questions: practiceQuestions,
          skillGaps: data.skillGaps || [],
          overallReadiness: data.overallReadiness || 0,
          strengthsToHighlight: data.strengthsToHighlight || [],
          currentQuestionIndex: 0,
          stats: computeSessionStats(practiceQuestions),
        };
        saveSession(updated);
        return updated;
      });

      aiProgress.complete();

      if (data.meta?.fromCache) {
        toast.success(`Loaded ${practiceQuestions.length} questions from cache`);
      } else {
        toast.success(`Generated ${practiceQuestions.length} questions`);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        aiProgress.reset();
        return;
      }

      console.error("Error generating questions:", err);
      const message =
        err instanceof Error ? err.message : "Failed to generate questions";
      setError(message);
      toast.error(message);
      aiProgress.reset();
    } finally {
      setIsGenerating(false);
    }
  }, [session, getResumeData, aiProgress, saveSession]);

  // Current question
  const currentQuestion = useMemo(() => {
    if (!session || session.questions.length === 0) return null;
    return session.questions[session.currentQuestionIndex] || null;
  }, [session]);

  // Progress
  const progress = useMemo(() => {
    if (!session || session.questions.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }
    const completed = session.questions.filter(
      (q) => q.assessment !== null
    ).length;
    const total = session.questions.length;
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100),
    };
  }, [session]);

  // Navigation state
  const canGoNext = useMemo(() => {
    if (!session) return false;
    return session.currentQuestionIndex < session.questions.length - 1;
  }, [session]);

  const canGoPrevious = useMemo(() => {
    if (!session) return false;
    return session.currentQuestionIndex > 0;
  }, [session]);

  // Update answer
  const updateAnswer = useCallback(
    (answer: string) => {
      setSession((prev) => {
        if (!prev) return prev;
        const questions = [...prev.questions];
        if (questions[prev.currentQuestionIndex]) {
          questions[prev.currentQuestionIndex] = {
            ...questions[prev.currentQuestionIndex],
            userAnswer: answer,
          };
        }
        const updated = { ...prev, questions };
        saveSession(updated);
        return updated;
      });
    },
    [saveSession]
  );

  // Toggle show answer
  const toggleShowAnswer = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      const questions = [...prev.questions];
      if (questions[prev.currentQuestionIndex]) {
        questions[prev.currentQuestionIndex] = {
          ...questions[prev.currentQuestionIndex],
          showAnswer: !questions[prev.currentQuestionIndex].showAnswer,
        };
      }
      const updated = { ...prev, questions };
      saveSession(updated);
      return updated;
    });
  }, [saveSession]);

  // Assess question
  const assessQuestion = useCallback(
    (assessment: QuestionAssessment) => {
      setSession((prev) => {
        if (!prev) return prev;
        const questions = [...prev.questions];
        if (questions[prev.currentQuestionIndex]) {
          questions[prev.currentQuestionIndex] = {
            ...questions[prev.currentQuestionIndex],
            assessment,
          };
        }
        const updated = {
          ...prev,
          questions,
          stats: computeSessionStats(questions),
        };
        saveSession(updated);
        return updated;
      });
    },
    [saveSession]
  );

  // Go to specific question
  const goToQuestion = useCallback(
    (index: number) => {
      setSession((prev) => {
        if (!prev) return prev;
        if (index < 0 || index >= prev.questions.length) return prev;
        const updated = { ...prev, currentQuestionIndex: index };
        saveSession(updated);
        return updated;
      });
    },
    [saveSession]
  );

  // Navigation
  const goToNext = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      if (prev.currentQuestionIndex >= prev.questions.length - 1) return prev;
      const updated = {
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      };
      saveSession(updated);
      return updated;
    });
  }, [saveSession]);

  const goToPrevious = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      if (prev.currentQuestionIndex <= 0) return prev;
      const updated = {
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
      };
      saveSession(updated);
      return updated;
    });
  }, [saveSession]);

  // Skip question (mark as skipped and go to next, or complete if last)
  const skipQuestion = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      const questions = [...prev.questions];
      if (questions[prev.currentQuestionIndex]) {
        questions[prev.currentQuestionIndex] = {
          ...questions[prev.currentQuestionIndex],
          assessment: "skipped",
        };
      }

      const isLastQuestion = prev.currentQuestionIndex === prev.questions.length - 1;
      const allAssessed = questions.every((q) => q.assessment !== null);

      // If on last question and all assessed, complete the session
      if (isLastQuestion && allAssessed) {
        const updated = {
          ...prev,
          questions,
          status: "completed" as const,
          stats: computeSessionStats(questions),
        };
        saveSession(updated);
        return updated;
      }

      // Otherwise, go to next question
      const nextIndex = Math.min(
        prev.currentQuestionIndex + 1,
        prev.questions.length - 1
      );
      const updated = {
        ...prev,
        questions,
        currentQuestionIndex: nextIndex,
        stats: computeSessionStats(questions),
      };
      saveSession(updated);
      return updated;
    });
  }, [saveSession]);

  // Add time spent on current question
  const addTimeSpent = useCallback(
    (seconds: number) => {
      setSession((prev) => {
        if (!prev) return prev;
        const questions = [...prev.questions];
        if (questions[prev.currentQuestionIndex]) {
          questions[prev.currentQuestionIndex] = {
            ...questions[prev.currentQuestionIndex],
            timeSpent:
              questions[prev.currentQuestionIndex].timeSpent + seconds,
          };
        }
        const updated = {
          ...prev,
          questions,
          stats: computeSessionStats(questions),
        };
        // Don't save on every tick, just update state
        return updated;
      });
    },
    []
  );

  // Complete session
  const completeSession = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      const updated: InterviewPrepSession = {
        ...prev,
        status: "completed",
        stats: computeSessionStats(prev.questions),
      };
      saveSession(updated);
      return updated;
    });
  }, [saveSession]);

  // Practice weak questions only
  const practiceWeakQuestions = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      // Find questions that need practice
      const weakQuestions = prev.questions.filter(
        (q) => q.assessment === "needs-practice" || q.assessment === "skipped"
      );

      if (weakQuestions.length === 0) {
        toast.info("No weak questions to practice!");
        return prev;
      }

      // Reset these questions for re-practice
      const resetQuestions = weakQuestions.map((q) => ({
        ...q,
        userAnswer: "",
        assessment: null as QuestionAssessment,
        showAnswer: false,
        timeSpent: 0,
      }));

      const updated: InterviewPrepSession = {
        ...prev,
        status: "practicing",
        questions: resetQuestions,
        currentQuestionIndex: 0,
        stats: computeSessionStats(resetQuestions),
      };
      saveSession(updated);
      toast.success(`Practicing ${resetQuestions.length} weak questions`);
      return updated;
    });
  }, [saveSession]);

  // Reset session to setup
  const resetSession = useCallback(() => {
    const newSession = createNewSession(sessionId, initialResumeId || "");
    setSession(newSession);
    saveSession(newSession);
  }, [sessionId, initialResumeId, saveSession]);

  return {
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
    goToQuestion,
    goToNext,
    goToPrevious,
    skipQuestion,
    addTimeSpent,
    completeSession,
    practiceWeakQuestions,
    resetSession,
  };
}
