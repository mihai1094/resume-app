import { Metadata } from "next";
import { importPageMetadata } from "@/lib/seo/metadata";
import { ImportContent } from "./import-content";

// Export metadata for SEO - this only works in Server Components
export const metadata: Metadata = importPageMetadata;

export default function ImportCVPage() {
  return <ImportContent />;
}
