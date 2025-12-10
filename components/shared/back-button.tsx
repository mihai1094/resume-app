"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getBackDestination } from "@/hooks/use-navigation-guard";

interface BackButtonProps {
    /**
     * Explicit destination. If not provided, uses smart back navigation.
     */
    href?: string;
    /**
     * Fallback destination if no browser history exists.
     * Only used when href is not provided.
     */
    fallback?: string;
    label?: string;
    className?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    /**
     * Custom click handler. If provided, overrides default navigation.
     */
    onClick?: () => void;
    /**
     * Use browser history (router.back) when possible.
     * Default: true
     */
    useHistory?: boolean;
}

/**
 * Smart back button that:
 * 1. Uses browser history when available (for natural back behavior)
 * 2. Falls back to a sensible destination based on current page
 * 3. Can be overridden with explicit href or onClick
 */
export function BackButton({
    href,
    fallback,
    label = "Back",
    className,
    variant = "ghost",
    size = "sm",
    onClick,
    useHistory = true,
}: BackButtonProps) {
    const router = useRouter();
    const pathname = usePathname();
    const hasHistoryRef = useRef(false);

    // Check if user navigated to this page (has history)
    useEffect(() => {
        if (typeof window !== "undefined") {
            const referrer = document.referrer;
            // User has history if they came from within the same origin
            hasHistoryRef.current = Boolean(
                referrer &&
                referrer.includes(window.location.origin) &&
                window.history.length > 1
            );
        }
    }, []);

    const handleBack = () => {
        if (onClick) {
            onClick();
            return;
        }

        // If explicit href is provided, navigate there
        if (href) {
            router.push(href);
            return;
        }

        // Smart back: use history if available, otherwise use fallback
        if (useHistory && hasHistoryRef.current) {
            router.back();
        } else {
            // Use provided fallback or determine based on current path
            const destination = fallback || getBackDestination(pathname);
            router.push(destination);
        }
    };

    const content = (
        <>
            <ArrowLeft className={cn("w-4 h-4", label ? "mr-2" : "")} />
            {label && <span>{label}</span>}
        </>
    );

    // If using explicit href without history preference, render as Link
    if (href && !useHistory && !onClick) {
        return (
            <Button variant={variant} size={size} className={className} asChild>
                <Link href={href}>
                    {content}
                </Link>
            </Button>
        );
    }

    // Otherwise use button with smart navigation
    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            onClick={handleBack}
        >
            {content}
        </Button>
    );
}
