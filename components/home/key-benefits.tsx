"use client";

import { Card } from "@/components/ui/card";
import { ShieldCheck, Zap, Wallet, Eye } from "lucide-react";

const BENEFITS = [
    {
        icon: ShieldCheck,
        title: "Privacy First",
        description:
            "Your data stays with you. We store your resumes locally in your browser and securely in Firestore only when you choose to save.",
    },
    {
        icon: Zap,
        title: "ATS Optimized",
        description:
            "Our templates are designed to pass Applicant Tracking Systems, ensuring your resume gets seen by human recruiters.",
    },
    {
        icon: Wallet,
        title: "Completely Free",
        description:
            "No hidden paywalls for core features. Create, edit, and export your resume to PDF without entering credit card details.",
    },
    {
        icon: Eye,
        title: "Instant Preview",
        description:
            "See changes in real-time as you type. No more guessing how your resume will look after export.",
    },
];

export function KeyBenefits() {
    return (
        <div className="space-y-12">
            {/* Section Header */}
            <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-serif font-medium tracking-tight">
                    Why Choose ResumeForge?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    We focus on what matters most: helping you land your next job without
                    the hassle.
                </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {BENEFITS.map((benefit, index) => (
                    <Card
                        key={index}
                        className="p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/30"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors -mr-12 -mt-12" />
                        <div className="relative space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <benefit.icon className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {benefit.description}
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
