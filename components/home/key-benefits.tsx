"use client";

import { Card } from "@/components/ui/card";
import { Download, Sparkles, Layout, Eye } from "lucide-react";

const BENEFITS = [
  {
    icon: Download,
    title: "Instant PDF Export",
    description:
      "Download your professional resume in seconds. No watermarks, no paywalls, just a clean PDF ready for applications.",
  },
  {
    icon: Sparkles,
    title: "Smart AI Optimization",
    description:
      "Get intelligent suggestions to improve your content and match specific job descriptions.",
  },
  {
    icon: Layout,
    title: "Professional Templates",
    description:
      "Stand out with professionally designed layouts that look great and pass ATS scans.",
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
            className="p-6 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-primary/10 hover:border-primary/30"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors -mr-16 -mt-16" />
            <div className="relative space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                <benefit.icon className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {benefit.title}
                </h3>
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
