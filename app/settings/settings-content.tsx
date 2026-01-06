"use client";

import { SettingsHeader } from "./components/settings-header";
import { ProfileForm } from "./components/profile-form";
import { AppearanceForm } from "./components/appearance-form";
import { DataExport } from "./components/data-export";
import { AccountDangerZone } from "./components/account-danger-zone";
import { DevPlanToggle } from "@/components/settings/dev-plan-toggle";

export function SettingsContent() {
  return (
    <div className="min-h-screen bg-background">
      <SettingsHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        <div className="space-y-6">
          <ProfileForm />
          <AppearanceForm />
          <DataExport />
          <DevPlanToggle />
          <AccountDangerZone />
        </div>
      </main>
    </div>
  );
}
