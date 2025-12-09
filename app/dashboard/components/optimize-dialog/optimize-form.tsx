"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Target,
    Sparkles,
    ArrowRight,
    FileText,
    Briefcase,
    TrendingUp,
    CheckCircle2,
    Calendar,
    AlertCircle,
    RotateCw,
} from "lucide-react";
import { calculateATSScore } from "@/lib/ai/mock-analyzer";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { format } from "date-fns";

import type { SavedResume } from "@/hooks/use-saved-resumes";
import type { AnalysisError } from "@/app/dashboard/hooks/use-optimize-flow";

interface OptimizeFormProps {
    resumes: SavedResume[];
    selectedResumeId: string;
    setSelectedResumeId: (id: string) => void;
    jobDescription: string;
    setJobDescription: (desc: string) => void;
    onAnalyze: () => void;
    isAnalyzing: boolean;
    analysisError?: AnalysisError | null;
    onRetry?: () => void;
}

export function OptimizeForm({
    resumes,
    selectedResumeId,
    setSelectedResumeId,
    jobDescription,
    setJobDescription,
    onAnalyze,
    isAnalyzing,
    analysisError,
    onRetry,
}: OptimizeFormProps) {
    const selectedResume = resumes.find((r) => r.id === selectedResumeId);
    const atsScore = selectedResume
        ? calculateATSScore(selectedResume.data)
        : null;

    const [charCount, setCharCount] = useState(0);
    const minChars = 100;
    const recommendedChars = 500;

    useEffect(() => {
        setCharCount(jobDescription.length);
    }, [jobDescription]);

    const getCharCountColor = () => {
        if (charCount < minChars) return "text-red-600";
        if (charCount < recommendedChars) return "text-yellow-600";
        return "text-green-600";
    };

    const canAnalyze = jobDescription.trim().length >= minChars && selectedResumeId;

    return (
        <div className="space-y-6 mt-6">
            {/* Step Indicator */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                        1
                    </div>
                    <span className="font-medium">Select Resume</span>
                </div>
                <div className="flex-1 h-px bg-border" />
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                        jobDescription.length >= minChars
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                    )}>
                        2
                    </div>
                    <span className={cn(
                        "font-medium",
                        jobDescription.length >= minChars
                            ? "text-foreground"
                            : "text-muted-foreground"
                    )}>
                        Job Description
                    </span>
                </div>
                <div className="flex-1 h-px bg-border" />
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                        canAnalyze
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                    )}>
                        3
                    </div>
                    <span className={cn(
                        "font-medium",
                        canAnalyze
                            ? "text-foreground"
                            : "text-muted-foreground"
                    )}>
                        Analyze
                    </span>
                </div>
            </div>

            {/* Resume Selection */}
            <Card className="p-6 border-2">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-base">Select Resume to Optimize</h3>
                        <p className="text-sm text-muted-foreground">
                            Choose which resume you want to match against the job
                        </p>
                    </div>
                </div>

                <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                    <SelectTrigger className="h-12">
                        <SelectValue placeholder="Choose a resume..." />
                    </SelectTrigger>
                    <SelectContent>
                        {resumes.map((resume, index) => {
                            const jobCount = resume.data.workExperience.length;
                            const updatedAtFormatted = format(new Date(resume.updatedAt), "MMM d, yyyy h:mm a");
                            const isLatest = index === 0;

                            return (
                                <SelectItem key={resume.id} value={resume.id}>
                                    <div className="flex flex-col gap-1 py-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold">{resume.name}</span>
                                            <Badge variant="outline" className="capitalize text-xs">
                                                {resume.templateId}
                                            </Badge>
                                            {isLatest && (
                                                <Badge variant="secondary" className="text-[10px]">
                                                    Latest
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>Updated {updatedAtFormatted}</span>
                                            </div>
                                            <span className="hidden sm:inline">•</span>
                                            <div className="flex items-center gap-1">
                                                <Briefcase className="w-3 h-3" />
                                                <span>{jobCount} job{jobCount !== 1 ? "s" : ""}</span>
                                            </div>
                                        </div>
                                    </div>
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>

                {/* Current ATS Score */}
                {selectedResume && atsScore && (
                    <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2 border-blue-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm">
                                    <TrendingUp className={cn(
                                        "w-6 h-6",
                                        atsScore.score >= 80
                                            ? "text-green-600"
                                            : atsScore.score >= 60
                                                ? "text-yellow-600"
                                                : "text-red-600"
                                    )} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm">Current ATS Score</h4>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedResume.name}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div
                                    className={cn(
                                        "text-4xl font-bold",
                                        atsScore.score >= 80
                                            ? "text-green-600"
                                            : atsScore.score >= 60
                                                ? "text-yellow-600"
                                                : "text-red-600"
                                    )}
                                >
                                    {atsScore.score}
                                </div>
                                <div className="text-xs text-muted-foreground">out of 100</div>
                            </div>
                        </div>
                        <Progress value={atsScore.score} className="h-2 mt-3" />
                    </div>
                )}
            </Card>

            {/* Job Description Input */}
            <Card className="p-6 border-2">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base">Paste Job Description</h3>
                            <p className="text-sm text-muted-foreground">
                                Copy the full job posting for best results
                            </p>
                        </div>
                    </div>
                    <Badge variant="outline" className="gap-1">
                        <Target className="w-3 h-3" />
                        Better match = More callbacks
                    </Badge>
                </div>

                <Textarea
                    placeholder={`Paste the complete job description here...

Example:
Senior Full Stack Developer

We are seeking an experienced Full Stack Developer with 5+ years of experience in React, Node.js, and TypeScript. The ideal candidate will have:

• Strong experience with modern JavaScript frameworks
• Proficiency in RESTful API design
• Experience with AWS cloud services
• Excellent problem-solving skills
• Strong communication abilities

Responsibilities:
• Design and develop scalable web applications
• Collaborate with cross-functional teams
• Write clean, maintainable code
• Participate in code reviews

Requirements:
• Bachelor's degree in Computer Science or related field
• 5+ years of professional development experience
• Experience with Docker and CI/CD pipelines
• Knowledge of database design (SQL and NoSQL)

The more complete the job description, the better our AI can analyze the match!`}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[300px] font-mono text-sm resize-none"
                />

                {/* Character Count & Guidance */}
                <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs">
                        <span className={cn("font-medium", getCharCountColor())}>
                            {charCount} characters
                        </span>
                        {charCount < minChars && (
                            <span className="text-red-600">
                                Minimum {minChars} characters required
                            </span>
                        )}
                        {charCount >= minChars && charCount < recommendedChars && (
                            <span className="text-yellow-600">
                                {recommendedChars - charCount} more for optimal results
                            </span>
                        )}
                        {charCount >= recommendedChars && (
                            <span className="text-green-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Great! Sufficient detail for analysis
                            </span>
                        )}
                    </div>
                    <Progress
                        value={Math.min((charCount / recommendedChars) * 100, 100)}
                        className="w-32 h-1.5"
                    />
                </div>
            </Card>

            {/* Analyze Button */}
            <Button
                onClick={onAnalyze}
                disabled={!canAnalyze || isAnalyzing}
                className="w-full h-14 text-base font-semibold"
                size="lg"
            >
                {isAnalyzing ? (
                    <>
                        <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing Your Match...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Analyze Match & Get AI Recommendations
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                )}
            </Button>

            {!canAnalyze && (
                <p className="text-sm text-center text-muted-foreground">
                    {!selectedResumeId
                        ? "Please select a resume to continue"
                        : `Add at least ${minChars - charCount} more characters to the job description`}
                </p>
            )}

            {analysisError && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
                                {analysisError.type === "RATE_LIMIT_EXCEEDED"
                                    ? "Rate Limit Exceeded"
                                    : analysisError.type === "TIMEOUT"
                                    ? "Request Timed Out"
                                    : analysisError.type === "VALIDATION_ERROR"
                                    ? "Invalid Input"
                                    : "Analysis Failed"}
                            </p>
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {analysisError.message}
                            </p>
                            {analysisError.retryable !== false && onRetry && (
                                <Button
                                    onClick={onRetry}
                                    variant="outline"
                                    size="sm"
                                    className="mt-3 border-red-300 hover:bg-red-100 dark:hover:bg-red-950/30"
                                >
                                    <RotateCw className="w-4 h-4 mr-2" />
                                    Try Again
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
