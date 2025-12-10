"use client";

import Link from "next/link";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/shared/back-button";

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center px-4">
            <div className="max-w-2xl w-full text-center space-y-8">
                {/* Illustration */}
                <div className="relative">
                    <div className="w-32 h-32 mx-auto bg-muted/30 rounded-full flex items-center justify-center">
                        <WifiOff className="w-16 h-16 text-muted-foreground" />
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 border border-muted/40 rounded-full -z-10 animate-pulse" />
                </div>

                {/* Message */}
                <div className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                        You&apos;re Offline
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-md mx-auto">
                        It looks like you&apos;ve lost your internet connection. Please check your
                        network settings and try again.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button onClick={() => window.location.reload()} size="lg" className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </Button>
                    <BackButton href="/" label="Back to Home" variant="outline" size="lg" className="gap-2" useHistory={false} />
                </div>
            </div>
        </div>
    );
}
