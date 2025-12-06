"use client";

import { Building2, Command, Cpu, Globe, Zap } from "lucide-react";

export function SocialProof() {
    return (
        <section className="py-12 border-b bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Trusted by professionals from leading companies
                    </p>
                </div>

                <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-6 h-6" />
                        <span className="font-bold text-lg">TechCorp</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Command className="w-6 h-6" />
                        <span className="font-bold text-lg">Acme Inc.</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Globe className="w-6 h-6" />
                        <span className="font-bold text-lg">GlobalTech</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap className="w-6 h-6" />
                        <span className="font-bold text-lg">FastStart</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Cpu className="w-6 h-6" />
                        <span className="font-bold text-lg">AI Systems</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
