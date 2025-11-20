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
} from "lucide-react";
import Link from "next/link";
import { User } from "@/hooks/use-user";
import { ResumeData } from "@/lib/types/resume";
import { JobMatcher } from "@/components/ai/job-matcher";
import { TemplateId } from "@/lib/constants/templates";

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
}: EditorHeaderProps) {
  const progressPercentage = (completedSections / totalSections) * 100;

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
            alert("Resume imported successfully!");
          } catch (error) {
            alert("Failed to import resume. Invalid file.");
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
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Link href="/">
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 sm:w-auto sm:px-3 sm:gap-2">
                <ArrowLeft className="w-4 h-4 sm:hidden" />
                <Home className="w-4 h-4 hidden sm:block" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-5 h-5 hidden sm:block flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-semibold truncate">Resume Builder</h1>
                <div className="text-xs text-muted-foreground hidden sm:block">
                  {saveStatus}
                </div>
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
            <div className="hidden sm:flex flex-wrap gap-2 justify-end">
              {/* Undo/Redo */}
              {onUndo && onRedo && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onUndo}
                    disabled={!canUndo}
                    title="Undo (Ctrl+Z)"
                  >
                    <Undo2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRedo}
                    disabled={!canRedo}
                    title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
                  >
                    <Redo2 className="w-4 h-4" />
                  </Button>
                  <div className="h-6 w-px bg-border" />
                </>
              )}
              {/* AI Job Matcher - Only show when resume has meaningful content */}
              {resumeData &&
               resumeData.personalInfo.firstName &&
               resumeData.personalInfo.lastName &&
               (resumeData.workExperience.length > 0 || resumeData.education.length > 0) && (
                <>
                  <JobMatcher resumeData={resumeData} />
                  <div className="h-6 w-px bg-border" />
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onTogglePreview}
                className="lg:flex"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Hide Preview
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Show Preview
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={onExportJSON}>
                <Download className="w-4 h-4 mr-2" />
                <span>Export JSON</span>
              </Button>
              <Button variant="default" size="sm" onClick={onExportPDF}>
                <FileText className="w-4 h-4 mr-2" />
                <span>Export PDF</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="w-4 h-4" />
                    <span>Tools</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Template Tools</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {onOpenTemplateGallery && (
                    <DropdownMenuItem onClick={onOpenTemplateGallery}>
                      <LayoutGrid className="w-4 h-4 mr-2" />
                      Template Gallery
                    </DropdownMenuItem>
                  )}
                  {onToggleCustomizer && (
                    <DropdownMenuItem onClick={onToggleCustomizer}>
                      <Palette className="w-4 h-4 mr-2" />
                      {showCustomizer ? "Hide Customizer" : "Customize Template"}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={onReset} className="text-destructive focus:text-destructive">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Resume
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    title={user?.name || "Account"}
                  >
                    <UserCircle className="w-5 h-5" />
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
                  <DropdownMenuItem asChild>
                    <Link href="/my-resumes" className="cursor-pointer">
                      <FolderOpen className="mr-2 h-4 w-4" />
                      <span>My CVs</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleImport}>
                    <Upload className="mr-2 h-4 w-4" />
                    <span>Import Resume</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      alert("Settings page coming soon!");
                    }}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      alert("Help & Documentation coming soon!");
                    }}
                  >
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help & Support</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      if (
                        confirm(
                          "Are you sure you want to logout? This will clear your session."
                        )
                      ) {
                        onLogout();
                      }
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile: Single hamburger menu with ALL actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="sm:hidden h-9 w-9 p-0">
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

                {/* AI Tools */}
                {resumeData &&
                 resumeData.personalInfo.firstName &&
                 resumeData.personalInfo.lastName &&
                 (resumeData.workExperience.length > 0 || resumeData.education.length > 0) && (
                  <>
                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">AI Tools</DropdownMenuLabel>
                    <div className="px-2 py-1.5">
                      <JobMatcher resumeData={resumeData} />
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}

                {/* Export & Import */}
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Export & Import</DropdownMenuLabel>
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
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Template</DropdownMenuLabel>
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
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">My Account</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/my-resumes" className="cursor-pointer">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    <span>My CVs</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    alert("Settings page coming soon!");
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    alert("Help & Documentation coming soon!");
                  }}
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {/* Danger Zone */}
                <DropdownMenuItem onClick={onReset} className="text-destructive focus:text-destructive">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Resume
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you want to logout? This will clear your session."
                      )
                    ) {
                      onLogout();
                    }
                  }}
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
            <span className="font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-1 sm:h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
