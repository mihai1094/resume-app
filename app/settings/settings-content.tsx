"use client";

import { SettingsHeader } from "./components/settings-header";
import { ProfileForm } from "./components/profile-form";
import { AppearanceForm } from "./components/appearance-form";
import { AccountDangerZone } from "./components/account-danger-zone";

export function SettingsContent() {
    return (
        <div className="min-h-screen bg-background">
            <SettingsHeader />
            <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
                <div className="space-y-6">
                    <AppearanceForm />
                    <ProfileForm />
                    <AccountDangerZone />
                </div>
            </main>
        </div>
    );
}
