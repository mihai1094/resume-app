"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { ProgressBreakdown } from "@/hooks/use-progress-tracker";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check } from "lucide-react";

interface ProgressCircleProps {
    progress: number;
    breakdown: ProgressBreakdown;
    className?: string;
}

export function ProgressCircle({
    progress,
    breakdown,
    className,
}: ProgressCircleProps) {
    // SVG circle parameters
    const size = 36;
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Spring animation for smooth, organic progress updates
    const springProgress = useSpring(0, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    const offset = useTransform(
        springProgress,
        [0, 100],
        [circumference, 0]
    );

    useEffect(() => {
        springProgress.set(progress);
    }, [progress, springProgress]);

    // Determine color based on progress
    const getProgressColor = () => {
        if (progress === 100) return "stroke-green-500";
        if (progress >= 50) return "stroke-primary";
        return "stroke-orange-500";
    };

    // Pulse animation for milestones
    const isMilestone = progress === 25 || progress === 50 || progress === 75 || progress === 100;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <motion.div
                        className={cn("relative inline-flex items-center justify-center", className)}
                        animate={isMilestone ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 0.5, ease: [0.68, -0.55, 0.265, 1.55] }}
                    >
                        {/* SVG Circle */}
                        <svg width={size} height={size} className="transform -rotate-90">
                            {/* Background circle */}
                            <circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={strokeWidth}
                                className="text-muted opacity-20"
                            />
                            {/* Progress circle with spring animation */}
                            <motion.circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                strokeWidth={strokeWidth}
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                                className={cn(
                                    "transition-colors duration-500",
                                    getProgressColor()
                                )}
                            />
                        </svg>

                        {/* Center text with stagger animation */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.div
                                className="text-[10px] font-bold"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
                            >
                                {progress}%
                            </motion.div>
                        </div>

                        {/* Checkmark for 100% with bounce */}
                        {progress === 100 && (
                            <motion.div
                                className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full flex items-center justify-center"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 20,
                                    delay: 0.3
                                }}
                            >
                                <Check className="w-2 h-2 text-white" />
                            </motion.div>
                        )}
                    </motion.div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="p-4 space-y-2">
                    <div className="font-semibold text-sm mb-2">Resume Completion</div>
                    <motion.div
                        className="space-y-1.5 text-xs"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: {},
                            visible: {
                                transition: {
                                    staggerChildren: 0.05
                                }
                            }
                        }}
                    >
                        {[
                            { label: "Personal Info", value: breakdown.personalInfo, max: 30 },
                            { label: "Experience", value: breakdown.workExperience, max: 40 },
                            { label: "Education", value: breakdown.education, max: 20 },
                            { label: "Skills", value: breakdown.skills, max: 10 },
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                className="flex items-center justify-between gap-4"
                                variants={{
                                    hidden: { opacity: 0, x: -10 },
                                    visible: { opacity: 1, x: 0 }
                                }}
                            >
                                <span className="text-muted-foreground">{item.label}:</span>
                                <span className={cn(
                                    "font-medium",
                                    item.value === item.max && "text-green-500"
                                )}>
                                    {item.value}/{item.max}
                                    {item.value === item.max && " ✓"}
                                </span>
                            </motion.div>
                        ))}
                    </motion.div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
