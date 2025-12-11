"use client";

import { useState, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { JobDescriptionContext } from "@/lib/types/job-context";
import { toast } from "sonner";

interface JDContextPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: JobDescriptionContext | null;
  matchScore: number | null;
  missingKeywords: string[];
  matchedSkills: string[];
  needsRefresh: boolean;
  isAnalyzing?: boolean;
  onSetJobDescription: (jd: string, jobTitle?: string, company?: string) => void;
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

  const handleSave = useCallback(() => {
    if (draftJD.trim().length < 50) {
      toast.error("Job description must be at least 50 characters");
      return;
    }
    onSetJobDescription(draftJD.trim(), draftTitle.trim(), draftCompany.trim());
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
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Needs Improvement";
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Job Description Context
          </SheetTitle>
          <SheetDescription>
            Set a target job to get tailored suggestions across all AI features.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] mt-4">
          <div className="space-y-6 pr-4">
            {/* Edit Mode */}
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title (optional)</Label>
                    <Input
                      id="jobTitle"
                      placeholder="e.g., Senior Software Engineer"
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company (optional)</Label>
                    <Input
                      id="company"
                      placeholder="e.g., Stripe"
                      value={draftCompany}
                      onChange={(e) => setDraftCompany(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobDescription">Job Description</Label>
                  <Textarea
                    id="jobDescription"
                    placeholder="Paste the full job description here..."
                    value={draftJD}
                    onChange={(e) => setDraftJD(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{draftJD.length} characters</span>
                    <span>Minimum: 50 characters</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={draftJD.trim().length < 50}
                    className="flex-1"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Set Target Job
                  </Button>
                  {context && (
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* View Mode */}
                {context && (
                  <>
                    {/* Job Header */}
                    <div className="space-y-2">
                      {(context.jobTitle || context.company) && (
                        <div className="flex items-center gap-2 flex-wrap">
                          {context.jobTitle && (
                            <h3 className="font-semibold text-lg">
                              {context.jobTitle}
                            </h3>
                          )}
                          {context.company && (
                            <Badge variant="secondary">{context.company}</Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Match Score */}
                    {matchScore !== null && (
                      <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Match Score</span>
                          <div className="flex items-center gap-2">
                            {needsRefresh && (
                              <Badge variant="outline" className="text-xs text-amber-600">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Outdated
                              </Badge>
                            )}
                            <span className={cn("text-2xl font-bold", getScoreColor(matchScore))}>
                              {matchScore}%
                            </span>
                          </div>
                        </div>
                        <Progress value={matchScore} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className={getScoreColor(matchScore)}>
                            {getScoreLabel(matchScore)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={onRefreshScore}
                            disabled={isAnalyzing}
                            className="h-6 text-xs"
                          >
                            <RefreshCw className={cn("w-3 h-3 mr-1", isAnalyzing && "animate-spin")} />
                            Refresh
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Keywords */}
                    {(missingKeywords.length > 0 || matchedSkills.length > 0) && (
                      <div className="space-y-3">
                        {matchedSkills.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                              <CheckCircle2 className="w-4 h-4" />
                              Matched Skills ({matchedSkills.length})
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {matchedSkills.slice(0, 8).map((skill) => (
                                <Badge
                                  key={skill}
                                  variant="outline"
                                  className="text-xs bg-green-500/10 border-green-500/30 text-green-700"
                                >
                                  {skill}
                                </Badge>
                              ))}
                              {matchedSkills.length > 8 && (
                                <Badge variant="outline" className="text-xs">
                                  +{matchedSkills.length - 8} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {missingKeywords.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
                              <AlertCircle className="w-4 h-4" />
                              Missing Keywords ({missingKeywords.length})
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {missingKeywords.slice(0, 8).map((keyword) => (
                                <Badge
                                  key={keyword}
                                  variant="outline"
                                  className="text-xs bg-amber-500/10 border-amber-500/30 text-amber-700"
                                >
                                  {keyword}
                                </Badge>
                              ))}
                              {missingKeywords.length > 8 && (
                                <Badge variant="outline" className="text-xs">
                                  +{missingKeywords.length - 8} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <Separator />

                    {/* Quick Actions */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Quick Actions
                      </h4>
                      <div className="grid gap-2">
                        {onAddSkills && missingKeywords.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={onAddSkills}
                            className="justify-start gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add Missing Skills
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {missingKeywords.length}
                            </Badge>
                          </Button>
                        )}
                        {onTailorBullets && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={onTailorBullets}
                            className="justify-start gap-2"
                          >
                            <Zap className="w-4 h-4" />
                            Tailor Bullets
                          </Button>
                        )}
                        {onGenerateCover && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={onGenerateCover}
                            className="justify-start gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            Generate Cover Letter
                          </Button>
                        )}
                        {onInterviewPrep && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={onInterviewPrep}
                            className="justify-start gap-2"
                          >
                            <ListChecks className="w-4 h-4" />
                            Interview Prep
                          </Button>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* JD Preview */}
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFullJD(!showFullJD)}
                        className="w-full justify-between"
                      >
                        <span className="text-sm font-medium">Job Description</span>
                        {showFullJD ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                      {showFullJD && (
                        <div className="p-3 bg-muted/50 rounded-md text-sm text-muted-foreground whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                          {context.jobDescription}
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleEdit} className="flex-1">
                        Change Job
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={handleClear}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
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
    if (score >= 80) return "text-green-600 border-green-500/30 bg-green-500/5";
    if (score >= 60) return "text-amber-600 border-amber-500/30 bg-amber-500/5";
    return "text-red-600 border-red-500/30 bg-red-500/5";
  };

  if (!isActive) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        className="gap-2 text-muted-foreground"
      >
        <Target className="w-4 h-4" />
        <span className="hidden lg:inline">Add Job</span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn(
        "gap-2",
        matchScore !== null && getScoreColor(matchScore),
        needsRefresh && "border-dashed"
      )}
    >
      <Target className="w-4 h-4" />
      {matchScore !== null ? (
        <span className="font-medium">
          JD: {matchScore}%{needsRefresh && "*"}
        </span>
      ) : (
        <span className="font-medium">JD Active</span>
      )}
    </Button>
  );
}
