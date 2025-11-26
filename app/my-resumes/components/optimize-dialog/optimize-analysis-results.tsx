import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    TrendingUp,
    CheckCircle,
    Check,
    AlertCircle,
    Copy,
    Lightbulb,
    ArrowRight,
} from "lucide-react";
import { JobAnalysis } from "@/lib/ai/mock-analyzer";
import { ResumeData } from "@/lib/types/resume";
import { cn } from "@/lib/utils";

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
    return (
        <div className="space-y-6 animate-in fade-in duration-500 border-t pt-6">
            {/* Match Score */}
            <Card
                className={cn(
                    "p-6 border-2",
                    analysis.score >= 80
                        ? "border-green-600/50 bg-green-50/50 dark:bg-green-950/20"
                        : analysis.score >= 60
                            ? "border-yellow-600/50 bg-yellow-50/50 dark:bg-yellow-950/20"
                            : "border-red-600/50 bg-red-50/50 dark:bg-red-950/20"
                )}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Job Match Score
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {analysis.score >= 80
                                ? "Excellent match! Your resume aligns well with this job."
                                : analysis.score >= 60
                                    ? "Good match with room for improvement"
                                    : "Consider optimizing your resume for better results"}
                        </p>
                    </div>
                    <div className="text-right">
                        <div
                            className={cn(
                                "text-5xl font-bold",
                                analysis.score >= 80
                                    ? "text-green-600"
                                    : analysis.score >= 60
                                        ? "text-yellow-600"
                                        : "text-red-600"
                            )}
                        >
                            {analysis.score}%
                        </div>
                        <div className="text-xs text-muted-foreground">match rate</div>
                    </div>
                </div>
                <Progress value={analysis.score} className="mt-4 h-3" />
            </Card>

            {/* Strengths */}
            {analysis.strengths.length > 0 && (
                <Card className="p-6">
                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Your Strengths
                    </h3>
                    <div className="space-y-2">
                        {analysis.strengths.map((strength, index) => (
                            <div key={index} className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                                <span className="text-sm">{strength}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Missing Keywords */}
            {analysis.missingKeywords.length > 0 && (
                <Card className="p-6">
                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        Missing Keywords
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                        These important keywords from the job description are missing from
                        your resume:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {analysis.missingKeywords.map((keyword, index) => (
                            <Badge key={index} variant="outline" className="gap-1">
                                {keyword}
                                <button
                                    className="ml-1 hover:text-primary"
                                    onClick={() => {
                                        navigator.clipboard.writeText(keyword);
                                    }}
                                >
                                    <Copy className="w-3 h-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                </Card>
            )}

            {/* AI Suggestions */}
            <Card className="p-6">
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    AI Suggestions ({analysis.suggestions.length})
                </h3>
                <div className="space-y-4">
                    {analysis.suggestions.map((suggestion) => (
                        <div
                            key={suggestion.id}
                            className={cn(
                                "p-4 rounded-lg border-2 transition-colors",
                                suggestion.severity === "high"
                                    ? "border-red-200 bg-red-50/50 dark:bg-red-950/20"
                                    : suggestion.severity === "medium"
                                        ? "border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20"
                                        : "border-blue-200 bg-blue-50/50 dark:bg-blue-950/20"
                            )}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant={
                                                suggestion.severity === "high"
                                                    ? "destructive"
                                                    : suggestion.severity === "medium"
                                                        ? "secondary"
                                                        : "outline"
                                            }
                                            className="text-xs"
                                        >
                                            {suggestion.severity} priority
                                        </Badge>
                                        <Badge variant="outline" className="text-xs capitalize">
                                            {suggestion.type}
                                        </Badge>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{suggestion.title}</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {suggestion.description}
                                        </p>
                                    </div>

                                    {/* Before/After comparison */}
                                    {(suggestion.current || suggestion.suggested) && (
                                        <div className="mt-3 space-y-2">
                                            {suggestion.current && (
                                                <div className="text-sm">
                                                    <span className="font-medium text-muted-foreground">
                                                        Current:
                                                    </span>
                                                    <p className="mt-1 p-2 bg-background rounded border italic">
                                                        {suggestion.current}
                                                    </p>
                                                </div>
                                            )}
                                            {suggestion.suggested && (
                                                <div className="text-sm">
                                                    <span className="font-medium text-primary">
                                                        Suggested:
                                                    </span>
                                                    <p className="mt-1 p-2 bg-primary/5 rounded border border-primary/20 font-medium">
                                                        {suggestion.suggested}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 mt-3">
                                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">
                                            {suggestion.action}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <Button
                    className="flex-1"
                    onClick={() => onEditResume(resume)}
                >
                    Edit Resume to Apply Changes
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" onClick={onAnalyzeAnother}>
                    Analyze Another Job
                </Button>
            </div>
        </div>
    );
}
