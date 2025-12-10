"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";
import { WizardStep } from "@/hooks/use-wizard-mode";
import { cn } from "@/lib/utils";

interface WizardTooltipProps {
  step: WizardStep;
  currentStep: number;
  totalSteps: number;
  progress: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
}

export function WizardTooltip({
  step,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
}: WizardTooltipProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  // For welcome/complete steps, show centered modal
  const isCenteredStep = !step.targetSelector;

  if (isCenteredStep) {
    return (
      <>
        {/* Light overlay for centered modals */}
        <div
          className="fixed inset-0 bg-black/30 z-[100] animate-in fade-in duration-200"
          onClick={onSkip}
        />

        {/* Centered card */}
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
            {/* Header with gradient */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-t-2xl border-b">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-primary" />
                </div>
                <button
                  onClick={onSkip}
                  className="p-2 rounded-full hover:bg-black/5 transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <h2 className="text-xl font-bold">{step.title}</h2>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {currentStep + 1} / {totalSteps}
              </span>
              <div className="flex gap-2">
                {!isFirstStep && (
                  <Button variant="ghost" size="sm" onClick={onPrevious}>
                    Back
                  </Button>
                )}
                <Button onClick={onNext}>
                  {isLastStep ? "Get Started" : "Continue"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // For targeted steps, show a floating tip card at bottom
  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] flex justify-center animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card border rounded-xl shadow-lg max-w-md w-full">
        <div className="p-4">
          {/* Step indicator dots */}
          <div className="flex items-center justify-center gap-1.5 mb-3">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  i === currentStep
                    ? "w-4 bg-primary"
                    : i < currentStep
                    ? "bg-primary/50"
                    : "bg-muted"
                )}
              />
            ))}
          </div>

          {/* Content */}
          <div className="text-center mb-4">
            <h3 className="font-semibold mb-1">{step.title}</h3>
            <p className="text-sm text-muted-foreground">
              {step.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-muted-foreground"
            >
              Skip
            </Button>
            <div className="flex gap-2">
              {!isFirstStep && (
                <Button variant="outline" size="sm" onClick={onPrevious}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}
              <Button size="sm" onClick={onNext}>
                {isLastStep ? "Done" : "Next"}
                {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
