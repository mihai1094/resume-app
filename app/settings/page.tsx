import { Suspense } from "react";
import { Metadata } from "next";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SettingsContent } from "./settings-content";

export const metadata: Metadata = {
  title: "Settings - ResumeForge",
  description: "Manage your account settings, profile, and preferences.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SettingsPage() {
  return (
    <Suspense>
      <AuthGuard featureName="settings">
        <SettingsContent />
      </AuthGuard>
    </Suspense>
  );
}
