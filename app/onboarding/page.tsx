"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { GoalStep, Goal } from "./components/goal-step";
import { TemplateStep } from "./components/template-step";
import { ImportStep } from "./components/import-step";
import { WizardProgress } from "./components/wizard-progress";
import { TemplateId } from "@/lib/constants/templates";
import { ResumeData } from "@/lib/types/resume";
import Link from "next/link";

export default function OnboardingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [goal, setGoal] = useState<Goal | null>(null);
    const [templateId, setTemplateId] = useState<TemplateId | null>(null);

    const totalSteps = 3;

    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleImport = (data: ResumeData) => {
        // Store imported data in localStorage for the editor to pick up
        localStorage.setItem("imported-resume-data", JSON.stringify(data));
        router.push(`/create?template=${templateId}&goal=${goal}&imported=true`);
    };

    const handleStartFresh = () => {
        router.push(`/create?template=${templateId}&goal=${goal}`);
    };

    const canProceed = () => {
        if (currentStep === 1) return goal !== null;
        if (currentStep === 2) return templateId !== null;
        return true;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="text-xl font-bold">
                            ResumeForge
                        </Link>
                        <Link href="/">
                            <Button variant="ghost" size="icon">
                                <X className="w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-12">
                <div className="max-w-6xl mx-auto space-y-12">
                    {/* Progress */}
                    <WizardProgress currentStep={currentStep} totalSteps={totalSteps} />

                    {/* Steps */}
                    <div className="min-h-[500px]">
                        {currentStep === 1 && (
                            <GoalStep selectedGoal={goal} onSelectGoal={setGoal} />
                        )}
                        {currentStep === 2 && goal && (
                            <TemplateStep
                                goal={goal}
                                selectedTemplate={templateId}
                                onSelectTemplate={setTemplateId}
                            />
                        )}
                        {currentStep === 3 && (
                            <ImportStep
                                onImport={handleImport}
                                onStartFresh={handleStartFresh}
                            />
                        )}
                    </div>

                    {/* Navigation */}
                    {currentStep < 3 && (
                        <div className="flex items-center justify-between max-w-5xl mx-auto">
                            <Button
                                variant="ghost"
                                onClick={handleBack}
                                disabled={currentStep === 1}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>

                            <div className="flex items-center gap-4">
                                <Link href="/create">
                                    <Button variant="ghost">Skip</Button>
                                </Link>
                                <Button onClick={handleNext} disabled={!canProceed()}>
                                    Next
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
