"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";
import Link from "next/link";
import { User } from "@/hooks/use-user";
import { ResumeData } from "@/lib/types/resume";
import { JobMatcher } from "@/components/ai/job-matcher";

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
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Logo & Title */}
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <div>
                <h1 className="text-lg font-semibold">Resume Builder</h1>
                <div className="text-xs text-muted-foreground">
                  {saveStatus}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Undo/Redo */}
            {onUndo && onRedo && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onUndo}
                  disabled={!canUndo}
                  title="Undo (Ctrl+Z)"
                  className="hidden sm:flex"
                >
                  <Undo2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRedo}
                  disabled={!canRedo}
                  title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
                  className="hidden sm:flex"
                >
                  <Redo2 className="w-4 h-4" />
                </Button>
                <div className="h-6 w-px bg-border hidden sm:block" />
              </>
            )}
            {onToggleCustomizer && (
              <Button
                variant={showCustomizer ? "default" : "ghost"}
                size="sm"
                onClick={onToggleCustomizer}
                title="Customize Template"
              >
                <Palette className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Customize</span>
              </Button>
            )}
            {/* AI Job Matcher - Only show when resume has meaningful content */}
            {resumeData &&
             resumeData.personalInfo.firstName &&
             resumeData.personalInfo.lastName &&
             (resumeData.workExperience.length > 0 || resumeData.education.length > 0) && (
              <>
                <JobMatcher resumeData={resumeData} />
                <div className="h-6 w-px bg-border hidden sm:block" />
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onTogglePreview}
              className="hidden lg:flex"
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
              <Download className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Export JSON</span>
            </Button>
            <Button variant="default" size="sm" onClick={onExportPDF}>
              <FileText className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Export PDF</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-destructive hover:text-destructive"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
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
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>
              {completedSections} of {totalSections} sections completed
            </span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
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
