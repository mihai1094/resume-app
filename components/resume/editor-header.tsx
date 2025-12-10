"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Home,
  FileText,
  Download,
  Eye,
  EyeOff,
  RotateCcw,
  UserCircle,
  FolderOpen,
  Upload,
  Settings,
  HelpCircle,
  LogOut,
  Undo2,
  Redo2,
  LayoutGrid,
  MoreHorizontal,
  ArrowLeft,
  Menu,
  Check,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import Link from "next/link";
import { User } from "@/hooks/use-user";
import { ResumeData } from "@/lib/types/resume";
import { TemplateId, TEMPLATES } from "@/lib/constants/templates";
import { ATSAnalyzer, ATSResult } from "@/lib/ats/engine";
import { ATSScoreCard } from "@/components/ats/score-card";
import { useState, useEffect, useRef } from "react";
import { useConfetti } from "@/hooks/use-confetti";
import { useFileDialog } from "@/hooks/use-file-dialog";
import { ReadinessDashboard } from "./readiness-dashboard";
import { EditorMoreMenu } from "./editor-more-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useResumeReadiness } from "@/hooks/use-resume-readiness";
import { getUserInitials } from "@/app/dashboard/hooks/use-resume-utils";
import { UserMenu } from "@/components/shared/user-menu";
import { AchievementsPanel } from "@/components/achievements/achievements-panel";
import { WizardTrigger } from "@/components/wizard";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
}: EditorHeaderProps) {
  const progressPercentage = (completedSections / totalSections) * 100;

  // ATS Analysis
  const [showATSCard, setShowATSCard] = useState(false);
  const [atsResult, setATSResult] = useState<ATSResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Readiness Dashboard
  const [showReadinessDashboard, setShowReadinessDashboard] = useState(false);
  const { fire: fireConfetti } = useConfetti();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleCheckATS = (jobDescription?: string) => {
    if (!resumeData) return;
    const analyzer = new ATSAnalyzer(resumeData, jobDescription);
    const result = analyzer.analyze();
    setATSResult(result);
    setShowATSCard(true);
  };

  // Calculate resume readiness (memoized to avoid recalculation)
  const { result: readinessResult, status: readinessStatus } = useResumeReadiness(resumeData);

  // Get status color based on readiness
  const getStatusColor = () => {
    if (!readinessStatus) return "text-muted-foreground";
    if (readinessStatus.variant === "ready") return "text-green-600 dark:text-green-400";
    return "text-amber-600 dark:text-amber-400";
  };

  const getStatusBgColor = () => {
    if (!readinessStatus) return "";
    if (readinessStatus.variant === "ready") return "border-green-500/30 bg-green-500/5";
    return "border-amber-500/30 bg-amber-500/5";
  };

  const { handleImportJSON } = useFileDialog();

  const handleImport = () => {
    handleImportJSON(onImport);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="sr-only" aria-live="polite">
        {saveStatus}
      </div>
      <div className="container mx-auto px-4 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Back button & Title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Back"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <div className="flex items-baseline gap-3 min-w-0">
              <h1 className="text-base font-semibold tracking-tight truncate">
                ResumeForge
              </h1>
              <div className="text-xs text-muted-foreground hidden sm:block truncate">
                {saveStatus}
              </div>
              {saveError && (
                <Badge variant="destructive" className="text-[10px]">
                  {saveError}
                </Badge>
              )}
              {planLimitReached && (
                <Badge variant="destructive" className="text-[10px]">
                  Free limit reached
                </Badge>
              )}
            </div>
          </div>

          {/* Right: Save status badge & Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mobile save status badge - Enhanced */}
            <div className="flex items-center gap-1.5 text-xs sm:hidden">
              <div
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-full transition-all duration-300",
                  saveStatus.toLowerCase().includes("saving")
                    ? "bg-amber-500/10 text-amber-600"
                    : saveStatus.toLowerCase().includes("saved")
                    ? "bg-green-500/10 text-green-600"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    saveStatus.toLowerCase().includes("saving")
                      ? "bg-amber-500 animate-pulse"
                      : saveStatus.toLowerCase().includes("saved")
                      ? "bg-green-500"
                      : "bg-muted-foreground"
                  )}
                  aria-hidden
                />
                <span className="font-medium">{saveStatus}</span>
              </div>
            </div>

            {/* Desktop actions */}
            <div className="hidden sm:flex flex-wrap items-center gap-2 justify-end">
              {/* Preview Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onTogglePreview}
                className="gap-2"
                aria-pressed={showPreview}
                aria-label={showPreview ? "Hide preview" : "Show preview"}
              >
                {showPreview ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span className="hidden lg:inline">Hide Preview</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span className="hidden lg:inline">Show Preview</span>
                  </>
                )}
              </Button>

              {/* Resume Readiness Badge */}
              {readinessStatus && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReadinessDashboard(true)}
                  className={cn("gap-2", getStatusBgColor())}
                  title="Check resume readiness and job match"
                >
                  {readinessStatus.variant === "ready" ? (
                    <CheckCircle2 className={cn("w-4 h-4", getStatusColor())} />
                  ) : (
                    <AlertCircle className={cn("w-4 h-4", getStatusColor())} />
                  )}
                  <span className={cn("font-medium", getStatusColor())}>
                    {readinessStatus.label}
                  </span>
                </Button>
              )}

              {/* Achievements Panel */}
              <AchievementsPanel />

              {/* Wizard Tour Trigger */}
              <WizardTrigger />

              {/* Template Selector */}
              {onChangeTemplate && templateId && (
                <Select
                  value={templateId}
                  onValueChange={(value) =>
                    onChangeTemplate(value as TemplateId)
                  }
                >
                  <SelectTrigger className="w-36 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {TEMPLATES.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* More Menu */}
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
                showCustomizer={showCustomizer}
              />

              <Button variant="default" size="sm" onClick={onSaveAndExit}>
                <Check className="w-4 h-4 mr-2" />
                <span>Save & Exit</span>
              </Button>

              <UserMenu
                user={user}
                onLogout={onLogout}
                onImport={handleImport}
              />
            </div>

            {/* Mobile: Single hamburger menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="sm:hidden h-9 w-9"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Export & Import */}
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  Export & Import
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={onExportPDF} disabled={isExporting}>
                  <FileText className="w-4 h-4 mr-2" />
                  {isExporting ? "Exporting PDF..." : "Export PDF"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportJSON} disabled={isExporting}>
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? "Exporting..." : "Export JSON"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleImport}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Resume
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {/* Template Tools */}
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  Template
                </DropdownMenuLabel>
                {onOpenTemplateGallery && (
                  <DropdownMenuItem onClick={onOpenTemplateGallery}>
                    <LayoutGrid className="w-4 h-4 mr-2" />
                    Template Gallery
                  </DropdownMenuItem>
                )}
                {/* My Account */}
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    <span>My CVs</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/cover-letter" className="cursor-pointer">
                    <FileCheck className="mr-2 h-4 w-4" />
                    <span>Cover Letter</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    toast.info("Help & documentation are coming soon.");
                  }}
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {/* Danger Zone */}
                <DropdownMenuItem
                  onClick={onReset}
                  className="text-destructive focus:text-destructive"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Resume
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowLogoutConfirm(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Progress Bar - Desktop */}
        <div className="hidden sm:block mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>
              {completedSections} of {totalSections} sections completed
            </span>
            <span className="font-medium">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

      </div>
      {/* ATS Score Card */}
      {atsResult && (
        <ATSScoreCard
          result={atsResult}
          open={showATSCard}
          onOpenChange={setShowATSCard}
        />
      )}

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
