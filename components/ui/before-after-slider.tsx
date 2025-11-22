"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BeforeAfterSliderProps {
    beforeContent: React.ReactNode;
    afterContent: React.ReactNode;
    className?: string;
}

export function BeforeAfterSlider({
    beforeContent,
    afterContent,
    className,
}: BeforeAfterSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);

    const handleMove = (clientX: number, rect: DOMRect) => {
        const x = clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        setSliderPosition(Math.min(Math.max(percentage, 0), 100));
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        const rect = e.currentTarget.getBoundingClientRect();
        handleMove(e.clientX, rect);
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        const rect = e.currentTarget.getBoundingClientRect();
        handleMove(e.touches[0].clientX, rect);
    };

    return (
        <div
            className={cn("relative overflow-hidden rounded-lg select-none", className)}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onMouseUp={() => setIsDragging(false)}
            onTouchEnd={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
        >
            {/* After (Right side) */}
            <div className="w-full">{afterContent}</div>

            {/* Before (Left side - overlay) */}
            <div
                className="absolute top-0 left-0 h-full overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
            >
                {beforeContent}
            </div>

            {/* Slider */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize group"
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={() => setIsDragging(true)}
                onTouchStart={() => setIsDragging(true)}
            >
                {/* Slider handle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <div className="flex gap-0.5">
                        <div className="w-0.5 h-4 bg-gray-400 rounded-full" />
                        <div className="w-0.5 h-4 bg-gray-400 rounded-full" />
                    </div>
                </div>

                {/* Labels */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-4 text-xs font-medium whitespace-nowrap">
                    <span className="bg-black/70 text-white px-2 py-1 rounded">Before</span>
                    <span className="bg-primary/90 text-primary-foreground px-2 py-1 rounded">After</span>
                </div>
            </div>
        </div>
    );
}
