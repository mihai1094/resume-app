"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TypingAnimationProps {
    text: string;
    className?: string;
    speed?: number;
    showCursor?: boolean;
    loop?: boolean;
    delay?: number;
}

export function TypingAnimation({
    text,
    className,
    speed = 100,
    showCursor = true,
    loop = false,
    delay = 0,
}: TypingAnimationProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        if (delay > 0 && !hasStarted) {
            const delayTimeout = setTimeout(() => {
                setHasStarted(true);
            }, delay);
            return () => clearTimeout(delayTimeout);
        } else {
            setHasStarted(true);
        }
    }, [delay, hasStarted]);

    useEffect(() => {
        if (!hasStarted) return;

        if (!loop) {
            // Simple typing effect without loop
            if (currentIndex < text.length) {
                const timeout = setTimeout(() => {
                    setDisplayedText((prev) => prev + text[currentIndex]);
                    setCurrentIndex((prev) => prev + 1);
                }, speed);
                return () => clearTimeout(timeout);
            }
        } else {
            // Typing effect with loop (type and delete)
            const timeout = setTimeout(
                () => {
                    if (!isDeleting && currentIndex < text.length) {
                        setDisplayedText((prev) => prev + text[currentIndex]);
                        setCurrentIndex((prev) => prev + 1);
                    } else if (!isDeleting && currentIndex === text.length) {
                        // Pause before deleting
                        setTimeout(() => setIsDeleting(true), 2000);
                    } else if (isDeleting && currentIndex > 0) {
                        setDisplayedText((prev) => prev.slice(0, -1));
                        setCurrentIndex((prev) => prev - 1);
                    } else if (isDeleting && currentIndex === 0) {
                        setIsDeleting(false);
                    }
                },
                isDeleting ? speed / 2 : speed
            );
            return () => clearTimeout(timeout);
        }
    }, [currentIndex, isDeleting, text, speed, loop, hasStarted]);

    return (
        <span className={cn("inline-block", className)}>
            {displayedText}
            {showCursor && (
                <span className="animate-pulse ml-1 inline-block w-0.5 h-[1em] bg-current align-middle" />
            )}
        </span>
    );
}
