"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface PagedPreviewProps {
  children: ReactNode;
  pageHeightMm?: number;
  marginTopMm?: number;
  marginBottomMm?: number;
  currentPage?: number;
  onPageCountChange?: (count: number) => void;
  className?: string;
}

const A4_HEIGHT_MM = 297;
const DEFAULT_MARGIN_TOP_MM = 8;
const DEFAULT_MARGIN_BOTTOM_MM = 12;

/**
 * PagedPreview — page-accurate viewport for HTML resume preview.
 *
 * Clips content to exactly one A4 page with top/bottom margins,
 * simulating real printed page margins. Translates vertically
 * to show the requested page. Reports total page count so the parent
 * can render carousel navigation.
 */
export function PagedPreview({
  children,
  pageHeightMm = A4_HEIGHT_MM,
  marginTopMm = DEFAULT_MARGIN_TOP_MM,
  marginBottomMm = DEFAULT_MARGIN_BOTTOM_MM,
  currentPage = 0,
  onPageCountChange,
  className,
}: PagedPreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const cbRef = useRef(onPageCountChange);
  const [pageCount, setPageCount] = useState(1);

  const contentHeightMm = pageHeightMm - marginTopMm - marginBottomMm;

  useEffect(() => {
    cbRef.current = onPageCountChange;
  }, [onPageCountChange]);

  useEffect(() => {
    if (!contentRef.current) return;

    let last = 0;
    const contentPx = contentHeightMm * 3.78;

    const measure = () => {
      if (!contentRef.current) return;
      const h = contentRef.current.scrollHeight;
      const count = Math.max(1, Math.ceil((h - 10) / contentPx));
      if (count !== last) {
        last = count;
        setPageCount(count);
        cbRef.current?.(count);
      }
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, [contentHeightMm]);

  const hasPrevPage = currentPage > 0;

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ height: `${pageHeightMm}mm` }}
    >
      <div
        style={{
          boxSizing: "border-box",
          paddingTop: `${marginTopMm}mm`,
          paddingBottom: `${marginBottomMm}mm`,
          height: `${pageHeightMm}mm`,
          overflow: "hidden",
        }}
      >
        <div
          ref={contentRef}
          className="will-change-transform transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateY(-${currentPage * contentHeightMm}mm)`,
          }}
        >
          {children}
        </div>
      </div>

      {/* Top fade — signals content continues from previous page */}
      {hasPrevPage && (
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none z-10"
          style={{
            height: "20mm",
            background:
              "linear-gradient(to top, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 70%, rgba(255,255,255,1) 100%)",
          }}
        />
      )}
    </div>
  );
}
