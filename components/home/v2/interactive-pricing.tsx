"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function InteractivePricing() {
    const [isAnnual, setIsAnnual] = useState(true);

    return (
        <section className="container mx-auto px-6 py-24">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                <h2 className="text-4xl md:text-5xl font-serif font-medium tracking-tight">
                    Simple, transparent pricing
                </h2>
                <p className="text-muted-foreground text-lg">
                    Start for free, upgrade when you're ready to land that dream job.
                </p>

                <div className="flex items-center justify-center gap-4 pt-4">
                    <span className={cn("text-sm font-medium transition-colors", !isAnnual && "text-primary")}>Monthly</span>
                    <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
                    <span className={cn("text-sm font-medium transition-colors", isAnnual && "text-primary")}>
                        Annual <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700 hover:bg-green-100">-20%</Badge>
                    </span>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Free Plan */}
                <div className="relative rounded-3xl p-8 bg-card border border-border/50 hover:border-border transition-colors">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold">Free Forever</h3>
                        <div className="mt-4 flex items-baseline">
                            <span className="text-4xl font-bold tracking-tight">$0</span>
                            <span className="ml-1 text-muted-foreground">/month</span>
                        </div>
                        <p className="mt-4 text-sm text-muted-foreground">
                            Perfect for creating your first resume and cover letter.
                        </p>
                    </div>
                    <ul className="space-y-3 mb-8">
                        <li className="flex items-center text-sm gap-3">
                            <Check className="w-4 h-4 text-primary" /> 1 Resume
                        </li>
                        <li className="flex items-center text-sm gap-3">
                            <Check className="w-4 h-4 text-primary" /> Basic Templates
                        </li>
                        <li className="flex items-center text-sm gap-3">
                            <Check className="w-4 h-4 text-primary" /> PDF Export
                        </li>
                        <li className="flex items-center text-sm gap-3 text-muted-foreground">
                            <X className="w-4 h-4" /> AI Writer
                        </li>
                    </ul>
                    <Button variant="outline" className="w-full h-12">
                        Get Started
                    </Button>
                </div>

                {/* Pro Plan */}
                <div className="relative rounded-3xl p-8 bg-primary/5 border-2 border-primary ring-4 ring-primary/10 shadow-2xl scale-105 transform">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Badge className="bg-primary text-white hover:bg-primary px-4 py-1">Most Popular</Badge>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-primary">Pro</h3>
                        <div className="mt-4 flex items-baseline">
                            <span className="text-4xl font-bold tracking-tight">
                                {isAnnual ? "$12" : "$15"}
                            </span>
                            <span className="ml-1 text-muted-foreground">/month</span>
                        </div>
                        <p className="mt-4 text-sm text-muted-foreground">
                            Unlock AI powers and unlimited possibilities.
                        </p>
                    </div>
                    <ul className="space-y-3 mb-8">
                        <li className="flex items-center text-sm gap-3 font-medium">
                            <Check className="w-4 h-4 text-primary" /> Unlimited Resumes
                        </li>
                        <li className="flex items-center text-sm gap-3 font-medium">
                            <Check className="w-4 h-4 text-primary" /> All Premium Templates
                        </li>
                        <li className="flex items-center text-sm gap-3 font-medium">
                            <Check className="w-4 h-4 text-primary" /> Advanced AI Writer
                        </li>
                        <li className="flex items-center text-sm gap-3 font-medium">
                            <Check className="w-4 h-4 text-primary" /> Priority Support
                        </li>
                    </ul>
                    <Button className="w-full h-12">
                        Upgrade to Pro
                    </Button>
                </div>
            </div>
        </section>
    );
}
