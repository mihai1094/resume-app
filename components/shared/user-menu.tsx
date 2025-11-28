"use client";

import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    FolderOpen,
    FileCheck,
    Settings,
    HelpCircle,
    LogOut,
    Upload,
    User as UserIcon,
} from "lucide-react";
import { User } from "@/hooks/use-user";

interface UserMenuProps {
    user: User | null;
    onLogout: () => void;
    onImport?: () => void;
    trigger?: React.ReactNode;
}

export function UserMenu({ user, onLogout, onImport, trigger }: UserMenuProps) {
    // Get user initials for avatar
    const getUserInitials = () => {
        if (!user?.name) return "U";
        const names = user.name.split(" ");
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return user.name[0].toUpperCase();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {trigger || (
                    <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full"
                        title={user?.name || "Account"}
                    >
                        <Avatar className="h-8 w-8">
                            <AvatarImage
                                src={user?.photoURL || undefined}
                                alt={user?.name || "User"}
                                referrerPolicy="no-referrer"
                            />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {getUserInitials()}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                )}
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
                    <Link href="/dashboard" className="cursor-pointer">
                        <FolderOpen className="mr-2 h-4 w-4" />
                        <span>My CVs</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/cover-letter" className="cursor-pointer">
                        <FileCheck className="mr-2 h-4 w-4" />
                        <span>Cover Letter</span>
                    </Link>
                </DropdownMenuItem>
                {onImport && (
                    <DropdownMenuItem onClick={onImport}>
                        <Upload className="mr-2 h-4 w-4" />
                        <span>Import Resume</span>
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => {
                        alert("Help & Documentation coming soon!");
                    }}
                >
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help & Support</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => {
                        if (
                            confirm(
                                "Are you sure you want to logout? This will clear your session."
                            )
                        ) {
                            onLogout();
                        }
                    }}
                    className="text-destructive focus:text-destructive"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
