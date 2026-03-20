"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/config/app";
import { Logo } from "@/components/shared/logo";
import { useUser } from "@/hooks/use-user";

interface HeaderProps {
  showActions?: boolean;
}

export function Header({ showActions = true }: HeaderProps) {
  const { user, isLoading } = useUser();
  const accountHref = user ? "/dashboard" : "/register";
  const accountLabel = user ? "Dashboard" : "Create free account";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href={appConfig.urls.homepage}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Logo size={180} />
          </Link>

          {/* Actions */}
          {showActions && (
            <nav className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/blog">Blog</Link>
              </Button>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/about">About</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href={appConfig.urls.preview}>Preview</Link>
              </Button>
              {isLoading ? (
                <div className="h-9 w-36" aria-hidden="true" />
              ) : (
                <Button asChild>
                  <Link href={accountHref}>{accountLabel}</Link>
                </Button>
              )}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
