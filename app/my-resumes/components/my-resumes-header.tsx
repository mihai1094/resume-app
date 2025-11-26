import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Plus, Sparkles, Menu } from "lucide-react";
import { getUserInitials } from "../hooks/use-resume-utils";

interface User {
    name?: string | null;
    email?: string | null;
    photoURL?: string | null;
}

interface MyResumesHeaderProps {
    user: User | null;
    hasEligibleResume: boolean;
    onOptimizeClick: () => void;
}

export function MyResumesHeader({
    user,
    hasEligibleResume,
    onOptimizeClick,
}: MyResumesHeaderProps) {
    return (
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="container mx-auto px-4 py-2.5 sm:py-4">
                <div className="flex items-center justify-between gap-2">
                    {/* Left: Back Arrow (Mobile) / Icon & Title */}
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                        {/* Mobile: Back Arrow */}
                        <Link href="/" className="sm:hidden">
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        {/* Desktop: User Avatar */}
                        <Avatar className="h-10 w-10 flex-shrink-0 hidden sm:flex">
                            <AvatarImage
                                src={user?.photoURL || undefined}
                                alt={user?.name || "User"}
                                referrerPolicy="no-referrer"
                            />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                {getUserInitials(user)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                            <h1 className="text-base sm:text-2xl font-semibold truncate">
                                My Resumes
                            </h1>
                            {user && (
                                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                                    {user.name} • {user.email}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Link href="/" className="hidden sm:inline-flex">
                            <Button variant="ghost" size="icon" aria-label="Back to home">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <Link href="/create" className="hidden sm:inline-flex">
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

                        {/* Mobile: Hamburger menu */}
                        <div className="sm:hidden flex items-center gap-2">
                            <Button size="sm" asChild>
                                <Link href="/create">
                                    <Plus className="w-4 h-4" />
                                </Link>
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                                        <Menu className="w-5 h-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {user?.name || "User"}
                                            </p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user?.email || "user@example.com"}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/create">
                                            <Plus className="mr-2 h-4 w-4" />
                                            <span>Create New Resume</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        disabled={!hasEligibleResume}
                                        onSelect={(event) => {
                                            if (!hasEligibleResume) {
                                                event.preventDefault();
                                                return;
                                            }
                                            onOptimizeClick();
                                        }}
                                    >
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        <span>Optimize Resume</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/">
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            <span>Back to Home</span>
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
