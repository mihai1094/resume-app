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
        <section className={cn(
            "space-y-6 bg-card/60 backdrop-blur-xl border border-border/40 shadow-sm rounded-[2rem] p-6 lg:p-8 transition-all hover:shadow-md",
            className
        )}>
            <div className="flex flex-col sm:flex-row sm:items-start lg:items-center justify-between gap-4 border-b border-border/30 pb-5">
                <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-sm">
                                <Icon className="w-5 h-5" />
                            </div>
                        )}
                        <h2 className="text-xl font-semibold tracking-tight text-foreground/90">{title}</h2>
                        {badge && <div className="ml-auto sm:ml-4">{badge}</div>}
                    </div>
                    {description && (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    )}
                </div>
            </div>
            <div className="grid gap-7 pt-2">{children}</div>
        </section>
    );
}
