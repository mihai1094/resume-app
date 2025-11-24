"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Flame, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useConfetti } from "@/hooks/use-confetti";
import { ModeToggle } from "@/components/mode-toggle";

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { fire: fireConfetti } = useConfetti();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
          <Flame className="w-6 h-6 text-primary" />
          <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            ResumeForge
          </span>
        </Link>

        {/* Right: Auth Buttons (Desktop) */}
        <div className="hidden lg:flex items-center gap-3">
          <ModeToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/my-resumes">My CVs</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button
            size="sm"
            asChild
            onClick={() => fireConfetti({ particleCount: 100, spread: 90 })}
          >
            <Link href="/onboarding">Get Started</Link>
          </Button>
        </div>

        {/* Mobile: Hamburger Menu */}
        <div className="lg:hidden flex items-center gap-2">
          <ModeToggle />
          <Button
            size="sm"
            asChild
            onClick={() => fireConfetti({ particleCount: 100, spread: 90 })}
          >
            <Link href="/onboarding">Get Started</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="h-9 w-9 p-0"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-6 space-y-4">
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/my-resumes">My CVs</Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
