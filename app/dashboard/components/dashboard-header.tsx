"use client";

import { User } from "@/hooks/use-user";
import { FileText, Sparkles, Clock } from "lucide-react";

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

    return (
        <div className="space-y-6 mb-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    Welcome back, {firstName}! 👋
                </h1>
                <p className="text-muted-foreground text-lg">
                    Ready to land your next dream job? Here's what's happening with your
                    applications.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <div className="bg-card border rounded-xl p-4 flex items-center gap-4 shadow-sm">
                    <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                            Time Saved
                        </p>
                        <p className="text-2xl font-bold">~2 hrs</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
