"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { appConfig } from "@/config/app";

interface HeaderProps {
  showActions?: boolean;
}

export function Header({ showActions = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href={appConfig.urls.homepage}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <FileText className="w-6 h-6" />
            <span className="text-xl font-semibold">{appConfig.name}</span>
          </Link>

          {/* Actions */}
          {showActions && (
            <nav className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link href="/blog">Blog</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href={appConfig.urls.preview}>Preview</Link>
              </Button>
              <Button asChild>
                <Link href={appConfig.urls.create}>Create Resume</Link>
              </Button>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
