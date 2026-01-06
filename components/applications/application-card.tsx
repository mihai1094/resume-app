"use client";

import { forwardRef } from "react";
import { JobApplication, getColumnByStatus, INTERVIEW_TYPE_LABELS } from "@/lib/types/application";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format, isAfter, isBefore, addDays } from "date-fns";
import {
  Building2,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  ExternalLink,
  FileText,
  Flag,
  Video,
  Phone,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ApplicationCardProps {
  application: JobApplication;
  onClick?: () => void;
  isDragging?: boolean;
  isOverlay?: boolean;
}

const priorityConfig = {
  high: { color: "text-red-600 bg-red-500/10", label: "High" },
  medium: { color: "text-yellow-600 bg-yellow-500/10", label: "Medium" },
  low: { color: "text-slate-600 bg-slate-500/10", label: "Low" },
};

export const ApplicationCard = forwardRef<HTMLDivElement, ApplicationCardProps>(
  ({ application, onClick, isDragging, isOverlay }, ref) => {
    const hasUpcomingInterview = application.interviews?.some(
      (interview) =>
        !interview.completed &&
        isAfter(new Date(interview.date), new Date()) &&
        isBefore(new Date(interview.date), addDays(new Date(), 7))
    );

    const nextInterview = application.interviews
      ?.filter((i) => !i.completed && isAfter(new Date(i.date), new Date()))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

    const getInterviewIcon = (type: string) => {
      switch (type) {
        case "phone":
          return Phone;
        case "video":
          return Video;
        case "onsite":
        case "behavioral":
          return Users;
        default:
          return Calendar;
      }
    };

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          "bg-card border rounded-lg p-3 cursor-pointer transition-all",
          "hover:border-primary/50 hover:shadow-md",
          isDragging && "opacity-50 shadow-lg ring-2 ring-primary",
          isOverlay && "shadow-xl ring-2 ring-primary rotate-3"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-sm truncate">{application.position}</h4>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Building2 className="w-3 h-3 shrink-0" />
              <span className="truncate">{application.company}</span>
            </div>
          </div>

          {application.priority && (
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px] px-1.5 py-0 shrink-0",
                priorityConfig[application.priority].color
              )}
            >
              <Flag className="w-2.5 h-2.5 mr-0.5" />
              {priorityConfig[application.priority].label}
            </Badge>
          )}
        </div>

        {/* Meta info */}
        <div className="space-y-1 text-xs text-muted-foreground">
          {application.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{application.location}</span>
            </div>
          )}

          {application.salary && (
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 shrink-0" />
              <span className="truncate">{application.salary}</span>
            </div>
          )}

          {application.appliedAt && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 shrink-0" />
              <span>Applied {formatDistanceToNow(new Date(application.appliedAt), { addSuffix: true })}</span>
            </div>
          )}
        </div>

        {/* Upcoming interview indicator */}
        {nextInterview && (
          <div className="mt-2 pt-2 border-t">
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium rounded px-2 py-1",
                hasUpcomingInterview
                  ? "bg-purple-500/10 text-purple-700"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {(() => {
                const Icon = getInterviewIcon(nextInterview.type);
                return <Icon className="w-3 h-3 shrink-0" />;
              })()}
              <span className="truncate">
                {INTERVIEW_TYPE_LABELS[nextInterview.type]} -{" "}
                {format(new Date(nextInterview.date), "MMM d, h:mm a")}
              </span>
            </div>
          </div>
        )}

        {/* Footer indicators */}
        <div className="mt-2 flex items-center gap-2">
          {application.resumeId && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-0.5">
              <FileText className="w-2.5 h-2.5" />
              Resume
            </Badge>
          )}
          {application.jobUrl && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-0.5">
              <ExternalLink className="w-2.5 h-2.5" />
              Link
            </Badge>
          )}
          {application.contacts && application.contacts.length > 0 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-0.5">
              <Users className="w-2.5 h-2.5" />
              {application.contacts.length}
            </Badge>
          )}
        </div>
      </div>
    );
  }
);

ApplicationCard.displayName = "ApplicationCard";

// Sortable wrapper for drag-and-drop
interface SortableApplicationCardProps {
  application: JobApplication;
  onClick?: () => void;
}

export function SortableApplicationCard({
  application,
  onClick,
}: SortableApplicationCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: application.id,
    data: {
      type: "application",
      application,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ApplicationCard
        application={application}
        onClick={onClick}
        isDragging={isDragging}
      />
    </div>
  );
}
