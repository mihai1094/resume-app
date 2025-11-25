"use client";

import { TemplateId } from "@/lib/constants/templates";
import { SAMPLE_RESUME_DATA } from "@/lib/constants/sample-data";
import { PreviewPanel } from "@/components/resume/preview-panel";
import { DEFAULT_TEMPLATE_CUSTOMIZATION } from "@/lib/constants/defaults";

interface ResumePreviewMiniProps {
    templateId: TemplateId;
    className?: string;
}

/**
 * Mini preview component that shows a scaled-down version of a resume template
 * Uses sample data to show what the template looks like
 */
export function ResumePreviewMini({
    templateId,
    className = "",
}: ResumePreviewMiniProps) {
    return (
        <div
            className={`relative w-full h-48 overflow-hidden bg-white ${className}`}
        >
            {/* Scale down the preview panel to fit in the thumbnail */}
            <div
                className="absolute origin-top-left"
                style={{
                    transform: "scale(0.18)",
                    width: "595px", // A4 width
                    height: "842px", // A4 height
                    pointerEvents: "none",
                }}
            >
                <PreviewPanel
                    templateId={templateId}
                    resumeData={SAMPLE_RESUME_DATA}
                    isValid={true}
                    customization={DEFAULT_TEMPLATE_CUSTOMIZATION}
                    onChangeTemplate={() => { }}
                />
            </div>

            {/* Gradient overlay for better visual */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
        </div>
    );
}
