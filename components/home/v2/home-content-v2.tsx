"use client";

import { HeroSection } from "./hero-section";
import { BentoGrid } from "./bento-grid";
import { InfiniteMarquee } from "./infinite-marquee";
import { InteractivePricing } from "./interactive-pricing";
import { ThemeSwitcher } from "./theme-switcher";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export function HomeContentV2() {
    return (
        <div className="min-h-screen bg-background selection:bg-primary/20">
            <ThemeSwitcher />
            <SiteHeader />

            <main className="overflow-x-hidden">
                <HeroSection />
                <InfiniteMarquee />
                <BentoGrid />
                <InteractivePricing />


            </main>

            <SiteFooter />
        </div>
    );
}
