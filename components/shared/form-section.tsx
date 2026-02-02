"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FormSectionProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    children: React.ReactNode;
    className?: string;
    badge?: React.ReactNode;
}

export function FormSection({
    title,
    description,
    icon: Icon,
    children,
    className,
    badge,
}: FormSectionProps) {
    return (
        <section className={cn("space-y-6", className)}>
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        {Icon && <Icon className="w-5 h-5 text-primary" />}
                        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                        {badge}
                    </div>
                    {description && (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    )}
                </div>
            </div>
            <div className="grid gap-6">{children}</div>
        </section>
    );
}
