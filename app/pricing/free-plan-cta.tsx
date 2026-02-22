"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { Check, ArrowRight, Loader2 } from "lucide-react";

export function FreePlanCTA() {
    const { user, isLoading } = useUser();

    if (isLoading) {
        return (
            <Button variant="outline" size="lg" className="w-full mt-6" disabled>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
            </Button>
        );
    }

    // Already on free (or premium — both mean "already have an account")
    if (user) {
        if (user.plan === "free") {
            return (
                <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
                        <Check className="w-4 h-4" />
                        You&apos;re already on the Free plan
                    </div>
                    <Button variant="outline" size="lg" className="w-full" asChild>
                        <Link href="/dashboard">
                            Go to Dashboard
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </Button>
                </div>
            );
        }

        // Premium user viewing the free plan
        return (
            <div className="mt-6 space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground font-medium">
                    <Check className="w-4 h-4 text-green-500" />
                    You&apos;re on Premium — free features included
                </div>
                <Button variant="outline" size="lg" className="w-full" asChild>
                    <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
            </div>
        );
    }

    // Guest — original CTA
    return (
        <>
            <Button variant="outline" size="lg" className="w-full mt-6" asChild>
                <Link href="/register">Create Free Account</Link>
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3">
                No credit card required for the free account
            </p>
        </>
    );
}
