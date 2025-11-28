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
import {
    Eye,
    Edit,
    Loader2,
    FileText,
    Download,
    Trash2,
    Building2,
    User,
    Calendar,
    FileJson,
    Mail,
} from "lucide-react";
import { format } from "date-fns";
import { SavedCoverLetter } from "@/lib/types/cover-letter";
import { cn } from "@/lib/utils";

interface CoverLetterCardProps {
    letter: SavedCoverLetter;
    onPreview: () => void;
    onExportPDF: () => void;
    onExportJSON: () => void;
    onDelete: () => void;
    isExportingPdf: boolean;
}

// Template-specific colors
const TEMPLATE_COLORS: Record<string, string> = {
    modern: "text-blue-600 bg-blue-50 border-blue-200",
    classic: "text-slate-700 bg-slate-50 border-slate-200",
    professional: "text-emerald-700 bg-emerald-50 border-emerald-200",
    creative: "text-purple-600 bg-purple-50 border-purple-200",
};

export function CoverLetterCard({
    letter,
    onPreview,
    onExportPDF,
    onExportJSON,
    onDelete,
    isExportingPdf,
}: CoverLetterCardProps) {
    const router = useRouter();

    // Calculate completion percentage
    const hasJobTitle = !!letter.data.jobTitle;
    const hasCompany = !!letter.data.recipient.company;
    const hasSender = !!(letter.data.sender.name && letter.data.sender.email);
    const hasContent = !!(
        letter.data.salutation &&
        letter.data.openingParagraph &&
        letter.data.closingParagraph
    );

    const completionPercentage = Math.round(
        ((hasJobTitle ? 1 : 0) +
            (hasCompany ? 1 : 0) +
            (hasSender ? 1 : 0) +
            (hasContent ? 1 : 0)) /
        4 *
        100
    );

    const templateColor = TEMPLATE_COLORS[letter.data.templateId] || TEMPLATE_COLORS.modern;

    return (
        <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden group">
            {/* Header Section */}
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Template Icon */}
                        <div className={cn(
                            "w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border-2",
                            templateColor
                        )}>
                            <Mail className="w-6 h-6" />
                        </div>

                        {/* Letter Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg truncate mb-1">
                                {letter.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="outline" className="capitalize">
                                    {letter.data.templateId}
                                </Badge>
                                <span className="hidden sm:inline">•</span>
                                <span className="hidden sm:inline">
                                    <Calendar className="w-3 h-3 inline mr-1" />
                                    {format(new Date(letter.updatedAt), "MMM d, h:mm a")}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Completion Badge */}
                    <Badge className={cn(
                        "shrink-0 border-2",
                        completionPercentage === 100
                            ? "bg-green-100 text-green-700 border-green-200"
                            : completionPercentage >= 75
                                ? "bg-blue-100 text-blue-700 border-blue-200"
                                : "bg-orange-100 text-orange-700 border-orange-200"
                    )}>
                        {completionPercentage}%
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50 border">
                        <div className="flex items-center gap-2 mb-1">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Company</span>
                        </div>
                        <div className="font-semibold text-sm truncate">
                            {letter.data.recipient.company || "Not specified"}
                        </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 border">
                        <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Position</span>
                        </div>
                        <div className="font-semibold text-sm truncate">
                            {letter.data.jobTitle || "Not specified"}
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
                    onClick={() => router.push(`/edit-cover-letter?id=${letter.id}`)}
                    className="w-full"
                >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Cover Letter
                </Button>

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                        <TooltipContent>Delete Cover Letter</TooltipContent>
                    </Tooltip>
                </div>
            </CardContent>
        </Card>
    );
}
