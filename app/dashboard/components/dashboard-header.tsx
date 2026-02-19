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
        <div className="relative space-y-8 mb-10 mt-4">
            {/* Background ambient glow effect */}
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

            {/* Mobile Stats Pills */}
            {!isNewUser && (
                <div className="flex gap-2 md:hidden overflow-x-auto pb-2 scrollbar-hide">
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 rounded-full text-sm shrink-0 border border-primary/20 backdrop-blur-sm">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-primary">{resumeCount}</span>
                        <span className="text-primary/80">resumes</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-4 py-2 bg-blue-500/10 rounded-full text-sm shrink-0 border border-blue-500/20 backdrop-blur-sm">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{coverLetterCount}</span>
                        <span className="text-blue-600/80 dark:text-blue-400/80">letters</span>
                    </div>
                    <CreditsDisplay variant="pill" />
                </div>
            )}

            <div className="space-y-3 relative z-10 pl-2">
                <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {isNewUser ? `Hello, ${firstName}! 👋` : `Welcome back, ${firstName}! 👋`}
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    {isNewUser
                        ? "Let's get started! Create your first resume to begin your journey."
                        : "Ready to land your next dream job? Here's an overview of your application materials."}
                </p>
            </div>

            {/* Desktop Stats Cards */}
            <div className="hidden md:grid grid-cols-3 gap-6 relative z-10">
                <div className="relative overflow-hidden bg-card border rounded-2xl p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:scale-105 transition-transform duration-500">
                        <FileText className="h-7 w-7 text-primary" />
                    </div>
                    <div className="z-10 relative">
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                            Total Resumes
                        </p>
                        <p className="text-3xl font-bold flex items-baseline gap-2">
                            {resumeCount}
                            {resumeLimit ? (
                                <span className="text-sm font-normal text-muted-foreground">
                                    / {resumeLimit}
                                </span>
                            ) : null}
                        </p>
                    </div>
                </div>

                <div className="relative overflow-hidden bg-card border rounded-2xl p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors duration-500" />
                    <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:scale-105 transition-transform duration-500">
                        <Sparkles className="h-7 w-7 text-blue-500" />
                    </div>
                    <div className="z-10 relative">
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                            Cover Letters
                        </p>
                        <p className="text-3xl font-bold flex items-baseline gap-2">
                            {coverLetterCount}
                            {coverLetterLimit ? (
                                <span className="text-sm font-normal text-muted-foreground">
                                    / {coverLetterLimit}
                                </span>
                            ) : null}
                        </p>
                    </div>
                </div>

                <div className="relative overflow-hidden group">
                    <CreditsDisplay variant="full" showUpgrade={true} />
                </div>
            </div>
        </div>
    );
}
