"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Eye,
  Edit,
  Sparkles,
  Loader2,
  FileText,
  Trash2,
  Briefcase,
  GraduationCap,
  Code,
  Calendar,
  FileJson,
  FileType,
  Lock,
  ScrollText,
  ListChecks,
  CheckCircle2,
  AlertCircle as AlertCircleIcon,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { TemplateId } from "@/lib/constants/templates";
import { ResumeData } from "@/lib/types/resume";
import { useResumeReadiness } from "@/hooks/use-resume-readiness";
import { cn } from "@/lib/utils";
import { CoverLetterQuickDialog } from "@/components/ai/cover-letter-quick-dialog";
import { InterviewPrepDialog } from "@/components/ai/interview-prep-dialog";

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
  onOptimize: () => void;
  isExportingPdf: boolean;
  canOptimize: boolean;
  isOptimizeLocked: boolean;
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
  onOptimize,
  isExportingPdf,
  canOptimize,
  isOptimizeLocked,
}: ResumeCardProps) {
  const router = useRouter();
  const [showReadinessDialog, setShowReadinessDialog] = useState(false);
  const { result: readinessResult, status: readinessStatus } = useResumeReadiness(resume.data);

  const getReadinessBadgeStyle = (): string => {
    if (!readinessStatus) return "bg-gray-100 text-gray-700 border-gray-200";
    if (readinessStatus.variant === "ready") {
      return "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800";
    }
    return "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
  };

  // Get checks that need attention
  const checksNeedingWork = useMemo(() => {
    if (!readinessResult) return [];
    return readinessResult.checks.filter(c => c.status !== 'pass');
  }, [readinessResult]);

  // Calculate resume stats
  const jobCount = resume.data.workExperience.length;
  const educationCount = resume.data.education.length;
  const skillsCount = resume.data.skills.length;

  // Calculate completion percentage
  const completionPercentage = Math.round(
    (((jobCount > 0 ? 1 : 0) +
      (educationCount > 0 ? 1 : 0) +
      (skillsCount > 0 ? 1 : 0) +
      (resume.data.personalInfo.firstName && resume.data.personalInfo.lastName
        ? 1
        : 0)) /
      4) *
      100
  );

  const templateColor =
    TEMPLATE_COLORS[resume.templateId] || TEMPLATE_COLORS.modern;

  // Get template-specific badge colors with dark mode support
  const getTemplateBadgeColor = (templateId: string): string => {
    const colors: Record<string, string> = {
      modern:
        "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:opacity-80 transition-opacity",
      classic:
        "bg-slate-100 dark:bg-slate-950/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:opacity-80 transition-opacity",
      creative:
        "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:opacity-80 transition-opacity",
      minimalist:
        "bg-gray-100 dark:bg-gray-950/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:opacity-80 transition-opacity",
      executive:
        "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:opacity-80 transition-opacity",
      technical:
        "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800 hover:opacity-80 transition-opacity",
      adaptive:
        "bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:opacity-80 transition-opacity",
      timeline:
        "bg-cyan-100 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800 hover:opacity-80 transition-opacity",
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
            <h3 className="font-bold text-lg truncate mb-2">{resume.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge
                className={cn(
                  "capitalize",
                  getTemplateBadgeColor(resume.templateId)
                )}
              >
                {resume.templateId}
              </Badge>
              <span className="hidden sm:inline-flex items-center justify-center leading-none">
                •
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 leading-none align-middle">
                <Calendar className="w-3 h-3" />
                {format(new Date(resume.updatedAt), "MMM d, h:mm a")}
              </span>
            </div>
          </div>

          {/* Readiness Badge */}
          {readinessStatus && (
            <Badge
              className={cn(
                "shrink-0 border cursor-pointer hover:opacity-80 transition gap-1",
                getReadinessBadgeStyle()
              )}
              onClick={() => setShowReadinessDialog(true)}
              role="button"
              aria-label={`Resume readiness: ${readinessStatus.label}. Click to see details.`}
            >
              {readinessStatus.variant === "ready" ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <AlertCircleIcon className="w-3 h-3" />
              )}
              {readinessStatus.label}
            </Badge>
          )}
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
              Job{jobCount !== 1 ? "s" : ""}
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
              Skill{skillsCount !== 1 ? "s" : ""}
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

        {/* Primary Action */}
        <Button
          variant="default"
          size="lg"
          onClick={() => {
            if (onEdit) {
              onEdit();
              return;
            }
            router.push(`/editor/${resume.id}`);
          }}
          className="w-full"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Resume
        </Button>

        {/* Secondary Actions - Preview & Export */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="default"
            onClick={onPreview}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="default"
            onClick={onExportPDF}
            disabled={isExportingPdf}
            className="gap-2"
          >
            {isExportingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            Export PDF
          </Button>
        </div>

        {/* AI Tools Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI Tools
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <CoverLetterQuickDialog
              resumeData={resume.data}
              trigger={
                <Button variant="outline" size="default" className="w-full gap-2">
                  <ScrollText className="w-4 h-4" />
                  <span className="truncate">Cover Letter</span>
                </Button>
              }
            />
            <InterviewPrepDialog
              resumeData={resume.data}
              trigger={
                <Button variant="outline" size="default" className="w-full gap-2">
                  <ListChecks className="w-4 h-4" />
                  <span className="truncate">Interview</span>
                </Button>
              }
            />
          </div>

          {/* AI Optimize - Full width when available */}
          {(canOptimize || isOptimizeLocked) && (
            <Button
              variant={isOptimizeLocked ? "outline" : "secondary"}
              size="default"
              disabled={!isOptimizeLocked && !canOptimize}
              className="w-full gap-2"
              onClick={onOptimize}
            >
              {isOptimizeLocked ? (
                <>
                  <Lock className="w-4 h-4" />
                  Upgrade to Optimize
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Optimize for Job
                </>
              )}
            </Button>
          )}
        </div>

        {/* Utility Actions */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onExportJSON}
                className="flex-1 gap-2 text-muted-foreground hover:text-foreground"
              >
                <FileJson className="w-4 h-4" />
                <span className="text-xs">JSON</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export as JSON backup</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toast.info("DOCX export coming soon!")}
                className="flex-1 gap-2 text-muted-foreground hover:text-foreground"
              >
                <FileType className="w-4 h-4" />
                <span className="text-xs">DOCX</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export as Word (Coming soon)</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
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

      <Dialog open={showReadinessDialog} onOpenChange={setShowReadinessDialog}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-primary" />
              Resume Readiness
            </DialogTitle>
            <DialogDescription>
              {readinessResult?.isReady
                ? "Your resume passes all required checks."
                : "Complete the required checks to improve your resume."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Summary Badges */}
            {readinessResult && (
              <div className="flex items-center gap-2">
                <Badge
                  variant={readinessResult.isReady ? "default" : "destructive"}
                  className="gap-1"
                >
                  {readinessResult.isReady ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <AlertCircleIcon className="w-3 h-3" />
                  )}
                  Required: {readinessResult.summary.required.passed}/
                  {readinessResult.summary.required.total}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  Tips: {readinessResult.summary.recommended.passed}/
                  {readinessResult.summary.recommended.total}
                </Badge>
              </div>
            )}

            {checksNeedingWork.length === 0 ? (
              <div className="p-3 rounded-lg border bg-green-500/10 border-green-500/20 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-green-700 dark:text-green-300">
                    All checks passed!
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Your resume is ready. Consider tailoring it for specific job postings.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">
                  Items to address ({checksNeedingWork.length})
                </h4>
                <div className="space-y-2">
                  {checksNeedingWork.slice(0, 6).map((check) => (
                    <div
                      key={check.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border",
                        check.status === "fail"
                          ? "bg-red-500/5 border-red-500/20"
                          : "bg-amber-500/5 border-amber-500/20"
                      )}
                    >
                      {check.status === "fail" ? (
                        <AlertCircleIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircleIcon className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{check.label}</span>
                          <Badge
                            variant={check.priority === "required" ? "destructive" : "secondary"}
                            className="text-[10px] h-4 px-1"
                          >
                            {check.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {check.message}
                        </p>
                      </div>
                    </div>
                  ))}
                  {checksNeedingWork.length > 6 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{checksNeedingWork.length - 6} more items
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setShowReadinessDialog(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowReadinessDialog(false);
                  onEdit();
                }}
              >
                Edit Resume
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
