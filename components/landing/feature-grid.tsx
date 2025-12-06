"use client";

import { CheckCircle2, FileCheck, Sparkles } from "lucide-react";

export function FeatureGrid() {
    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">
                        Everything you need to get hired
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Our platform gives you the competitive edge with powerful tools designed for the modern job market.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="bg-card border rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                        <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                            <FileCheck className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">ATS-Friendly Templates</h3>
                        <p className="text-muted-foreground">
                            Professionally designed templates ensuring your resume gets parsed correctly by Applicant Tracking Systems.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-card border rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                        <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                            <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">AI-Powered Optimization</h3>
                        <p className="text-muted-foreground">
                            Get intelligent suggestions to improve your content and match specific job descriptions seamlessly.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-card border rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                        <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Instant PDF Export</h3>
                        <p className="text-muted-foreground">
                            Download your polished resume in seconds, ready to send to recruiters with perfect formatting.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
