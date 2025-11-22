"use client";

import { cn } from "@/lib/utils";

interface WizardProgressProps {
    currentStep: number;
    totalSteps: number;
}

export function WizardProgress({ currentStep, totalSteps }: WizardProgressProps) {
    return (
        <div className="space-y-2">
            {/* Progress Bar */}
            <div className="flex items-center gap-2">
                {Array.from({ length: totalSteps }).map((_, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;

                    return (
                        <div key={stepNumber} className="flex items-center flex-1">
                            <div
                                className={cn(
                                    "h-2 rounded-full transition-all duration-500 flex-1",
                                    isCompleted || isCurrent
                                        ? "bg-primary"
                                        : "bg-muted"
                                )}
                            />
                            {stepNumber < totalSteps && (
                                <div className="w-2" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Step Counter */}
            <div className="text-center">
                <p className="text-sm text-muted-foreground">
                    Step {currentStep} of {totalSteps}
                </p>
            </div>
        </div>
    );
}
