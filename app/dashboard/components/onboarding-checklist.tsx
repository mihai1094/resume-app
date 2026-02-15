"use client";

import { CheckCircle2, Circle, FileText, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";

interface OnboardingChecklistProps {
  className?: string;
  onCreateResume: () => void;
}

export function OnboardingChecklist({
  className,
  onCreateResume,
}: OnboardingChecklistProps) {
  const steps = [
    {
      id: 1,
      label: "Create your account",
      description: "You're already here!",
      icon: CheckCircle2,
      completed: true,
      action: null,
      buttonText: null,
    },
    {
      id: 2,
      label: "Create your first resume",
      description: "Use our AI builder or start from scratch.",
      icon: FileText,
      completed: false, // This component is shown when NO resumes exist
      action: onCreateResume,
      buttonText: "Start my Resume",
      primary: true,
    },
  ];

  return (
    <Card className={`border-2 border-primary/10 shadow-lg ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <GraduationCap className="h-6 w-6 text-primary" />
          Getting Started
        </CardTitle>
        <CardDescription>
          Follow these steps to land your dream job faster.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-start gap-4 p-3 rounded-lg border transition-colors ${
                step.completed
                  ? "bg-green-500/5 border-green-500/20"
                  : step.primary
                  ? "bg-primary/5 border-primary/20 ring-1 ring-primary/10"
                  : "bg-muted/30 border-transparent"
              }`}
            >
              <div className="mt-1">
                {step.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <p
                  className={`font-medium ${
                    step.completed ? "text-muted-foreground line-through" : ""
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
                {step.action && !step.completed && (
                  <Button
                    size="sm"
                    onClick={step.action}
                    variant={step.primary ? "default" : "outline"}
                    className="mt-2 h-8 text-xs font-medium"
                  >
                    {step.buttonText}
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
