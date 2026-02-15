"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Copy,
    Lightbulb,
    ArrowRight,
    Target,
    Zap,
    FileText,
    ChevronDown,
    ChevronUp,
    FilePlus2,
    Building2,
    Briefcase,
} from "lucide-react";
import { ATSAnalysisResult } from "@/lib/ai/content-types";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { LearningResourcesCard } from "./learning-resources-card";
import { WizardPreviewCard } from "./wizard-preview-card";

interface OptimizeAnalysisResultsProps {
    analysis: ATSAnalysisResult;
    jobTitle: string;
    companyName: string;
    onCreateTailoredCopy: () => void;
    onAnalyzeAnother: () => void;
    onStartWizard: () => void;
}

export function OptimizeAnalysisResults({
    analysis,
    jobTitle,
    companyName,
    onCreateTailoredCopy,
    onAnalyzeAnother,
    onStartWizard,
}: OptimizeAnalysisResultsProps) {
    const [expandedSuggestions, setExpandedSuggestions] = useState<Set<string>>(
        new Set()
    );

    const toggleSuggestion = (id: string) => {
        const newExpanded = new Set(expandedSuggestions);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedSuggestions(newExpanded);
    };

    const allSuggestionsExpanded =
        analysis.suggestions.length > 0 &&
        expandedSuggestions.size === analysis.suggestions.length;

    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success(`${label} copied to clipboard!`);
        } catch {
            toast.error("Clipboard access blocked. Copy manually.");
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    const getScoreBgColor = (score: number) => {
        if (score >= 80) return "bg-green-50 dark:bg-green-950/20 border-green-200";
        if (score >= 60) return "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200";
        return "bg-red-50 dark:bg-red-950/20 border-red-200";
    };

    const getScoreMessage = (score: number) => {
        if (score >= 80)
            return {
                emoji: "🎉",
                title: "Excellent Match!",
                message: "Your resume aligns very well with this job posting.",
            };
        if (score >= 60)
            return {
                emoji: "👍",
                title: "Good Match",
                message: "Your resume is competitive, but there's room for improvement.",
            };
        return {
            emoji: "⚠️",
            title: "Needs Optimization",
            message: "Consider making changes to better match this job posting.",
        };
    };

    const scoreInfo = getScoreMessage(analysis.score);

    // Categorize suggestions by severity
    const criticalPriority = analysis.suggestions.filter((s) => s.severity === "critical");
    const highPriority = analysis.suggestions.filter((s) => s.severity === "high");
    const mediumPriority = analysis.suggestions.filter((s) => s.severity === "medium");
    const lowPriority = analysis.suggestions.filter((s) => s.severity === "low");

    return (
        <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 mt-2 md:mt-6">
            {/* Hero Score Card - Compact on Mobile */}
            <Card className={cn("p-4 md:p-8 border-2", getScoreBgColor(analysis.score))}>
                <div className="flex items-center justify-between gap-4">
                    {/* Left side - Score circle */}
                    <div className="relative shrink-0">
                        <div className="w-20 h-20 md:w-32 md:h-32 rounded-full border-4 md:border-8 border-background shadow-lg flex items-center justify-center bg-white dark:bg-gray-900">
                            <div className="text-center">
                                <div className={cn("text-2xl md:text-4xl font-bold tabular-nums", getScoreColor(analysis.score))}>
                                    {analysis.score}%
                                </div>
                                <div className="text-[10px] md:text-xs text-muted-foreground">
                                    Match
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 md:mb-2">
                            <span className="text-xl md:text-3xl">{scoreInfo.emoji}</span>
                            <h3 className="text-base md:text-xl font-bold truncate">{scoreInfo.title}</h3>
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3 line-clamp-2">
                            {scoreInfo.message}
                        </p>
                        <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm">
                            <div className="flex items-center gap-1">
                                <Target className="w-3 h-3 md:w-4 md:h-4 text-primary shrink-0" />
                                <span className="font-medium">{analysis.strengths.length}</span>
                                <span className="hidden sm:inline">Strengths</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Zap className="w-3 h-3 md:w-4 md:h-4 text-yellow-600 shrink-0" />
                                <span className="font-medium">{analysis.suggestions.length}</span>
                                <span className="hidden sm:inline">Tips</span>
                            </div>
                        </div>
                    </div>
                </div>
                <Progress value={analysis.score} className="mt-3 md:mt-6 h-2 md:h-3" />
            </Card>

            {/* Two Column Layout: Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-3 md:gap-6">
                {/* What's Working Well */}
                <Card className="p-3 md:p-6 border-2 border-green-200 bg-green-50/50 dark:bg-green-950/10">
                    <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-600 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-sm md:text-lg">Strengths</h3>
                            <p className="text-xs md:text-sm text-muted-foreground">
                                {analysis.strengths.length} found
                            </p>
                        </div>
                    </div>
                    <div className="space-y-2 md:space-y-3">
                        {analysis.strengths.length > 0 ? (
                            analysis.strengths.map((strength, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-2 p-2 md:p-3 rounded-lg bg-white dark:bg-gray-900 border border-green-200"
                                >
                                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                                    <span className="text-xs md:text-sm flex-1">{strength}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs md:text-sm text-muted-foreground text-center py-3">
                                No specific strengths identified
                            </p>
                        )}
                    </div>
                </Card>

                {/* Missing Keywords */}
                <Card className="p-3 md:p-6 border-2 border-orange-200 bg-orange-50/50 dark:bg-orange-950/10">
                    <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-orange-600 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-sm md:text-lg">Missing Keywords</h3>
                            <p className="text-xs md:text-sm text-muted-foreground">
                                {analysis.missingKeywords.length} to add
                            </p>
                        </div>
                    </div>
                    <div className="space-y-2 md:space-y-3">
                        {analysis.missingKeywords.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 md:gap-2">
                                {analysis.missingKeywords.map((keyword, index) => (
                                    <Button
                                        key={index}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 px-2.5 gap-1 md:gap-2 border-orange-300 hover:bg-orange-100 dark:hover:bg-orange-950/30 transition-colors text-xs"
                                        onClick={() => void copyToClipboard(keyword, "Keyword")}
                                    >
                                        <XCircle className="w-3 h-3 text-orange-600" />
                                        {keyword}
                                        <Copy className="w-2.5 h-2.5 md:w-3 md:h-3 text-muted-foreground" />
                                    </Button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs md:text-sm text-muted-foreground text-center py-3">
                                All important keywords present
                            </p>
                        )}
                    </div>
                </Card>
            </div>

            {/* Actionable Recommendations */}
            <Card className="p-3 md:p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/10 dark:to-blue-950/10">
                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-6">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shrink-0">
                        <Lightbulb className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-sm md:text-xl">AI Recommendations</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">
                            {analysis.suggestions.length} suggestions
                        </p>
                    </div>
                </div>

                {/* Priority Badges - Scrollable on mobile */}
                <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-xs text-muted-foreground">
                        Tap a suggestion to see before/after details
                    </p>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 text-xs shrink-0"
                        onClick={() =>
                            setExpandedSuggestions(
                                allSuggestionsExpanded
                                    ? new Set()
                                    : new Set(analysis.suggestions.map((s) => s.id))
                            )
                        }
                    >
                        {allSuggestionsExpanded ? "Collapse all" : "Expand all"}
                    </Button>
                </div>

                <div className="flex gap-1.5 md:gap-2 mb-3 md:mb-6 overflow-x-auto pb-1 -mx-1 px-1">
                    {criticalPriority.length > 0 && (
                        <Badge variant="destructive" className="gap-1 text-xs shrink-0">
                            <AlertTriangle className="w-3 h-3" />
                            {criticalPriority.length} Critical
                        </Badge>
                    )}
                    {highPriority.length > 0 && (
                        <Badge variant="destructive" className="gap-1 text-xs shrink-0">
                            {highPriority.length} High
                        </Badge>
                    )}
                    {mediumPriority.length > 0 && (
                        <Badge variant="secondary" className="gap-1 text-xs shrink-0">
                            {mediumPriority.length} Medium
                        </Badge>
                    )}
                    {lowPriority.length > 0 && (
                        <Badge variant="outline" className="gap-1 text-xs shrink-0">
                            {lowPriority.length} Low
                        </Badge>
                    )}
                </div>

                <div className="space-y-2 md:space-y-4">
                    {analysis.suggestions.map((suggestion) => {
                        const isExpanded = expandedSuggestions.has(suggestion.id);

                        return (
                            <Card
                                key={suggestion.id}
                                className={cn(
                                    "overflow-hidden transition-all",
                                    suggestion.severity === "critical"
                                        ? "border-2 border-red-500 bg-red-50/50 dark:bg-red-950/20"
                                        : suggestion.severity === "high"
                                        ? "border-2 border-red-300 bg-red-50/50 dark:bg-red-950/20"
                                        : suggestion.severity === "medium"
                                            ? "border-2 border-yellow-300 bg-yellow-50/50 dark:bg-yellow-950/20"
                                            : "border-2 border-blue-300 bg-blue-50/50 dark:bg-blue-950/20"
                                )}
                            >
                                <button
                                    type="button"
                                    className="w-full p-3 md:p-4 text-left"
                                    onClick={() => toggleSuggestion(suggestion.id)}
                                    aria-expanded={isExpanded}
                                >
                                    <div className="flex items-start justify-between gap-2 md:gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2 flex-wrap">
                                                <Badge
                                                    variant={
                                                        suggestion.severity === "critical" || suggestion.severity === "high"
                                                            ? "destructive"
                                                            : suggestion.severity === "medium"
                                                                ? "secondary"
                                                                : "outline"
                                                    }
                                                    className="text-[10px] md:text-xs uppercase"
                                                >
                                                    {suggestion.severity}
                                                </Badge>
                                                <Badge variant="outline" className="text-[10px] md:text-xs capitalize">
                                                    {suggestion.type}
                                                </Badge>
                                            </div>
                                            <h4 className="font-bold text-xs md:text-base mb-0.5 md:mb-1">
                                                {suggestion.title}
                                            </h4>
                                            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                                                {suggestion.description}
                                            </p>
                                        </div>
                                        <div className="shrink-0 mt-1">
                                            {isExpanded ? (
                                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                            )}
                                        </div>
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="px-3 pb-3 md:px-4 md:pb-4 space-y-2 md:space-y-3 animate-in fade-in duration-300">
                                        {/* Before/After Comparison */}
                                        {(suggestion.current || suggestion.suggested) && (
                                            <div className="grid gap-2 md:gap-3">
                                                {suggestion.current && (
                                                    <div>
                                                        <span className="text-[10px] md:text-xs font-semibold text-red-600 uppercase">
                                                            Current
                                                        </span>
                                                        <div className="mt-1 p-2 md:p-3 bg-white dark:bg-gray-900 rounded-lg border border-red-200">
                                                            <p className="text-xs md:text-sm italic text-muted-foreground">
                                                                {suggestion.current}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                {suggestion.suggested && (
                                                    <div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] md:text-xs font-semibold text-green-600 uppercase">
                                                                Suggested
                                                            </span>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 text-xs px-2"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    void copyToClipboard(suggestion.suggested!, "Suggestion");
                                                                }}
                                                            >
                                                                <Copy className="w-3 h-3 mr-1" />
                                                                Copy
                                                            </Button>
                                                        </div>
                                                        <div className="mt-1 p-2 md:p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-300">
                                                            <p className="text-xs md:text-sm font-medium">
                                                                {suggestion.suggested}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Action */}
                                        <div className="flex items-start gap-2 p-2 md:p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200">
                                            <ArrowRight className="w-3 h-3 md:w-4 md:h-4 text-blue-600 mt-0.5 shrink-0" />
                                            <span className="text-xs md:text-sm font-medium text-blue-900 dark:text-blue-100">
                                                {suggestion.action}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            </Card>

            {/* Learning Resources Section */}
            {analysis.learnableSkills && analysis.learnableSkills.length > 0 && (
                <LearningResourcesCard learnableSkills={analysis.learnableSkills} />
            )}

            {/* Wizard Preview Card - Shows plan before starting */}
            <WizardPreviewCard analysis={analysis} onStartWizard={onStartWizard} />

            {/* Secondary Actions */}
            <div className="sticky bottom-0 -mx-4 md:mx-0 px-4 md:px-0 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:py-0 md:pb-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:bg-transparent border-t md:border-0">
                {/* Target job info */}
                {(jobTitle || companyName) && (
                    <div className="flex items-center gap-2 mb-3 text-xs md:text-sm text-muted-foreground">
                        <span>Creating tailored resume for:</span>
                        <div className="flex items-center gap-2 flex-wrap">
                            {jobTitle && (
                                <Badge variant="secondary" className="gap-1">
                                    <Briefcase className="w-3 h-3" />
                                    {jobTitle}
                                </Badge>
                            )}
                            {companyName && (
                                <Badge variant="secondary" className="gap-1">
                                    <Building2 className="w-3 h-3" />
                                    {companyName}
                                </Badge>
                            )}
                        </div>
                    </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button
                        variant="secondary"
                        size="lg"
                        className="h-11 text-sm"
                        onClick={onCreateTailoredCopy}
                    >
                        <FilePlus2 className="w-4 h-4 mr-2" />
                        Create Copy
                    </Button>
                    <Button
                        variant="ghost"
                        size="lg"
                        className="h-11 text-sm"
                        onClick={onAnalyzeAnother}
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Back to Edit
                    </Button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-3 text-center">
                    Your original resume will remain unchanged
                </p>
            </div>
        </div>
    );
}
