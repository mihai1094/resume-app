"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ResumeData } from "@/lib/types/resume";
import { calculateResumeScore, ResumeScore } from "@/lib/services/resume-scoring";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Target,
    CheckCircle2,
    AlertCircle,
    XCircle,
    TrendingUp,
    Sparkles,
    ChevronRight,
    Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OverallScoreRing } from "@/components/resume/overall-score-ring";
import { MetricCard } from "@/components/resume/metric-card";
import { ATSAnalyzer, ATSResult } from "@/lib/ats/engine";

interface ScoreDashboardProps {
    resumeData: ResumeData;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onJumpToSection?: (sectionId: string) => void;
}

export function ScoreDashboard({
    resumeData,
    open,
    onOpenChange,
    onJumpToSection,
}: ScoreDashboardProps) {
    const score = calculateResumeScore(resumeData);
    const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

    const getOverallStatus = () => {
        if (score.overall >= 90) return { label: "Excellent!", emoji: "🎯", color: "text-green-500" };
        if (score.overall >= 75) return { label: "Good!", emoji: "👍", color: "text-blue-500" };
        if (score.overall >= 60) return { label: "Fair", emoji: "⚠️", color: "text-orange-500" };
        return { label: "Needs Work", emoji: "❌", color: "text-red-500" };
    };

    const status = getOverallStatus();

    const metrics = [
        {
            id: "ats",
            icon: Target,
            label: "ATS Compatibility",
            weight: "30%",
            ...score.breakdown.atsCompatibility,
        },
        {
            id: "content",
            icon: Sparkles,
            label: "Content Quality",
            weight: "25%",
            ...score.breakdown.contentQuality,
        },
        {
            id: "skills",
            icon: Target,
            label: "Skills & Keywords",
            weight: "20%",
            ...score.breakdown.skillsKeywords,
        },
        {
            id: "impact",
            icon: TrendingUp,
            label: "Impact & Achievements",
            weight: "15%",
            ...score.breakdown.impactAchievements,
        },
        {
            id: "structure",
            icon: CheckCircle2,
            label: "Structure & Formatting",
            weight: "10%",
            ...score.breakdown.structureFormatting,
        },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Target className="w-6 h-6 text-primary" />
                        Resume Health Score
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Overall Score */}
                    <div className="flex flex-col items-center justify-center py-6">
                        <OverallScoreRing score={score.overall} />
                        <motion.div
                            className={cn("text-2xl font-bold mt-4", status.color)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            {status.emoji} {status.label}
                        </motion.div>
                    </div>

                    {/* Divider */}
                    <div className="border-t" />

                    {/* Metrics Breakdown */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            📋 Breakdown
                        </h3>
                        <motion.div
                            className="space-y-3"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: {},
                                visible: {
                                    transition: {
                                        staggerChildren: 0.05,
                                    },
                                },
                            }}
                        >
                            {metrics.map((metric, idx) => (
                                <motion.div
                                    key={metric.id}
                                    variants={{
                                        hidden: { opacity: 0, x: -20 },
                                        visible: { opacity: 1, x: 0 },
                                    }}
                                >
                                    <MetricCard
                                        {...metric}
                                        expanded={expandedMetric === metric.id}
                                        onToggle={() =>
                                            setExpandedMetric(expandedMetric === metric.id ? null : metric.id)
                                        }
                                        onJumpToSection={onJumpToSection}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Divider */}
                    {score.recommendations.length > 0 && <div className="border-t" />}

                    {/* Top Recommendations */}
                    {score.recommendations.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                💡 Top Recommendations
                            </h3>
                            <div className="space-y-2">
                                {score.recommendations.map((rec, idx) => (
                                    <motion.div
                                        key={rec.id}
                                        className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 + idx * 0.05 }}
                                    >
                                        <div className="flex-shrink-0 mt-0.5">
                                            <Badge
                                                variant={
                                                    rec.priority === "high"
                                                        ? "destructive"
                                                        : rec.priority === "medium"
                                                            ? "default"
                                                            : "secondary"
                                                }
                                                className="text-xs"
                                            >
                                                {idx + 1}
                                            </Badge>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm">{rec.title}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                {rec.description}
                                            </div>
                                        </div>
                                        {rec.sectionId && onJumpToSection && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="flex-shrink-0"
                                                onClick={() => {
                                                    onJumpToSection(rec.sectionId!);
                                                    onOpenChange(false);
                                                }}
                                            >
                                                Fix Now
                                                <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
