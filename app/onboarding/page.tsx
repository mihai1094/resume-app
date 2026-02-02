import { Suspense } from "react";
import { Metadata } from "next";
import { onboardingMetadata } from "@/lib/seo/metadata";
import { OnboardingContent } from "./onboarding-content";
import { LoadingPage } from "@/components/shared/loading";

// Export metadata for SEO - this only works in Server Components
export const metadata: Metadata = onboardingMetadata;

export default function OnboardingPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <OnboardingContent />
    </Suspense>
  );
}
