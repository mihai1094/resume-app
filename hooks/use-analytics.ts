"use client";

import { useState, useEffect, useCallback } from "react";
import { analyticsService } from "@/lib/services/analytics-service";
import {
  AnalyticsSummary,
  RecentActivity,
  EMPTY_ANALYTICS_SUMMARY,
} from "@/lib/types/analytics";

interface UseAnalyticsOptions {
  autoFetch?: boolean;
  activityLimit?: number;
}

interface UseAnalyticsResult {
  summary: AnalyticsSummary;
  recentActivity: RecentActivity[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage analytics data for a resume
 */
export function useAnalytics(
  resumeId: string | null,
  options: UseAnalyticsOptions = {}
): UseAnalyticsResult {
  const { autoFetch = true, activityLimit = 20 } = options;

  const [summary, setSummary] = useState<AnalyticsSummary>(EMPTY_ANALYTICS_SUMMARY);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!resumeId) return;

    setIsLoading(true);
    setError(null);

    try {
      const [summaryData, activityData] = await Promise.all([
        analyticsService.getAnalyticsSummary(resumeId),
        analyticsService.getRecentEvents(resumeId, activityLimit),
      ]);

      setSummary(summaryData);
      setRecentActivity(activityData);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch analytics"));
    } finally {
      setIsLoading(false);
    }
  }, [resumeId, activityLimit]);

  useEffect(() => {
    if (autoFetch && resumeId) {
      fetchAnalytics();
    }
  }, [autoFetch, resumeId, fetchAnalytics]);

  return {
    summary,
    recentActivity,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
}
