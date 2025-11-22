"use client";

import { useEffect, useState } from "react";

export function ParallaxBackground() {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="absolute inset-0 -z-10 overflow-hidden">
            {/* Primary blob - moves slower */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-[100%] blur-3xl opacity-50 transition-transform duration-100"
                style={{
                    transform: `translate(-50%, ${scrollY * 0.3}px)`,
                }}
            />

            {/* Secondary blob - moves at medium speed */}
            <div
                className="absolute top-[20%] right-0 w-[800px] h-[600px] bg-accent/30 rounded-[100%] blur-3xl transition-transform duration-100"
                style={{
                    transform: `translate(0, ${scrollY * 0.5}px)`,
                }}
            />

            {/* Tertiary blob - moves faster */}
            <div
                className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/50 rounded-[100%] blur-3xl transition-transform duration-100"
                style={{
                    transform: `translate(0, ${-scrollY * 0.2}px)`,
                }}
            />
        </div>
    );
}
