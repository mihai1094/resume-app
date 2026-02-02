"use client";

import { useEffect, useCallback, useRef } from "react";
import { useResumeEditorState } from "./use-resume-editor-state";
import { BREAKPOINTS, TIMING } from "@/lib/constants/defaults";
import { TemplateId } from "@/lib/constants/templates";

/**
 * Presentation hook for ResumeEditor UI
 * Handles UI state like mobile/desktop, preview visibility, template customization, etc.
 * Extracted from ResumeEditor to keep it focused on data/persistence
 */
export function useResumeEditorUI(initialTemplateId: TemplateId = "modern") {
  const {
    selectedTemplateId,
    setSelectedTemplateId,
    templateCustomization,
    setTemplateCustomization,
    activeSection,
    setActiveSection,
    isMobile,
    setIsMobile,
    showPreview,
    setShowPreview,
    togglePreview,
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebar,
    showCustomizer,
    setShowCustomizer,
    toggleCustomizer,
    showTemplateGallery,
    setShowTemplateGallery,
    showResetConfirmation,
    setShowResetConfirmation,
  } = useResumeEditorState(initialTemplateId);

  // Track if we've already applied the loaded template to prevent overriding manual changes
  const hasAppliedLoadedTemplate = useRef(false);

  // Initialize mobile and preview state after mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mobile = window.innerWidth < BREAKPOINTS.lg;
      setIsMobile(mobile);
      // On mobile/tablet, show form by default; on desktop, show preview
      setShowPreview(!mobile);
    }
  }, [setIsMobile, setShowPreview]);

  // Detect mobile/desktop viewport changes
  useEffect(() => {
    const checkViewport = () => {
      if (typeof window === "undefined") return;
      const mobile = window.innerWidth < BREAKPOINTS.lg;
      const wasMobile = isMobile;

      setIsMobile(mobile);

      // If switching from desktop to mobile, show form by default
      if (!wasMobile && mobile) {
        setShowPreview(false);
      }
      // If switching from mobile to desktop, show preview by default
      if (wasMobile && !mobile) {
        setShowPreview(true);
      }
    };

    // Check on mount
    checkViewport();

    // Use matchMedia for more reliable breakpoint detection
    const mediaQuery = window.matchMedia(`(min-width: ${BREAKPOINTS.lg}px)`);
    const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const isDesktop = e.matches;
      const wasMobile = isMobile;
      setIsMobile(!isDesktop);

      // If switching from desktop to mobile, show form by default
      if (!wasMobile && !isDesktop) {
        setShowPreview(false);
      }
      // If switching from mobile to desktop, show preview by default
      if (wasMobile && isDesktop) {
        setShowPreview(true);
      }
    };

    // Check initial state
    handleMediaChange(mediaQuery);

    // Listen for changes with debounce to avoid excessive updates
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkViewport, TIMING.resizeDebounce);
    };

    window.addEventListener("resize", handleResize);

    // Listen for media query changes
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, [isMobile, setIsMobile, setShowPreview]);

  const updateLoadedTemplate = useCallback(
    (loadedTemplateId: TemplateId | null) => {
      if (!loadedTemplateId) return;
      // Only apply loaded template once, on initial load
      // After that, user can change template freely without it being reset
      if (hasAppliedLoadedTemplate.current) return;

      setSelectedTemplateId((current) => {
        // Only update if different to avoid unnecessary re-renders
        if (current === loadedTemplateId) {
          hasAppliedLoadedTemplate.current = true;
          return current;
        }
        hasAppliedLoadedTemplate.current = true;
        return loadedTemplateId;
      });
    },
    [setSelectedTemplateId]
  );

  return {
    // Template state
    selectedTemplateId,
    setSelectedTemplateId,
    templateCustomization,
    setTemplateCustomization,

    // Section state
    activeSection,
    setActiveSection,

    // UI state
    isMobile,
    showPreview,
    togglePreview,
    sidebarCollapsed,
    toggleSidebar,
    showCustomizer,
    setShowCustomizer,
    toggleCustomizer,
    showTemplateGallery,
    setShowTemplateGallery,
    showResetConfirmation,
    setShowResetConfirmation,

    // Utilities
    updateLoadedTemplate,
  };
}
