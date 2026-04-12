import { createOgPageImage, ogPageContentType, ogPageSize } from "@/lib/seo/og-page-image";

export const runtime = "edge";
export const size = ogPageSize;
export const contentType = ogPageContentType;
export const alt = "ResumeZeus pricing";

export default function Image() {
  return createOgPageImage({
    eyebrow: "Pricing",
    title: "Start free. Upgrade only when you need more.",
    description:
      "Free PDF export, ATS-friendly templates, and 30 AI credits at signup.",
  });
}
