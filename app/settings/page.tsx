import { Suspense } from "react";
import { Metadata } from "next";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SettingsContent } from "./settings-content";
import { LoadingPage } from "@/components/shared/loading";

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Manage your ResumeZeus account, preferences, data exports, and security settings.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SettingsPage() {
  return (
    <Suspense fallback={<LoadingPage text="Loading settings..." />}>
      <AuthGuard featureName="settings">
        <SettingsContent />
      </AuthGuard>
    </Suspense>
  );
}
