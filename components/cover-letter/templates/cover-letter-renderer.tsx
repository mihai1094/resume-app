"use client";

import { CoverLetterData, CoverLetterTemplateId } from "@/lib/types/cover-letter";
import { ModernCoverLetter } from "./modern-cover-letter";
import { ClassicCoverLetter } from "./classic-cover-letter";

interface CoverLetterRendererProps {
  data: CoverLetterData;
  templateId?: CoverLetterTemplateId;
  className?: string;
}

/**
 * Cover Letter Renderer
 *
 * Renders the appropriate cover letter template based on the templateId.
 * Default template is "modern".
 */
export function CoverLetterRenderer({
  data,
  templateId = "modern",
  className,
}: CoverLetterRendererProps) {
  const getTemplate = () => {
    switch (templateId) {
      case "classic":
        return <ClassicCoverLetter data={data} />;
      case "minimalist":
        // Falls back to modern for now, can be extended
        return <ModernCoverLetter data={data} />;
      case "executive":
        // Falls back to classic for now, can be extended
        return <ClassicCoverLetter data={data} />;
      case "modern":
      default:
        return <ModernCoverLetter data={data} />;
    }
  };

  return (
    <div className={className}>
      {getTemplate()}
    </div>
  );
}








