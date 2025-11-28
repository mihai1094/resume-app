"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { UserMenu } from "./user-menu";
import { useUser } from "@/hooks/use-user";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
    title: string;
    showBack?: boolean;
    backUrl?: string;
    children?: React.ReactNode;
    className?: string;
}

export function AppHeader({
    title,
    showBack = false,
    backUrl = "/",
    children,
    className,
}: AppHeaderProps) {
    const { user, logout } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    return (
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    {/* Left: Back & Title */}
                    <div className="flex items-center gap-3 min-w-0">
                        {showBack && (
                            <Link href={backUrl}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>
                            </Link>
                        )}
                        <Link href="/" className="hover:opacity-80 transition-opacity">
                            <h1 className="text-lg font-semibold truncate">{title}</h1>
                        </Link>
                    </div>

                    {/* Right: Actions & User Menu */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {children}
                        <UserMenu user={user} onLogout={handleLogout} />
                    </div>
                </div>
            </div>
        </header>
    );
}
