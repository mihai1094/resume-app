import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ResumePreviewMini } from "@/components/resume/resume-preview-mini";
import { JobMatcher } from "@/components/ai/job-matcher";
import {
    Eye,
    Edit,
    Sparkles,
    Loader2,
    FileText,
    Download,
    Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { TemplateId } from "@/lib/constants/templates";
import { ResumeData } from "@/lib/types/resume";

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
    return (
        <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col">
            <div className="relative hidden sm:block h-44 lg:h-48 bg-muted/30 overflow-hidden">
                <ResumePreviewMini
                    templateId={resume.templateId as TemplateId}
                    resumeData={resume.data}
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                    <Button
                        size="sm"
                        variant="secondary"
                        className="shadow-lg"
                        onClick={onPreview}
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        Quick Preview
                    </Button>
                </div>
            </div>

            <CardHeader className="px-4 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg mb-1 truncate">
                            {resume.name}
                        </CardTitle>
                        <Badge variant="outline" className="capitalize w-fit">
                            {resume.templateId}
                        </Badge>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:hidden"
                        onClick={onPreview}
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 sm:pt-2">
                <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                    <p>
                        Created {format(new Date(resume.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                    <p>
                        Updated {format(new Date(resume.updatedAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                </div>

                <div className="space-y-3 mt-4">
                    <Button
                        variant="default"
                        size="sm"
                        onClick={onEdit}
                        className="w-full"
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Resume
                    </Button>

                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="col-span-2 sm:col-auto">
                                    {canOptimize ? (
                                        <JobMatcher
                                            resumeData={resume.data}
                                            variant="icon"
                                            showLabelOnMobile
                                            buttonClassName="w-full justify-center gap-2 sm:w-10 sm:p-0 border border-input bg-background hover:bg-accent"
                                        />
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled
                                            aria-label="AI optimize locked"
                                            className="w-full justify-center gap-2 sm:w-10 sm:px-0"
                                        >
                                            <Sparkles className="w-4 h-4" />
                                            <span className="text-xs font-medium sm:hidden">
                                                AI Locked
                                            </span>
                                        </Button>
                                    )}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                {canOptimize
                                    ? "AI Optimize"
                                    : "Add experience to unlock AI"}
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="col-span-2 sm:col-auto">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onExportPDF}
                                        disabled={isExportingPdf}
                                        aria-label="Export PDF"
                                        className="w-full justify-center gap-2 sm:w-10 sm:px-0"
                                    >
                                        {isExportingPdf ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <FileText className="w-4 h-4" />
                                        )}
                                        <span className="text-xs font-medium sm:hidden">
                                            PDF
                                        </span>
                                    </Button>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>Export PDF</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="col-span-2 sm:col-auto">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onExportJSON}
                                        aria-label="Export JSON"
                                        className="w-full justify-center gap-2 sm:w-10 sm:px-0"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span className="text-xs font-medium sm:hidden">
                                            JSON
                                        </span>
                                    </Button>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>Export JSON</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="col-span-2 sm:col-auto">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onDelete}
                                        aria-label="Delete resume"
                                        className="w-full justify-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 sm:w-10 sm:px-0"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="text-xs font-medium sm:hidden">
                                            Delete
                                        </span>
                                    </Button>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>Delete Resume</TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
