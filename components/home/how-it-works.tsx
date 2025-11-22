"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, Edit, Download, Check, ArrowRight } from "lucide-react";

const STEPS = [
    {
        id: 0,
        title: "Choose Template",
        description: "Select from our professional, ATS-friendly templates designed for your industry.",
        icon: FileText,
        color: "bg-blue-500",
    },
    {
        id: 1,
        title: "Fill Information",
        description: "Add your experience, education, and skills. Our AI helps you write better content.",
        icon: Edit,
        color: "bg-purple-500",
    },
    {
        id: 2,
        title: "Download & Apply",
        description: "Export as PDF and start applying with confidence. Track your applications.",
        icon: Download,
        color: "bg-green-500",
    },
];

export function HowItWorks() {
    const [activeStep, setActiveStep] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % STEPS.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [isPaused]);

    return (
        <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Navigation Steps */}
            <div className="space-y-6">
                {STEPS.map((step, index) => {
                    const isActive = activeStep === index;
                    const Icon = step.icon;

                    return (
                        <div
                            key={step.id}
                            className={cn(
                                "relative p-6 rounded-xl cursor-pointer transition-all duration-300 border-2",
                                isActive
                                    ? "bg-background border-primary shadow-lg scale-[1.02]"
                                    : "bg-muted/30 border-transparent hover:bg-muted/50"
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
                                <div className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-[4000ms] ease-linear w-full rounded-b-xl" />
                            )}

                            <div className="flex items-start gap-4">
                                <div
                                    className={cn(
                                        "w-12 h-12 rounded-lg flex items-center justify-center transition-colors duration-300",
                                        isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                    )}
                                >
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h3
                                        className={cn(
                                            "font-semibold text-lg transition-colors",
                                            isActive ? "text-foreground" : "text-muted-foreground"
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

            {/* Right Column: Dynamic Visual Preview */}
            <div className="relative h-[500px] hidden lg:block">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-purple-500/5 rounded-3xl" />

                {/* Preview Card Container */}
                <div className="relative h-full w-full flex items-center justify-center p-8">
                    {/* Step 1: Template Selection Visual */}
                    <div
                        className={cn(
                            "absolute inset-0 transition-all duration-500 flex items-center justify-center",
                            activeStep === 0 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8 pointer-events-none"
                        )}
                    >
                        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                            {[1, 2, 3, 4].map((i) => (
                                <Card
                                    key={i}
                                    className={cn(
                                        "p-4 space-y-3 border-2 transition-all duration-500",
                                        i === 2 ? "border-primary shadow-xl scale-105 ring-4 ring-primary/10" : "border-border opacity-60"
                                    )}
                                >
                                    <div className="h-24 bg-muted rounded-md w-full overflow-hidden relative">
                                        <div className="absolute top-2 left-2 right-2 h-2 bg-foreground/10 rounded-full" />
                                        <div className="absolute top-6 left-2 h-2 bg-foreground/10 rounded-full w-1/2" />
                                        <div className="absolute top-10 left-2 right-2 bottom-2 bg-foreground/5 rounded-md" />
                                    </div>
                                    {i === 2 && (
                                        <div className="flex justify-center">
                                            <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                                <Check className="w-3 h-3" /> Selected
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Step 2: Filling Information Visual */}
                    <div
                        className={cn(
                            "absolute inset-0 transition-all duration-500 flex items-center justify-center",
                            activeStep === 1 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8 pointer-events-none"
                        )}
                    >
                        <Card className="w-full max-w-md p-6 space-y-6 shadow-xl border-2 border-primary/20">
                            <div className="space-y-2">
                                <div className="h-4 bg-muted rounded-full w-1/3" />
                                <div className="h-10 border rounded-md w-full flex items-center px-3 text-sm text-muted-foreground">
                                    John Doe
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 bg-muted rounded-full w-1/4" />
                                <div className="h-24 border rounded-md w-full p-3 space-y-2">
                                    <div className="h-2 bg-primary/20 rounded-full w-full animate-pulse" />
                                    <div className="h-2 bg-primary/20 rounded-full w-5/6 animate-pulse delay-75" />
                                    <div className="h-2 bg-primary/20 rounded-full w-4/5 animate-pulse delay-150" />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button size="sm" className="gap-2">
                                    Next Step <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* Step 3: Download Visual */}
                    <div
                        className={cn(
                            "absolute inset-0 transition-all duration-500 flex items-center justify-center",
                            activeStep === 2 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8 pointer-events-none"
                        )}
                    >
                        <Card className="w-full max-w-md p-1 shadow-2xl border-t-4 border-t-primary">
                            <div className="bg-muted/30 p-8 flex flex-col items-center text-center space-y-6">
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                                    <Check className="w-10 h-10" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold">Ready to Download!</h3>
                                    <p className="text-muted-foreground">Your resume has been optimized and is ready for applications.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 w-full">
                                    <Button variant="outline" className="w-full">Preview</Button>
                                    <Button className="w-full gap-2">
                                        <Download className="w-4 h-4" /> PDF
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
