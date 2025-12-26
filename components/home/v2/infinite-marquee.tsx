"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

const TEMPLATE_IMAGES = [
    "/templates/modern.png",
    "/templates/professional.png",
    "/templates/creative.png",
    "/templates/simple.png",
    // We'll use placeholders for now since we might not have these images
];

export function InfiniteMarquee() {
    return (
        <section className="py-20 overflow-hidden bg-muted/10 border-y border-border/40">
            <div className="container mx-auto px-6 mb-10 text-center">
                <p className="text-muted-foreground font-medium uppercase tracking-widest text-sm">
                    Join 50,000+ professionals hired at
                </p>
            </div>

            <div className="relative flex overflow-x-hidden group">
                <div className="animate-marquee whitespace-nowrap flex items-center gap-16 px-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <LogoPlaceholder key={i} index={i} />
                    ))}
                </div>

                <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex items-center gap-16 px-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <LogoPlaceholder key={`clone-${i}`} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function LogoPlaceholder({ index }: { index: number }) {
    const companies = ["Google", "Spotify", "Netflix", "Amazon", "Microsoft", "Airbnb"];
    return (
        <div className="text-3xl font-bold text-muted-foreground/30 hover:text-primary/50 transition-colors cursor-default select-none">
            {companies[index % companies.length]}
        </div>
    );
}
