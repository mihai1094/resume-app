import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Plus, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/shared/app-header";
import type { User } from "@/hooks/use-user";

interface MyResumesHeaderProps {
    user: User | null;
    hasEligibleResume: boolean;
    hasAiAccess: boolean;
    onOptimizeClick: () => void;
    onCreateResume: () => void;
    onLogout: () => void | Promise<void>;
}

export function MyResumesHeader({
    user,
    hasEligibleResume,
    hasAiAccess,
    onOptimizeClick,
    onCreateResume,
    onLogout,
}: MyResumesHeaderProps) {
    const optimizeLocked = !hasAiAccess;
    const isDisabled = hasAiAccess ? !hasEligibleResume : false;

    return (
        <AppHeader title="My Resumes" showBack={false} user={user} onLogout={onLogout}>
            <div className="flex items-center gap-2">
                <Button size="sm" className="gap-2 hidden sm:inline-flex" onClick={onCreateResume}>
                    <Plus className="w-4 h-4" />
                    Create Resume
                </Button>
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

                {/* Mobile: Create Button & Optimize */}
                <div className="sm:hidden flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="secondary"
                        disabled={isDisabled}
                        onClick={onOptimizeClick}
                    >
                        {optimizeLocked ? (
                            <Lock className="w-4 h-4" />
                        ) : (
                            <Sparkles className="w-4 h-4" />
                        )}
                    </Button>
                    <Button size="sm" onClick={onCreateResume}>
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </AppHeader>
    );
}
