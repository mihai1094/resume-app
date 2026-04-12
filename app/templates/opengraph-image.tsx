import { createOgPageImage, ogPageContentType, ogPageSize } from "@/lib/seo/og-page-image";

export const runtime = "edge";
export const size = ogPageSize;
export const contentType = ogPageContentType;
export const alt = "ResumeZeus templates";

export default function Image() {
  return createOgPageImage({
    eyebrow: "Templates",
    title: "Free ATS-friendly resume templates for 2026",
    description:
      "Browse 24 resume layouts, compare ATS fit, and export PDF without a paywall.",
  });
}
