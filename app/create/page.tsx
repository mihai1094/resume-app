import { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo/metadata";
import { CreatePageClient } from "./create-content";

// Export metadata for SEO - this only works in Server Components
export const metadata: Metadata = createPageMetadata;

export default function CreateResumePage() {
  return <CreatePageClient />;
}
