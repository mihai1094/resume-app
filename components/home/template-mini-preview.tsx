"use client";

import { cn } from "@/lib/utils";

interface TemplateMiniPreviewProps {
  templateId: string;
  className?: string;
}

/**
 * Professional mini preview components for each template style
 * These show realistic, scaled-down resume layouts
 */
export function TemplateMiniPreview({
  templateId,
  className,
}: TemplateMiniPreviewProps) {
  switch (templateId) {
    case "modern":
      return <ModernMiniPreview className={className} />;
    case "classic":
      return <ClassicMiniPreview className={className} />;
    case "executive":
      return <ExecutiveMiniPreview className={className} />;
    case "minimalist":
      return <MinimalistMiniPreview className={className} />;
    case "creative":
      return <CreativeMiniPreview className={className} />;
    case "technical":
      return <TechnicalMiniPreview className={className} />;
    case "adaptive":
      return <AdaptiveMiniPreview className={className} />;
    case "timeline":
      return <TimelineMiniPreview className={className} />;
    case "ivy":
      return <IvyMiniPreview className={className} />;
    case "ats-clarity":
      return <ClarityMiniPreview className={className} />;
    case "ats-structured":
      return <StructuredMiniPreview className={className} />;
    case "ats-compact":
      return <CompactMiniPreview className={className} />;
    default:
      return <ModernMiniPreview className={className} />;
  }
}

// Modern Template - Teal sidebar with white content
function ModernMiniPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-full w-full flex overflow-hidden bg-white shadow-inner",
        className
      )}
    >
      {/* Teal Sidebar */}
      <div className="w-[32%] bg-gradient-to-b from-teal-600 to-teal-700 p-3 flex flex-col">
        {/* Name */}
        <div className="mb-4">
          <div className="h-[6px] w-14 bg-white rounded-[1px] mb-1" />
          <div className="h-[6px] w-10 bg-white rounded-[1px]" />
        </div>

        {/* Contact section */}
        <div className="mb-4">
          <div className="h-[3px] w-8 bg-white/40 rounded-[1px] mb-2" />
          <div className="space-y-1.5">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
              <div className="h-[2px] w-12 bg-white/60 rounded-[1px]" />
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
              <div className="h-[2px] w-10 bg-white/60 rounded-[1px]" />
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
              <div className="h-[2px] w-14 bg-white/60 rounded-[1px]" />
            </div>
          </div>
        </div>

        {/* Skills section */}
        <div className="mt-auto">
          <div className="h-[3px] w-6 bg-white/40 rounded-[1px] mb-2" />
          <div className="flex flex-wrap gap-1">
            <div
              className="h-[8px] px-1 bg-white/20 rounded-[2px]"
              style={{ width: "18px" }}
            />
            <div
              className="h-[8px] px-1 bg-white/20 rounded-[2px]"
              style={{ width: "22px" }}
            />
            <div
              className="h-[8px] px-1 bg-white/20 rounded-[2px]"
              style={{ width: "16px" }}
            />
            <div
              className="h-[8px] px-1 bg-white/20 rounded-[2px]"
              style={{ width: "20px" }}
            />
          </div>
        </div>
      </div>

      {/* White Content */}
      <div className="flex-1 p-3 bg-white">
        {/* Experience Header */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-3 h-3 rounded-[3px] bg-teal-50 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-teal-500" />
          </div>
          <div className="h-[4px] w-16 bg-gray-800 rounded-[1px]" />
        </div>

        {/* Job Entry 1 */}
        <div className="mb-3 pl-2 border-l-[2px] border-teal-500">
          <div className="h-[4px] w-20 bg-gray-700 rounded-[1px] mb-1" />
          <div className="h-[3px] w-14 bg-teal-500/70 rounded-[1px] mb-1.5" />
          <div className="space-y-[3px]">
            <div className="flex items-start gap-1">
              <div className="w-[3px] h-[3px] rounded-full bg-teal-400 mt-[2px] shrink-0" />
              <div className="h-[2px] w-full bg-gray-200 rounded-[1px]" />
            </div>
            <div className="flex items-start gap-1">
              <div className="w-[3px] h-[3px] rounded-full bg-teal-400 mt-[2px] shrink-0" />
              <div className="h-[2px] w-[90%] bg-gray-200 rounded-[1px]" />
            </div>
            <div className="flex items-start gap-1">
              <div className="w-[3px] h-[3px] rounded-full bg-teal-400 mt-[2px] shrink-0" />
              <div className="h-[2px] w-[85%] bg-gray-200 rounded-[1px]" />
            </div>
          </div>
        </div>

        {/* Job Entry 2 */}
        <div className="pl-2 border-l-[2px] border-gray-200">
          <div className="h-[4px] w-18 bg-gray-700 rounded-[1px] mb-1" />
          <div className="h-[3px] w-12 bg-teal-500/70 rounded-[1px] mb-1.5" />
          <div className="space-y-[3px]">
            <div className="flex items-start gap-1">
              <div className="w-[3px] h-[3px] rounded-full bg-teal-400 mt-[2px] shrink-0" />
              <div className="h-[2px] w-full bg-gray-200 rounded-[1px]" />
            </div>
            <div className="flex items-start gap-1">
              <div className="w-[3px] h-[3px] rounded-full bg-teal-400 mt-[2px] shrink-0" />
              <div className="h-[2px] w-[88%] bg-gray-200 rounded-[1px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Classic Template - Traditional centered header
function ClassicMiniPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-full w-full bg-[#FAFAF9] p-4 flex flex-col shadow-inner",
        className
      )}
    >
      {/* Centered Header */}
      <div className="text-center mb-3 pb-2 border-b border-slate-300">
        <div className="h-[7px] w-24 bg-slate-800 rounded-[1px] mx-auto mb-1.5" />
        <div className="h-[3px] w-32 bg-slate-400/60 rounded-[1px] mx-auto mb-2" />
        <div className="flex justify-center items-center gap-2">
          <div className="h-[2px] w-14 bg-slate-400/50 rounded-[1px]" />
          <div className="w-[3px] h-[3px] rounded-full bg-slate-300" />
          <div className="h-[2px] w-16 bg-slate-400/50 rounded-[1px]" />
          <div className="w-[3px] h-[3px] rounded-full bg-slate-300" />
          <div className="h-[2px] w-12 bg-slate-400/50 rounded-[1px]" />
        </div>
      </div>

      {/* Summary */}
      <div className="mb-3">
        <div className="space-y-[3px]">
          <div className="h-[2px] w-full bg-slate-200 rounded-[1px]" />
          <div className="h-[2px] w-[95%] bg-slate-200 rounded-[1px]" />
          <div className="h-[2px] w-[85%] bg-slate-200 rounded-[1px]" />
        </div>
      </div>

      {/* Two Column Content */}
      <div className="flex gap-4 flex-1">
        <div className="flex-1 space-y-3">
          {/* Experience */}
          <div>
            <div className="h-[4px] w-14 bg-slate-700 rounded-[1px] mb-2 uppercase" />
            <div className="space-y-2">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="h-[3px] w-16 bg-slate-600 rounded-[1px]" />
                  <div className="h-[2px] w-10 bg-slate-400 rounded-[1px]" />
                </div>
                <div className="h-[2px] w-12 bg-slate-400/60 rounded-[1px] mb-1 italic" />
                <div className="space-y-[2px] pl-2">
                  <div className="h-[2px] w-full bg-slate-200 rounded-[1px]" />
                  <div className="h-[2px] w-[90%] bg-slate-200 rounded-[1px]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-[35%] space-y-3">
          <div>
            <div className="h-[4px] w-10 bg-slate-700 rounded-[1px] mb-2" />
            <div className="space-y-1">
              <div className="h-[3px] w-full bg-slate-500 rounded-[1px]" />
              <div className="h-[2px] w-16 bg-slate-300 rounded-[1px]" />
            </div>
          </div>
          <div>
            <div className="h-[4px] w-8 bg-slate-700 rounded-[1px] mb-2" />
            <div className="flex flex-wrap gap-1">
              <div className="h-[7px] w-10 bg-slate-200 rounded-[2px]" />
              <div className="h-[7px] w-12 bg-slate-200 rounded-[2px]" />
              <div className="h-[7px] w-8 bg-slate-200 rounded-[2px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Executive Template - Premium dark with gold accents
function ExecutiveMiniPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-full w-full bg-[#1C1917] p-4 flex flex-col shadow-inner",
        className
      )}
    >
      {/* Header with Monogram */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-900/30">
          <span className="text-[11px] font-bold text-amber-950 tracking-tight">
            JD
          </span>
        </div>
        <div className="flex-1 pt-1">
          <div className="h-[6px] w-20 bg-white rounded-[1px] mb-1.5" />
          <div className="h-[3px] w-24 bg-amber-500/70 rounded-[1px]" />
        </div>
      </div>

      {/* Gold Divider */}
      <div className="h-[1px] bg-gradient-to-r from-amber-500/60 via-amber-500/30 to-transparent mb-3" />

      {/* Content */}
      <div className="space-y-3 flex-1">
        {/* Section 1 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-[3px] w-14 bg-amber-500/50 rounded-[1px]" />
            <div className="h-[1px] flex-1 bg-stone-700" />
          </div>
          <div className="pl-2 space-y-1.5">
            <div className="flex justify-between">
              <div className="h-[4px] w-20 bg-stone-200 rounded-[1px]" />
              <div className="h-[3px] w-12 bg-stone-500 rounded-[1px]" />
            </div>
            <div className="h-[3px] w-16 bg-amber-500/50 rounded-[1px]" />
            <div className="space-y-[3px]">
              <div className="h-[2px] w-full bg-stone-600 rounded-[1px]" />
              <div className="h-[2px] w-[92%] bg-stone-600 rounded-[1px]" />
              <div className="h-[2px] w-[88%] bg-stone-600 rounded-[1px]" />
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-[3px] w-12 bg-amber-500/50 rounded-[1px]" />
            <div className="h-[1px] flex-1 bg-stone-700" />
          </div>
          <div className="pl-2 space-y-1">
            <div className="h-[4px] w-18 bg-stone-200 rounded-[1px]" />
            <div className="h-[2px] w-full bg-stone-600 rounded-[1px]" />
            <div className="h-[2px] w-[85%] bg-stone-600 rounded-[1px]" />
          </div>
        </div>
      </div>

      {/* Footer Skills */}
      <div className="flex gap-1.5 mt-auto pt-2">
        <div
          className="h-[8px] px-1.5 bg-amber-500/20 rounded-[2px]"
          style={{ width: "24px" }}
        />
        <div
          className="h-[8px] px-1.5 bg-amber-500/15 rounded-[2px]"
          style={{ width: "28px" }}
        />
        <div
          className="h-[8px] px-1.5 bg-amber-500/15 rounded-[2px]"
          style={{ width: "20px" }}
        />
      </div>
    </div>
  );
}

// Minimalist Template - Swiss design
function MinimalistMiniPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-full w-full bg-white p-5 flex flex-col shadow-inner",
        className
      )}
    >
      {/* Clean Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="h-[10px] w-28 bg-black rounded-[1px]" />
        <div className="space-y-[3px] text-right">
          <div className="h-[2px] w-16 bg-gray-400 rounded-[1px] ml-auto" />
          <div className="h-[2px] w-14 bg-gray-400 rounded-[1px] ml-auto" />
          <div className="h-[2px] w-18 bg-gray-400 rounded-[1px] ml-auto" />
        </div>
      </div>

      {/* Bold Line */}
      <div className="h-[2px] bg-black mb-3" />

      {/* Grid Content */}
      <div className="flex gap-6 flex-1">
        {/* Main Column */}
        <div className="flex-1 space-y-4">
          {/* Experience */}
          <div>
            <div className="h-[3px] w-12 bg-black rounded-[1px] mb-2 tracking-[0.3em]" />
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <div className="h-[4px] w-20 bg-gray-800 rounded-[1px]" />
                  <div className="h-[2px] w-12 bg-gray-400 rounded-[1px]" />
                </div>
                <div className="h-[3px] w-16 bg-gray-500 rounded-[1px] mb-1" />
                <div className="pl-2 border-l border-black/10 space-y-[3px]">
                  <div className="h-[2px] w-full bg-gray-300 rounded-[1px]" />
                  <div className="h-[2px] w-[92%] bg-gray-300 rounded-[1px]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <div className="h-[4px] w-18 bg-gray-800 rounded-[1px]" />
                  <div className="h-[2px] w-10 bg-gray-400 rounded-[1px]" />
                </div>
                <div className="h-[3px] w-14 bg-gray-500 rounded-[1px] mb-1" />
                <div className="pl-2 border-l border-black/10 space-y-[3px]">
                  <div className="h-[2px] w-full bg-gray-300 rounded-[1px]" />
                  <div className="h-[2px] w-[88%] bg-gray-300 rounded-[1px]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side Column */}
        <div className="w-[30%] space-y-3">
          <div>
            <div className="h-[3px] w-10 bg-black rounded-[1px] mb-2" />
            <div className="space-y-[3px]">
              <div className="h-[3px] w-full bg-gray-700 rounded-[1px]" />
              <div className="h-[2px] w-14 bg-gray-400 rounded-[1px]" />
            </div>
          </div>
          <div>
            <div className="h-[3px] w-8 bg-black rounded-[1px] mb-2" />
            <div className="space-y-1">
              <div className="h-[2px] w-full bg-gray-400 rounded-[1px]" />
              <div className="h-[2px] w-12 bg-gray-400 rounded-[1px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Creative Template - Magazine editorial style
function CreativeMiniPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-full w-full bg-[#FAFAF8] p-3 relative overflow-hidden shadow-inner",
        className
      )}
    >
      {/* Geometric accent */}
      <div
        className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500"
        style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
      />

      {/* Large faded initials */}
      <div
        className="absolute top-1 left-2 text-[52px] font-black text-orange-500/[0.08] leading-none select-none"
        style={{ fontFamily: "Georgia, serif" }}
      >
        AJ
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between pt-6">
        <div>
          <div className="h-[8px] w-12 bg-gray-800 rounded-[1px] mb-1" />
          <div className="h-[8px] w-16 bg-orange-500 rounded-[1px]" />
          <div className="h-[3px] w-24 bg-gray-400/60 rounded-[1px] mt-2" />
        </div>
        <div className="p-2 border-l-2 border-orange-500 bg-gradient-to-b from-transparent to-black/[0.02]">
          <div className="space-y-1">
            <div className="h-[2px] w-14 bg-gray-400 rounded-[1px]" />
            <div className="h-[2px] w-12 bg-gray-400 rounded-[1px]" />
            <div className="h-[2px] w-16 bg-gray-400 rounded-[1px]" />
          </div>
        </div>
      </div>

      {/* Magazine-style columns */}
      <div className="relative z-10 flex gap-4 mt-4">
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-5 h-[2px] bg-orange-500" />
            <div className="h-[4px] w-14 bg-gray-700 rounded-[1px]" />
          </div>
          <div className="space-y-1.5">
            <div className="h-[3px] w-full bg-gray-600 rounded-[1px]" />
            <div className="h-[3px] w-16 bg-orange-500/60 rounded-[1px]" />
            <div className="space-y-[3px] mt-1">
              <div className="h-[2px] w-full bg-gray-200 rounded-[1px]" />
              <div className="h-[2px] w-[92%] bg-gray-200 rounded-[1px]" />
              <div className="h-[2px] w-[88%] bg-gray-200 rounded-[1px]" />
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-5 h-[2px] bg-orange-500" />
            <div className="h-[4px] w-10 bg-gray-700 rounded-[1px]" />
          </div>
          <div className="space-y-1.5">
            <div className="h-[3px] w-full bg-gray-600 rounded-[1px]" />
            <div className="h-[3px] w-14 bg-orange-500/60 rounded-[1px]" />
            <div className="space-y-[3px] mt-1">
              <div className="h-[2px] w-full bg-gray-200 rounded-[1px]" />
              <div className="h-[2px] w-[88%] bg-gray-200 rounded-[1px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Technical Template - Dark IDE theme
function TechnicalMiniPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-full w-full bg-[#0D1117] p-3 flex flex-col shadow-inner",
        className
      )}
      style={{ fontFamily: "monospace" }}
    >
      {/* Terminal-like header */}
      <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-slate-800">
        <div className="flex gap-[5px]">
          <div className="w-[8px] h-[8px] rounded-full bg-red-500/80" />
          <div className="w-[8px] h-[8px] rounded-full bg-yellow-500/80" />
          <div className="w-[8px] h-[8px] rounded-full bg-green-500/80" />
        </div>
        <div className="h-[3px] w-20 bg-slate-700 rounded-[1px] ml-2" />
      </div>

      {/* Code-like content */}
      <div className="space-y-2 flex-1">
        {/* Name declaration */}
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] text-cyan-400 font-medium">const</span>
          <div className="h-[5px] w-14 bg-purple-400/80 rounded-[1px]" />
          <span className="text-[8px] text-slate-500">=</span>
          <span className="text-[8px] text-green-400">"Developer"</span>
        </div>

        {/* Experience block */}
        <div className="pl-2 border-l-[2px] border-blue-500/40 space-y-1.5 mt-2">
          <div className="flex items-center gap-1">
            <span className="text-[7px] text-blue-400">→</span>
            <div className="h-[4px] w-20 bg-slate-300 rounded-[1px]" />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[7px] text-slate-600">//</span>
            <div className="h-[2px] w-full bg-slate-700 rounded-[1px]" />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[7px] text-slate-600">//</span>
            <div className="h-[2px] w-[88%] bg-slate-700 rounded-[1px]" />
          </div>
        </div>

        {/* Skills array */}
        <div className="mt-3">
          <div className="flex items-center gap-1 mb-1.5">
            <span className="text-[8px] text-pink-400">skills</span>
            <span className="text-[8px] text-slate-500">: [</span>
          </div>
          <div className="flex gap-1.5 flex-wrap pl-2">
            <div className="h-[12px] px-1.5 bg-blue-500/20 border border-blue-500/40 rounded flex items-center">
              <span className="text-[7px] text-blue-400">React</span>
            </div>
            <div className="h-[12px] px-1.5 bg-green-500/20 border border-green-500/40 rounded flex items-center">
              <span className="text-[7px] text-green-400">Node</span>
            </div>
            <div className="h-[12px] px-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded flex items-center">
              <span className="text-[7px] text-yellow-400">TS</span>
            </div>
            <div className="h-[12px] px-1.5 bg-purple-500/20 border border-purple-500/40 rounded flex items-center">
              <span className="text-[7px] text-purple-400">SQL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex justify-between items-center pt-2 border-t border-slate-800 mt-auto">
        <div className="flex items-center gap-1">
          <div className="w-[6px] h-[6px] rounded-full bg-green-500" />
          <span className="text-[6px] text-slate-500">ready</span>
        </div>
        <div className="h-[3px] w-10 bg-cyan-500/40 rounded-[1px]" />
      </div>
    </div>
  );
}

// Adaptive/Smart Template - Shows flexibility
function AdaptiveMiniPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-full w-full bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-3 relative overflow-hidden shadow-inner",
        className
      )}
    >
      {/* Subtle animated orbs */}
      <div className="absolute top-2 right-2 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400/20 to-violet-400/20 blur-sm" />
      <div className="absolute bottom-4 left-4 w-8 h-8 rounded-full bg-gradient-to-br from-violet-400/15 to-indigo-400/15 blur-sm" />

      {/* Smart header */}
      <div className="relative z-10 flex items-start gap-2 mb-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <div className="flex-1 pt-1">
          <div className="h-[6px] w-20 bg-gray-800 rounded-[1px] mb-1" />
          <div className="h-[3px] w-16 bg-indigo-500/60 rounded-[1px]" />
        </div>
      </div>

      {/* Adaptive content grid */}
      <div className="relative z-10 space-y-2">
        {/* Section header */}
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md bg-indigo-100 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          </div>
          <div className="h-[4px] w-16 bg-gray-700 rounded-[1px]" />
        </div>

        {/* Smart cards */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-white/70 backdrop-blur-sm border border-indigo-100 shadow-sm">
            <div className="h-[4px] w-14 bg-gray-700 rounded-[1px] mb-1" />
            <div className="h-[3px] w-10 bg-indigo-400/60 rounded-[1px] mb-1.5" />
            <div className="space-y-[3px]">
              <div className="h-[2px] w-full bg-gray-200 rounded-[1px]" />
              <div className="h-[2px] w-[85%] bg-gray-200 rounded-[1px]" />
            </div>
          </div>
          <div className="p-2 rounded-lg bg-white/70 backdrop-blur-sm border border-violet-100 shadow-sm">
            <div className="h-[4px] w-12 bg-gray-700 rounded-[1px] mb-1" />
            <div className="h-[3px] w-14 bg-violet-400/60 rounded-[1px] mb-1.5" />
            <div className="space-y-[3px]">
              <div className="h-[2px] w-full bg-gray-200 rounded-[1px]" />
              <div className="h-[2px] w-[90%] bg-gray-200 rounded-[1px]" />
            </div>
          </div>
        </div>

        {/* Skills pills */}
        <div className="flex gap-1.5 flex-wrap pt-1">
          <div className="h-[10px] px-2 rounded-full bg-indigo-500/15 border border-indigo-500/25" />
          <div className="h-[10px] px-2.5 rounded-full bg-violet-500/15 border border-violet-500/25" />
          <div className="h-[10px] px-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/25" />
        </div>
      </div>
    </div>
  );
}

// Timeline Template - Visual career journey
function TimelineMiniPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-full w-full bg-white flex flex-col overflow-hidden shadow-inner",
        className
      )}
    >
      {/* Dark header */}
      <div className="bg-slate-700 p-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-14 h-14 rounded-full bg-orange-500/15 -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex justify-between items-end">
          <div>
            <div className="h-[6px] w-18 bg-white rounded-[1px] mb-1" />
            <div className="h-[3px] w-24 bg-white/50 rounded-[1px]" />
          </div>
          <div className="text-right">
            <div className="text-[14px] font-bold text-orange-500 leading-none">
              8+
            </div>
            <div className="text-[6px] text-white/50 uppercase tracking-wider">
              Years
            </div>
          </div>
        </div>
        {/* Contact icons */}
        <div className="flex gap-3 mt-2">
          <div className="flex items-center gap-1">
            <div className="w-[5px] h-[5px] rounded-full bg-orange-500" />
            <div className="h-[2px] w-10 bg-white/50 rounded-[1px]" />
          </div>
          <div className="flex items-center gap-1">
            <div className="w-[5px] h-[5px] rounded-full bg-orange-500" />
            <div className="h-[2px] w-8 bg-white/50 rounded-[1px]" />
          </div>
        </div>
      </div>

      {/* Timeline content */}
      <div className="flex-1 p-3 flex gap-3">
        <div className="flex-1 relative">
          {/* Timeline line */}
          <div className="absolute left-[6px] top-1 bottom-2 w-[2px] bg-gradient-to-b from-slate-400 via-slate-300 to-transparent" />

          <div className="space-y-3">
            {/* Timeline entry 1 */}
            <div className="flex gap-2 relative">
              <div className="w-[14px] h-[14px] rounded-full bg-white border-[3px] border-slate-700 relative z-10 shrink-0" />
              <div className="flex-1 -mt-0.5">
                <div className="h-[4px] w-16 bg-gray-700 rounded-[1px] mb-1" />
                <div className="h-[3px] w-12 bg-orange-500/60 rounded-[1px] mb-1" />
                <div className="space-y-[3px]">
                  <div className="h-[2px] w-full bg-gray-200 rounded-[1px]" />
                  <div className="h-[2px] w-[90%] bg-gray-200 rounded-[1px]" />
                </div>
              </div>
            </div>

            {/* Timeline entry 2 */}
            <div className="flex gap-2 relative">
              <div className="w-[14px] h-[14px] rounded-full bg-white border-[3px] border-slate-400 relative z-10 shrink-0" />
              <div className="flex-1 -mt-0.5">
                <div className="h-[4px] w-14 bg-gray-700 rounded-[1px] mb-1" />
                <div className="h-[3px] w-10 bg-orange-500/60 rounded-[1px] mb-1" />
                <div className="space-y-[3px]">
                  <div className="h-[2px] w-full bg-gray-200 rounded-[1px]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills sidebar */}
        <div className="w-[35%] bg-slate-50 rounded-lg p-2">
          <div className="h-[4px] w-10 bg-slate-600 rounded-[1px] mb-2" />
          <div className="flex flex-wrap gap-[4px]">
            <div className="h-[8px] w-8 bg-slate-200 rounded-[2px]" />
            <div className="h-[8px] w-10 bg-slate-200 rounded-[2px]" />
            <div className="h-[8px] w-6 bg-slate-200 rounded-[2px]" />
            <div className="h-[8px] w-9 bg-slate-200 rounded-[2px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Clarity (ATS) - single column, bold headers
function ClarityMiniPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-full w-full bg-white border border-slate-200 p-4 flex flex-col gap-3 shadow-inner",
        className
      )}
    >
      <div className="space-y-1">
        <div className="h-[7px] w-28 bg-slate-900 rounded-[1px]" />
        <div className="h-[4px] w-40 bg-slate-500 rounded-[1px]" />
      </div>
      <div className="h-px bg-slate-200" />
      <div className="space-y-2">
        <div className="h-[3px] w-16 bg-sky-500 rounded-[1px]" />
        <div className="space-y-[3px]">
          <div className="h-[3px] w-28 bg-slate-800 rounded-[1px]" />
          <div className="h-[2px] w-full bg-slate-200 rounded-[1px]" />
          <div className="h-[2px] w-[92%] bg-slate-200 rounded-[1px]" />
        </div>
        <div className="space-y-[3px]">
          <div className="h-[3px] w-24 bg-slate-800 rounded-[1px]" />
          <div className="h-[2px] w-[95%] bg-slate-200 rounded-[1px]" />
          <div className="h-[2px] w-[88%] bg-slate-200 rounded-[1px]" />
        </div>
      </div>
      <div className="h-[3px] w-16 bg-sky-500 rounded-[1px] mt-auto" />
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[10px] px-2 rounded-full bg-slate-100 border border-slate-200"
            style={{ width: `${18 + i * 2}px` }}
          />
        ))}
      </div>
    </div>
  );
}

// Structured (ATS) - two-column grid with labels
function StructuredMiniPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-full w-full bg-white border border-slate-200 p-4 grid grid-cols-4 gap-3 shadow-inner",
        className
      )}
    >
      <div className="col-span-1 space-y-2">
        <div className="h-[3px] w-18 bg-emerald-500 rounded-[1px]" />
        <div className="h-[2px] w-full bg-slate-200 rounded-[1px]" />
        <div className="h-[3px] w-16 bg-emerald-500 rounded-[1px]" />
        <div className="h-[2px] w-[90%] bg-slate-200 rounded-[1px]" />
        <div className="h-[3px] w-14 bg-emerald-500 rounded-[1px]" />
        <div className="h-[2px] w-[85%] bg-slate-200 rounded-[1px]" />
      </div>
      <div className="col-span-3 space-y-3">
        <div className="space-y-[3px]">
          <div className="h-[3px] w-28 bg-slate-900 rounded-[1px]" />
          <div className="h-[2px] w-full bg-slate-200 rounded-[1px]" />
          <div className="h-[2px] w-[90%] bg-slate-200 rounded-[1px]" />
        </div>
        <div className="space-y-[3px]">
          <div className="h-[3px] w-24 bg-slate-800 rounded-[1px]" />
          <div className="h-[2px] w-[95%] bg-slate-200 rounded-[1px]" />
          <div className="h-[2px] w-[88%] bg-slate-200 rounded-[1px]" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-[9px] px-2 rounded-md bg-slate-50 border border-slate-200"
              style={{ width: `${16 + i * 2}px` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Compact (ATS) - condensed, tight spacing
function CompactMiniPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-full w-full bg-white border border-slate-200 p-3 flex flex-col gap-2 shadow-inner",
        className
      )}
    >
      <div className="space-y-1">
        <div className="h-[6px] w-24 bg-slate-900 rounded-[1px]" />
        <div className="h-[3px] w-32 bg-slate-500 rounded-[1px]" />
      </div>
      <div className="space-y-[3px]">
        <div className="h-[3px] w-18 bg-indigo-500 rounded-[1px]" />
        <div className="h-[2px] w-full bg-slate-200 rounded-[1px]" />
        <div className="h-[2px] w-[92%] bg-slate-200 rounded-[1px]" />
      </div>
      <div className="space-y-[2px]">
        <div className="flex items-center justify-between">
          <div className="h-[3px] w-20 bg-slate-800 rounded-[1px]" />
          <div className="h-[2px] w-12 bg-slate-300 rounded-[1px]" />
        </div>
        <div className="h-[2px] w-[96%] bg-slate-200 rounded-[1px]" />
        <div className="h-[2px] w-[90%] bg-slate-200 rounded-[1px]" />
      </div>
      <div className="flex flex-wrap gap-1 mt-auto">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-[9px] px-2 rounded-md bg-slate-50 border border-slate-200"
            style={{ width: `${14 + i * 2}px` }}
          />
        ))}
      </div>
    </div>
  );
}

// Ivy League Template - Finance/consulting format
function IvyMiniPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-full w-full bg-white p-4 flex flex-col shadow-inner",
        className
      )}
    >
      {/* Centered header - traditional Ivy style */}
      <div className="text-center mb-3">
        <div className="h-[8px] w-28 bg-slate-800 rounded-[1px] mx-auto mb-1.5" />
        <div className="flex justify-center items-center gap-1.5 text-[7px] text-slate-400">
          <div className="h-[2px] w-12 bg-slate-400 rounded-[1px]" />
          <span>|</span>
          <div className="h-[2px] w-10 bg-slate-400 rounded-[1px]" />
          <span>|</span>
          <div className="h-[2px] w-14 bg-slate-400 rounded-[1px]" />
          <span>|</span>
          <div className="h-[2px] w-8 bg-slate-400 rounded-[1px]" />
        </div>
      </div>

      {/* Horizontal rule */}
      <div className="h-[2px] bg-slate-800 mb-3" />

      {/* Dense content - wall street style */}
      <div className="space-y-3 flex-1">
        {/* Education */}
        <div>
          <div className="h-[4px] w-16 bg-slate-800 rounded-[1px] mb-1.5 font-bold" />
          <div className="flex justify-between items-start mb-1">
            <div>
              <div className="h-[4px] w-20 bg-slate-700 rounded-[1px] mb-0.5" />
              <div className="h-[3px] w-16 bg-slate-400 rounded-[1px] italic" />
            </div>
            <div className="h-[3px] w-14 bg-slate-400 rounded-[1px]" />
          </div>
        </div>

        {/* Experience */}
        <div>
          <div className="h-[4px] w-18 bg-slate-800 rounded-[1px] mb-1.5" />
          <div className="flex justify-between items-start mb-1">
            <div>
              <div className="h-[4px] w-24 bg-slate-700 rounded-[1px] mb-0.5" />
              <div className="h-[3px] w-18 bg-slate-400 rounded-[1px]" />
            </div>
            <div className="h-[3px] w-12 bg-slate-400 rounded-[1px]" />
          </div>
          <div className="pl-2 space-y-[4px]">
            <div className="flex items-start gap-1">
              <span className="text-[6px] text-slate-400 mt-[1px]">•</span>
              <div className="h-[2px] w-full bg-slate-200 rounded-[1px]" />
            </div>
            <div className="flex items-start gap-1">
              <span className="text-[6px] text-slate-400 mt-[1px]">•</span>
              <div className="h-[2px] w-[94%] bg-slate-200 rounded-[1px]" />
            </div>
            <div className="flex items-start gap-1">
              <span className="text-[6px] text-slate-400 mt-[1px]">•</span>
              <div className="h-[2px] w-[88%] bg-slate-200 rounded-[1px]" />
            </div>
          </div>
        </div>

        {/* Skills line */}
        <div className="mt-auto">
          <div className="h-[4px] w-10 bg-slate-800 rounded-[1px] mb-1" />
          <div className="h-[3px] w-full bg-slate-200 rounded-[1px]" />
        </div>
      </div>
    </div>
  );
}
