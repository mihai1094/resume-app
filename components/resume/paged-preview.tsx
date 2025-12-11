"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface PagedPreviewProps {
  children: ReactNode;
  pageHeightMm?: number;
  className?: string;
}

const A4_HEIGHT_MM = 297;

/**
 * PagedPreview - Visual page break indicators for HTML resume preview
 *
 * Shows dashed lines and page labels at A4 page boundaries to help users
 * understand where page breaks will occur in the final PDF export.
 */
export function PagedPreview({
  children,
  pageHeightMm = A4_HEIGHT_MM,
  className,
}: PagedPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;

    const updatePageCount = () => {
      if (!containerRef.current) return;
      const containerHeight = containerRef.current.scrollHeight;
      // Convert mm to pixels (assuming 96 DPI, 1mm ≈ 3.78px)
      const pageHeightPx = pageHeightMm * 3.78;
      const pages = Math.ceil(containerHeight / pageHeightPx);
      setPageCount(Math.max(1, pages));
    };

    // Initial calculation
    updatePageCount();

    // Watch for content changes
    const observer = new ResizeObserver(updatePageCount);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [pageHeightMm, children]);

  // Generate page break indicators
  const pageBreakIndicators = [];
  for (let i = 1; i < pageCount; i++) {
    pageBreakIndicators.push(
      <div
        key={i}
        className="absolute left-0 right-0 pointer-events-none z-10"
        style={{
          top: `${pageHeightMm * i}mm`,
        }}
      >
        {/* Page break line */}
        <div className="relative">
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-red-400/60"
            style={{ top: "-1px" }}
          />
          {/* Page labels */}
          <div className="absolute left-2 -translate-y-1/2 bg-white px-2 py-0.5 rounded text-xs font-medium text-muted-foreground shadow-sm border">
            Page {i}
          </div>
          <div className="absolute right-2 -translate-y-1/2 bg-white px-2 py-0.5 rounded text-xs font-medium text-muted-foreground shadow-sm border">
            Page {i + 1}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Page break indicators */}
      {pageBreakIndicators}

      {/* Content container */}
      <div ref={containerRef} className="relative">
        {children}
      </div>

      {/* Page count indicator (only show if more than 1 page) */}
      {pageCount > 1 && (
        <div className="sticky bottom-2 left-0 right-0 flex justify-center pointer-events-none">
          <div className="bg-slate-900/80 text-white text-xs px-3 py-1.5 rounded-full shadow-lg pointer-events-auto">
            {pageCount} pages
          </div>
        </div>
      )}
    </div>
  );
}
