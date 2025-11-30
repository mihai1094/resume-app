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
  Palette,
  LayoutGrid,
  MoreHorizontal,
  ArrowLeft,
  Menu,
  Sparkles,
  Check,
  ShieldCheck,
  Trophy,
  Target,
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
import { ScoreDashboard } from "./score-dashboard";
import { EditorMoreMenu } from "./editor-more-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { calculateResumeScore } from "@/lib/services/resume-scoring";
import { UserMenu } from "@/components/shared/user-menu";
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
  onToggleCustomizer?: () => void;
  onOpenTemplateGallery?: () => void;
  templateId?: TemplateId;
  onSaveAndExit: () => void;
  onChangeTemplate?: (templateId: TemplateId) => void;
}

export function EditorHeader({
  user,
  onExportJSON,
  onExportPDF,
  onReset,
  onLogout,
  onImport,
  saveStatus,
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
  onOpenTemplateGallery,
  templateId,
  onSaveAndExit,
  onChangeTemplate,
}: EditorHeaderProps) {
  const progressPercentage = (completedSections / totalSections) * 100;

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return "U";
    const names = user.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name[0].toUpperCase();
  };

  // ATS Analysis
  const [showATSCard, setShowATSCard] = useState(false);
  const [atsResult, setATSResult] = useState<ATSResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Score Dashboard
  const [showScoreDashboard, setShowScoreDashboard] = useState(false);
  const { fire: fireConfetti } = useConfetti();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleCheckATS = (jobDescription?: string) => {
    if (!resumeData) return;
    const analyzer = new ATSAnalyzer(resumeData, jobDescription);
    const result = analyzer.analyze();
    setATSResult(result);
    setShowATSCard(true);
  };

  // Calculate resume score
  const resumeScore = resumeData ? calculateResumeScore(resumeData) : null;

  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 75) return "text-blue-600 dark:text-blue-400";
    if (score >= 60) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            onImport(data);
            toast.success("Resume imported successfully!");
          } catch (error) {
            toast.error("Failed to import resume. Invalid file.");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Back button & Title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title="Back to Home"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <div className="flex items-baseline gap-3 min-w-0">
              <h1 className="text-base font-semibold tracking-tight truncate">
                ResumeForge
              </h1>
              <div className="text-xs text-muted-foreground hidden sm:block truncate">
                {saveStatus}
              </div>
            </div>
          </div>

          {/* Right: Save status badge & Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mobile save status badge */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground sm:hidden">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-medium">Saved</span>
            </div>

            {/* Desktop actions */}
            <div className="hidden sm:flex flex-wrap items-center gap-2 justify-end">
              {/* Preview Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onTogglePreview}
                className="gap-2"
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

              {/* Resume Score Badge */}
              {resumeScore && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScoreDashboard(true)}
                  className="gap-2 border-dashed"
                  title="View detailed resume analysis"
                >
                  <Trophy
                    className={cn(
                      "w-4 h-4",
                      getScoreColor(resumeScore.overall)
                    )}
                  />
                  <span
                    className={cn(
                      "font-semibold",
                      getScoreColor(resumeScore.overall)
                    )}
                  >
                    {Math.round(resumeScore.overall)}%
                  </span>
                </Button>
              )}

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
                <DropdownMenuItem onClick={onExportPDF}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportJSON}>
                  <Download className="w-4 h-4 mr-2" />
                  Export JSON
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
                {onToggleCustomizer && (
                  <DropdownMenuItem onClick={onToggleCustomizer}>
                    <Palette className="w-4 h-4 mr-2" />
                    {showCustomizer ? "Hide Customizer" : "Customize"}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />

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

        {/* Progress Bar */}
        <div className="mt-2 sm:mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="text-[11px] sm:text-xs">
              {completedSections} of {totalSections} sections completed
            </span>
            <span className="font-medium">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="h-1 sm:h-1.5 bg-muted rounded-full overflow-hidden">
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

      {/* Score Dashboard */}
      {resumeData && (
        <ScoreDashboard
          resumeData={resumeData}
          open={showScoreDashboard}
          onOpenChange={setShowScoreDashboard}
        />
      )}
      <AlertDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
      >
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
