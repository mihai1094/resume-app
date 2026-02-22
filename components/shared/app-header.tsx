"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";
import { BackButton } from "@/components/shared/back-button";
import type { User } from "@/hooks/use-user";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  title: React.ReactNode;
  showBack?: boolean;
  backUrl?: string;
  titleHref?: string | null;
  children?: React.ReactNode;
  className?: string;
  user: User | null;
  onLogout: () => void | Promise<void>;
}

export function AppHeader({
  title,
  showBack = false,
  backUrl = "/",
  titleHref,
  children,
  className,
  user,
  onLogout,
}: AppHeaderProps) {
  const homeHref = user ? "/dashboard" : "/";
  const resolvedTitleHref = titleHref === undefined ? homeHref : titleHref;

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
              <BackButton href={backUrl} size="icon" label="" variant="ghost" className="h-8 w-8" />
            )}
            {resolvedTitleHref ? (
              <Link href={resolvedTitleHref} className="hover:opacity-80 transition-opacity">
                {typeof title === "string" ? (
                  <h1 className="text-lg font-semibold truncate">{title}</h1>
                ) : (
                  <div className="truncate">{title}</div>
                )}
              </Link>
            ) : typeof title === "string" ? (
              <h1 className="text-lg font-semibold truncate">{title}</h1>
            ) : (
              <div className="truncate">{title}</div>
            )}
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
