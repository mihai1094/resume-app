"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ResumeData } from "@/lib/types/resume";
import { ResumeVersionMeta, ResumeVersion } from "@/lib/types/version";
import { versionService } from "@/lib/services/version-service";
import { FREE_TIER_LIMITS, PREMIUM_TIER_LIMITS } from "@/lib/config/credits";
import { toast } from "sonner";

interface UseVersionHistoryProps {
  userId: string | null;
  resumeId: string | null;
  isPremium: boolean;
  resumeData: ResumeData;
  onRestoreVersion: (data: ResumeData) => void;
}

interface UseVersionHistoryReturn {
  versions: ResumeVersionMeta[];
  isLoading: boolean;
  error: string | null;
  selectedVersion: ResumeVersion | null;
  isLoadingVersion: boolean;
  versionLimit: number;
  canSaveManualVersion: boolean;
  // Actions
  loadVersions: () => Promise<void>;
  saveManualVersion: (label?: string) => Promise<boolean>;
  loadVersion: (versionId: string) => Promise<void>;
  restoreVersion: (versionId: string) => Promise<boolean>;
  deleteVersion: (versionId: string) => Promise<boolean>;
  clearSelectedVersion: () => void;
}

// Auto-save interval: 5 minutes
const AUTO_SAVE_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Hook to manage resume version history
 */
export function useVersionHistory({
  userId,
  resumeId,
  isPremium,
  resumeData,
  onRestoreVersion,
}: UseVersionHistoryProps): UseVersionHistoryReturn {
  const [versions, setVersions] = useState<ResumeVersionMeta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<ResumeVersion | null>(null);
  const [isLoadingVersion, setIsLoadingVersion] = useState(false);

  // Track last saved data for change detection
  const lastSavedDataRef = useRef<ResumeData | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const versionLimit = isPremium
    ? PREMIUM_TIER_LIMITS.versionHistory
    : FREE_TIER_LIMITS.versionHistory;

  const canSaveManualVersion = isPremium;

  /**
   * Load versions from Firestore
   */
  const loadVersions = useCallback(async () => {
    if (!userId || !resumeId) {
      setVersions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const limit = isPremium ? undefined : FREE_TIER_LIMITS.versionHistory;
      const loadedVersions = await versionService.getVersions(userId, resumeId, limit);
      setVersions(loadedVersions);

      // Update last saved data reference
      if (loadedVersions.length > 0) {
        const latestVersion = await versionService.getVersion(
          userId,
          resumeId,
          loadedVersions[0].id
        );
        if (latestVersion) {
          lastSavedDataRef.current = latestVersion.data;
        }
      }
    } catch (err) {
      console.error("Failed to load versions:", err);
      setError("Failed to load version history");
    } finally {
      setIsLoading(false);
    }
  }, [userId, resumeId, isPremium]);

  /**
   * Save a manual version snapshot
   */
  const saveManualVersion = useCallback(
    async (label?: string): Promise<boolean> => {
      if (!userId || !resumeId) {
        toast.error("Cannot save version: Resume not saved yet");
        return false;
      }

      if (!isPremium) {
        toast.error("Manual snapshots require a Premium subscription");
        return false;
      }

      try {
        await versionService.saveVersion(
          userId,
          resumeId,
          resumeData,
          "manual",
          label,
          lastSavedDataRef.current
        );

        lastSavedDataRef.current = resumeData;
        await loadVersions();
        toast.success("Version saved successfully");
        return true;
      } catch (err) {
        console.error("Failed to save manual version:", err);
        toast.error("Failed to save version");
        return false;
      }
    },
    [userId, resumeId, isPremium, resumeData, loadVersions]
  );

  /**
   * Save an auto-save version (internal, called on interval)
   */
  const saveAutoVersion = useCallback(async () => {
    if (!userId || !resumeId) return;

    // Check if data actually changed
    if (
      lastSavedDataRef.current &&
      JSON.stringify(lastSavedDataRef.current) === JSON.stringify(resumeData)
    ) {
      return; // No changes, skip save
    }

    try {
      await versionService.saveVersion(
        userId,
        resumeId,
        resumeData,
        "auto",
        undefined,
        lastSavedDataRef.current
      );

      lastSavedDataRef.current = resumeData;

      // Clean up old auto-saves for free users
      if (!isPremium) {
        await versionService.deleteOldVersions(
          userId,
          resumeId,
          FREE_TIER_LIMITS.versionHistory
        );
      }

      // Refresh versions list
      await loadVersions();
    } catch (err) {
      console.error("Auto-save version failed:", err);
    }
  }, [userId, resumeId, resumeData, isPremium, loadVersions]);

  /**
   * Load a specific version with full data
   */
  const loadVersion = useCallback(
    async (versionId: string) => {
      if (!userId || !resumeId) return;

      setIsLoadingVersion(true);

      try {
        const version = await versionService.getVersion(userId, resumeId, versionId);
        setSelectedVersion(version);
      } catch (err) {
        console.error("Failed to load version:", err);
        toast.error("Failed to load version");
      } finally {
        setIsLoadingVersion(false);
      }
    },
    [userId, resumeId]
  );

  /**
   * Restore a version
   */
  const restoreVersion = useCallback(
    async (versionId: string): Promise<boolean> => {
      if (!userId || !resumeId) return false;

      try {
        const restoredData = await versionService.restoreVersion(
          userId,
          resumeId,
          versionId
        );

        if (restoredData) {
          onRestoreVersion(restoredData);
          lastSavedDataRef.current = restoredData;
          await loadVersions();
          setSelectedVersion(null);
          toast.success("Version restored successfully");
          return true;
        }

        toast.error("Failed to restore version");
        return false;
      } catch (err) {
        console.error("Failed to restore version:", err);
        toast.error("Failed to restore version");
        return false;
      }
    },
    [userId, resumeId, onRestoreVersion, loadVersions]
  );

  /**
   * Delete a version
   */
  const deleteVersion = useCallback(
    async (versionId: string): Promise<boolean> => {
      if (!userId || !resumeId) return false;

      try {
        const success = await versionService.deleteVersion(userId, resumeId, versionId);

        if (success) {
          await loadVersions();
          if (selectedVersion?.id === versionId) {
            setSelectedVersion(null);
          }
          toast.success("Version deleted");
          return true;
        }

        toast.error("Cannot delete this version");
        return false;
      } catch (err) {
        console.error("Failed to delete version:", err);
        toast.error("Failed to delete version");
        return false;
      }
    },
    [userId, resumeId, loadVersions, selectedVersion?.id]
  );

  const clearSelectedVersion = useCallback(() => {
    setSelectedVersion(null);
  }, []);

  // Set up auto-save timer
  useEffect(() => {
    if (!userId || !resumeId) return;

    // Clear any existing timer
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }

    // Set up new timer
    autoSaveTimerRef.current = setInterval(() => {
      saveAutoVersion();
    }, AUTO_SAVE_INTERVAL_MS);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [userId, resumeId, saveAutoVersion]);

  // Load versions on mount
  useEffect(() => {
    if (userId && resumeId) {
      loadVersions();
    }
  }, [userId, resumeId, loadVersions]);

  return {
    versions,
    isLoading,
    error,
    selectedVersion,
    isLoadingVersion,
    versionLimit,
    canSaveManualVersion,
    loadVersions,
    saveManualVersion,
    loadVersion,
    restoreVersion,
    deleteVersion,
    clearSelectedVersion,
  };
}
