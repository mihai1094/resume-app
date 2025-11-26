"use client";

import Link from "next/link";
import { Construction, MessageCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex items-center justify-center px-4">
            <div className="max-w-2xl w-full text-center space-y-8">
                {/* Illustration */}
                <div className="relative">
                    <div className="w-32 h-32 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                        <Construction className="w-16 h-16 text-primary" />
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center animate-bounce">
                        <span className="text-primary font-bold">!</span>
                    </div>
                </div>

                {/* Message */}
                <div className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                        Under Maintenance
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-md mx-auto">
                        We&apos;re currently performing scheduled maintenance to improve your
                        experience. We&apos;ll be back shortly!
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button onClick={() => window.location.reload()} size="lg" className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Check Status
                    </Button>
                    <Button asChild variant="outline" size="lg" className="gap-2">
                        <Link href="/contact">
                            <MessageCircle className="w-4 h-4" />
                            Contact Support
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
