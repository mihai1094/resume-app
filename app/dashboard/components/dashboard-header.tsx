"use client";

import { User } from "@/hooks/use-user";
import { FileText, Sparkles } from "lucide-react";
import { CreditsDisplay } from "@/components/premium/credits-display";
import { cn } from "@/lib/utils";

type DashboardTab = "resumes" | "cover-letters";

interface DashboardHeaderProps {
    user: User | null;
    resumeCount: number;
    coverLetterCount: number;
    resumeLimit?: number;
    coverLetterLimit?: number;
    activeTab?: DashboardTab;
    onSelectResumes?: () => void;
    onSelectCoverLetters?: () => void;
}

export function DashboardHeader({
    user,
    resumeCount,
    coverLetterCount,
    resumeLimit,
    coverLetterLimit,
    activeTab,
    onSelectResumes,
    onSelectCoverLetters,
}: DashboardHeaderProps) {
    const firstName = user?.name?.split(" ")[0] || "there";
    const isNewUser = resumeCount === 0 && coverLetterCount === 0;

    return (
        <div className="relative space-y-6 mb-8 mt-4">
            {/* Mobile Stats Pills */}
            {!isNewUser && (
                <div className="flex gap-2 md:hidden overflow-x-auto pb-2 scrollbar-hide touch-pan-x overscroll-x-contain">
                    <button
                        type="button"
                        onClick={onSelectResumes}
                        className={cn(
                            "flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm shrink-0 border backdrop-blur-sm transition-colors min-h-[44px]",
                            activeTab === "resumes"
                                ? "bg-primary/15 border-primary/30"
                                : "bg-primary/10 border-primary/20 hover:bg-primary/15"
                        )}
                    >
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-primary">{resumeCount}</span>
                        <span className="text-primary/80">resumes</span>
                    </button>
                    <button
                        type="button"
                        onClick={onSelectCoverLetters}
                        className={cn(
                            "flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm shrink-0 border backdrop-blur-sm transition-colors min-h-[44px]",
                            activeTab === "cover-letters"
                                ? "bg-blue-500/15 border-blue-500/30"
                                : "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15"
                        )}
                    >
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{coverLetterCount}</span>
                        <span className="text-blue-600/80 dark:text-blue-400/80">letters</span>
                    </button>
                    <CreditsDisplay variant="pill" />
                </div>
            )}

            {/* Desktop Stats Cards */}
            <div className="hidden md:grid grid-cols-[1fr_1fr_1.4fr] gap-5">
                <button
                    type="button"
                    onClick={onSelectResumes}
                    className={cn(
                        "relative overflow-hidden bg-card border rounded-2xl p-6 flex items-center gap-5 shadow-sm transition-all group text-left",
                        onSelectResumes && "cursor-pointer hover:shadow-md",
                        activeTab === "resumes" && "ring-1 ring-primary/30 border-primary/30"
                    )}
                >
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:scale-105 transition-transform duration-300">
                        <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
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
                </button>

                <button
                    type="button"
                    onClick={onSelectCoverLetters}
                    className={cn(
                        "relative overflow-hidden bg-card border rounded-2xl p-6 flex items-center gap-5 shadow-sm transition-all group text-left",
                        onSelectCoverLetters && "cursor-pointer hover:shadow-md",
                        activeTab === "cover-letters" && "ring-1 ring-blue-500/30 border-blue-500/30"
                    )}
                >
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                        <Sparkles className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
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
                </button>

                <div className="relative overflow-hidden group">
                    <CreditsDisplay variant="full" showUpgrade={true} />
                </div>
            </div>
        </div>
    );
}
