"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  Briefcase,
  Building2,
  Calendar,
  Edit,
  Eye,
  FileText,
  Trash2,
  MoreHorizontal,
  Loader2,
  Target,
  GitBranch,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { SavedResume } from "@/hooks/use-saved-resumes";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TailoredResumeItemProps {
  resume: SavedResume;
  onEdit: () => void;
  onPreview: () => void;
  onExportPDF: () => void;
  onDelete: () => void;
  isExportingPdf: boolean;
}

function TailoredResumeItem({
  resume,
  onEdit,
  onPreview,
  onExportPDF,
  onDelete,
  isExportingPdf,
}: TailoredResumeItemProps) {
  const hasCompany = !!resume.targetCompany;
  const hasJobTitle = !!resume.targetJobTitle;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group">
      {/* Target icon */}
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Target className="w-4 h-4 text-primary" />
      </div>

      {/* Info - with tooltip for full details */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex-1 min-w-0 cursor-default">
            {/* Primary: Job title or company */}
            <p className="font-medium text-sm truncate">
              {hasJobTitle ? resume.targetJobTitle : (hasCompany ? resume.targetCompany : "Tailored")}
            </p>
            {/* Secondary: Company (if job title shown) + date */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              {hasJobTitle && hasCompany && (
                <>
                  <span className="flex items-center gap-1 truncate max-w-[120px]">
                    <Building2 className="w-3 h-3 shrink-0" />
                    <span className="truncate">{resume.targetCompany}</span>
                  </span>
                  <span className="text-muted-foreground/50">•</span>
                </>
              )}
              <span className="flex items-center gap-1 shrink-0">
                <Calendar className="w-3 h-3" />
                {format(new Date(resume.updatedAt), "MMM d")}
              </span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start" className="max-w-[280px]">
          <div className="space-y-1">
            {hasJobTitle && (
              <div className="flex items-start gap-2">
                <Briefcase className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                <span className="font-medium">{resume.targetJobTitle}</span>
              </div>
            )}
            {hasCompany && (
              <div className="flex items-start gap-2">
                <Building2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                <span>{resume.targetCompany}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground text-xs pt-1">
              <Calendar className="w-3 h-3" />
              <span>Updated {format(new Date(resume.updatedAt), "MMM d, yyyy")}</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>

      {/* Actions - always visible on mobile */}
      <div className="flex items-center">
        {/* Desktop: show all buttons */}
        <div className="hidden sm:flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-8 px-2.5"
          >
            <Edit className="w-3.5 h-3.5 mr-1.5" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onExportPDF}
            disabled={isExportingPdf}
            className="h-8 px-2.5"
          >
            {isExportingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                PDF
              </>
            )}
          </Button>
        </div>

        {/* Dropdown for more actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={onEdit} className="sm:hidden">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onPreview}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportPDF} disabled={isExportingPdf} className="sm:hidden">
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

interface ResumeGroupProps {
  masterResume: SavedResume;
  tailoredResumes: SavedResume[];
  masterCardComponent: React.ReactNode;
  onEditTailored: (resume: SavedResume) => void;
  onPreviewTailored: (resume: SavedResume) => void;
  onExportPDFTailored: (resume: SavedResume) => void;
  onDeleteTailored: (resume: SavedResume) => void;
  exportingPdfId: string | null;
}

export function ResumeGroup({
  masterResume,
  tailoredResumes,
  masterCardComponent,
  onEditTailored,
  onPreviewTailored,
  onExportPDFTailored,
  onDeleteTailored,
  exportingPdfId,
}: ResumeGroupProps) {
  const [isOpen, setIsOpen] = useState(tailoredResumes.length <= 3);
  const hasTailoredVersions = tailoredResumes.length > 0;

  return (
    <div className="space-y-3">
      {/* Master Resume Card */}
      {masterCardComponent}

      {/* Tailored Versions */}
      {hasTailoredVersions && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="rounded-lg border bg-muted/30 overflow-hidden">
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                  <GitBranch className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      Tailored Versions
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] h-5 px-1.5 bg-primary/10 text-primary border-0"
                    >
                      {tailoredResumes.length}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isOpen
                      ? "Click to collapse"
                      : `${tailoredResumes.slice(0, 2).map(r => r.targetCompany || r.targetJobTitle || "Tailored").join(", ")}${tailoredResumes.length > 2 ? ` +${tailoredResumes.length - 2} more` : ""}`
                    }
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-muted-foreground transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-3 pb-3 space-y-2">
                {tailoredResumes.map((resume) => (
                  <TailoredResumeItem
                    key={resume.id}
                    resume={resume}
                    onEdit={() => onEditTailored(resume)}
                    onPreview={() => onPreviewTailored(resume)}
                    onExportPDF={() => onExportPDFTailored(resume)}
                    onDelete={() => onDeleteTailored(resume)}
                    isExportingPdf={exportingPdfId === resume.id}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}
    </div>
  );
}
