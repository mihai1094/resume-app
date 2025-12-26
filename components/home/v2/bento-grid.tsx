"use client";

import { cn } from "@/lib/utils";
import {
    Wand2,
    FileCheck,
    Layout,
    Target,
    Zap,
    MousePointer2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function BentoGrid() {
    return (
        <section className="container mx-auto px-6 py-24">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                <Badge variant="secondary" className="px-4 py-1.5 text-sm rounded-full bg-primary/10 text-primary border-0">
                    Super Powers ⚡️
                </Badge>
                <h2 className="text-4xl md:text-5xl font-serif font-medium tracking-tight">
                    Everything you need to <br />
                    <span className="italic relative inline-block">
                        stand out
                        <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                        </svg>
                    </span>
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(0,auto)]">

                {/* Large Item: AI Writer */}
                <div className="md:col-span-2 relative group overflow-hidden rounded-3xl bg-secondary/50 border border-border/50 hover:border-primary/50 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="p-8 h-full flex flex-col justify-between relative z-10">
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Wand2 className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">AI Content Writer</h3>
                            <p className="text-muted-foreground max-w-sm">
                                Writer's block? Gone. Generate professional summaries and bullet points instantly with our fine-tuned AI.
                            </p>
                        </div>

                        {/* Interactive Preview */}
                        <div className="bg-background rounded-xl p-4 text-sm font-mono shadow-sm border border-border/50 translate-y-4 group-hover:translate-y-0 opacity-80 group-hover:opacity-100 transition-all">
                            <span className="text-primary">AI:</span> "Experienced Project Manager with a proven track record of..."
                            <span className="animate-pulse">|</span>
                        </div>
                    </div>
                </div>

                {/* Tall Item: ATS Check */}
                <div className="md:row-span-2 relative group overflow-hidden rounded-3xl bg-card border border-border/50 hover:shadow-xl transition-all duration-300">
                    <div className="p-8 h-full flex flex-col relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4">
                            <FileCheck className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">ATS Guaranteed</h3>
                        <p className="text-muted-foreground mb-8">
                            Every template is tested against real Applicant Tracking Systems to ensure you never get filtered out by a bot.
                        </p>

                        {/* Animation Visual */}
                        <div className="flex-1 rounded-xl bg-muted/50 p-4 relative overflow-hidden flex items-center justify-center min-h-[160px]">
                            <div className="relative z-10 bg-background shadow-lg rounded-lg p-3 w-3/4 animate-float">
                                <div className="h-2 w-12 bg-green-500/20 rounded mb-2" />
                                <div className="space-y-1">
                                    <div className="h-1.5 bg-muted rounded w-full" />
                                    <div className="h-1.5 bg-muted rounded w-5/6" />
                                    <div className="h-1.5 bg-muted rounded w-4/6" />
                                </div>
                                <div className="absolute -right-2 -top-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
                                    <CheckCircle2 className="w-3 h-3" />
                                </div>
                            </div>

                            {/* Scanning effect */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.5)] animate-scan"
                                style={{ animation: 'scan 3s ease-in-out infinite' }} />
                        </div>
                    </div>
                </div>

                {/* Small Item: Live Preview */}
                <div className="relative group overflow-hidden rounded-3xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all">
                    <div className="p-8">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
                            <Layout className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Real-time Preview</h3>
                        <p className="text-sm text-muted-foreground">
                            See changes instantly as you type. No more switching tabs.
                        </p>
                    </div>
                </div>

                {/* Small Item: Job Targeting */}
                <div className="relative group overflow-hidden rounded-3xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all">
                    <div className="p-8">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4">
                            <Target className="w-6 h-6 text-orange-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Job Targeting</h3>
                        <p className="text-sm text-muted-foreground">
                            Paste a job description and we'll tell you what skills to add.
                        </p>
                    </div>
                </div>

                {/* CLICK & EDIT (Already existing) */}
                <div className="md:col-span-2 relative group overflow-hidden rounded-3xl bg-card border border-border/50 hover:shadow-lg transition-all">
                    <div className="p-8 flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1 space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                                <MousePointer2 className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-2xl font-bold">Drag, Drop, Done.</h3>
                            <p className="text-muted-foreground">
                                Reorder sections easily, toggle visibility, and customize layouts with a simple click.
                            </p>
                        </div>
                        <div className="flex-1 w-full bg-muted/30 rounded-xl p-4 h-48 flex items-center justify-center relative group-hover:bg-muted/50 transition-colors">
                            <div className="cursor-move bg-background shadow-sm border px-6 py-3 rounded-lg flex items-center gap-3 select-none active:scale-95 transition-transform">
                                <div className="grid gap-1">
                                    <div className="w-1 h-1 rounded-full bg-foreground/30" />
                                    <div className="w-1 h-1 rounded-full bg-foreground/30" />
                                    <div className="w-1 h-1 rounded-full bg-foreground/30" />
                                </div>
                                <span>Experience</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* NEW ITEM: PDF Export */}
                <div className="relative group overflow-hidden rounded-3xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all">
                    <div className="p-8">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-red-600"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Instant PDF</h3>
                        <p className="text-sm text-muted-foreground">
                            Download clean, watermark-free PDFs ready for application.
                        </p>
                    </div>
                </div>

            </div>

            <style jsx>{`
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
        </section>
    );
}

// Helper for icons
function CheckCircle2({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}
