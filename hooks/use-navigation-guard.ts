"use client";

import React, { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";

interface UseNavigationGuardOptions {
  /**
   * Whether there are unsaved changes that need protection
   */
  isDirty: boolean;
  /**
   * Message to show in the browser's beforeunload dialog
   */
  message?: string;
  /**
   * Callback when user tries to navigate away with unsaved changes
   * Return true to allow navigation, false to block
   */
  onNavigateAway?: () => boolean;
}

/**
 * Hook to protect against accidental navigation with unsaved changes.
 *
 * Features:
 * - Warns before browser refresh/close (beforeunload)
 * - Provides safe navigation methods that respect unsaved state
 * - Tracks navigation history for smart back behavior
 */
export function useNavigationGuard({
  isDirty,
  message = "You have unsaved changes. Are you sure you want to leave?",
  onNavigateAway,
}: UseNavigationGuardOptions) {
  const router = useRouter();
  const [hasHistory, setHasHistory] = useState(false);
  const [previousPath, setPreviousPath] = useState<string | null>(null);

  // Track that user has navigated within the app (for smart back)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Store the referrer when component mounts
      const referrer = document.referrer;
      if (referrer && referrer.includes(window.location.origin)) {
        // User came from within the app
        setHasHistory(true);
        try {
          setPreviousPath(new URL(referrer).pathname);
        } catch {
          setPreviousPath(null);
        }
      }
    }
  }, []);

  // Warn before browser refresh/close
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Modern browsers ignore custom messages, but we set it anyway
      e.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, message]);

  /**
   * Check if navigation should be allowed
   */
  const canNavigate = useCallback((): boolean => {
    if (!isDirty) return true;

    if (onNavigateAway) {
      return onNavigateAway();
    }

    // Fallback to browser confirm
    return window.confirm(message);
  }, [isDirty, message, onNavigateAway]);

  /**
   * Safe navigation that checks for unsaved changes
   */
  const safeNavigate = useCallback((path: string) => {
    if (canNavigate()) {
      router.push(path);
    }
  }, [canNavigate, router]);

  /**
   * Smart back navigation:
   * 1. If came from within the app, use router.back()
   * 2. Otherwise, go to a sensible default (dashboard)
   */
  const safeGoBack = useCallback((fallbackPath: string = "/dashboard") => {
    if (!canNavigate()) return;

    // Check if there's history to go back to
    if (hasHistory && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackPath);
    }
  }, [canNavigate, router, hasHistory]);

  /**
   * Force navigation without checking unsaved changes
   * Use only after user has confirmed they want to discard changes
   */
  const forceNavigate = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  /**
   * Force back navigation without checking unsaved changes
   */
  const forceGoBack = useCallback((fallbackPath: string = "/dashboard") => {
    if (hasHistory && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackPath);
    }
  }, [router, hasHistory]);

  return React.useMemo(() => ({
    canNavigate,
    safeNavigate,
    safeGoBack,
    forceNavigate,
    forceGoBack,
    hasHistory,
    previousPath,
  }), [canNavigate, safeNavigate, safeGoBack, forceNavigate, forceGoBack, hasHistory, previousPath]);
}

/**
 * Determine the best "back" destination based on context
 */
export function getBackDestination(currentPath: string): string {
  // Editor pages → Dashboard
  if (currentPath.startsWith("/editor")) {
    return "/dashboard";
  }

  // Onboarding → Dashboard (if logged in) or Home
  if (currentPath.startsWith("/onboarding")) {
    return "/dashboard";
  }

  // Settings → Dashboard
  if (currentPath.startsWith("/settings")) {
    return "/dashboard";
  }

  // Cover letter → Dashboard
  if (currentPath.startsWith("/cover-letter")) {
    return "/dashboard";
  }

  // Preview → Dashboard
  if (currentPath.startsWith("/preview")) {
    return "/dashboard";
  }

  // Blog posts → Blog index
  if (currentPath.startsWith("/blog/")) {
    return "/blog";
  }

  // Default to home
  return "/";
}
