"use client";

import { User } from "@/hooks/use-user";
import { FileText, Sparkles, Clock } from "lucide-react";
import { CreditsDisplay } from "@/components/premium/credits-display";

interface DashboardHeaderProps {
    user: User | null;
    resumeCount: number;
    coverLetterCount: number;
    resumeLimit?: number;
    coverLetterLimit?: number;
}

export function DashboardHeader({
    user,
    resumeCount,
    coverLetterCount,
    resumeLimit,
    coverLetterLimit,
}: DashboardHeaderProps) {
    const firstName = user?.name?.split(" ")[0] || "there";
    const isNewUser = resumeCount === 0 && coverLetterCount === 0;

    return (
        <div className="space-y-6 mb-8">
            {/* Mobile Stats Pills */}
            {!isNewUser && (
                <div className="flex gap-2 md:hidden">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full text-sm">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="font-semibold">{resumeCount}</span>
                        <span className="text-muted-foreground">resumes</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 rounded-full text-sm">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold">{coverLetterCount}</span>
                        <span className="text-muted-foreground">letters</span>
                    </div>
                    <CreditsDisplay variant="pill" />
                </div>
            )}

            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    {isNewUser ? `Hello, ${firstName}! 👋` : `Welcome back, ${firstName}! 👋`}
                </h1>
                <p className="text-muted-foreground text-lg">
                    {isNewUser
                        ? "Let's get started! Create your first resume to begin your journey."
                        : "Ready to land your next dream job? Here is a quick overview of your resumes and cover letters."}
                </p>
            </div>

            {/* Desktop Stats Cards */}
            <div className="hidden md:grid grid-cols-3 gap-4">
                <div className="bg-card border rounded-xl p-4 flex items-center gap-4 shadow-sm">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Total Resumes
                        </p>
                        <p className="text-2xl font-bold">
                            {resumeCount}
                            {resumeLimit ? (
                                <span className="text-sm text-muted-foreground ml-2">
                                    / {resumeLimit}
                                </span>
                            ) : null}
                        </p>
                    </div>
                </div>

                <div className="bg-card border rounded-xl p-4 flex items-center gap-4 shadow-sm">
                    <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Cover Letters
                        </p>
                        <p className="text-2xl font-bold">
                            {coverLetterCount}
                            {coverLetterLimit ? (
                                <span className="text-sm text-muted-foreground ml-2">
                                    / {coverLetterLimit}
                                </span>
                            ) : null}
                        </p>
                    </div>
                </div>

                <CreditsDisplay variant="full" showUpgrade={true} />
            </div>
        </div>
    );
}
