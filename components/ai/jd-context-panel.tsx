"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Target,
  Sparkles,
  Plus,
  RefreshCw,
  Trash2,
  FileText,
  ListChecks,
  Zap,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { JobDescriptionContext } from "@/lib/types/job-context";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface JDContextPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: JobDescriptionContext | null;
  matchScore: number | null;
  missingKeywords: string[];
  matchedSkills: string[];
  needsRefresh: boolean;
  isAnalyzing?: boolean;
  onSetJobDescription: (
    jd: string,
    jobTitle?: string,
    company?: string
  ) => boolean;
  onClearContext: () => void;
  onRefreshScore: () => void;
  onAddSkills?: () => void;
  onTailorBullets?: () => void;
  onGenerateCover?: () => void;
  onInterviewPrep?: () => void;
}

export function JDContextPanel({
  open,
  onOpenChange,
  context,
  matchScore,
  missingKeywords,
  matchedSkills,
  needsRefresh,
  isAnalyzing = false,
  onSetJobDescription,
  onClearContext,
  onRefreshScore,
  onAddSkills,
  onTailorBullets,
  onGenerateCover,
  onInterviewPrep,
}: JDContextPanelProps) {
  const [isEditing, setIsEditing] = useState(!context);
  const [draftJD, setDraftJD] = useState(context?.jobDescription || "");
  const [draftTitle, setDraftTitle] = useState(context?.jobTitle || "");
  const [draftCompany, setDraftCompany] = useState(context?.company || "");
  const [showFullJD, setShowFullJD] = useState(false);

  // SVG Circle logic
  const circleSize = 64;
  const strokeWidth = 6;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const scoreOffset = matchScore !== null
    ? circumference - (matchScore / 100) * circumference
    : circumference;

  const handleSave = useCallback(() => {
    if (draftJD.trim().length < 50) {
      toast.error("Job description must be at least 50 characters");
      return;
    }
    const saved = onSetJobDescription(
      draftJD.trim(),
      draftTitle.trim(),
      draftCompany.trim()
    );
    if (!saved) {
      toast.error("Save your resume first to add a target job");
      return;
    }
    setIsEditing(false);
    toast.success("Job description saved");
  }, [draftJD, draftTitle, draftCompany, onSetJobDescription]);

  const handleClear = useCallback(() => {
    onClearContext();
    setDraftJD("");
    setDraftTitle("");
    setDraftCompany("");
    setIsEditing(true);
    toast.info("Job description cleared");
  }, [onClearContext]);

  const handleEdit = useCallback(() => {
    setDraftJD(context?.jobDescription || "");
    setDraftTitle(context?.jobTitle || "");
    setDraftCompany(context?.company || "");
    setIsEditing(true);
  }, [context]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-500";
    if (score >= 60) return "text-amber-600 dark:text-amber-500";
    return "text-rose-600 dark:text-rose-500";
  };

  const getScoreStrokeColor = (score: number) => {
    if (score >= 80) return "stroke-emerald-500";
    if (score >= 60) return "stroke-amber-500";
    return "stroke-rose-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Needs Improvement";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-2xl p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl sm:rounded-2xl">
        <DialogHeader className="px-6 py-5 border-b border-border/50 bg-muted/20">
          <DialogTitle className="flex items-center gap-2.5 text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="w-5 h-5 text-primary" />
            </div>
            Target Job Context
          </DialogTitle>
          <DialogDescription>
            Tailor your resume content and AI suggestions to a specific role.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-130px)] px-6 py-6">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle" className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Job Title (optional)</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="jobTitle"
                        placeholder="e.g., Senior Software Engineer"
                        value={draftTitle}
                        onChange={(e) => setDraftTitle(e.target.value)}
                        className="pl-9 bg-muted/30 border-muted/50 focus-visible:ring-primary/20 h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Company (optional)</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="company"
                        placeholder="e.g., Stripe"
                        value={draftCompany}
                        onChange={(e) => setDraftCompany(e.target.value)}
                        className="pl-9 bg-muted/30 border-muted/50 focus-visible:ring-primary/20 h-11"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="jobDescription" className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Job Description</Label>
                    <span className={cn(
                      "text-xs font-medium",
                      draftJD.length < 50 ? "text-amber-500" : "text-emerald-500"
                    )}>
                      {draftJD.length} / 50+ chars
                    </span>
                  </div>
                  <Textarea
                    id="jobDescription"
                    placeholder="Paste the full job description here. The more details, the better the AI can tailor your resume..."
                    value={draftJD}
                    onChange={(e) => setDraftJD(e.target.value)}
                    className="min-h-[240px] resize-y bg-muted/30 border-muted/50 focus-visible:ring-primary/20 leading-relaxed p-4"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={draftJD.trim().length < 50}
                    className="flex-1 h-11"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Save Target Job
                  </Button>
                  {context && (
                    <Button variant="outline" onClick={() => setIsEditing(false)} className="h-11 px-8">
                      Cancel
                    </Button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8 pb-4"
              >
                {context && (
                  <>
                    {/* Header Card */}
                    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-muted/50 to-muted/10 p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1">
                          {context.jobTitle ? (
                            <h3 className="font-semibold text-xl tracking-tight">
                              {context.jobTitle}
                            </h3>
                          ) : (
                            <h3 className="font-semibold text-xl tracking-tight text-muted-foreground italic">
                              Untitled Role
                            </h3>
                          )}
                          {context.company && (
                            <div className="flex items-center text-muted-foreground text-sm font-medium">
                              <Building2 className="w-4 h-4 mr-1.5" />
                              {context.company}
                            </div>
                          )}
                        </div>

                        {/* Match Score Display */}
                        {matchScore !== null && (
                          <div className="flex items-center gap-4 bg-background/50 backdrop-blur-sm px-4 py-2.5 rounded-lg border border-border/50">
                            <div className="relative flex items-center justify-center">
                              <svg width={circleSize} height={circleSize} className="transform -rotate-90">
                                <circle
                                  cx={circleSize / 2}
                                  cy={circleSize / 2}
                                  r={radius}
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={strokeWidth}
                                  className="text-muted opacity-30"
                                />
                                <motion.circle
                                  cx={circleSize / 2}
                                  cy={circleSize / 2}
                                  r={radius}
                                  fill="none"
                                  strokeWidth={strokeWidth}
                                  strokeDasharray={circumference}
                                  strokeDashoffset={circumference}
                                  animate={{ strokeDashoffset: scoreOffset }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  strokeLinecap="round"
                                  className={cn("transition-colors", getScoreStrokeColor(matchScore))}
                                />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={cn("text-sm font-bold", getScoreColor(matchScore))}>
                                  {matchScore}%
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span className={cn("font-semibold text-sm", getScoreColor(matchScore))}>
                                {getScoreLabel(matchScore)}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                {needsRefresh && (
                                  <Badge variant="outline" className="text-[10px] h-4 px-1 py-0 bg-amber-500/10 text-amber-700 dark:text-amber-500 border-amber-500/30">
                                    Outdated
                                  </Badge>
                                )}
                                <button
                                  onClick={onRefreshScore}
                                  disabled={isAnalyzing}
                                  className="text-[10px] font-medium text-muted-foreground hover:text-foreground flex items-center transition-colors"
                                >
                                  <RefreshCw className={cn("w-3 h-3 mr-1", isAnalyzing && "animate-spin")} />
                                  Refresh
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Keywords Section */}
                    {(missingKeywords.length > 0 || matchedSkills.length > 0) && (
                      <div className="space-y-5">
                        {matchedSkills.length > 0 && (
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-emerald-600 dark:text-emerald-500">
                              <CheckCircle2 className="w-4 h-4" />
                              Matched Keywords ({matchedSkills.length})
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {matchedSkills.slice(0, 12).map((skill) => (
                                <Badge
                                  key={skill}
                                  variant="outline"
                                  className="px-2.5 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                                >
                                  {skill}
                                </Badge>
                              ))}
                              {matchedSkills.length > 12 && (
                                <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-medium bg-muted/50">
                                  +{matchedSkills.length - 12} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {missingKeywords.length > 0 && (
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-amber-600 dark:text-amber-500">
                              <AlertCircle className="w-4 h-4" />
                              Missing Keywords ({missingKeywords.length})
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {missingKeywords.slice(0, 12).map((keyword) => (
                                <Badge
                                  key={keyword}
                                  variant="outline"
                                  className="px-2.5 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                                >
                                  {keyword}
                                </Badge>
                              ))}
                              {missingKeywords.length > 12 && (
                                <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-medium bg-muted/50">
                                  +{missingKeywords.length - 12} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <Separator className="border-border/50" />

                    {/* Quick Actions Grid */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold tracking-tight flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        AI Power Tools
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {onAddSkills && missingKeywords.length > 0 && (
                          <button
                            onClick={onAddSkills}
                            className="flex flex-col items-start gap-2 p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-primary/5 hover:border-primary/30 transition-all text-left group"
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <Plus className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold text-sm">Add Missing Skills</div>
                              <div className="text-[11px] text-muted-foreground mt-0.5 leading-tight">Auto-inject {missingKeywords.length} keywords</div>
                            </div>
                          </button>
                        )}
                        {onTailorBullets && (
                          <button
                            onClick={onTailorBullets}
                            className="flex flex-col items-start gap-2 p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-primary/5 hover:border-primary/30 transition-all text-left group"
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <Zap className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold text-sm">Tailor Bullets</div>
                              <div className="text-[11px] text-muted-foreground mt-0.5 leading-tight">Rewrite experience easily</div>
                            </div>
                          </button>
                        )}
                        {onGenerateCover && (
                          <button
                            onClick={onGenerateCover}
                            className="flex flex-col items-start gap-2 p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-primary/5 hover:border-primary/30 transition-all text-left group"
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <FileText className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold text-sm">Cover Letter</div>
                              <div className="text-[11px] text-muted-foreground mt-0.5 leading-tight">Generate highly targeted</div>
                            </div>
                          </button>
                        )}
                        {onInterviewPrep && (
                          <button
                            onClick={onInterviewPrep}
                            className="flex flex-col items-start gap-2 p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-primary/5 hover:border-primary/30 transition-all text-left group"
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <ListChecks className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold text-sm">Interview Prep</div>
                              <div className="text-[11px] text-muted-foreground mt-0.5 leading-tight">Generate prep questions</div>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>

                    <Separator className="border-border/50" />

                    {/* JD Preview */}
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFullJD(!showFullJD)}
                        className="w-full justify-between hover:bg-muted/50 rounded-lg px-3"
                      >
                        <span className="text-sm font-semibold">View Raw Description</span>
                        {showFullJD ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                      <AnimatePresence>
                        {showFullJD && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 bg-muted/30 border border-border/50 rounded-lg text-sm text-muted-foreground whitespace-pre-wrap max-h-[250px] overflow-y-auto mt-2 font-mono text-[13px] leading-relaxed">
                              {context.jobDescription}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" onClick={handleEdit} className="flex-1 bg-background shadow-sm hover:bg-accent hover:text-accent-foreground border-border/50">
                        Edit Target Job
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={handleClear}
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 px-4"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Small badge component for showing in the header
 */
interface JDIndicatorBadgeProps {
  isActive: boolean;
  matchScore: number | null;
  needsRefresh: boolean;
  onClick: () => void;
}

export function JDIndicatorBadge({
  isActive,
  matchScore,
  needsRefresh,
  onClick,
}: JDIndicatorBadgeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-500 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20";
    if (score >= 60) return "text-amber-600 dark:text-amber-500 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20";
    return "text-rose-600 dark:text-rose-500 border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20";
  };

  if (!isActive) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onClick}
        className="gap-2 h-9 pl-3 pr-2 text-primary border-primary/40 bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 transition-colors shadow-sm"
      >
        <Target className="w-4 h-4 shrink-0" />
        <span className="hidden lg:inline font-semibold">Add Target Job</span>
        <Badge
          variant="secondary"
          className="hidden xl:inline-flex h-5 px-1.5 text-[10px] font-semibold"
        >
          Recommended
        </Badge>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn(
        "gap-2 transition-colors bg-background/50 backdrop-blur-sm",
        matchScore !== null ? getScoreColor(matchScore) : "hover:bg-primary/5 border-primary/20 text-primary",
        needsRefresh && "border-dashed"
      )}
    >
      <Target className="w-4 h-4" />
      {matchScore !== null ? (
        <span className="font-semibold tracking-tight">
          Score: {matchScore}%{needsRefresh && "*"}
        </span>
      ) : (
        <span className="font-semibold tracking-tight">JD Active</span>
      )}
    </Button>
  );
}
