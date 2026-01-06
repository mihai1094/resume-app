"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  JobApplication,
  ApplicationStatus,
  ApplicationStats,
  CreateApplicationInput,
  UpdateApplicationInput,
  KANBAN_COLUMNS,
} from "@/lib/types/application";
import {
  applicationService,
  PlanLimitError,
  PlanId,
} from "@/lib/services/application-service";
import { useUser } from "./use-user";

export interface UseApplicationsReturn {
  applications: JobApplication[];
  applicationsByStatus: Record<ApplicationStatus, JobApplication[]>;
  stats: ApplicationStats;
  isLoading: boolean;
  error: string | null;
  createApplication: (
    data: CreateApplicationInput
  ) => Promise<JobApplication | PlanLimitError | null>;
  updateApplication: (
    id: string,
    updates: UpdateApplicationInput
  ) => Promise<boolean>;
  deleteApplication: (id: string) => Promise<boolean>;
  moveApplication: (id: string, newStatus: ApplicationStatus) => Promise<boolean>;
  getApplicationById: (id: string) => JobApplication | undefined;
}

export function useApplications(userId: string | null): UseApplicationsReturn {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  // Subscribe to real-time updates
  useEffect(() => {
    if (!userId) {
      setApplications([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const unsubscribe = applicationService.subscribeToApplications(
        userId,
        (firestoreApplications) => {
          setApplications(firestoreApplications);
          setIsLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error("Failed to subscribe to applications:", err);
      setError("Failed to load applications");
      setApplications([]);
      setIsLoading(false);
    }
  }, [userId]);

  // Group applications by status for Kanban board
  const applicationsByStatus = useMemo(() => {
    const grouped: Record<ApplicationStatus, JobApplication[]> = {
      wishlist: [],
      applied: [],
      screening: [],
      interviewing: [],
      offer: [],
      rejected: [],
    };

    applications.forEach((app) => {
      grouped[app.status].push(app);
    });

    // Sort each column by updatedAt (most recent first)
    Object.keys(grouped).forEach((status) => {
      grouped[status as ApplicationStatus].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });

    return grouped;
  }, [applications]);

  // Calculate statistics
  const stats = useMemo(() => {
    return applicationService.getApplicationStats(applications);
  }, [applications]);

  // Create a new application
  const createApplication = useCallback(
    async (data: CreateApplicationInput) => {
      if (!userId) return null;

      try {
        const result = await applicationService.createApplication(
          userId,
          data,
          (user?.plan as PlanId) || "free"
        );

        if ("code" in result && result.code === "PLAN_LIMIT") {
          return result as PlanLimitError;
        }

        // Optimistic update - add to local state
        if ("id" in result) {
          setApplications((prev) => [result, ...prev]);
          return result;
        }

        return null;
      } catch (err) {
        console.error("Failed to create application:", err);
        setError("Failed to create application");
        return null;
      }
    },
    [userId, user?.plan]
  );

  // Update an application
  const updateApplication = useCallback(
    async (id: string, updates: UpdateApplicationInput) => {
      if (!userId) return false;

      // Optimistic update
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id
            ? { ...app, ...updates, updatedAt: new Date().toISOString() }
            : app
        )
      );

      try {
        const success = await applicationService.updateApplication(
          userId,
          id,
          updates
        );

        if (!success) {
          // Revert optimistic update on failure
          // The subscription will sync the correct state
          setError("Failed to update application");
        }

        return success;
      } catch (err) {
        console.error("Failed to update application:", err);
        setError("Failed to update application");
        return false;
      }
    },
    [userId]
  );

  // Delete an application
  const deleteApplication = useCallback(
    async (id: string) => {
      if (!userId) return false;

      // Optimistic update
      const previousApplications = [...applications];
      setApplications((prev) => prev.filter((app) => app.id !== id));

      try {
        const success = await applicationService.deleteApplication(userId, id);

        if (!success) {
          // Revert optimistic update on failure
          setApplications(previousApplications);
          setError("Failed to delete application");
        }

        return success;
      } catch (err) {
        console.error("Failed to delete application:", err);
        setApplications(previousApplications);
        setError("Failed to delete application");
        return false;
      }
    },
    [userId, applications]
  );

  // Move application to a new status (for drag-and-drop)
  const moveApplication = useCallback(
    async (id: string, newStatus: ApplicationStatus) => {
      if (!userId) return false;

      // Find the application
      const app = applications.find((a) => a.id === id);
      if (!app || app.status === newStatus) return false;

      // Optimistic update
      const updates: UpdateApplicationInput = {
        status: newStatus,
        // Set appliedAt if moving to applied and not already set
        ...(newStatus === "applied" && !app.appliedAt
          ? { appliedAt: new Date().toISOString() }
          : {}),
      };

      setApplications((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, ...updates, updatedAt: new Date().toISOString() }
            : a
        )
      );

      try {
        const success = await applicationService.moveApplication(
          userId,
          id,
          newStatus
        );

        if (!success) {
          setError("Failed to move application");
        }

        return success;
      } catch (err) {
        console.error("Failed to move application:", err);
        setError("Failed to move application");
        return false;
      }
    },
    [userId, applications]
  );

  // Get application by ID
  const getApplicationById = useCallback(
    (id: string) => {
      return applications.find((app) => app.id === id);
    },
    [applications]
  );

  return {
    applications,
    applicationsByStatus,
    stats,
    isLoading,
    error,
    createApplication,
    updateApplication,
    deleteApplication,
    moveApplication,
    getApplicationById,
  };
}
