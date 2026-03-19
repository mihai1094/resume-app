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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Edit,
  Palette,
  Sparkles,
  Loader2,
  FileText,
  Trash2,
  Calendar,
  FileJson,
  Lock,
  ScrollText,
  CheckCircle2,
  AlertCircle as AlertCircleIcon,
  X,
  RotateCcw,
  MoreHorizontal,
  ListChecks,
} from "lucide-react";
import { format } from "date-fns";
import { ResumeData } from "@/lib/types/resume";
import { useResumeReadiness } from "@/hooks/use-resume-readiness";
import { useDismissedChecks } from "@/hooks/use-dismissed-checks";
import { cn } from "@/lib/utils";
import { CoverLetterQuickDialog } from "@/components/ai/cover-letter-quick-dialog";

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
  onDesign?: () => void;
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
  onDesign,
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

  // Gradient map per template for the card background
  const getTemplateGradient = (tid: string): string => {
    const g: Record<string, string> = {
      modern: "from-blue-500/20 via-blue-400/10 to-indigo-500/15",
      classic: "from-slate-400/20 via-slate-300/10 to-slate-500/15",
      creative: "from-purple-500/20 via-fuchsia-400/10 to-pink-500/15",
      minimalist: "from-gray-400/15 via-gray-300/10 to-zinc-400/15",
      executive: "from-emerald-500/20 via-teal-400/10 to-green-500/15",
      technical: "from-orange-500/20 via-amber-400/10 to-yellow-500/15",
      adaptive: "from-indigo-500/20 via-violet-400/10 to-purple-500/15",
      timeline: "from-cyan-500/20 via-sky-400/10 to-blue-400/15",
      ivy: "from-teal-500/20 via-emerald-400/10 to-green-400/15",
    };
    return g[tid] || g.modern;
  };

  const initials = `${resume.data?.personalInfo?.firstName?.[0] ?? ""}${resume.data?.personalInfo?.lastName?.[0] ?? ""}`.toUpperCase() || "?";
  const fullName = resume.data?.personalInfo?.firstName
    ? `${resume.data.personalInfo.firstName} ${resume.data.personalInfo.lastName ?? ""}`.trim()
    : resume.name;
  const jobTitle = resume.data?.personalInfo?.jobTitle;

  // Content fingerprint — helps differentiate cards with same name/date
  const contentSummary = useMemo(() => {
    const d = resume.data;
    if (!d) return null;

    // Priority 1: latest work experience (most distinguishing)
    const latestJob = d.workExperience?.[0];
    if (latestJob?.position && latestJob?.company) {
      return `${latestJob.position} at ${latestJob.company}`;
    }
    if (latestJob?.position) return latestJob.position;
    if (latestJob?.company) return latestJob.company;

    // Priority 2: section counts as fallback
    const parts: string[] = [];
    const skills = d.skills?.length ?? 0;
    const edu = d.education?.length ?? 0;
    const projects = d.projects?.length ?? 0;
    if (skills > 0) parts.push(`${skills} skill${skills !== 1 ? "s" : ""}`);
    if (edu > 0) parts.push(`${edu} education`);
    if (projects > 0) parts.push(`${projects} project${projects !== 1 ? "s" : ""}`);
    return parts.length > 0 ? parts.join(" · ") : null;
  }, [resume.data]);

  const handleFixAction = (sectionId: string) => {
    setShowReadinessDialog(false);
    router.push(`/editor/${resume.id}?section=${sectionId}`);
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full border-muted/60 hover:border-primary/30">
      {/* Thumbnail */}
      <div
        className={cn(
          "relative h-44 overflow-hidden cursor-pointer bg-gradient-to-br",
          getTemplateGradient(resume.templateId)
        )}
        onClick={() => onEdit()}
      >
        {/* Subtle dot grid pattern */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />

        {/* Centered identity */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-2xl bg-background/80 backdrop-blur border border-border/40 shadow-md flex items-center justify-center">
            <span className="text-xl font-bold text-foreground/80">{initials}</span>
          </div>
          {/* Name */}
          <div className="text-center max-w-[200px]">
            <p className="font-semibold text-sm text-foreground/90 truncate leading-tight">{fullName}</p>
            {jobTitle && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">{jobTitle}</p>
            )}
          </div>
        </div>

        {/* Top-left: more menu */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-background/60 hover:bg-background/90 backdrop-blur-sm shadow-sm rounded-full"
              >
                <MoreHorizontal className="w-4 h-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview();
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </DropdownMenuItem>
              {onDesign && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDesign();
                  }}
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Change Design
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onExportJSON();
                }}
              >
                <FileJson className="w-4 h-4 mr-2" />
                Export JSON
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Top-right: template + readiness badges */}
        <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1.5 z-10 pointer-events-none">
          <Badge
            className={cn(
              "capitalize text-[10px] h-5 px-2 shadow-sm backdrop-blur-sm",
              getTemplateBadgeColor(resume.templateId)
            )}
          >
            {resume.templateId}
          </Badge>
          {readinessStatus && (
            <Badge
              className={cn(
                "flex items-center gap-1 text-[10px] h-5 px-2 shadow-sm backdrop-blur-sm font-medium pointer-events-auto cursor-pointer",
                isEffectivelyReady
                  ? "bg-green-100/90 text-green-700 border-green-300 dark:bg-green-950/60 dark:text-green-300 dark:border-green-800"
                  : "bg-amber-100/90 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
              )}
              onClick={(e) => { e.stopPropagation(); setShowReadinessDialog(true); }}
            >
              {isEffectivelyReady
                ? <CheckCircle2 className="w-2.5 h-2.5" />
                : <AlertCircleIcon className="w-2.5 h-2.5" />}
              {readinessStatus.label}
            </Badge>
          )}
        </div>

        {/* Hover overlay with actions — pointer devices only */}
        <div className="absolute inset-0 bg-background/70 backdrop-blur-[3px] opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-all duration-200 hidden [@media(hover:hover)]:flex flex-col items-center justify-center gap-2.5 z-0">
          <Button
            variant="default"
            size="sm"
            className="w-28 shadow-md"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
          >
            <Edit className="w-3.5 h-3.5 mr-2" />
            Edit
          </Button>
          <div className="flex gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 shadow-sm"
                  onClick={(e) => { e.stopPropagation(); onPreview(); }}
                >
                  <Eye className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Full Preview</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 shadow-sm"
                  onClick={(e) => { e.stopPropagation(); onExportPDF(); }}
                  disabled={isExportingPdf}
                >
                  {isExportingPdf
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <FileText className="w-3.5 h-3.5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export PDF</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 shadow-sm text-destructive hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Info + Actions Area */}
      <div className="p-4 flex flex-col flex-grow justify-between bg-card">
        <div className="mb-3">
          <h3 className="font-semibold text-sm truncate" title={resume.name}>
            {resume.name}
          </h3>
          {contentSummary && (
            <p className="text-xs text-muted-foreground/80 truncate mt-0.5" title={contentSummary}>
              {contentSummary}
            </p>
          )}
          <div className="flex items-center text-xs text-muted-foreground gap-1.5 mt-1">
            <Calendar className="w-3 h-3 shrink-0" />
            <span>Edited {format(new Date(resume.updatedAt), "MMM d, yyyy")}</span>
          </div>
        </div>

        {/* Mobile quick actions — touch devices */}
        <div className="flex gap-2 [@media(hover:hover)]:hidden pt-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1 min-h-[44px]"
            onClick={onEdit}
          >
            <Edit className="w-3.5 h-3.5 mr-1.5" />
            Edit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="min-h-[44px] min-w-[44px] px-3"
            onClick={onExportPDF}
            disabled={isExportingPdf}
          >
            {isExportingPdf
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <><FileText className="w-3.5 h-3.5 mr-1.5" />PDF</>}
          </Button>
        </div>

        {/* AI Tools Section */}
        <div className="pt-3 border-t space-y-2 mt-auto">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Sparkles className="w-3 h-3 text-purple-500" />
            <span className="font-medium text-purple-500 dark:text-purple-400">AI Tools</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <CoverLetterQuickDialog
              resumeData={resume.data}
              trigger={
                <Button variant="outline" size="sm" className="min-h-[44px] sm:min-h-0 sm:h-8 h-auto w-full justify-start text-xs px-2.5 sm:px-2 border-dashed">
                  <ScrollText className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                  Cover Letter
                </Button>
              }
            />

            {(canOptimize || isOptimizeLocked) && (
              <Button
                variant={isOptimizeLocked ? "outline" : "secondary"}
                size="sm"
                disabled={!isOptimizeLocked && !canOptimize}
                className={cn(
                  "w-full min-h-[44px] sm:min-h-0 sm:h-8 h-auto text-xs justify-start px-2.5 sm:px-2",
                  !isOptimizeLocked && "bg-gradient-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20 border border-purple-500/20",
                  isOptimizeLocked && "border-dashed"
                )}
                onClick={onOptimize}
              >
                {isOptimizeLocked ? (
                  <><Lock className="w-3.5 h-3.5 mr-1.5 shrink-0" />Optimize</>
                ) : (
                  <><Sparkles className="w-3.5 h-3.5 mr-1.5 shrink-0" />Optimize</>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>




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
                        {check.fixAction && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2 h-7 text-xs"
                            onClick={() => handleFixAction(check.fixAction!.sectionId)}
                          >
                            {check.fixAction.label}
                          </Button>
                        )}
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
    </Card >
  );
}
