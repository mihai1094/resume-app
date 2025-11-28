"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { JobMatcher } from "@/components/ai/job-matcher";
import {
    Eye,
    Edit,
    Sparkles,
    Loader2,
    FileText,
    Download,
    Trash2,
    Briefcase,
    GraduationCap,
    Code,
    Calendar,
    FileJson,
} from "lucide-react";
import { format } from "date-fns";
import { TemplateId } from "@/lib/constants/templates";
import { ResumeData } from "@/lib/types/resume";
import { calculateResumeScore } from "@/lib/services/resume-scoring";
import { cn } from "@/lib/utils";

interface ResumeCardProps {
    resume: {
        id: string;
        name: string;
        templateId: string;
        data: ResumeData;
        createdAt: Date | string;
        updatedAt: Date | string;
    };
    onEdit: () => void;
    onPreview: () => void;
    onExportPDF: () => void;
    onExportJSON: () => void;
    onDelete: () => void;
    isExportingPdf: boolean;
    canOptimize: boolean;
}

// Template-specific colors
const TEMPLATE_COLORS: Record<string, string> = {
    modern: "text-blue-600 bg-blue-50 border-blue-200",
    classic: "text-slate-700 bg-slate-50 border-slate-200",
    creative: "text-purple-600 bg-purple-50 border-purple-200",
    minimalist: "text-gray-700 bg-gray-50 border-gray-200",
    executive: "text-emerald-700 bg-emerald-50 border-emerald-200",
    technical: "text-orange-600 bg-orange-50 border-orange-200",
    adaptive: "text-indigo-600 bg-indigo-50 border-indigo-200",
    timeline: "text-slate-600 bg-slate-50 border-slate-200",
    ivy: "text-teal-600 bg-teal-50 border-teal-200",
};

export function ResumeCard({
    resume,
    onEdit,
    onPreview,
    onExportPDF,
    onExportJSON,
    onDelete,
    isExportingPdf,
    canOptimize,
}: ResumeCardProps) {
    const router = useRouter();
    const scoreData = calculateResumeScore(resume.data);
    const overallScore = scoreData.overall;

    const getScoreLabel = (score: number): string => {
        if (score >= 90) return "Excellent";
        if (score >= 75) return "Good";
        if (score >= 60) return "Fair";
        return "Needs Work";
    };

    const getScoreColor = (score: number): string => {
        if (score >= 90) return "bg-green-100 text-green-700 border-green-200";
        if (score >= 75) return "bg-blue-100 text-blue-700 border-blue-200";
        if (score >= 60) return "bg-orange-100 text-orange-700 border-orange-200";
        return "bg-red-100 text-red-700 border-red-200";
    };

    // Calculate resume stats
    const jobCount = resume.data.workExperience.length;
    const educationCount = resume.data.education.length;
    const skillsCount = resume.data.skills.length;

    // Calculate completion percentage
    const completionPercentage = Math.round(
        ((jobCount > 0 ? 1 : 0) +
            (educationCount > 0 ? 1 : 0) +
            (skillsCount > 0 ? 1 : 0) +
            (resume.data.personalInfo.firstName && resume.data.personalInfo.lastName ? 1 : 0)) /
        4 *
        100
    );

    const templateColor = TEMPLATE_COLORS[resume.templateId] || TEMPLATE_COLORS.modern;

    // Get template-specific badge colors with dark mode support
    const getTemplateBadgeColor = (templateId: string): string => {
        const colors: Record<string, string> = {
            modern: "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:opacity-80 transition-opacity",
            classic: "bg-slate-100 dark:bg-slate-950/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:opacity-80 transition-opacity",
            creative: "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:opacity-80 transition-opacity",
            minimalist: "bg-gray-100 dark:bg-gray-950/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:opacity-80 transition-opacity",
            executive: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:opacity-80 transition-opacity",
            technical: "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800 hover:opacity-80 transition-opacity",
            adaptive: "bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:opacity-80 transition-opacity",
            timeline: "bg-cyan-100 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800 hover:opacity-80 transition-opacity",
            ivy: "bg-teal-100 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 hover:opacity-80 transition-opacity",
        };
        return colors[templateId] || colors.modern;
    };

    return (
        <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden group">
            {/* Header Section */}
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        {/* Resume Info */}
                        <h3 className="font-bold text-lg truncate mb-2">
                            {resume.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge className={cn("capitalize", getTemplateBadgeColor(resume.templateId))}>
                                {resume.templateId}
                            </Badge>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline">
                                <Calendar className="w-3 h-3 inline mr-1" />
                                {format(new Date(resume.updatedAt), "MMM d, h:mm a")}
                            </span>
                        </div>
                    </div>

                    {/* ATS Score Badge */}
                    <Badge className={cn("shrink-0 border-2", getScoreColor(overallScore))}>
                        {getScoreLabel(overallScore)}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 rounded-lg bg-muted/50 border">
                        <div className="flex items-center justify-center mb-1">
                            <Briefcase className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold">{jobCount}</div>
                        <div className="text-xs text-muted-foreground">
                            Job{jobCount !== 1 ? 's' : ''}
                        </div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50 border">
                        <div className="flex items-center justify-center mb-1">
                            <GraduationCap className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold">{educationCount}</div>
                        <div className="text-xs text-muted-foreground">Education</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50 border">
                        <div className="flex items-center justify-center mb-1">
                            <Code className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold">{skillsCount}</div>
                        <div className="text-xs text-muted-foreground">
                            Skill{skillsCount !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>

                {/* Completion Progress */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Completion</span>
                        <span className="font-semibold">{completionPercentage}%</span>
                    </div>
                    <Progress value={completionPercentage} className="h-2" />
                </div>

                {/* Primary Action - Edit */}
                <Button
                    variant="default"
                    size="lg"
                    onClick={() => {
                        // Prefer the provided edit handler so the resume data gets preloaded
                        if (onEdit) {
                            onEdit();
                            return;
                        }
                        router.push(`/edit?id=${resume.id}`);
                    }}
                    className="w-full"
                >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Resume
                </Button>

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {/* Preview */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onPreview}
                                className="col-span-2 sm:col-span-1"
                            >
                                <Eye className="w-4 h-4 sm:mr-0 mr-2" />
                                <span className="sm:hidden">Preview</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Quick Preview</TooltipContent>
                    </Tooltip>

                    {/* AI Optimize */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="col-span-2 sm:col-span-1">
                                {canOptimize ? (
                                    <JobMatcher
                                        resumeData={resume.data}
                                        variant="icon"
                                        showLabelOnMobile
                                        buttonClassName="w-full h-9"
                                    />
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled
                                        className="w-full"
                                    >
                                        <Sparkles className="w-4 h-4 sm:mr-0 mr-2" />
                                        <span className="sm:hidden">AI Locked</span>
                                    </Button>
                                )}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            {canOptimize ? "AI Optimize" : "Add experience to unlock AI"}
                        </TooltipContent>
                    </Tooltip>

                    {/* Export PDF */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onExportPDF}
                                disabled={isExportingPdf}
                            >
                                {isExportingPdf ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <FileText className="w-4 h-4" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Export PDF</TooltipContent>
                    </Tooltip>

                    {/* Export JSON */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onExportJSON}
                            >
                                <FileJson className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Export JSON</TooltipContent>
                    </Tooltip>

                    {/* Delete */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onDelete}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete Resume</TooltipContent>
                    </Tooltip>
                </div>
            </CardContent>
        </Card>
    );
}
