import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Plus, Sparkles } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { AppHeader } from "@/components/shared/app-header";
import type { User } from "@/hooks/use-user";

interface MyResumesHeaderProps {
    user: User | null;
    activeTab: "resumes" | "cover-letters";
    showOptimize?: boolean;
    showContinueDraft?: boolean;
    hasEligibleResume: boolean;
    hasAiAccess: boolean;
    createLabel?: string;
    onOptimizeClick: () => void;
    onCreateResume: () => void;
    onCreateCoverLetter: () => void;
    onContinueDraft?: () => void;
    onLogout: () => void | Promise<void>;
}

export function MyResumesHeader({
    user,
    activeTab,
    showOptimize = true,
    showContinueDraft = false,
    hasEligibleResume,
    hasAiAccess,
    createLabel = "Create Resume",
    onOptimizeClick,
    onCreateResume,
    onCreateCoverLetter,
    onContinueDraft,
    onLogout,
}: MyResumesHeaderProps) {
    const optimizeLocked = !hasAiAccess;
    const isDisabled = hasAiAccess ? !hasEligibleResume : false;
    const isResumesTab = activeTab === "resumes";
    const logoTitle = (
        <div className="flex items-center gap-2">
            <Logo size={180} />
        </div>
    );

    return (
        <AppHeader title={logoTitle} showBack={false} user={user} onLogout={onLogout}>
            <div className="flex items-center gap-2">
                {/* Desktop actions */}
                {isResumesTab ? (
                    <>
                        {showContinueDraft && onContinueDraft && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-2 hidden sm:inline-flex"
                                onClick={onContinueDraft}
                            >
                                Continue Draft
                            </Button>
                        )}
                        <Button size="sm" className="gap-2 hidden sm:inline-flex" onClick={onCreateResume}>
                            <Plus className="w-4 h-4" />
                            {createLabel}
                        </Button>
                        {showOptimize && (
                            <div className="hidden sm:flex flex-col items-end gap-1">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="gap-2"
                                    disabled={isDisabled}
                                    onClick={onOptimizeClick}
                                >
                                    {optimizeLocked ? (
                                        <>
                                            <Lock className="w-4 h-4" />
                                            Unlock AI Optimize
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            Optimize for Job
                                            <Badge variant="outline" className="ml-1 text-xs">
                                                AI
                                            </Badge>
                                        </>
                                    )}
                                </Button>
                                {!hasEligibleResume && (
                                    <span className="text-[11px] text-muted-foreground">
                                        Add personal info + experience to unlock
                                    </span>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <Button size="sm" className="gap-2 hidden sm:inline-flex" onClick={onCreateCoverLetter}>
                        <Plus className="w-4 h-4" />
                        New Cover Letter
                    </Button>
                )}

                {/* Mobile actions — optimize only, create moved to in-grid card */}
                {isResumesTab && showOptimize && (
                    <div className="sm:hidden">
                        <Button
                            variant="secondary"
                            className="h-11 w-11 p-0"
                            disabled={isDisabled}
                            onClick={onOptimizeClick}
                            aria-label={optimizeLocked ? "Unlock AI Optimize" : "Optimize for job"}
                        >
                            {optimizeLocked ? (
                                <Lock className="w-4 h-4" />
                            ) : (
                                <Sparkles className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </AppHeader>
    );
}
