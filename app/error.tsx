"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/shared/back-button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-destructive/5 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Error illustration */}
        <div className="relative">
          <div className="w-32 h-32 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-16 h-16 text-destructive animate-pulse" />
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 border border-destructive/20 rounded-full -z-10" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 border border-destructive/10 rounded-full -z-10" />
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
            Something Went Wrong
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            We encountered an unexpected error. Don&apos;t worry, your resume data
            is safely stored in your browser.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground font-mono bg-muted/50 px-3 py-1 rounded-full inline-block">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button onClick={reset} size="lg" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <BackButton href="/" label="Back to Home" variant="outline" size="lg" className="gap-2" />
        </div>

        {/* Help section */}
        <div className="pt-8 border-t border-border">
          <div className="bg-muted/30 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-foreground">
              If this keeps happening:
            </h2>
            <ul className="text-sm text-muted-foreground space-y-2 text-left max-w-sm mx-auto">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">1.</span>
                <span>Try refreshing the page or clearing your browser cache</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">2.</span>
                <span>Check if your browser is up to date</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">3.</span>
                <span>Try using a different browser</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact support */}
        <p className="text-sm text-muted-foreground">
          Need help?{" "}
          <Link
            href="/contact"
            className="text-primary hover:underline underline-offset-4 inline-flex items-center gap-1"
          >
            <MessageCircle className="w-3 h-3" />
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}












