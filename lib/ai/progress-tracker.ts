/**
 * Progress tracking utilities for long-running AI operations
 * Provides stage tracking, time estimation, and cancellation support
 */

export type ProgressStage = {
  id: string;
  label: string;
  estimatedDuration: number; // in milliseconds
};

export type ProgressState = {
  currentStage: number;
  stages: ProgressStage[];
  startTime: number;
  estimatedTimeRemaining: number; // in milliseconds
  progress: number; // 0-100 percentage
  isComplete: boolean;
  isCancelled: boolean;
};

export type ProgressCallback = (state: ProgressState) => void;

export class ProgressTracker {
  private stages: ProgressStage[];
  private currentStageIndex: number = 0;
  private startTime: number = 0;
  private stageStartTime: number = 0;
  private onProgressUpdate: ProgressCallback | null = null;
  private isCancelled: boolean = false;
  private abortController: AbortController;

  constructor(stages: ProgressStage[], onProgressUpdate?: ProgressCallback) {
    this.stages = stages;
    this.onProgressUpdate = onProgressUpdate || null;
    this.abortController = new AbortController();
  }

  /**
   * Start tracking progress
   */
  start() {
    this.startTime = Date.now();
    this.stageStartTime = Date.now();
    this.currentStageIndex = 0;
    this.isCancelled = false;
    this.emitProgress();
  }

  /**
   * Move to the next stage
   */
  nextStage() {
    if (this.currentStageIndex < this.stages.length - 1) {
      this.currentStageIndex++;
      this.stageStartTime = Date.now();
      this.emitProgress();
    }
  }

  /**
   * Mark as complete
   */
  complete() {
    this.currentStageIndex = this.stages.length;
    this.emitProgress();
  }

  /**
   * Cancel the operation
   */
  cancel() {
    this.isCancelled = true;
    this.abortController.abort();
    this.emitProgress();
  }

  /**
   * Get the abort signal for fetch requests
   */
  getSignal(): AbortSignal {
    return this.abortController.signal;
  }

  /**
   * Check if operation was cancelled
   */
  isCancelledOperation(): boolean {
    return this.isCancelled;
  }

  /**
   * Calculate and emit current progress state
   */
  private emitProgress() {
    const state = this.calculateProgress();
    if (this.onProgressUpdate) {
      this.onProgressUpdate(state);
    }
  }

  /**
   * Calculate current progress state
   */
  private calculateProgress(): ProgressState {
    const isComplete = this.currentStageIndex >= this.stages.length;

    // Calculate total estimated duration
    const totalEstimatedDuration = this.stages.reduce(
      (sum, stage) => sum + stage.estimatedDuration,
      0
    );

    // Calculate time spent so far
    const timeSpent = Date.now() - this.startTime;

    // Calculate estimated time for completed stages
    const completedStagesDuration = this.stages
      .slice(0, this.currentStageIndex)
      .reduce((sum, stage) => sum + stage.estimatedDuration, 0);

    // Calculate progress percentage
    let progress = 0;
    if (isComplete) {
      progress = 100;
    } else if (totalEstimatedDuration > 0) {
      const currentStage = this.stages[this.currentStageIndex];
      const currentStageProgress = currentStage
        ? Math.min(
            (Date.now() - this.stageStartTime) / currentStage.estimatedDuration,
            0.95 // Cap at 95% until we actually move to next stage
          )
        : 0;

      progress = Math.round(
        ((completedStagesDuration + currentStageProgress * (currentStage?.estimatedDuration || 0)) /
          totalEstimatedDuration) *
          100
      );
    }

    // Calculate estimated time remaining
    let estimatedTimeRemaining = 0;
    if (!isComplete && totalEstimatedDuration > 0) {
      estimatedTimeRemaining = Math.max(
        0,
        totalEstimatedDuration - timeSpent
      );
    }

    return {
      currentStage: this.currentStageIndex,
      stages: this.stages,
      startTime: this.startTime,
      estimatedTimeRemaining,
      progress,
      isComplete,
      isCancelled: this.isCancelled,
    };
  }

  /**
   * Get current progress state
   */
  getProgress(): ProgressState {
    return this.calculateProgress();
  }
}

/**
 * Predefined stage configurations for common AI operations
 */
export const AI_OPERATION_STAGES = {
  COVER_LETTER: [
    { id: "analyze", label: "Analyzing resume and job description", estimatedDuration: 3000 },
    { id: "generate", label: "Generating personalized content", estimatedDuration: 8000 },
    { id: "refine", label: "Refining and formatting", estimatedDuration: 3000 },
  ],
  RESUME_TAILOR: [
    { id: "analyze", label: "Analyzing job requirements", estimatedDuration: 3000 },
    { id: "match", label: "Matching skills and experience", estimatedDuration: 5000 },
    { id: "optimize", label: "Optimizing bullet points", estimatedDuration: 7000 },
    { id: "finalize", label: "Finalizing recommendations", estimatedDuration: 3000 },
  ],
  INTERVIEW_PREP: [
    { id: "analyze", label: "Analyzing resume and job posting", estimatedDuration: 3000 },
    { id: "generate", label: "Generating interview questions", estimatedDuration: 10000 },
    { id: "answers", label: "Creating sample answers", estimatedDuration: 8000 },
  ],
  ATS_ANALYSIS: [
    { id: "parse", label: "Parsing resume structure", estimatedDuration: 2000 },
    { id: "analyze", label: "Analyzing ATS compatibility", estimatedDuration: 5000 },
    { id: "score", label: "Calculating match score", estimatedDuration: 4000 },
    { id: "suggestions", label: "Generating improvement suggestions", estimatedDuration: 5000 },
  ],
};

/**
 * Format time remaining in human-readable format
 */
export function formatTimeRemaining(milliseconds: number): string {
  if (milliseconds < 0) return "Finishing up...";

  const seconds = Math.ceil(milliseconds / 1000);

  if (seconds < 5) return "A few seconds";
  if (seconds < 10) return "About 10 seconds";
  if (seconds < 20) return "About 15 seconds";
  if (seconds < 30) return "About 30 seconds";
  if (seconds < 45) return "About 45 seconds";
  if (seconds < 60) return "About a minute";

  const minutes = Math.ceil(seconds / 60);
  return `About ${minutes} minute${minutes > 1 ? "s" : ""}`;
}
