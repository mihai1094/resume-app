import { createOgPageImage, ogPageContentType, ogPageSize } from "@/lib/seo/og-page-image";

export const runtime = "edge";
export const size = ogPageSize;
export const contentType = ogPageContentType;
export const alt = "ResumeZeus blog";

export default function Image() {
  return createOgPageImage({
    eyebrow: "Blog",
    title: "ATS resume guides and career tips",
    description:
      "Practical articles on resume writing, ATS optimization, and job-search strategy.",
  });
}
