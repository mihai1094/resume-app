"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, CheckCircle2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeroSection() {
    const containerRef = useRef<HTMLDivElement>(null);

    // Simplified parallax effect - CSS only for better performance
    // We removed the JS-based mouse tracking which can cause jitter

    return (
        <section
            ref={containerRef}
            className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20"
        >
            {/* Dynamic Gradient Background */}
            <div className="absolute inset-0 z-0 opacity-30 dark:opacity-20 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/40 rounded-full blur-3xl animate-pulse-glow" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400/40 rounded-full blur-3xl animate-pulse-glow" style={{ animationDuration: '5s', animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-300/30 rounded-full blur-[100px] animate-pulse" />
            </div>

            <div className="container relative z-10 px-6 mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                    {/* Left Content */}
                    <div className="text-center lg:text-left space-y-8 max-w-2xl mx-auto lg:mx-0">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm animate-fade-in hover:bg-primary/20 transition-colors cursor-default">
                            <Sparkles className="w-4 h-4 fill-primary" />
                            <span>The smartest way to get hired</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-serif font-medium tracking-tight leading-[1.1] text-foreground animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            Your Resume. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-600 animate-gradient-x">
                                Supercharged.
                            </span>
                        </h1>

                        <p className="text-xl text-muted-foreground leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            Turn your experience into a story recruiters can't ignore.
                            Beautiful templates, AI-powered writing, and instant polish —
                            <span className="text-foreground font-semibold"> zero design skills needed.</span>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                            <Button
                                size="lg"
                                className="h-14 px-8 text-lg"
                                asChild
                            >
                                <Link href="/templates">
                                    Build My Resume
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Link>
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                className="h-14 px-8 text-lg hover:bg-muted/50"
                                asChild
                            >
                                <a href="#how-it-works">
                                    How It Works
                                </a>
                            </Button>
                        </div>

                        <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-sm text-muted-foreground animate-slide-up" style={{ animationDelay: '0.4s' }}>
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted overflow-hidden">
                                        <img
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 20}`}
                                            alt="User"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                                <div className="w-10 h-10 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                    1k+
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-1 text-yellow-500">
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                </div>
                                <span className="text-xs">Loved by job seekers</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Visuals - Smoother CSS Animation */}
                    <div className="relative hidden lg:block h-[600px] w-full">
                        {/* Main Resume Card - Using CSS animation float instead of JS */}
                        <div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[480px] bg-background rounded-2xl shadow-2xl border border-border/50 animate-float z-20"
                            style={{
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            }}
                        >
                            {/* Fake Resume Content */}
                            <div className="p-6 space-y-4 opacity-50 blur-[0.5px]">
                                <div className="w-20 h-20 rounded-full bg-muted mx-auto" />
                                <div className="h-4 bg-foreground/10 rounded w-3/4 mx-auto" />
                                <div className="h-3 bg-muted rounded w-1/2 mx-auto" />
                                <div className="space-y-2 pt-8">
                                    <div className="h-2 bg-muted rounded w-full" />
                                    <div className="h-2 bg-muted rounded w-full" />
                                    <div className="h-2 bg-muted rounded w-5/6" />
                                </div>
                            </div>

                            {/* Success Badge Overlay */}
                            <div className="absolute -right-12 top-20 bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-xl border border-green-100 dark:border-green-900/30 flex items-center gap-3 animate-bounce-in" style={{ animationDelay: '0.8s' }}>
                                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold">Interview!</div>
                                    <div className="text-xs text-muted-foreground">Just now</div>
                                </div>
                            </div>

                            {/* Score Badge Overlay */}
                            <div className="absolute -left-8 bottom-32 bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-xl border border-primary/20 flex items-center gap-3 animate-bounce-in" style={{ animationDelay: '1s' }}>
                                <div className="radial-progress text-primary text-xs font-bold" style={{ "--value": "98", "--size": "2.5rem" } as any}>
                                    98
                                </div>
                                <div>
                                    <div className="text-sm font-bold">Excellent</div>
                                    <div className="text-xs text-muted-foreground">Resume Score</div>
                                </div>
                            </div>
                        </div>

                        {/* Background Decorative Blobs/Cards - CSS Float with delay */}
                        <div
                            className="absolute top-20 right-20 w-40 h-40 bg-purple-100 dark:bg-purple-900/20 rounded-3xl animate-float -z-10"
                            style={{ animationDelay: '1s', animationDuration: '4s' }}
                        />
                        <div
                            className="absolute bottom-40 left-20 w-32 h-32 bg-orange-100 dark:bg-orange-900/20 rounded-full animate-float -z-10"
                            style={{ animationDelay: '2s', animationDuration: '5s' }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
