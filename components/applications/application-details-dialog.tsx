"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  JobApplication,
  ApplicationStatus,
  KANBAN_COLUMNS,
  INTERVIEW_TYPE_LABELS,
  getColumnByStatus,
} from "@/lib/types/application";
import { SavedResume } from "@/hooks/use-saved-resumes";
import { format, formatDistanceToNow, isAfter } from "date-fns";
import {
  Building2,
  MapPin,
  DollarSign,
  ExternalLink,
  Calendar,
  Clock,
  FileText,
  Edit,
  Trash2,
  Flag,
  User,
  Mail,
  Phone,
  Linkedin,
  Video,
  Users,
  StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import { useState } from "react";

interface ApplicationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: JobApplication | null;
  resumes: SavedResume[];
  onEdit: () => void;
  onDelete: () => Promise<boolean>;
  onStatusChange: (newStatus: ApplicationStatus) => Promise<boolean>;
}

const priorityConfig = {
  high: { color: "text-red-600 bg-red-500/10", label: "High Priority" },
  medium: { color: "text-yellow-600 bg-yellow-500/10", label: "Medium Priority" },
  low: { color: "text-slate-600 bg-slate-500/10", label: "Low Priority" },
};

export function ApplicationDetailsDialog({
  open,
  onOpenChange,
  application,
  resumes,
  onEdit,
  onDelete,
  onStatusChange,
}: ApplicationDetailsDialogProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!application) return null;

  const column = getColumnByStatus(application.status);
  const resume = resumes.find((r) => r.id === application.resumeId);

  const upcomingInterviews = application.interviews?.filter(
    (i) => !i.completed && isAfter(new Date(i.date), new Date())
  );

  const pastInterviews = application.interviews?.filter(
    (i) => i.completed || !isAfter(new Date(i.date), new Date())
  );

  const handleDelete = async () => {
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

  const getInterviewIcon = (type: string) => {
    switch (type) {
      case "phone":
        return Phone;
      case "video":
        return Video;
      default:
        return Users;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-xl">{application.position}</DialogTitle>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  <span>{application.company}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
            </div>

            {/* Status selector */}
            <div className="flex items-center gap-3 mt-4">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Select
                value={application.status}
                onValueChange={(value) => onStatusChange(value as ApplicationStatus)}
              >
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KANBAN_COLUMNS.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", col.color)} />
                        {col.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {application.priority && (
                <Badge
                  variant="secondary"
                  className={cn("ml-auto", priorityConfig[application.priority].color)}
                >
                  <Flag className="w-3 h-3 mr-1" />
                  {priorityConfig[application.priority].label}
                </Badge>
              )}
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="px-6 py-4 space-y-6">
              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                {application.location && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm">{application.location}</p>
                    </div>
                  </div>
                )}

                {application.salary && (
                  <div className="flex items-start gap-2">
                    <DollarSign className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Salary Range</p>
                      <p className="text-sm">{application.salary}</p>
                    </div>
                  </div>
                )}

                {application.appliedAt && (
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Applied</p>
                      <p className="text-sm">
                        {format(new Date(application.appliedAt), "MMM d, yyyy")}
                        <span className="text-muted-foreground ml-1">
                          ({formatDistanceToNow(new Date(application.appliedAt), { addSuffix: true })})
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {resume && (
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Resume Used</p>
                      <p className="text-sm">{resume.name}</p>
                    </div>
                  </div>
                )}
              </div>

              {application.jobUrl && (
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    asChild
                  >
                    <a href={application.jobUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                      View Job Posting
                    </a>
                  </Button>
                </div>
              )}

              {/* Upcoming Interviews */}
              {upcomingInterviews && upcomingInterviews.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Upcoming Interviews
                    </h4>
                    <div className="space-y-2">
                      {upcomingInterviews.map((interview) => {
                        const Icon = getInterviewIcon(interview.type);
                        return (
                          <div
                            key={interview.id}
                            className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg"
                          >
                            <Icon className="w-4 h-4 text-purple-600" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {INTERVIEW_TYPE_LABELS[interview.type]}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(interview.date), "EEEE, MMMM d 'at' h:mm a")}
                              </p>
                              {interview.interviewer && (
                                <p className="text-xs text-muted-foreground">
                                  with {interview.interviewer}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Contacts */}
              {application.contacts && application.contacts.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Contacts
                    </h4>
                    <div className="space-y-2">
                      {application.contacts.map((contact, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                        >
                          <User className="w-4 h-4 mt-0.5 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{contact.name}</p>
                            <p className="text-xs text-muted-foreground">{contact.role}</p>
                            {contact.email && (
                              <a
                                href={`mailto:${contact.email}`}
                                className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                              >
                                <Mail className="w-3 h-3" />
                                {contact.email}
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Notes */}
              {application.notes && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <StickyNote className="w-4 h-4" />
                      Notes
                    </h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {application.notes}
                    </p>
                  </div>
                </>
              )}

              {/* Past Interviews */}
              {pastInterviews && pastInterviews.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-sm mb-3 flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Past Interviews
                    </h4>
                    <div className="space-y-2">
                      {pastInterviews.map((interview) => {
                        const Icon = getInterviewIcon(interview.type);
                        return (
                          <div
                            key={interview.id}
                            className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                          >
                            <Icon className="w-4 h-4 text-muted-foreground" />
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">
                                {INTERVIEW_TYPE_LABELS[interview.type]}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(interview.date), "MMM d, yyyy")}
                              </p>
                            </div>
                            {interview.completed && (
                              <Badge variant="secondary" className="text-xs">
                                Completed
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Timestamps */}
              <Separator />
              <div className="text-xs text-muted-foreground">
                <p>Created {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}</p>
                <p>Last updated {formatDistanceToNow(new Date(application.updatedAt), { addSuffix: true })}</p>
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="px-6 py-4 border-t flex justify-between">
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this application?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The application for{" "}
              <span className="font-semibold">
                {application.position} at {application.company}
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
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
