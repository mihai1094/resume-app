import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Plus, Sparkles } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { AppHeader } from "@/components/shared/app-header";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
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
    // Always disable when there's no eligible resume — no more click-then-toast dead-ends.
    // The lock state still allows clicks when there IS a resume, to surface the upsell dialog.
    const isDisabled = !hasEligibleResume;
    const disabledReason = !hasEligibleResume
        ? "Add personal info and experience to unlock"
        : null;
    const isResumesTab = activeTab === "resumes";
    const logoTitle = (
        <div className="flex items-center gap-2">
            <Logo size={80} />
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
                                {disabledReason ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span tabIndex={0}>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="gap-2"
                                                    disabled
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
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom">{disabledReason}</TooltipContent>
                                    </Tooltip>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="gap-2"
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
                                )}
                            </div>
                        )}
                    </>
                ) : (
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
                        <Button size="sm" className="gap-2 hidden sm:inline-flex" onClick={onCreateCoverLetter}>
                            <Plus className="w-4 h-4" />
                            New Cover Letter
                        </Button>
                    </>
                )}

                {/* Mobile actions — optimize only, create moved to in-grid card */}
                {isResumesTab && showOptimize && (
                    <div className="sm:hidden">
                        <Button
                            variant="secondary"
                            className="h-11 w-11 p-0"
                            disabled={isDisabled}
                            onClick={isDisabled ? undefined : onOptimizeClick}
                            aria-label={
                                disabledReason
                                    ? disabledReason
                                    : optimizeLocked
                                        ? "Unlock AI Optimize"
                                        : "Optimize for job"
                            }
                            title={disabledReason ?? undefined}
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
