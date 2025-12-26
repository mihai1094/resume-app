import { useState, useCallback, useEffect } from "react";
import { storageConfig } from "@/config/storage";
import { generateId } from "@/lib/utils";
import type {
  InterviewPrepSession,
  SessionSummary,
} from "@/lib/types/interview-prep";
import { toSessionSummary } from "@/lib/types/interview-prep";

interface UseInterviewPrepHistoryReturn {
  /** List of session summaries for the history list */
  sessions: SessionSummary[];
  /** Whether the history is loading */
  isLoading: boolean;
  /** Total number of sessions */
  totalSessions: number;
  /** Average nailed percentage across all completed sessions */
  averageScore: number;
  /** Total practice time in seconds */
  totalPracticeTime: number;

  /** Create a new session and return its ID */
  createNewSession: () => string;
  /** Delete a session by ID */
  deleteSession: (sessionId: string) => void;
  /** Get full session data by ID */
  getSession: (sessionId: string) => InterviewPrepSession | null;
  /** Save a session (creates summary and stores full data) */
  saveSession: (session: InterviewPrepSession) => void;
  /** Clear all sessions */
  clearHistory: () => void;
  /** Refresh the session list from storage */
  refresh: () => void;
}

/**
 * Hook for managing interview prep session history
 */
export function useInterviewPrepHistory(): UseInterviewPrepHistoryReturn {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load sessions from localStorage
  const loadSessions = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageConfig.keys.interviewPrepSessions);
      if (stored) {
        const parsed = JSON.parse(stored) as SessionSummary[];
        // Sort by most recent first
        parsed.sort((a, b) => b.createdAt - a.createdAt);
        setSessions(parsed);
      } else {
        setSessions([]);
      }
    } catch (error) {
      console.error("Error loading interview prep sessions:", error);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Save sessions list to localStorage
  const saveSessions = useCallback((newSessions: SessionSummary[]) => {
    try {
      localStorage.setItem(
        storageConfig.keys.interviewPrepSessions,
        JSON.stringify(newSessions)
      );
    } catch (error) {
      console.error("Error saving interview prep sessions:", error);
    }
  }, []);

  // Create a new session
  const createNewSession = useCallback((): string => {
    const sessionId = generateId();
    return sessionId;
  }, []);

  // Get full session data
  const getSession = useCallback(
    (sessionId: string): InterviewPrepSession | null => {
      try {
        const key = storageConfig.keys.interviewPrepSession(sessionId);
        const stored = localStorage.getItem(key);
        if (stored) {
          return JSON.parse(stored) as InterviewPrepSession;
        }
      } catch (error) {
        console.error("Error loading session:", error);
      }
      return null;
    },
    []
  );

  // Save a session
  const saveSession = useCallback(
    (session: InterviewPrepSession) => {
      try {
        // Save full session data
        const key = storageConfig.keys.interviewPrepSession(session.id);
        localStorage.setItem(key, JSON.stringify(session));

        // Update session list
        const summary = toSessionSummary(session);
        setSessions((prev) => {
          const filtered = prev.filter((s) => s.id !== session.id);
          const updated = [summary, ...filtered];
          updated.sort((a, b) => b.createdAt - a.createdAt);
          saveSessions(updated);
          return updated;
        });
      } catch (error) {
        console.error("Error saving session:", error);
      }
    },
    [saveSessions]
  );

  // Delete a session
  const deleteSession = useCallback(
    (sessionId: string) => {
      try {
        // Remove full session data
        const key = storageConfig.keys.interviewPrepSession(sessionId);
        localStorage.removeItem(key);

        // Update session list
        setSessions((prev) => {
          const updated = prev.filter((s) => s.id !== sessionId);
          saveSessions(updated);
          return updated;
        });
      } catch (error) {
        console.error("Error deleting session:", error);
      }
    },
    [saveSessions]
  );

  // Clear all history
  const clearHistory = useCallback(() => {
    try {
      // Remove all session data
      sessions.forEach((s) => {
        const key = storageConfig.keys.interviewPrepSession(s.id);
        localStorage.removeItem(key);
      });

      // Clear session list
      localStorage.removeItem(storageConfig.keys.interviewPrepSessions);
      setSessions([]);
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  }, [sessions]);

  // Compute statistics
  const completedSessions = sessions.filter((s) => s.status === "completed");
  const totalSessions = sessions.length;
  const averageScore =
    completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce((acc, s) => acc + s.nailedPercentage, 0) /
            completedSessions.length
        )
      : 0;

  // Calculate total practice time from full session data
  const totalPracticeTime = sessions.reduce((acc, summary) => {
    const session = getSession(summary.id);
    if (session?.stats?.totalTimeSpent) {
      return acc + session.stats.totalTimeSpent;
    }
    return acc;
  }, 0);

  return {
    sessions,
    isLoading,
    totalSessions,
    averageScore,
    totalPracticeTime,
    createNewSession,
    deleteSession,
    getSession,
    saveSession,
    clearHistory,
    refresh: loadSessions,
  };
}
