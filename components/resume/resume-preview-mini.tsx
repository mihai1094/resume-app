"use client";

import { TemplateId } from "@/lib/constants/templates";
import { ResumeData } from "@/lib/types/resume";
import { cn } from "@/lib/utils";

interface ResumePreviewMiniProps {
    templateId: TemplateId;
    resumeData: ResumeData;
    className?: string;
}

// Map templates to layout styles
type LayoutStyle = "sidebar-left" | "sidebar-right" | "header-top" | "minimal" | "creative";

const TEMPLATE_LAYOUTS: Record<TemplateId, LayoutStyle> = {
    modern: "sidebar-left",
    ivy: "sidebar-left",
    timeline: "sidebar-left",
    executive: "header-top",
    classic: "header-top",
    technical: "header-top",
    minimalist: "minimal",
    adaptive: "minimal",
    creative: "creative",
    "ats-clarity": "minimal",
    "ats-structured": "minimal",
    "ats-compact": "minimal",
};

// Template-specific color schemes (keeping existing colors but refining for abstract look)
const TEMPLATE_COLORS: Record<TemplateId, { primary: string; bg: string; accent: string; text: string }> = {
    modern: { primary: "bg-blue-500", bg: "bg-blue-50", accent: "border-blue-200", text: "text-blue-700" },
    classic: { primary: "bg-slate-700", bg: "bg-slate-50", accent: "border-slate-200", text: "text-slate-800" },
    creative: { primary: "bg-purple-500", bg: "bg-purple-50", accent: "border-purple-200", text: "text-purple-700" },
    minimalist: { primary: "bg-gray-800", bg: "bg-gray-50", accent: "border-gray-200", text: "text-gray-800" },
    executive: { primary: "bg-emerald-700", bg: "bg-emerald-50", accent: "border-emerald-200", text: "text-emerald-800" },
    technical: { primary: "bg-orange-500", bg: "bg-orange-50", accent: "border-orange-200", text: "text-orange-700" },
    adaptive: { primary: "bg-indigo-500", bg: "bg-indigo-50", accent: "border-indigo-200", text: "text-indigo-700" },
    timeline: { primary: "bg-slate-600", bg: "bg-slate-50", accent: "border-slate-200", text: "text-slate-700" },
    ivy: { primary: "bg-teal-600", bg: "bg-teal-50", accent: "border-teal-200", text: "text-teal-700" },
    "ats-clarity": { primary: "bg-cyan-500", bg: "bg-cyan-50", accent: "border-cyan-200", text: "text-cyan-700" },
    "ats-structured": { primary: "bg-emerald-500", bg: "bg-emerald-50", accent: "border-emerald-200", text: "text-emerald-700" },
    "ats-compact": { primary: "bg-purple-500", bg: "bg-purple-50", accent: "border-purple-200", text: "text-purple-700" },
};

/**
 * Stylized Skeleton Mini Preview
 * Renders an abstract representation of the resume layout
 */
export function ResumePreviewMini({
    templateId,
    resumeData,
    className = "",
}: ResumePreviewMiniProps) {
    const layout = TEMPLATE_LAYOUTS[templateId] || "sidebar-left";
    const colors = TEMPLATE_COLORS[templateId] || TEMPLATE_COLORS.modern;

    const fullName = `${resumeData.personalInfo?.firstName || ""} ${resumeData.personalInfo?.lastName || ""}`.trim() || "Untitled Resume";
    const title = resumeData.personalInfo?.summary?.split(" ").slice(0, 8).join(" ") || "";

    // Helper to render skeleton lines
    const SkeletonLines = ({ count = 3, className = "" }: { count?: number; className?: string }) => (
        <div className={cn("space-y-1.5", className)}>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="h-1.5 rounded-full bg-current opacity-10 w-full last:w-2/3"
                />
            ))}
        </div>
    );

    // Helper to render a section block
    const SectionBlock = ({ className = "" }: { className?: string }) => (
        <div className={cn("space-y-2", className)}>
            <div className="h-2 w-1/3 rounded-full bg-current opacity-20 mb-2" />
            <SkeletonLines count={2} />
        </div>
    );

    const renderContent = () => {
        switch (layout) {
            case "sidebar-left":
                return (
                    <div className="flex h-full">
                        {/* Sidebar */}
                        <div className={cn("w-[30%] h-full p-3 flex flex-col gap-4", colors.bg)}>
                            <div className={cn("w-8 h-8 rounded-full opacity-20 mb-2", colors.primary)} />
                            <SkeletonLines count={4} className="text-gray-900" />
                            <div className="mt-auto space-y-2">
                                <div className="h-1.5 w-1/2 rounded-full bg-current opacity-10" />
                                <div className="h-1.5 w-3/4 rounded-full bg-current opacity-10" />
                            </div>
                        </div>
                        {/* Main Content */}
                        <div className="flex-1 p-4 flex flex-col gap-4 bg-white">
                            <div className="border-b pb-3 border-gray-100">
                                <h3 className={cn("font-bold text-sm truncate leading-tight mb-1", colors.text)}>
                                    {fullName}
                                </h3>
                                <p className="text-[10px] text-gray-400 truncate uppercase tracking-wider">
                                    {title}
                                </p>
                            </div>
                            <SectionBlock className="text-gray-800" />
                            <SectionBlock className="text-gray-800" />
                            <SectionBlock className="text-gray-800" />
                        </div>
                    </div>
                );

            case "header-top":
                return (
                    <div className="flex flex-col h-full bg-white">
                        {/* Header */}
                        <div className={cn("p-4 text-center border-b border-gray-100", colors.bg)}>
                            <h3 className={cn("font-bold text-sm truncate leading-tight mb-1", colors.text)}>
                                {fullName}
                            </h3>
                            <p className="text-[10px] text-gray-500 truncate uppercase tracking-wider">
                                {title}
                            </p>
                        </div>
                        {/* Columns */}
                        <div className="flex-1 p-4 grid grid-cols-3 gap-4">
                            <div className="col-span-2 space-y-4">
                                <SectionBlock className="text-gray-800" />
                                <SectionBlock className="text-gray-800" />
                                <SectionBlock className="text-gray-800" />
                            </div>
                            <div className="col-span-1 space-y-4 pt-2">
                                <SkeletonLines count={3} className="text-gray-400" />
                                <SkeletonLines count={4} className="text-gray-400" />
                            </div>
                        </div>
                    </div>
                );

            case "minimal":
                return (
                    <div className="flex flex-col h-full bg-white p-5">
                        <div className="mb-6">
                            <h3 className="font-bold text-lg text-gray-900 truncate leading-tight mb-1">
                                {fullName}
                            </h3>
                            <p className="text-[10px] text-gray-400 truncate">
                                {title}
                            </p>
                        </div>
                        <div className="space-y-5">
                            <div className="border-l-2 border-gray-100 pl-3">
                                <SectionBlock className="text-gray-600" />
                            </div>
                            <div className="border-l-2 border-gray-100 pl-3">
                                <SectionBlock className="text-gray-600" />
                            </div>
                            <div className="border-l-2 border-gray-100 pl-3">
                                <SectionBlock className="text-gray-600" />
                            </div>
                        </div>
                    </div>
                );

            case "creative":
                return (
                    <div className="flex h-full bg-white">
                        <div className={cn("w-2 h-full", colors.primary)} />
                        <div className="flex-1 flex flex-col">
                            <div className="p-4 bg-gray-50">
                                <h3 className={cn("font-bold text-lg truncate leading-tight", colors.text)}>
                                    {fullName}
                                </h3>
                                <p className="text-[10px] text-gray-500 truncate italic">
                                    {title}
                                </p>
                            </div>
                            <div className="flex-1 p-4 grid grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <SectionBlock className="text-gray-800" />
                                    <SectionBlock className="text-gray-800" />
                                </div>
                                <div className="space-y-4">
                                    <div className={cn("p-2 rounded bg-opacity-10", colors.bg)}>
                                        <SkeletonLines count={3} className={colors.text} />
                                    </div>
                                    <SkeletonLines count={4} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div
            className={cn(
                "relative w-full h-full overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md",
                colors.accent,
                className
            )}
        >
            {renderContent()}

            {/* Template Badge */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[9px] font-medium bg-gray-900 text-white px-2 py-1 rounded shadow-sm capitalize">
                    {templateId}
                </span>
            </div>
        </div>
    );
}
