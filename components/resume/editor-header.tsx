"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FileText,
  Download,
  Eye,
  EyeOff,
  Target,
  Sparkles,
  RotateCcw,
  Upload,
  Settings,
  LogOut,
  LayoutGrid,
  ArrowLeft,
  Menu,
  Check,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  Palette,
} from "lucide-react";
import Link from "next/link";
import { User } from "@/hooks/use-user";
import { ResumeData } from "@/lib/types/resume";
import { TemplateId } from "@/lib/constants/templates";
import { useCallback, useEffect, useState } from "react";
import { useFileDialog } from "@/hooks/use-file-dialog";
import { ReadinessDashboard } from "./readiness-dashboard";
import { EditorMoreMenu } from "./editor-more-menu";
import { useResumeReadiness } from "@/hooks/use-resume-readiness";
import { UserMenu } from "@/components/shared/user-menu";
import { AchievementsPanel } from "@/components/achievements/achievements-panel";
import {
  JDIndicatorBadge,
  JDContextPanel,
} from "@/components/ai/jd-context-panel";
import type { UseJobDescriptionContextReturn } from "@/hooks/use-job-description-context";
import { cn } from "@/lib/utils";

const JD_HINT_STORAGE_KEY = "editor_jd_hint_seen_v1";

interface EditorHeaderProps {
  user: User | null;
  onExportJSON: () => void;
  onExportPDF: () => void;
  onReset: () => void;
  onLogout: () => void;
  onImport: (data: ResumeData) => void;
  saveStatus: string;
  saveError?: string | null;
  isExporting?: boolean;
  completedSections: number;
  totalSections: number;
  showPreview: boolean;
  onTogglePreview: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  showCustomizer?: boolean;
  resumeData?: ResumeData;
  resumeId?: string;
  onToggleCustomizer?: () => void;
  onOpenTemplateGallery?: () => void;
  templateId?: TemplateId;
  onSaveAndExit: () => void;
  onChangeTemplate?: (templateId: TemplateId) => void;
  planLimitReached?: boolean;
  onJumpToSection?: (sectionId: string) => void;
  onBack?: () => void;
  jdContext?: UseJobDescriptionContextReturn;
  onRefreshJDScore?: () => void;
  isRefreshingJDScore?: boolean;
}

export function EditorHeader({
  user,
  onExportJSON,
  onExportPDF,
  onReset,
  onLogout,
  onImport,
  saveStatus,
  isExporting = false,
  completedSections,
  totalSections,
  showPreview,
  onTogglePreview,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  showCustomizer = false,
  onToggleCustomizer,
  resumeData,
  resumeId,
  onOpenTemplateGallery,
  templateId,
  onSaveAndExit,
  onChangeTemplate,
  planLimitReached = false,
  saveError = null,
  onJumpToSection,
  onBack,
  jdContext,
  onRefreshJDScore,
  isRefreshingJDScore = false,
}: EditorHeaderProps) {
  const progressPercentage = (completedSections / totalSections) * 100;
  const hasPersistedResume = Boolean(resumeId);

  // Readiness Dashboard
  const [showReadinessDashboard, setShowReadinessDashboard] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // JD Context Panel
  const [showJDPanel, setShowJDPanel] = useState(false);
  const canUseJD = hasPersistedResume && Boolean(jdContext);
  const [showJDHint, setShowJDHint] = useState(false);

  // Calculate resume readiness (memoized to avoid recalculation)
  const { status: readinessStatus } = useResumeReadiness(resumeData);

  const { handleImportJSON } = useFileDialog();

  const handleImport = () => {
    handleImportJSON(onImport);
  };

  const dismissJDHint = useCallback(() => {
    setShowJDHint(false);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(JD_HINT_STORAGE_KEY, "1");
    } catch {
      // no-op: non-critical UI hint persistence
    }
  }, []);

  const handleOpenJDPanel = useCallback(() => {
    dismissJDHint();
    setShowJDPanel(true);
  }, [dismissJDHint]);

  useEffect(() => {
    if (!canUseJD || !jdContext || jdContext.isActive) {
      setShowJDHint(false);
      return;
    }

    if (typeof window === "undefined") return;
    try {
      const seen = window.localStorage.getItem(JD_HINT_STORAGE_KEY) === "1";
      setShowJDHint(!seen);
    } catch {
      setShowJDHint(true);
    }
  }, [canUseJD, jdContext?.isActive]);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm transition-all duration-300">
      <div className="sr-only" aria-live="polite">
        {saveStatus}
      </div>

      {/* Absolute Thin Progress line at the bottom */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-muted/50">
        <div
          className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Back button & Status */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Button
              variant="secondary"
              size="icon"
              className="h-9 w-9 rounded-full shadow-sm hover:cursor-pointer"
              title="Return to Dashboard"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4 text-foreground/80" />
            </Button>

            <div className="hidden sm:flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate capitalize text-foreground/90">
                {resumeData?.personalInfo?.firstName
                  ? `${resumeData.personalInfo.firstName}'s Resume`
                  : "Untitled Resume"}
              </span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    saveStatus.toLowerCase().includes("saving")
                      ? "bg-amber-500 animate-pulse"
                      : saveStatus.toLowerCase().includes("saved")
                        ? "bg-green-500"
                        : "bg-muted-foreground",
                  )}
                  title={saveStatus}
                />
                <span className="truncate">{saveStatus}</span>
                {saveError && (
                  <Badge variant="destructive" className="ml-1 text-[9px] h-4 py-0 px-1">
                    {saveError}
                  </Badge>
                )}
                {planLimitReached && (
                  <Badge variant="destructive" className="ml-1 text-[9px] h-4 py-0 px-1">
                    Limit reached
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Mobile: Save status indicator only */}
            <div className="sm:hidden flex items-center pr-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  saveStatus.toLowerCase().includes("saving")
                    ? "bg-amber-500 animate-pulse"
                    : saveStatus.toLowerCase().includes("saved")
                      ? "bg-green-500"
                      : "bg-muted-foreground"
                )}
                title={saveStatus}
              />
            </div>

            <AchievementsPanel />

            {/* Desktop Quick Actions */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant={showPreview ? "secondary" : "ghost"}
                size="sm"
                onClick={onTogglePreview}
                className={cn("gap-2 h-9 rounded-full px-4 transition-all", showPreview ? "shadow-sm" : "")}
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showPreview ? "Hide Preview" : "Preview"}</span>
              </Button>

              <Separator orientation="vertical" className="h-5 mx-1" />

              {/* AI Assistant Features Group */}
              <div className="flex bg-muted/30 rounded-full p-1 border border-border/40 shadow-sm backdrop-blur-md">
                {canUseJD && jdContext && (
                  <div className="mr-1">
                    <JDIndicatorBadge
                      isActive={jdContext.isActive}
                      matchScore={jdContext.matchScore}
                      needsRefresh={jdContext.needsRefresh}
                      onClick={handleOpenJDPanel}
                    />
                  </div>
                )}

                {canUseJD && jdContext && !jdContext.isActive && (
                  <Popover
                    open={showJDHint}
                    onOpenChange={(open) => {
                      if (!open) dismissJDHint();
                      else setShowJDHint(true);
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleOpenJDPanel}
                        className="h-7 px-3 rounded-full border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 animate-pulse"
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        <span className="text-[11px] font-semibold">
                          AI Boost: Add Target Job
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      side="bottom"
                      align="start"
                      className="w-[320px] p-4 border-primary/20"
                    >
                      <div className="space-y-3">
                        <p className="text-sm font-semibold">
                          Improve AI output quality
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Add a target job description to get more relevant summaries, stronger bullet rewrites, and smarter skill suggestions.
                        </p>
                        <div className="flex items-center gap-2">
                          <Button size="sm" className="h-8" onClick={handleOpenJDPanel}>
                            Add Target Job
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8" onClick={dismissJDHint}>
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

                {readinessStatus && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReadinessDashboard(true)}
                    className={cn(
                      "h-7 text-xs rounded-full gap-1.5 pl-2 pr-3 transition-colors hover:bg-background/80",
                      readinessStatus.variant === "ready" ? "text-green-600 hover:text-green-700" : "text-amber-600 hover:text-amber-700"
                    )}
                  >
                    {readinessStatus.variant === "ready" ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5" />
                    )}
                    <span className="font-semibold">{readinessStatus.label}</span>
                  </Button>
                )}
              </div>

              <Separator orientation="vertical" className="h-5 mx-1" />

              {onToggleCustomizer && (
                <Button
                  variant={showCustomizer ? "secondary" : "ghost"}
                  size="sm"
                  onClick={onToggleCustomizer}
                  className={cn("gap-2 h-9 rounded-full px-4 transition-all", showCustomizer ? "shadow-sm" : "")}
                >
                  <Palette className="w-4 h-4" />
                  <span className="hidden md:inline">Design</span>
                </Button>
              )}

              <Button
                variant="default"
                size="sm"
                onClick={onSaveAndExit}
                className="h-9 px-4 rounded-full shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Check className="w-4 h-4 mr-1.5" />
                Done
              </Button>

              <EditorMoreMenu
                onUndo={onUndo}
                onRedo={onRedo}
                canUndo={canUndo}
                canRedo={canRedo}
                onExportJSON={onExportJSON}
                onExportPDF={onExportPDF}
                isExporting={isExporting}
                onReset={onReset}
                onImport={handleImport}
                onToggleCustomizer={onToggleCustomizer}
                onOpenTemplateGallery={onOpenTemplateGallery}
                showCustomizer={showCustomizer}
              />

              <UserMenu
                user={user}
                onLogout={onLogout}
                onImport={handleImport}
              />
            </div>

            {canUseJD && jdContext && (
              <Button
                variant={jdContext.isActive ? "secondary" : "default"}
                size="icon"
                className={cn(
                  "sm:hidden h-9 w-9 rounded-full relative",
                  !jdContext.isActive && "shadow-md ring-1 ring-primary/50"
                )}
                onClick={handleOpenJDPanel}
                title={
                  jdContext.isActive
                    ? "Edit Target Job"
                    : "Add Target Job for better AI suggestions"
                }
              >
                <Target className="w-4 h-4" />
                {!jdContext.isActive && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-primary text-[9px] leading-4 text-primary-foreground font-bold">
                    AI
                  </span>
                )}
              </Button>
            )}

            {/* Mobile: Export PDF button */}
            <Button
              variant="outline"
              size="icon"
              className="sm:hidden h-9 w-9 rounded-full"
              onClick={onExportPDF}
              disabled={isExporting}
              title="Export PDF"
            >
              <Download className="w-4 h-4" />
            </Button>

            {/* Mobile Hamburger Layout */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="sm:hidden h-9 w-9 rounded-full">
                  <Menu className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl border-border/50 shadow-xl backdrop-blur-xl bg-background/95">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name || "User"}</p>
                    <p className="text-xs text-muted-foreground">{user?.email || "user@example.com"}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Export & Settings</DropdownMenuLabel>
                <DropdownMenuItem onClick={onExportPDF} disabled={isExporting}>
                  <FileText className="w-4 h-4 mr-2" />
                  {isExporting ? "Exporting PDF..." : "Export PDF"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportJSON} disabled={isExporting}>
                  <Download className="w-4 h-4 mr-2" />
                  Export JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleImport}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Resume
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {canUseJD && jdContext && (
                  <>
                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                      AI Tailoring
                    </DropdownMenuLabel>
                    <DropdownMenuItem onClick={handleOpenJDPanel}>
                      <Target className="w-4 h-4 mr-2" />
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {jdContext.isActive
                            ? "Edit Target Job"
                            : "Add Target Job (Recommended)"}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {jdContext.isActive
                            ? jdContext.matchScore != null
                              ? `Current match score: ${jdContext.matchScore}%`
                              : "Use this to improve AI precision"
                            : "Better summaries, bullets and skill suggestions"}
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                {onOpenTemplateGallery && (
                  <>
                    <DropdownMenuItem onClick={onOpenTemplateGallery}>
                      <LayoutGrid className="w-4 h-4 mr-2" />
                      Change Template
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={onReset} className="text-destructive focus:text-destructive">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Resume
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowLogoutConfirm(true)} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      {/* Readiness Dashboard */}
      {resumeData && (
        <ReadinessDashboard
          resumeData={resumeData}
          resumeId={resumeId}
          open={showReadinessDashboard}
          onOpenChange={setShowReadinessDashboard}
          onJumpToSection={onJumpToSection}
          initialTab="job-match"
        />
      )}
      {/* JD Context Panel */}
      {jdContext && (
        <JDContextPanel
          open={showJDPanel}
          onOpenChange={setShowJDPanel}
          context={jdContext.context}
          matchScore={jdContext.matchScore}
          missingKeywords={jdContext.missingKeywords}
          matchedSkills={jdContext.matchedSkills}
          needsRefresh={jdContext.needsRefresh}
          isAnalyzing={isRefreshingJDScore}
          onSetJobDescription={jdContext.setJobDescription}
          onClearContext={jdContext.clearContext}
          onRefreshScore={() => onRefreshJDScore?.()}
        />
      )}

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear your current session. You’ll need to sign back in
              to access your documents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                onLogout();
                setShowLogoutConfirm(false);
              }}
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
