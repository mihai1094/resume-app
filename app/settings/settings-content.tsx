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
        <section className="space-y-3" aria-labelledby="account-section-heading">
          <div>
            <h2 id="account-section-heading" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Account
            </h2>
          </div>
          <ProfileForm />
        </section>

        <section className="space-y-3" aria-labelledby="preferences-section-heading">
          <div>
            <h2 id="preferences-section-heading" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Preferences
            </h2>
          </div>
          <AppearanceForm />
        </section>

        <section className="space-y-3" aria-labelledby="data-privacy-section-heading">
          <div>
            <h2 id="data-privacy-section-heading" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Data &amp; Privacy
            </h2>
          </div>
          <DataExport />
        </section>

        <DevPlanToggle />

        <section className="space-y-3" aria-labelledby="security-section-heading">
          <div>
            <h2 id="security-section-heading" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Security
            </h2>
          </div>
          <AccountDangerZone />
        </section>
      </main>
    </div>
  );
}
