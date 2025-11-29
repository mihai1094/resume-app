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
} from "lucide-react";
import { format } from "date-fns";
import { SavedCoverLetter } from "@/lib/types/cover-letter";
import { cn } from "@/lib/utils";

interface CoverLetterCardProps {
    letter: SavedCoverLetter;
    onPreview?: () => void;
    onExportPDF?: () => void;
    onExportJSON?: () => void;
    onDelete?: (id: string) => void;
    isExportingPdf?: boolean;
}

export function CoverLetterCard({
    letter,
    onPreview,
    onExportPDF,
    onExportJSON,
    onDelete,
    isExportingPdf = false,
}: CoverLetterCardProps) {
    const router = useRouter();

    // Calculate completion percentage
    const hasJobTitle = !!letter.data.jobTitle;
    const hasCompany = !!letter.data.recipient.company;
    const hasSender = !!(
        letter.data.senderName &&
        letter.data.senderEmail
    );
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

    return (
        <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden group">
            {/* Header Section */}
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
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
                            <span className="text-xs text-muted-foreground">Contact</span>
                        </div>
                        <div className="font-semibold text-sm truncate">
                            {letter.data.senderName || "Not specified"}
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
                    {onPreview && (
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
                    )}

                    {/* Export PDF */}
                    {onExportPDF && (
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
                    )}

                    {/* Export JSON */}
                    {onExportJSON && (
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
                    )}

                    {/* Delete */}
                    {onDelete && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onDelete(letter.id)}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete Cover Letter</TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
