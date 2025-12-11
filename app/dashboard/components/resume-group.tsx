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
  ChevronRight,
  Briefcase,
  Building2,
  Calendar,
  Edit,
  Eye,
  FileText,
  Trash2,
  MoreHorizontal,
  Loader2,
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
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group">
      {/* Arrow indicator */}
      <div className="w-5 h-5 flex items-center justify-center text-muted-foreground">
        <ChevronRight className="w-4 h-4" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-medium text-sm truncate">{resume.name}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {resume.targetCompany && (
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {resume.targetCompany}
            </span>
          )}
          {resume.targetJobTitle && (
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              {resume.targetJobTitle}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(new Date(resume.updatedAt), "MMM d")}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-7 px-2"
        >
          <Edit className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onPreview}
          className="h-7 px-2"
        >
          <Eye className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onExportPDF}
          disabled={isExportingPdf}
          className="h-7 px-2"
        >
          {isExportingPdf ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <FileText className="w-3.5 h-3.5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-7 px-2 text-destructive hover:text-destructive"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
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
  const [isOpen, setIsOpen] = useState(false);
  const hasTailoredVersions = tailoredResumes.length > 0;

  return (
    <div className="space-y-2">
      {/* Master Resume Card */}
      {masterCardComponent}

      {/* Tailored Versions */}
      {hasTailoredVersions && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors">
              {isOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <span className="font-medium">
                Tailored versions ({tailoredResumes.length})
              </span>
              <div className="flex-1" />
              <div className="flex gap-1">
                {tailoredResumes.slice(0, 3).map((resume) => (
                  <Badge
                    key={resume.id}
                    variant="secondary"
                    className="text-[10px] h-5 px-1.5"
                  >
                    {resume.targetCompany || resume.targetJobTitle || "Tailored"}
                  </Badge>
                ))}
                {tailoredResumes.length > 3 && (
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                    +{tailoredResumes.length - 3}
                  </Badge>
                )}
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 pt-1">
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
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
