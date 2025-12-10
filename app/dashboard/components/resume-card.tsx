"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Calendar,
  FileJson,
  FileType,
  Lock,
  ScrollText,
  ListChecks,
  CheckCircle2,
  AlertCircle as AlertCircleIcon,
  X,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ResumeData } from "@/lib/types/resume";
import { useResumeReadiness } from "@/hooks/use-resume-readiness";
import { useDismissedChecks } from "@/hooks/use-dismissed-checks";
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
  const { dismissedIds, dismissCheck, restoreCheck, resetAll, hasDismissed } = useDismissedChecks(resume.id);

  const getReadinessBadgeStyle = (): string => {
    if (!readinessStatus) return "bg-gray-100 text-gray-700 border-gray-200";
    if (readinessStatus.variant === "ready") {
      return "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800";
    }
    return "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
  };

  // Get checks that need attention (excluding dismissed recommended checks)
  const checksNeedingWork = useMemo(() => {
    if (!readinessResult) return [];
    return readinessResult.checks.filter(c => {
      if (c.status === 'pass') return false;
      // Required checks cannot be dismissed
      if (c.priority === 'required') return true;
      // Recommended checks can be dismissed
      return !dismissedIds.has(c.id);
    });
  }, [readinessResult, dismissedIds]);

  // Get dismissed checks for showing in dialog
  const dismissedChecks = useMemo(() => {
    if (!readinessResult) return [];
    return readinessResult.checks.filter(c =>
      c.status !== 'pass' &&
      c.priority === 'recommended' &&
      dismissedIds.has(c.id)
    );
  }, [readinessResult, dismissedIds]);

  // Calculate if resume is "ready" considering dismissed checks
  const isEffectivelyReady = useMemo(() => {
    if (!readinessResult) return false;
    // Ready if all required checks pass (recommended can be dismissed)
    const requiredFailing = readinessResult.checks.filter(
      c => c.priority === 'required' && c.status !== 'pass'
    );
    return requiredFailing.length === 0;
  }, [readinessResult]);

  // Calculate actual summary counts (for display in badges)
  const actualSummary = useMemo(() => {
    if (!readinessResult) return { required: { passed: 0, total: 0 }, recommended: { passed: 0, total: 0 } };

    const requiredChecks = readinessResult.checks.filter(c => c.priority === 'required');
    const recommendedChecks = readinessResult.checks.filter(c => c.priority === 'recommended');

    return {
      required: {
        passed: requiredChecks.filter(c => c.status === 'pass').length,
        total: requiredChecks.length
      },
      recommended: {
        // Count passed + dismissed as "done" (user chose to skip them)
        passed: recommendedChecks.filter(c => c.status === 'pass').length + dismissedChecks.length,
        total: recommendedChecks.length
      }
    };
  }, [readinessResult, dismissedChecks]);

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
        {/* Readiness Status */}
        {readinessResult && (
          <button
            onClick={() => setShowReadinessDialog(true)}
            className={cn(
              "w-full p-3 rounded-lg border text-left transition-colors hover:opacity-90",
              isEffectivelyReady
                ? "bg-green-500/10 border-green-500/20"
                : "bg-amber-500/10 border-amber-500/20"
            )}
          >
            <div className="flex items-center gap-2">
              {isEffectivelyReady ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              )}
              <span className={cn(
                "text-sm font-medium",
                isEffectivelyReady
                  ? "text-green-700 dark:text-green-300"
                  : "text-amber-700 dark:text-amber-300"
              )}>
                {isEffectivelyReady
                  ? "Ready to export"
                  : `${checksNeedingWork.filter(c => c.priority === 'required').length} sections need attention`}
              </span>
            </div>
            {!isEffectivelyReady && checksNeedingWork.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1 ml-6">
                {checksNeedingWork
                  .filter(c => c.priority === 'required')
                  .slice(0, 2)
                  .map(c => c.label)
                  .join(", ")}
                {checksNeedingWork.filter(c => c.priority === 'required').length > 2 && "..."}
              </p>
            )}
          </button>
        )}

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
                  <span className="truncate">New Letter</span>
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
              {isEffectivelyReady
                ? "Your resume passes all required checks."
                : "Complete the required checks to improve your resume."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Summary Badges */}
            {readinessResult && (
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant={isEffectivelyReady ? "default" : "destructive"}
                  className="gap-1"
                >
                  {isEffectivelyReady ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <AlertCircleIcon className="w-3 h-3" />
                  )}
                  Required: {actualSummary.required.passed}/
                  {actualSummary.required.total}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  Tips: {actualSummary.recommended.passed}/
                  {actualSummary.recommended.total}
                </Badge>
                {hasDismissed && (
                  <button
                    onClick={resetAll}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 ml-auto"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset dismissed
                  </button>
                )}
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
                  {checksNeedingWork.slice(0, 8).map((check) => (
                    <div
                      key={check.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border",
                        check.priority === "required"
                          ? "bg-red-500/5 border-red-500/20"
                          : "bg-amber-500/5 border-amber-500/20"
                      )}
                    >
                      {check.priority === "required" ? (
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
                      {/* Dismiss button - only for recommended checks */}
                      {check.priority === "recommended" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => dismissCheck(check.id)}
                              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                              aria-label={`Dismiss ${check.label}`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Dismiss this tip</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  ))}
                  {checksNeedingWork.length > 8 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{checksNeedingWork.length - 8} more items
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Dismissed checks section */}
            {dismissedChecks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Dismissed tips ({dismissedChecks.length})
                </h4>
                <div className="space-y-1">
                  {dismissedChecks.map((check) => (
                    <div
                      key={check.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 text-muted-foreground text-sm"
                    >
                      <span className="flex-1 line-through">{check.label}</span>
                      <button
                        onClick={() => restoreCheck(check.id)}
                        className="text-xs hover:text-foreground flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Restore
                      </button>
                    </div>
                  ))}
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
