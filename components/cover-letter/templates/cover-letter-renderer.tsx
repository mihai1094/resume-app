"use client";

import { CoverLetterData, CoverLetterTemplateId } from "@/lib/types/cover-letter";
import { ModernCoverLetter } from "./modern-cover-letter";
import { ClassicCoverLetter } from "./classic-cover-letter";
import { ExecutiveCoverLetter } from "./executive-cover-letter";
import { MinimalistCoverLetter } from "./minimalist-cover-letter";

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
        return <MinimalistCoverLetter data={data} />;
      case "executive":
        return <ExecutiveCoverLetter data={data} />;
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













