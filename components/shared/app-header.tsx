"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { UserMenu } from "./user-menu";
import type { User } from "@/hooks/use-user";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  backUrl?: string;
  children?: React.ReactNode;
  className?: string;
  user: User | null;
  onLogout: () => void | Promise<void>;
}

export function AppHeader({
  title,
  showBack = false,
  backUrl = "/",
  children,
  className,
  user,
  onLogout,
}: AppHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b",
        className
      )}
    >
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
            <UserMenu user={user} onLogout={onLogout} />
          </div>
        </div>
      </div>
    </header>
  );
}
