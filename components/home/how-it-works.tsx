"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FileText,
  Edit,
  Download,
  Check,
  ArrowRight,
  Sparkles,
  FileDown,
} from "lucide-react";
import { TemplateMiniPreview } from "@/components/home/template-mini-preview";

const STEPS = [
  {
    id: 0,
    title: "Pick a Template",
    description:
      "Choose an ATS-friendly layout that matches your role and style.",
    icon: FileText,
  },
  {
    id: 1,
    title: "Add Your Experience",
    description:
      "Fill in your work history, education, and skills. Use AI to improve clarity and impact.",
    icon: Edit,
  },
  {
    id: 2,
    title: "Export and Apply",
    description: "Download a clean PDF and start applying with confidence.",
    icon: Download,
  },
];

const PREVIEW_TEMPLATES = ["modern", "minimalist", "timeline", "classic"];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    // Only auto-advance on desktop where the visual preview is visible
    const mql = window.matchMedia("(min-width: 1024px)");
    if (!mql.matches) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 4000);

    const handleChange = (e: MediaQueryListEvent) => {
      if (!e.matches) clearInterval(interval);
    };
    mql.addEventListener("change", handleChange);

    return () => {
      clearInterval(interval);
      mql.removeEventListener("change", handleChange);
    };
  }, [isPaused]);

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
      {/* Left Column: Navigation Steps */}
      <div className="space-y-4 lg:space-y-6">
        {STEPS.map((step, index) => {
          const isActive = activeStep === index;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={cn(
                "relative p-4 lg:p-6 rounded-xl lg:cursor-pointer transition-all duration-300 border-2",
                isActive
                  ? "bg-background border-primary shadow-lg scale-[1.02] border-l-4 border-l-primary"
                  : "bg-muted/30 border-transparent hover:bg-muted/50",
              )}
              onClick={() => {
                setActiveStep(index);
                setIsPaused(true);
              }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Progress Bar for Active Step */}
              {isActive && (
                <div className="absolute bottom-0 left-0 h-1 bg-primary transition-all [transition-duration:4000ms] ease-linear w-full rounded-b-xl" />
              )}

              <div className="flex items-start gap-3 lg:gap-4">
                <div
                  className={cn(
                    "w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center transition-colors duration-300 shrink-0",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h3
                    className={cn(
                      "font-semibold text-base lg:text-lg transition-colors",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Column: Dynamic Visual Preview - Desktop only */}
      <div className="relative h-[500px] hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-primary/[0.02] rounded-3xl" />

        <div className="relative h-full w-full flex items-center justify-center p-8">
          {/* Step 1: Real template thumbnails */}
          <div
            className={cn(
              "absolute inset-0 transition-all duration-500 flex items-center justify-center",
              activeStep === 0
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8 pointer-events-none",
            )}
          >
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              {PREVIEW_TEMPLATES.map((id, i) => (
                <Card
                  key={id}
                  className={cn(
                    "overflow-hidden border-2 transition-all duration-500",
                    i === 0
                      ? "border-primary shadow-xl scale-105 ring-4 ring-primary/10"
                      : "border-border opacity-60",
                  )}
                >
                  <div className="h-28 overflow-hidden">
                    <TemplateMiniPreview templateId={id} />
                  </div>
                  {i === 0 && (
                    <div className="flex justify-center py-1.5 bg-background">
                      <div className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Selected
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Step 2: Realistic form with AI suggestion */}
          <div
            className={cn(
              "absolute inset-0 transition-all duration-500 flex items-center justify-center",
              activeStep === 1
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8 pointer-events-none",
            )}
          >
            <Card className="w-full max-w-md p-6 space-y-6 shadow-xl border-2 border-primary/20">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Full Name
                </p>
                <div className="h-10 border rounded-md w-full flex items-center px-3 text-sm text-foreground">
                  Sarah Johnson
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Experience
                </p>
                <div className="border rounded-md w-full p-3 space-y-2.5">
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    Led cross-functional team of 8 to deliver Q3 product
                    launch, resulting in 22% revenue increase.
                  </p>
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    Increased monthly active users by 34% through
                    data-driven UX improvements.
                  </p>
                  <div className="flex items-center gap-1.5 pt-1 border-t border-dashed">
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span className="text-xs text-primary font-medium">
                      AI improving bullet #3...
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button size="sm" className="gap-2">
                  Next Step <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Step 3: PDF export visual */}
          <div
            className={cn(
              "absolute inset-0 transition-all duration-500 flex items-center justify-center",
              activeStep === 2
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8 pointer-events-none",
            )}
          >
            <Card className="w-full max-w-md shadow-2xl overflow-hidden">
              {/* Mini resume document */}
              <div className="bg-white dark:bg-gray-50 p-6 space-y-4 border-b">
                <div className="space-y-1">
                  <div className="h-3 bg-gray-800 rounded w-2/5" />
                  <div className="h-1.5 bg-gray-300 rounded w-1/3" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-1.5 bg-gray-200 rounded w-full" />
                  <div className="h-1.5 bg-gray-200 rounded w-11/12" />
                  <div className="h-1.5 bg-gray-200 rounded w-4/5" />
                </div>
                <div className="pt-2 space-y-1.5">
                  <div className="h-2 bg-gray-700 rounded w-1/4" />
                  <div className="h-1.5 bg-gray-200 rounded w-full" />
                  <div className="h-1.5 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
              {/* Export bar */}
              <div className="bg-muted/30 p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      resume_sarah_johnson.pdf
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ready to download
                    </p>
                  </div>
                </div>
                <Button size="sm" className="gap-2">
                  <FileDown className="w-4 h-4" /> Export
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
