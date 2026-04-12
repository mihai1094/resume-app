"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

function CarouselSkeleton() {
  return (
    <div className="relative animate-pulse">
      <div
        className="rounded-2xl ring-1 ring-black/[0.07] shadow-[0_8px_40px_rgba(0,0,0,0.06)] bg-white overflow-hidden"
        style={{ height: 376 }}
      >
        <div className="p-8 space-y-5">
          {/* Name + title */}
          <div className="space-y-2">
            <div className="h-7 w-44 bg-muted rounded-md" />
            <div className="h-4 w-36 bg-muted/60 rounded-md" />
          </div>
          {/* Contact row */}
          <div className="flex gap-6 pt-1">
            <div className="h-3 w-32 bg-muted/40 rounded" />
            <div className="h-3 w-24 bg-muted/40 rounded" />
            <div className="h-3 w-20 bg-muted/40 rounded" />
          </div>
          {/* Divider */}
          <div className="h-px bg-muted/30" />
          {/* Summary */}
          <div className="space-y-2">
            <div className="h-3 w-16 bg-muted/50 rounded" />
            <div className="h-3 w-full bg-muted/25 rounded" />
            <div className="h-3 w-5/6 bg-muted/25 rounded" />
            <div className="h-3 w-4/5 bg-muted/25 rounded" />
          </div>
          {/* Experience */}
          <div className="space-y-2 pt-1">
            <div className="h-3 w-24 bg-muted/50 rounded" />
            <div className="h-4 w-40 bg-muted/40 rounded" />
            <div className="h-3 w-28 bg-muted/30 rounded" />
            <div className="h-3 w-full bg-muted/20 rounded" />
            <div className="h-3 w-4/5 bg-muted/20 rounded" />
          </div>
        </div>
      </div>
      {/* Tab placeholders */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {[80, 88, 72, 92].map((w, i) => (
          <div
            key={i}
            className={cn("h-7 rounded-full bg-muted/40")}
            style={{ width: w }}
          />
        ))}
      </div>
    </div>
  );
}

const HeroResumeCarouselInner = dynamic(
  () =>
    import("./hero-resume-carousel-inner").then((m) => ({
      default: m.HeroResumeCarouselInner,
    })),
  { ssr: false, loading: () => <CarouselSkeleton /> }
);

export function HeroResumeCarousel() {
  return <HeroResumeCarouselInner />;
}
