import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/shared/app-header";
import type { User } from "@/hooks/use-user";

interface MyResumesHeaderProps {
    user: User | null;
    hasEligibleResume: boolean;
    onOptimizeClick: () => void;
    onLogout: () => void | Promise<void>;
}

export function MyResumesHeader({
    user,
    hasEligibleResume,
    onOptimizeClick,
    onLogout,
}: MyResumesHeaderProps) {
    return (
        <AppHeader title="My Resumes" showBack={false} user={user} onLogout={onLogout}>
            <div className="flex items-center gap-2">
                <Link href="/editor/new" className="hidden sm:inline-flex">
                    <Button size="sm" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Create Resume
                    </Button>
                </Link>
                <div className="hidden sm:flex flex-col items-end gap-1">
                    <Button
                        size="sm"
                        variant="secondary"
                        className="gap-2"
                        disabled={!hasEligibleResume}
                        onClick={onOptimizeClick}
                    >
                        <Sparkles className="w-4 h-4" />
                        Optimize for Job
                        <Badge variant="outline" className="ml-1 text-xs">
                            AI
                        </Badge>
                    </Button>
                    {!hasEligibleResume && (
                        <span className="text-[11px] text-muted-foreground">
                            Add personal info + experience to unlock
                        </span>
                    )}
                </div>

                {/* Mobile: Create Button */}
                <div className="sm:hidden flex items-center gap-2">
                    <Button size="sm" asChild>
                        <Link href="/editor/new">
                            <Plus className="w-4 h-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </AppHeader>
    );
}
