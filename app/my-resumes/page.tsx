import { Metadata } from "next";
import { myResumesMetadata } from "@/lib/seo/metadata";
import { MyResumesContent } from "./my-resumes-content";

// Export metadata for SEO - this only works in Server Components
export const metadata: Metadata = myResumesMetadata;

export default function MyResumesPage() {
  return <MyResumesContent />;
}
