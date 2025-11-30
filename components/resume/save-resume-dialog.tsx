"use client";

import { useState } from "react";
import { ResumeData } from "@/lib/types/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Save, Check, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SaveResumeDialogProps {
  resumeData: ResumeData;
  templateId: string;
  onSave: (name: string) => Promise<boolean>;
  trigger?: React.ReactNode;
}

export function SaveResumeDialog({
  resumeData,
  templateId,
  onSave,
  trigger,
}: SaveResumeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [resumeName, setResumeName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Generate default name based on personal info
  const getDefaultName = () => {
    const { personalInfo } = resumeData;
    const date = new Date().toLocaleDateString();

    if (personalInfo.firstName && personalInfo.lastName) {
      return `${personalInfo.firstName} ${personalInfo.lastName} - Resume`;
    }

    return `My Resume - ${date}`;
  };

  const handleSave = async () => {
    const name = resumeName.trim() || getDefaultName();

    setIsSaving(true);
    try {
      const success = await onSave(name);

      if (success) {
        setSaveSuccess(true);
        // Close dialog after short delay to show success state
        setTimeout(() => {
          setIsOpen(false);
          setSaveSuccess(false);
          setResumeName("");
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to save resume:", error);
      toast.error("Failed to save resume. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!isSaving) {
      setIsOpen(open);
      if (!open) {
        // Reset state when closing
        setResumeName("");
        setSaveSuccess(false);
      }
    }
  };

  // Validation
  const isComplete = resumeData.personalInfo.firstName &&
                     resumeData.personalInfo.lastName &&
                     resumeData.personalInfo.email;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Save Resume</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Save Resume
          </DialogTitle>
          <DialogDescription>
            Save your current resume to access it later from "My Resumes"
          </DialogDescription>
        </DialogHeader>

        {!isComplete && (
          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ Your resume is incomplete. Consider adding your name and contact info before saving.
            </p>
          </div>
        )}

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="resume-name">Resume Name</Label>
            <Input
              id="resume-name"
              placeholder={getDefaultName()}
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isSaving) {
                  handleSave();
                }
              }}
              disabled={isSaving}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use default name
            </p>
          </div>

          {/* Resume Info */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Template:</span>
              <Badge variant="outline" className="capitalize">
                {templateId}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Sections completed:</span>
              <span className="font-medium">
                {[
                  resumeData.personalInfo.firstName && resumeData.personalInfo.lastName,
                  resumeData.workExperience.length > 0,
                  resumeData.education.length > 0,
                  resumeData.skills.length > 0,
                ].filter(Boolean).length} / 4 core sections
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || saveSuccess}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Resume
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
