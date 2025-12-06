"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BackButtonProps {
    href?: string;
    label?: string;
    className?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    onClick?: () => void;
}

export function BackButton({
    href,
    label = "Back",
    className,
    variant = "ghost",
    size = "sm",
    onClick
}: BackButtonProps) {
    const router = useRouter();

    const handleBack = () => {
        if (onClick) {
            onClick();
            return;
        }

        if (!href) {
            router.back();
        }
    };

    const content = (
        <>
            <ArrowLeft className={cn("w-4 h-4", label ? "mr-2" : "")} />
            {label && <span>{label}</span>}
        </>
    );

    if (href && !onClick) {
        return (
            <Button variant={variant} size={size} className={className} asChild>
                <Link href={href}>
                    {content}
                </Link>
            </Button>
        );
    }

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
