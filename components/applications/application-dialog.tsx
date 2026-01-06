"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  JobApplication,
  ApplicationStatus,
  CreateApplicationInput,
  UpdateApplicationInput,
  KANBAN_COLUMNS,
} from "@/lib/types/application";
import { SavedResume } from "@/hooks/use-saved-resumes";
import { Loader2, Trash2, Building2, Briefcase, MapPin, DollarSign, Link, FileText } from "lucide-react";
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

interface ApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application?: JobApplication | null;
  resumes: SavedResume[];
  onSubmit: (data: CreateApplicationInput | UpdateApplicationInput) => Promise<boolean>;
  onDelete?: () => Promise<boolean>;
}

const defaultFormData: CreateApplicationInput = {
  company: "",
  position: "",
  status: "wishlist",
  location: "",
  salary: "",
  jobUrl: "",
  notes: "",
  resumeId: undefined,
  priority: undefined,
};

export function ApplicationDialog({
  open,
  onOpenChange,
  application,
  resumes,
  onSubmit,
  onDelete,
}: ApplicationDialogProps) {
  const [formData, setFormData] = useState<CreateApplicationInput>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isEditing = !!application;

  // Reset form when dialog opens/closes or application changes
  useEffect(() => {
    if (open) {
      if (application) {
        setFormData({
          company: application.company,
          position: application.position,
          status: application.status,
          location: application.location || "",
          salary: application.salary || "",
          jobUrl: application.jobUrl || "",
          notes: application.notes || "",
          resumeId: application.resumeId,
          priority: application.priority,
          appliedAt: application.appliedAt,
          contacts: application.contacts,
          interviews: application.interviews,
        });
      } else {
        setFormData(defaultFormData);
      }
    }
  }, [open, application]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.company.trim() || !formData.position.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await onSubmit(formData);
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      const success = await onDelete();
      if (success) {
        setShowDeleteDialog(false);
        onOpenChange(false);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const updateField = <K extends keyof CreateApplicationInput>(
    field: K,
    value: CreateApplicationInput[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>
              {isEditing ? "Edit Application" : "Add New Application"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the details of your job application."
                : "Track a new job opportunity you're interested in."}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] px-6">
            <form id="application-form" onSubmit={handleSubmit} className="space-y-4 pb-4">
              {/* Company */}
              <div className="space-y-2">
                <Label htmlFor="company" className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Company *
                </Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => updateField("company", e.target.value)}
                  placeholder="e.g., Google, Microsoft"
                  required
                />
              </div>

              {/* Position */}
              <div className="space-y-2">
                <Label htmlFor="position" className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  Position *
                </Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => updateField("position", e.target.value)}
                  placeholder="e.g., Senior Software Engineer"
                  required
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    updateField("status", value as ApplicationStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KANBAN_COLUMNS.map((column) => (
                      <SelectItem key={column.id} value={column.id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${column.color}`} />
                          {column.title}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="e.g., San Francisco, CA (Remote)"
                />
              </div>

              {/* Salary */}
              <div className="space-y-2">
                <Label htmlFor="salary" className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  Salary Range
                </Label>
                <Input
                  id="salary"
                  value={formData.salary}
                  onChange={(e) => updateField("salary", e.target.value)}
                  placeholder="e.g., $150k - $200k"
                />
              </div>

              {/* Job URL */}
              <div className="space-y-2">
                <Label htmlFor="jobUrl" className="flex items-center gap-1.5">
                  <Link className="w-3.5 h-3.5" />
                  Job Posting URL
                </Label>
                <Input
                  id="jobUrl"
                  type="url"
                  value={formData.jobUrl}
                  onChange={(e) => updateField("jobUrl", e.target.value)}
                  placeholder="https://..."
                />
              </div>

              {/* Resume Used */}
              <div className="space-y-2">
                <Label htmlFor="resume" className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Resume Used
                </Label>
                <Select
                  value={formData.resumeId || "none"}
                  onValueChange={(value) =>
                    updateField("resumeId", value === "none" ? undefined : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a resume" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No resume selected</SelectItem>
                    {resumes.map((resume) => (
                      <SelectItem key={resume.id} value={resume.id}>
                        {resume.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority || "none"}
                  onValueChange={(value) =>
                    updateField(
                      "priority",
                      value === "none" ? undefined : (value as "low" | "medium" | "high")
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Set priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Add any notes about this application..."
                  rows={3}
                />
              </div>
            </form>
          </ScrollArea>

          <DialogFooter className="px-6 pb-6 pt-2 gap-2">
            {isEditing && onDelete && (
              <Button
                type="button"
                variant="outline"
                className="mr-auto text-destructive hover:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="application-form"
              disabled={isSubmitting || !formData.company.trim() || !formData.position.trim()}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? "Save Changes" : "Add Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this application?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The application for{" "}
              <span className="font-semibold">
                {application?.position} at {application?.company}
              </span>{" "}
              will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
