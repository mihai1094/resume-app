import { Metadata } from "next";
import { onboardingMetadata } from "@/lib/seo/metadata";
import { OnboardingContent } from "./onboarding-content";

// Export metadata for SEO - this only works in Server Components
export const metadata: Metadata = onboardingMetadata;

export default function OnboardingPage() {
  return <OnboardingContent />;
}
