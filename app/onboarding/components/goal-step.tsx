"use client";

import { Card } from "@/components/ui/card";
import { Target, RefreshCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type Goal = "job-application" | "career-change" | "general-update";

interface GoalStepProps {
    selectedGoal: Goal | null;
    onSelectGoal: (goal: Goal) => void;
}

const goals = [
    {
        id: "job-application" as Goal,
        icon: Target,
        title: "Job Application",
        description: "I'm applying for a specific role",
        color: "from-blue-500/10 to-cyan-500/10",
        borderColor: "hover:border-blue-500/50",
        iconColor: "text-blue-500",
    },
    {
        id: "career-change" as Goal,
        icon: RefreshCw,
        title: "Career Change",
        description: "I'm pivoting to a new industry",
        color: "from-purple-500/10 to-fuchsia-500/10",
        borderColor: "hover:border-purple-500/50",
        iconColor: "text-purple-500",
    },
    {
        id: "general-update" as Goal,
        icon: Sparkles,
        title: "General Update",
        description: "I want to refresh my resume",
        color: "from-emerald-500/10 to-teal-500/10",
        borderColor: "hover:border-emerald-500/50",
        iconColor: "text-emerald-500",
    },
];

export function GoalStep({ selectedGoal, onSelectGoal }: GoalStepProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold tracking-tight">
                    What brings you here today?
                </h2>
                <p className="text-muted-foreground text-lg">
                    Choose your goal to get personalized template recommendations
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {goals.map((goal) => {
                    const Icon = goal.icon;
                    const isSelected = selectedGoal === goal.id;

                    return (
                        <Card
                            key={goal.id}
                            className={cn(
                                "relative p-8 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                                "border-2",
                                isSelected
                                    ? "border-primary ring-2 ring-primary/20 shadow-lg"
                                    : `border-border ${goal.borderColor}`,
                                `bg-gradient-to-br ${goal.color}`
                            )}
                            onClick={() => onSelectGoal(goal.id)}
                        >
                            {/* Checkmark for selected state */}
                            {isSelected && (
                                <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                                    <svg
                                        className="w-4 h-4 text-primary-foreground"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div
                                    className={cn(
                                        "w-16 h-16 rounded-2xl flex items-center justify-center",
                                        isSelected ? "bg-primary/10" : "bg-background/50"
                                    )}
                                >
                                    <Icon className={cn("w-8 h-8", goal.iconColor)} />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold">{goal.title}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {goal.description}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
