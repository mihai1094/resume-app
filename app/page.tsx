import { Metadata } from "next";
import { homepageMetadata } from "@/lib/seo/metadata";
import { HomeContent } from "./home-content";
import { getFAQSchema } from "@/lib/seo/structured-data";
import { getHowToResumeSchema } from "@/lib/seo/structured-data-advanced";
import { JsonLd } from "@/components/seo/json-ld";

// Export metadata for SEO - this only works in Server Components
export const metadata: Metadata = homepageMetadata;

export default function Home() {
  const faqSchema = getFAQSchema();
  const howToSchema = getHowToResumeSchema();

  return (
    <>
      <JsonLd data={faqSchema} />
      <JsonLd data={howToSchema} />
      <HomeContent />
    </>
  );
}
