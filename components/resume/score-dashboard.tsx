"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { ResumeData } from "@/lib/types/resume";
import { calculateResumeScore, ResumeScore as LocalResumeScore, MetricScore, ScoreStatus } from "@/lib/services/resume-scoring";
import { ResumeScore as AIResumeScore } from "@/lib/ai/content-types";
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
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OverallScoreRing } from "@/components/resume/overall-score-ring";
import { MetricCard } from "@/components/resume/metric-card";
import { ATSAnalyzer, ATSResult } from "@/lib/ats/engine";
import { toast } from "sonner";
import { authPost } from "@/lib/api/auth-fetch";

interface ScoreDashboardProps {
    resumeData: ResumeData;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onJumpToSection?: (sectionId: string) => void;
}

// Convert AI score format to local score format for display
function convertAIScoreToLocal(aiScore: AIResumeScore): LocalResumeScore {
    const getStatus = (score: number): ScoreStatus => {
        if (score >= 90) return 'excellent';
        if (score >= 75) return 'good';
        if (score >= 60) return 'fair';
        return 'poor';
    };

    const createMetricScore = (score: number, label: string, feedback: string): MetricScore => ({
        score,
        maxScore: 100,
        status: getStatus(score),
        feedback,
        actionableItems: [],
    });

    return {
        overall: aiScore.overallScore,
        breakdown: {
            atsCompatibility: createMetricScore(
                aiScore.categoryScores.atsCompatibility,
                "ATS Compatibility",
                "AI-powered analysis of ATS compatibility"
            ),
            contentQuality: createMetricScore(
                aiScore.categoryScores.impact,
                "Content Quality",
                "AI-powered analysis of content impact and value"
            ),
            skillsKeywords: createMetricScore(
                aiScore.categoryScores.keywords,
                "Skills & Keywords",
                "AI-powered analysis of keyword optimization"
            ),
            impactAchievements: createMetricScore(
                aiScore.categoryScores.metrics,
                "Impact & Achievements",
                "AI-powered analysis of quantifiable achievements"
            ),
            structureFormatting: createMetricScore(
                aiScore.categoryScores.formatting,
                "Structure & Formatting",
                "AI-powered analysis of resume structure"
            ),
        },
        recommendations: aiScore.improvements.map((improvement, idx) => ({
            id: `ai-${idx}`,
            priority: idx < 2 ? 'high' : idx < 4 ? 'medium' : 'low',
            title: improvement.split(':')[0] || improvement.substring(0, 50),
            description: improvement,
        })),
    };
}

export function ScoreDashboard({
    resumeData,
    open,
    onOpenChange,
    onJumpToSection,
}: ScoreDashboardProps) {
    const [aiScore, setAiScore] = useState<AIResumeScore | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

    // Generate cache key based on resume data
    const cacheKey = useMemo(() => {
        return JSON.stringify({
            personalInfo: resumeData.personalInfo,
            workExperience: resumeData.workExperience,
            education: resumeData.education,
            skills: resumeData.skills,
        });
    }, [resumeData]);

    // Generate a hash from the cache key for storage
    const storageKey = useMemo(() => {
        let hash = 0;
        for (let i = 0; i < cacheKey.length; i++) {
            const char = cacheKey.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return `ai-score-${Math.abs(hash)}`;
    }, [cacheKey]);

    // Fetch AI score when dashboard opens
    useEffect(() => {
        if (!open) return;

        // Check if we have cached score in sessionStorage
        const cached = sessionStorage.getItem(storageKey);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                // Check if cache is still valid (5 minutes)
                if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
                    setAiScore(parsed.score);
                    return;
                }
            } catch (e) {
                // Invalid cache, continue to fetch
            }
        }

        // Fetch AI score
        setIsLoading(true);
        setError(null);

        authPost('/api/ai/score-resume', { resumeData })
            .then(async (res) => {
                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.error || 'Failed to fetch AI score');
                }
                return res.json();
            })
            .then((data) => {
                setAiScore(data.score);
                // Cache in sessionStorage
                sessionStorage.setItem(
                    storageKey,
                    JSON.stringify({
                        score: data.score,
                        timestamp: Date.now(),
                    })
                );
            })
            .catch((err) => {
                console.error('Failed to fetch AI score:', err);
                setError(err.message || 'Failed to load AI analysis');
                toast.error('Failed to load AI analysis. Showing local score instead.');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [open, resumeData, cacheKey, storageKey]);

    // Use AI score if available, otherwise fall back to local calculation
    const score = useMemo(() => {
        if (aiScore) {
            return convertAIScoreToLocal(aiScore);
        }
        // Fallback to local calculation
        return calculateResumeScore(resumeData);
    }, [aiScore, resumeData]);

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
                        {aiScore && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                                AI-Powered
                            </Badge>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                            <p className="text-sm text-muted-foreground">
                                Analyzing resume with AI...
                            </p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !isLoading && (
                        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                            <p className="text-sm text-destructive">{error}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                                Showing local calculation instead.
                            </p>
                        </div>
                    )}

                    {/* Content - hide while loading */}
                    {!isLoading && (
                        <>
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

                    {/* AI Strengths Section */}
                    {aiScore && aiScore.strengths.length > 0 && (
                        <>
                            <div className="border-t" />
                            <div>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    ✨ Strengths
                                </h3>
                                <div className="space-y-2">
                                    {aiScore.strengths.map((strength, idx) => (
                                        <motion.div
                                            key={idx}
                                            className="flex items-start gap-3 p-3 rounded-lg border border-green-500/20 bg-green-500/5"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.8 + idx * 0.05 }}
                                        >
                                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-foreground">{strength}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Industry Benchmark */}
                    {aiScore && aiScore.industryBenchmark && (
                        <>
                            <div className="border-t" />
                            <div className="rounded-lg border p-4 bg-muted/50">
                                <p className="text-sm font-medium mb-1">Industry Benchmark</p>
                                <p className="text-xs text-muted-foreground">{aiScore.industryBenchmark}</p>
                            </div>
                        </>
                    )}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
