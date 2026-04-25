"use client";

import { Button } from "@/components/ui/button";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { useState } from "react";
import { useFileDialog, ImportedResumeMeta } from "@/hooks/use-file-dialog";
import { ReadinessDashboard } from "./readiness-dashboard";
import { EditorMoreMenu } from "./editor-more-menu";
import { useResumeReadiness } from "@/hooks/use-resume-readiness";
import { UserMenu } from "@/components/shared/user-menu";
import { CreditsDisplay } from "@/components/premium/credits-display";
import { cn } from "@/lib/utils";

interface EditorHeaderProps {
  user: User | null;
  onExportJSON: () => void;
  onExportPDF: () => void;
  onReset: () => void;
  onLogout: () => void;
  onImport: (data: ResumeData, meta: ImportedResumeMeta) => void;
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
  /** Hide the readiness/issues badge until the user has touched the form. */
  hasUserInteracted?: boolean;
  jdContext?: { isActive: boolean; matchScore: number | null };
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
  hasUserInteracted = true,
}: EditorHeaderProps) {
  // Progress is now surfaced via the section navigation sidebar + mobile headers;
  // the header itself no longer shows a progress bar to reduce visual clutter.
  void completedSections;
  void totalSections;
  // Readiness Dashboard
  const [showReadinessDashboard, setShowReadinessDashboard] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);


  // Calculate resume readiness (memoized to avoid recalculation)
  const { status: readinessStatus } = useResumeReadiness(resumeData);

  const { handleImportJSON } = useFileDialog();

  const handleImport = () => {
    handleImportJSON(onImport);
  };

  const resumeTitleForA11y =
    resumeData?.personalInfo?.firstName || resumeData?.personalInfo?.lastName
      ? `${resumeData?.personalInfo?.firstName ?? ""} ${resumeData?.personalInfo?.lastName ?? ""}`.trim() +
        "'s resume"
      : "New resume";

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm transition-all duration-300">
      {/* Document heading for screen readers — the editor page otherwise has no <h1>. */}
      <h1 className="sr-only">{resumeTitleForA11y}</h1>
      <div className="sr-only" aria-live="polite">
        {saveStatus}
      </div>

      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Back button & Status */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Button
              variant="secondary"
              size="icon"
              className="h-9 w-9 rounded-lg shadow-sm hover:cursor-pointer"
              title="Return to Dashboard"
              aria-label="Return to dashboard"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4 text-foreground/80" />
            </Button>

            <button
              type="button"
              onClick={() => setShowReadinessDashboard(true)}
              className="hidden sm:flex flex-col min-w-0 text-left hover:opacity-80 transition-opacity"
              aria-label={
                resumeData?.personalInfo?.firstName
                  ? `${resumeData.personalInfo.firstName}'s Resume — open readiness dashboard`
                  : "Untitled Resume — open readiness dashboard"
              }
            >
              <span className="text-sm font-semibold truncate capitalize text-foreground/90">
                {resumeData?.personalInfo?.firstName
                  ? `${resumeData.personalInfo.firstName}'s Resume`
                  : "Untitled Resume"}
              </span>
              <div
                className="flex items-center gap-2 text-xs text-muted-foreground"
                aria-hidden="true"
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-150",
                    saveStatus.toLowerCase().includes("saving")
                      ? "bg-warning animate-pulse"
                      : saveStatus.toLowerCase().includes("saved")
                        ? "bg-success"
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
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Mobile: Save status indicator only */}
            <div className="sm:hidden flex items-center pr-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  saveStatus.toLowerCase().includes("saving")
                    ? "bg-warning animate-pulse"
                    : saveStatus.toLowerCase().includes("saved")
                      ? "bg-success"
                      : "bg-muted-foreground"
                )}
                title={saveStatus}
              />
            </div>

            <CreditsDisplay variant="pill" className="sm:hidden" />

            {/* Desktop Quick Actions */}
            <div className="hidden sm:flex items-center gap-2">
              <CreditsDisplay variant="pill" />

              <Button
                variant="ghost"
                size="sm"
                onClick={onTogglePreview}
                aria-label={showPreview ? "Hide preview" : "Show preview"}
                title={showPreview ? "Hide Preview" : "Show Preview"}
                className={cn(
                  "gap-2 h-9 rounded-lg px-3 xl:px-4 transition-all",
                  showPreview && "bg-muted/80 text-foreground"
                )}
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="hidden xl:inline">{showPreview ? "Hide" : "Preview"}</span>
              </Button>

              {/* AI-adjacent controls — grouped by spacing, not by a visual container */}
              <div className="flex items-center gap-2">
                {/* AI Boost button — deferred to future release */}

                {readinessStatus && hasUserInteracted && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReadinessDashboard(true)}
                    className={cn(
                      "h-9 text-xs rounded-lg gap-2 pl-2 pr-3 transition-colors hover:bg-muted/60",
                      readinessStatus.variant === "ready" ? "text-success hover:text-success/80" : "text-warning hover:text-warning/80"
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

              {(() => {
                const canSave = Boolean(resumeData?.personalInfo?.firstName);
                const saveButton = (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={canSave ? onSaveAndExit : undefined}
                    disabled={!canSave}
                    aria-label={canSave ? "Save and exit" : "Add your name to save"}
                    className="h-9 px-4 rounded-lg"
                  >
                    <Check className="w-4 h-4 xl:mr-1.5" />
                    <span className="hidden xl:inline">Save & Exit</span>
                  </Button>
                );
                return canSave ? (
                  saveButton
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0}>{saveButton}</span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Add your name to save</TooltipContent>
                  </Tooltip>
                );
              })()}

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
              />

              <UserMenu
                user={user}
                onLogout={onLogout}
                onImport={handleImport}
              />
            </div>

            {/* Mobile: Save & Exit — always visible, disabled until name entered */}
            {(() => {
              const canSave = Boolean(resumeData?.personalInfo?.firstName);
              return (
                <div className="sm:hidden flex flex-col items-center gap-0.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 rounded-lg"
                    onClick={canSave ? onSaveAndExit : undefined}
                    disabled={!canSave}
                    aria-label={canSave ? "Save and exit" : "Add your name to save"}
                  >
                    <Check className="w-4 h-4 mr-1.5" />
                    Save & Exit
                  </Button>
                  {!canSave && (
                    <span className="text-[10px] text-muted-foreground leading-none">
                      Add name first
                    </span>
                  )}
                </div>
              );
            })()}

            {/* Mobile Hamburger Layout */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="sm:hidden h-9 w-9 rounded-lg"
                  aria-label="Open editor menu"
                  title="Open Editor Menu"
                >
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

                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Export & Account</DropdownMenuLabel>
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

                <DropdownMenuItem onClick={onSaveAndExit}>
                  <Check className="w-4 h-4 mr-2" />
                  Save & Exit
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                <span className="hidden sm:contents">
                  {onOpenTemplateGallery && (
                    <>
                      <DropdownMenuItem onClick={onOpenTemplateGallery}>
                        <LayoutGrid className="w-4 h-4 mr-2" />
                        Change Template
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                </span>


                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={onReset} className="text-destructive focus:text-destructive">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
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
