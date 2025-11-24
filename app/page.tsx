import { Metadata } from "next";
import { homepageMetadata } from "@/lib/seo/metadata";
import { HomeContent } from "./home-content";

// Export metadata for SEO - this only works in Server Components
export const metadata: Metadata = homepageMetadata;

export default function Home() {
  return <HomeContent />;
}
