"use client";

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "resumeforge_wizard_completed";
const WIZARD_STEPS_KEY = "resumeforge_wizard_step";

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  position?: "top" | "bottom" | "left" | "right";
  action?: string; // What they should do
  highlight?: boolean;
}

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: "welcome",
    title: "Welcome to ResumeForge!",
    description: "Build a professional resume in minutes. We'll guide you through each section step by step.",
    position: "bottom",
  },
  {
    id: "tips",
    title: "Quick Tips",
    description: "Use the navigation on the left to switch sections. Look for ✨ buttons to get AI help writing content. Your progress saves automatically.",
    targetSelector: "[data-wizard='section-nav']",
    position: "bottom",
  },
  {
    id: "complete",
    title: "You're Ready!",
    description: "Start with your personal info, then work through each section. When done, export your resume as a polished PDF.",
    position: "bottom",
  },
];

interface UseWizardModeReturn {
  isActive: boolean;
  currentStep: number;
  currentStepData: WizardStep | null;
  totalSteps: number;
  hasCompleted: boolean;
  startWizard: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skipWizard: () => void;
  resetWizard: () => void;
  progress: number;
}

export function useWizardMode(): UseWizardModeReturn {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(true); // Default to true to avoid flash

  // Check if wizard was completed on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const completed = localStorage.getItem(STORAGE_KEY);
    setHasCompleted(completed === "true");

    // Check for saved step
    const savedStep = localStorage.getItem(WIZARD_STEPS_KEY);
    if (savedStep) {
      const step = parseInt(savedStep, 10);
      if (!isNaN(step) && step >= 0 && step < WIZARD_STEPS.length) {
        setCurrentStep(step);
      }
    }
  }, []);

  const startWizard = useCallback(() => {
    setIsActive(true);
    setCurrentStep(0);
    if (typeof window !== "undefined") {
      localStorage.setItem(WIZARD_STEPS_KEY, "0");
    }
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      if (typeof window !== "undefined") {
        localStorage.setItem(WIZARD_STEPS_KEY, nextStepIndex.toString());
      }
    } else {
      // Wizard completed
      setIsActive(false);
      setHasCompleted(true);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, "true");
        localStorage.removeItem(WIZARD_STEPS_KEY);
      }
    }
  }, [currentStep]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      setCurrentStep(prevStepIndex);
      if (typeof window !== "undefined") {
        localStorage.setItem(WIZARD_STEPS_KEY, prevStepIndex.toString());
      }
    }
  }, [currentStep]);

  const skipWizard = useCallback(() => {
    setIsActive(false);
    setHasCompleted(true);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "true");
      localStorage.removeItem(WIZARD_STEPS_KEY);
    }
  }, []);

  const resetWizard = useCallback(() => {
    setHasCompleted(false);
    setCurrentStep(0);
    setIsActive(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(WIZARD_STEPS_KEY);
    }
  }, []);

  const currentStepData = isActive ? WIZARD_STEPS[currentStep] : null;
  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  return {
    isActive,
    currentStep,
    currentStepData,
    totalSteps: WIZARD_STEPS.length,
    hasCompleted,
    startWizard,
    nextStep,
    previousStep,
    skipWizard,
    resetWizard,
    progress,
  };
}
