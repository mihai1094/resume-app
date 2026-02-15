"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  Achievement,
  AchievementId,
  AchievementState,
  ACHIEVEMENTS,
  calculateLevel,
  getNextLevelThreshold,
} from "@/lib/types/achievements";

const STORAGE_KEY = "resumeforge_achievements";

function getInitialState(): AchievementState {
  const achievements: Record<AchievementId, Achievement> = {} as Record<
    AchievementId,
    Achievement
  >;

  // Initialize all achievements as locked
  Object.entries(ACHIEVEMENTS).forEach(([id, achievement]) => {
    achievements[id as AchievementId] = {
      ...achievement,
      unlockedAt: undefined,
      progress: achievement.id === "five_exports"
        ? { current: 0, target: 5 }
        : achievement.id === "ten_exports"
        ? { current: 0, target: 10 }
        : achievement.id === "ai_master"
        ? { current: 0, target: 10 }
        : undefined,
    };
  });

  return {
    achievements,
    totalPoints: 0,
    level: 1,
    lastUnlocked: undefined,
  };
}

function loadState(): AchievementState {
  if (typeof window === "undefined") {
    return getInitialState();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults and always refresh metadata (title/description/icon/points)
      // from current ACHIEVEMENTS definitions. Keep only user state fields.
      const initial = getInitialState();
      const mergedAchievements = { ...initial.achievements };

      (Object.keys(initial.achievements) as AchievementId[]).forEach((id) => {
        const fromStorage = parsed?.achievements?.[id];
        if (!fromStorage) return;

        mergedAchievements[id] = {
          ...initial.achievements[id], // latest metadata
          unlockedAt: fromStorage.unlockedAt,
          progress: fromStorage.progress ?? initial.achievements[id].progress,
        };
      });

      return {
        ...initial,
        ...parsed,
        achievements: mergedAchievements,
      };
    }
  } catch (e) {
    console.error("Failed to load achievements:", e);
  }

  return getInitialState();
}

function saveState(state: AchievementState): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save achievements:", e);
  }
}

export function useAchievements() {
  const [state, setState] = useState<AchievementState>(getInitialState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setState(loadState());
    setIsInitialized(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isInitialized) {
      saveState(state);
    }
  }, [state, isInitialized]);

  const celebrateAchievement = useCallback((achievement: Achievement) => {
    // Confetti burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3"],
    });

    // Toast notification
    toast.success(
      <div className="flex items-center gap-3">
        <span className="text-2xl">{achievement.icon}</span>
        <div>
          <p className="font-semibold">{achievement.title} Unlocked!</p>
          <p className="text-sm text-muted-foreground">
            {achievement.description}
          </p>
          <p className="text-xs text-primary mt-1">
            +{achievement.points} points
          </p>
        </div>
      </div>,
      {
        duration: 5000,
      }
    );
  }, []);

  const unlockAchievement = useCallback(
    (achievementId: AchievementId) => {
      setState((prev) => {
        const achievement = prev.achievements[achievementId];

        // Already unlocked
        if (achievement.unlockedAt) {
          return prev;
        }

        const updatedAchievement = {
          ...achievement,
          unlockedAt: new Date().toISOString(),
        };

        const newTotalPoints = prev.totalPoints + achievement.points;
        const newLevel = calculateLevel(newTotalPoints);
        const leveledUp = newLevel > prev.level;

        // Celebrate
        setTimeout(() => {
          celebrateAchievement(updatedAchievement);
          if (leveledUp) {
            setTimeout(() => {
              toast.success(`Level Up! You're now Level ${newLevel}`, {
                icon: "🎮",
                duration: 4000,
              });
            }, 1500);
          }
        }, 100);

        return {
          ...prev,
          achievements: {
            ...prev.achievements,
            [achievementId]: updatedAchievement,
          },
          totalPoints: newTotalPoints,
          level: newLevel,
          lastUnlocked: achievementId,
        };
      });
    },
    [celebrateAchievement]
  );

  const updateProgress = useCallback(
    (achievementId: AchievementId, increment: number = 1) => {
      setState((prev) => {
        const achievement = prev.achievements[achievementId];

        // Already unlocked or no progress tracking
        if (achievement.unlockedAt || !achievement.progress) {
          return prev;
        }

        const newCurrent = Math.min(
          achievement.progress.current + increment,
          achievement.progress.target
        );

        const updatedAchievement = {
          ...achievement,
          progress: {
            ...achievement.progress,
            current: newCurrent,
          },
        };

        const newState = {
          ...prev,
          achievements: {
            ...prev.achievements,
            [achievementId]: updatedAchievement,
          },
        };

        // Check if target reached
        if (newCurrent >= achievement.progress.target) {
          // Unlock in next tick to avoid state update conflicts
          setTimeout(() => unlockAchievement(achievementId), 0);
        }

        return newState;
      });
    },
    [unlockAchievement]
  );

  const checkTimeBasedAchievements = useCallback(() => {
    // Deprecated: time-of-day achievements are intentionally disabled.
    // Keep the API to avoid breaking callers.
    return;
  }, []);

  const getUnlockedCount = useCallback(() => {
    return Object.values(state.achievements).filter((a) => a.unlockedAt).length;
  }, [state.achievements]);

  const getProgressToNextLevel = useCallback(() => {
    const nextThreshold = getNextLevelThreshold(state.level);
    const prevThreshold =
      state.level > 1 ? getNextLevelThreshold(state.level - 1) : 0;
    const progress = state.totalPoints - prevThreshold;
    const needed = nextThreshold - prevThreshold;
    return {
      current: progress,
      needed,
      percentage: Math.min(100, Math.round((progress / needed) * 100)),
    };
  }, [state.totalPoints, state.level]);

  return {
    achievements: state.achievements,
    totalPoints: state.totalPoints,
    level: state.level,
    lastUnlocked: state.lastUnlocked,
    unlockAchievement,
    updateProgress,
    checkTimeBasedAchievements,
    getUnlockedCount,
    getProgressToNextLevel,
    isInitialized,
  };
}
