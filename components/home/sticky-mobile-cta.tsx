"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface StickyMobileCTAProps {
    onCreate: () => void;
}

export function StickyMobileCTA({ onCreate }: StickyMobileCTAProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show CTA after scrolling 300px
            if (window.scrollY > 300 && !isDismissed) {
                setIsVisible(true);
            } else if (window.scrollY <= 300) {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isDismissed]);

    if (isDismissed) return null;

    return (
        <div
            className={cn(
                "fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-transform duration-300",
                isVisible ? "translate-y-0" : "translate-y-full"
            )}
        >
            <div className="bg-background/95 backdrop-blur-lg border-t border-border shadow-lg">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center gap-3">
                        <Button
                            size="lg"
                            className="flex-1 h-12 text-base shadow-lg shadow-primary/25 group"
                            onClick={onCreate}
                            type="button"
                        >
                            Create Your Resume
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsDismissed(true)}
                            className="h-12 w-12 flex-shrink-0"
                        >
                            <X className="w-5 h-5" />
                            <span className="sr-only">Dismiss</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
