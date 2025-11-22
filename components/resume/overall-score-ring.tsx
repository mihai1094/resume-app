"use client";

import { motion, useSpring, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface OverallScoreRingProps {
    score: number;
    className?: string;
}

export function OverallScoreRing({ score, className }: OverallScoreRingProps) {
    const [displayScore, setDisplayScore] = useState(0);

    // SVG circle parameters
    const size = 160;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Spring animation for smooth progress
    const springProgress = useSpring(0, {
        stiffness: 80,
        damping: 25,
        restDelta: 0.001,
    });

    const offset = useTransform(springProgress, [0, 100], [circumference, 0]);

    useEffect(() => {
        springProgress.set(score);

        // Animate the number count-up
        const controls = animate(0, score, {
            duration: 1,
            ease: "easeOut",
            onUpdate: (value) => setDisplayScore(Math.round(value)),
        });

        return () => controls.stop();
    }, [score, springProgress]);

    // Determine color based on score
    const getColor = () => {
        if (score >= 90) return "stroke-green-500";
        if (score >= 75) return "stroke-blue-500";
        if (score >= 60) return "stroke-orange-500";
        return "stroke-red-500";
    };

    const getGradient = () => {
        if (score >= 90) return "from-green-400 to-emerald-500";
        if (score >= 75) return "from-blue-400 to-cyan-500";
        if (score >= 60) return "from-orange-400 to-amber-500";
        return "from-red-400 to-rose-500";
    };

    return (
        <div className={cn("relative inline-flex items-center justify-center", className)}>
            {/* Glow effect */}
            <div
                className={cn(
                    "absolute inset-0 rounded-full blur-2xl opacity-20",
                    `bg-gradient-to-br ${getGradient()}`
                )}
            />

            {/* SVG Circle */}
            <svg width={size} height={size} className="transform -rotate-90 relative">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-muted opacity-10"
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
                    className={cn("transition-colors duration-500", getColor())}
                />
            </svg>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                    className="text-5xl font-bold"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
                >
                    {displayScore}
                </motion.div>
                <motion.div
                    className="text-sm text-muted-foreground uppercase tracking-wider"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                >
                    / 100
                </motion.div>
            </div>
        </div>
    );
}
