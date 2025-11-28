"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    TrendingUp,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Copy,
    Lightbulb,
    ArrowRight,
    Target,
    Zap,
    Award,
    FileText,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { JobAnalysis } from "@/lib/ai/mock-analyzer";
import { ResumeData } from "@/lib/types/resume";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

interface OptimizeAnalysisResultsProps {
    analysis: JobAnalysis;
    resume: {
        id: string;
        name: string;
        templateId: string;
        data: ResumeData;
    };
    onEditResume: (resume: any) => void;
    onAnalyzeAnother: () => void;
}

export function OptimizeAnalysisResults({
    analysis,
    resume,
    onEditResume,
    onAnalyzeAnother,
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

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
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
    const highPriority = analysis.suggestions.filter((s) => s.severity === "high");
    const mediumPriority = analysis.suggestions.filter((s) => s.severity === "medium");
    const lowPriority = analysis.suggestions.filter((s) => s.severity === "low");

    return (
        <div className="space-y-6 animate-in fade-in duration-700 mt-6">
            {/* Hero Score Card */}
            <Card className={cn("p-8 border-2", getScoreBgColor(analysis.score))}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                            <span className="text-4xl">{scoreInfo.emoji}</span>
                            <h3 className="text-2xl font-bold">{scoreInfo.title}</h3>
                        </div>
                        <p className="text-base text-muted-foreground mb-4">
                            {scoreInfo.message}
                        </p>
                        <div className="flex items-center justify-center md:justify-start gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-primary" />
                                <span className="font-medium">
                                    {analysis.strengths.length} Strengths Found
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-600" />
                                <span className="font-medium">
                                    {analysis.suggestions.length} Improvements
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Score Circle */}
                    <div className="relative">
                        <div className="w-40 h-40 rounded-full border-8 border-background shadow-lg flex items-center justify-center bg-white dark:bg-gray-900">
                            <div className="text-center">
                                <div className={cn("text-5xl font-bold", getScoreColor(analysis.score))}>
                                    {analysis.score}%
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    Match Score
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2">
                            <Badge className="bg-primary text-primary-foreground shadow-lg">
                                <Award className="w-3 h-3 mr-1" />
                                ATS Ready
                            </Badge>
                        </div>
                    </div>
                </div>
                <Progress value={analysis.score} className="mt-6 h-3" />
            </Card>

            {/* Two Column Layout: Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* What's Working Well */}
                <Card className="p-6 border-2 border-green-200 bg-green-50/50 dark:bg-green-950/10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">What's Working Well</h3>
                            <p className="text-sm text-muted-foreground">
                                {analysis.strengths.length} strengths identified
                            </p>
                        </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-3">
                        {analysis.strengths.length > 0 ? (
                            analysis.strengths.map((strength, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-gray-900 border border-green-200"
                                >
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                                    <span className="text-sm flex-1">{strength}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No specific strengths identified
                            </p>
                        )}
                    </div>
                </Card>

                {/* What Needs Improvement */}
                <Card className="p-6 border-2 border-orange-200 bg-orange-50/50 dark:bg-orange-950/10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">What Needs Improvement</h3>
                            <p className="text-sm text-muted-foreground">
                                {analysis.missingKeywords.length} missing keywords
                            </p>
                        </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-3">
                        {analysis.missingKeywords.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {analysis.missingKeywords.map((keyword, index) => (
                                    <Badge
                                        key={index}
                                        variant="outline"
                                        className="gap-2 cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-950/30 transition-colors"
                                        onClick={() => copyToClipboard(keyword, "Keyword")}
                                    >
                                        <XCircle className="w-3 h-3 text-orange-600" />
                                        {keyword}
                                        <Copy className="w-3 h-3 text-muted-foreground" />
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                All important keywords are present
                            </p>
                        )}
                    </div>
                </Card>
            </div>

            {/* Actionable Recommendations */}
            <Card className="p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/10 dark:to-blue-950/10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-xl">AI-Powered Recommendations</h3>
                        <p className="text-sm text-muted-foreground">
                            {analysis.suggestions.length} actionable suggestions to improve your match
                        </p>
                    </div>
                </div>

                {/* Priority Tabs */}
                <div className="flex gap-2 mb-6">
                    {highPriority.length > 0 && (
                        <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {highPriority.length} High Priority
                        </Badge>
                    )}
                    {mediumPriority.length > 0 && (
                        <Badge variant="secondary" className="gap-1">
                            {mediumPriority.length} Medium Priority
                        </Badge>
                    )}
                    {lowPriority.length > 0 && (
                        <Badge variant="outline" className="gap-1">
                            {lowPriority.length} Low Priority
                        </Badge>
                    )}
                </div>

                <div className="space-y-4">
                    {analysis.suggestions.map((suggestion) => {
                        const isExpanded = expandedSuggestions.has(suggestion.id);

                        return (
                            <Card
                                key={suggestion.id}
                                className={cn(
                                    "overflow-hidden transition-all",
                                    suggestion.severity === "high"
                                        ? "border-2 border-red-300 bg-red-50/50 dark:bg-red-950/20"
                                        : suggestion.severity === "medium"
                                            ? "border-2 border-yellow-300 bg-yellow-50/50 dark:bg-yellow-950/20"
                                            : "border-2 border-blue-300 bg-blue-50/50 dark:bg-blue-950/20"
                                )}
                            >
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge
                                                    variant={
                                                        suggestion.severity === "high"
                                                            ? "destructive"
                                                            : suggestion.severity === "medium"
                                                                ? "secondary"
                                                                : "outline"
                                                    }
                                                    className="text-xs uppercase"
                                                >
                                                    {suggestion.severity} Priority
                                                </Badge>
                                                <Badge variant="outline" className="text-xs capitalize">
                                                    {suggestion.type}
                                                </Badge>
                                            </div>
                                            <h4 className="font-bold text-base mb-1">
                                                {suggestion.title}
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                {suggestion.description}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleSuggestion(suggestion.id)}
                                        >
                                            {isExpanded ? (
                                                <ChevronUp className="w-4 h-4" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>

                                    {isExpanded && (
                                        <div className="mt-4 space-y-3 animate-in fade-in duration-300">
                                            {/* Before/After Comparison */}
                                            {(suggestion.current || suggestion.suggested) && (
                                                <div className="grid gap-3">
                                                    {suggestion.current && (
                                                        <div>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-xs font-semibold text-red-600 uppercase">
                                                                    Current
                                                                </span>
                                                            </div>
                                                            <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border-2 border-red-200">
                                                                <p className="text-sm italic text-muted-foreground">
                                                                    {suggestion.current}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {suggestion.suggested && (
                                                        <div>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-xs font-semibold text-green-600 uppercase">
                                                                    Suggested Improvement
                                                                </span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        copyToClipboard(
                                                                            suggestion.suggested!,
                                                                            "Suggestion"
                                                                        )
                                                                    }
                                                                >
                                                                    <Copy className="w-3 h-3 mr-1" />
                                                                    Copy
                                                                </Button>
                                                            </div>
                                                            <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border-2 border-green-300">
                                                                <p className="text-sm font-medium">
                                                                    {suggestion.suggested}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Action */}
                                            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200">
                                                <ArrowRight className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                                    {suggestion.action}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                    className="flex-1 h-12 text-base"
                    size="lg"
                    onClick={() => onEditResume(resume)}
                >
                    <FileText className="w-5 h-5 mr-2" />
                    Edit Resume to Apply Changes
                    <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    className="h-12"
                    onClick={onAnalyzeAnother}
                >
                    Analyze Another Job
                </Button>
            </div>
        </div>
    );
}
