"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowLeft,
  FileText,
  Sparkles,
  CheckCircle2,
  Briefcase,
  Zap,
  Shield,
  Target,
} from "lucide-react";
import { TemplateStep } from "./components/template-step";
import { TemplateId } from "@/lib/constants/templates";
import { getTemplateDefaultColor } from "@/lib/constants/color-palettes";
import { useLastUsedTemplate } from "@/hooks/use-last-used-template";
import Link from "next/link";
import { AuthGuard } from "@/components/auth/auth-guard";
import { sanitizeAuthRedirectPath } from "@/lib/utils/auth-redirect";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, title: "Start", description: "Choose how to begin" },
  { id: 2, title: "Template", description: "Pick your design" },
];

const benefits = [
  { icon: Zap, text: "30 free AI credits — write bullets, summaries & cover letters with one click" },
  { icon: Shield, text: "ATS-optimized templates that get past automated filters" },
  { icon: Target, text: "Content suggestions tailored to your target role" },
];

const ONBOARDING_STORAGE_KEY = "onboarding_preferences";

interface OnboardingPreferences {
  jobTitle: string;
  templateId: TemplateId | null;
  currentStep: number;
}

function saveOnboardingPreferences(prefs: OnboardingPreferences) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(prefs));
  }
}

function loadOnboardingPreferences(): OnboardingPreferences | null {
  if (typeof window !== "undefined") {
    const saved = sessionStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
  }
  return null;
}

function clearOnboardingPreferences() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(ONBOARDING_STORAGE_KEY);
  }
}

export function OnboardingContent() {
  const router = useRouter();
  const { setLastUsed } = useLastUsedTemplate();
  const [currentStep, setCurrentStep] = useState(1);
  const [jobTitle, setJobTitle] = useState("");
  const [templateId, setTemplateId] = useState<TemplateId | null>(null);
  const [hasLoadedPrefs, setHasLoadedPrefs] = useState(false);
  // +1 when advancing, -1 when going back — drives slide direction in AnimatePresence
  // so users feel "forward = left, back = right" instead of always sliding the same way.
  const [stepDirection, setStepDirection] = useState<1 | -1>(1);

  const totalSteps = 2;

  // Load saved preferences on mount (after login redirect)
  useEffect(() => {
    if (hasLoadedPrefs) return;

    // First, check if there's a returnTo URL with template info from auth redirect
    const redirectInfo = sessionStorage.getItem("auth_redirect");
    if (redirectInfo) {
      try {
        const { returnTo } = JSON.parse(redirectInfo);
        const safeReturnTo = sanitizeAuthRedirectPath(returnTo);
        if (safeReturnTo && safeReturnTo.includes("/editor")) {
          // User already selected template before login - go directly to editor
          sessionStorage.removeItem("auth_redirect_toast_key");
          sessionStorage.removeItem("auth_redirect");
          clearOnboardingPreferences();
          router.push(safeReturnTo);
          return;
        }
      } catch {
        // Ignore parsing errors
      }
    }

    // Otherwise, load any saved onboarding preferences
    const saved = loadOnboardingPreferences();
    if (saved) {
      if (saved.jobTitle) setJobTitle(saved.jobTitle);
      if (saved.templateId) setTemplateId(saved.templateId);
      if (saved.currentStep) setCurrentStep(saved.currentStep);
    }
    setHasLoadedPrefs(true);
  }, [hasLoadedPrefs, router]);

  // Save preferences whenever they change
  useEffect(() => {
    if (!hasLoadedPrefs) return;

    saveOnboardingPreferences({
      jobTitle,
      templateId,
      currentStep,
    });
  }, [jobTitle, templateId, currentStep, hasLoadedPrefs]);

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps) {
      setStepDirection(1);
      setCurrentStep(currentStep + 1);
    } else if (currentStep === totalSteps) {
      // Clear saved preferences since onboarding is complete
      clearOnboardingPreferences();

      // Persist the chosen template so the gallery's "Quick start" banner
      // picks it up on the user's next visit.
      if (templateId) {
        setLastUsed(templateId, getTemplateDefaultColor(templateId).id);
      }

      const params = new URLSearchParams({
        template: templateId || "",
        ...(jobTitle && { jobTitle }),
      });
      router.push(`/editor/new?${params.toString()}`);
    }
  }, [currentStep, totalSteps, templateId, jobTitle, router, setLastUsed]);

  const handleBack = () => {
    if (currentStep > 1) {
      setStepDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = useCallback(() => {
    // Step 1 (job title) is optional — users can move on without entering one.
    // Template recommendations fall back to generic when jobTitle is empty.
    if (currentStep === 1) return true;
    if (currentStep === 2) return templateId !== null;
    return true;
  }, [currentStep, templateId]);

  // Handle Enter key to proceed to next step.
  // Guard against interactive elements so pressing Enter on a role chip
  // doesn't simultaneously fire the chip click AND advance the step.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || !canProceed()) return;
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLButtonElement ||
        target instanceof HTMLSelectElement ||
        target.isContentEditable
      ) {
        return;
      }
      e.preventDefault();
      handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canProceed, handleNext]);

  return (
    <AuthGuard>
      <div className="min-h-screen flex">
        {/* Left Panel - Branding & Progress */}
        <div className="hidden lg:flex lg:w-[35%] xl:w-[30%] bg-gradient-to-br from-primary/10 via-background to-accent/10 relative overflow-hidden border-r border-border/60">
          {/* Decorative elements — warmer, matches homepage ambience */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 flex flex-col justify-between p-10 xl:p-12 text-foreground w-full">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold"
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              ResumeZeus
            </Link>

            {/* Steps Progress */}
            <div className="space-y-8">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                  Getting Started
                </p>
                <h1 className="h-1">
                  Let&apos;s build your
                  <br />
                  <span className="text-primary italic">perfect resume</span>
                </h1>
              </div>

              {/* Vertical Step Indicator */}
              <div className="space-y-4">
                {steps.map((step, index) => {
                  const isCompleted = step.id < currentStep;
                  const isCurrent = step.id === currentStep;

                  return (
                    <div key={step.id} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300",
                            isCompleted
                              ? "bg-primary text-primary-foreground"
                              : isCurrent
                              ? "bg-primary text-primary-foreground ring-4 ring-primary/30"
                              : "bg-muted text-muted-foreground border border-border",
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            step.id
                          )}
                        </div>
                        {index < steps.length - 1 && (
                          <div
                            className={cn(
                              "w-0.5 h-8 mt-2 transition-all duration-300",
                              isCompleted ? "bg-primary" : "bg-border",
                            )}
                          />
                        )}
                      </div>
                      <div className="pt-2">
                        <p
                          className={cn(
                            "font-semibold transition-colors",
                            isCurrent ? "text-foreground" : "text-muted-foreground",
                          )}
                        >
                          {step.title}
                        </p>
                        <p className="text-sm text-muted-foreground/80">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Benefits */}
              <div className="space-y-3 pt-4 border-t border-border/60">
                {benefits.map((benefit, i) => (
                  <motion.div
                    key={benefit.text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3 text-sm text-muted-foreground"
                  >
                    <benefit.icon className="w-4 h-4 text-primary" />
                    {benefit.text}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <p className="text-xs text-muted-foreground/70">
              Set up takes ~2 min · 30 AI credits included free
            </p>
          </div>
        </div>

        {/* Right Panel - Form Content */}
        <div className="flex-1 flex flex-col bg-background overflow-y-auto">
          {/* Mobile Header */}
          <div className="lg:hidden sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <Link href="/" className="flex items-center gap-2 font-bold">
                  <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                  ResumeZeus
                </Link>
                <span className="text-xs text-muted-foreground">
                  Step {currentStep} of {totalSteps}
                </span>
              </div>
              {/* Mobile Progress Bar */}
              <div className="flex gap-2">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-all duration-300",
                      step.id <= currentStep ? "bg-primary" : "bg-muted",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex items-start lg:items-center justify-center p-6 pb-28 sm:p-8 sm:pb-28 lg:p-12 lg:pb-28">
            <div className="w-full max-w-4xl">
              <AnimatePresence mode="wait" custom={stepDirection}>
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    custom={stepDirection}
                    initial={{ opacity: 0, x: stepDirection === 1 ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: stepDirection === 1 ? -20 : 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    {/* Step 1 Header */}
                    <div className="text-center space-y-3">
                      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        How would you like to start?
                      </h2>
                      <p className="text-muted-foreground max-w-lg mx-auto">
                        Enter your target role for tailored template suggestions — or skip and pick any template.
                      </p>
                    </div>

                    {/* Start from scratch */}
                    <div
                      className={cn(
                        "rounded-2xl border-2 p-6 sm:p-8 transition-all duration-300 max-w-2xl mx-auto",
                        "border-border hover:border-primary/50",
                        "hover:shadow-lg hover:shadow-primary/5 dark:hover:shadow-primary/20",
                      )}
                    >
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                          <FileText className="w-7 h-7 text-foreground" />
                        </div>
                        <div className="space-y-1.5">
                          <h3 className="text-lg font-semibold">
                            Start from scratch
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Enter your target job title and we&apos;ll suggest
                            templates and content for you.
                          </p>
                        </div>

                        <div className="w-full pt-2">
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center">
                              <span className="bg-background px-3 text-xs text-muted-foreground uppercase tracking-wider">
                                Enter your target role
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="w-full space-y-3">
                          <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                              type="text"
                              placeholder="e.g., Software Engineer"
                              value={jobTitle}
                              onChange={(e) => setJobTitle(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 text-sm border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-background"
                            />
                          </div>
                          {jobTitle && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Great choice! Click Next to pick a template.
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Popular Roles */}
                    {!jobTitle && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center space-y-3"
                      >
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          Popular roles
                        </p>
                        <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                          {[
                            "Software Engineer",
                            "Product Manager",
                            "Data Scientist",
                            "UX Designer",
                            "Marketing Manager",
                            "Business Analyst",
                          ].map((role) => (
                            <button
                              key={role}
                              onClick={() => setJobTitle(role)}
                              className="px-3 py-1.5 text-sm rounded-full border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    custom={stepDirection}
                    initial={{ opacity: 0, x: stepDirection === 1 ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: stepDirection === 1 ? -20 : 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TemplateStep
                      jobTitle={jobTitle}
                      selectedTemplate={templateId}
                      onSelectTemplate={setTemplateId}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="fixed inset-x-0 bottom-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t pb-[env(safe-area-inset-bottom)]">
            <div className="max-w-4xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className={cn(currentStep === 1 && "invisible")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <div className="flex items-center gap-3">
                  <Link href="/editor/new">
                    <Button variant="ghost" className="text-muted-foreground">
                      Skip setup
                    </Button>
                  </Link>
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="min-w-[120px]"
                  >
                    {currentStep === totalSteps ? "Create Resume" : "Next"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AuthGuard>
  );
}
