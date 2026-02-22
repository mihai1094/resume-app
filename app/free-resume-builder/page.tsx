import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, FileText, Sparkles, Zap } from "lucide-react";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FREE_TIER_LIMITS } from "@/lib/config/credits";
import { toAbsoluteUrl } from "@/lib/config/site-url";
import {
  getBreadcrumbSchema,
  getSoftwareApplicationSchema,
} from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: "Free Resume Builder with PDF Export | ResumeZeus",
  description:
    "Create a professional resume for free with ResumeZeus. Free account includes PDF export and 30 AI credits at signup. No credit card required for the free account.",
  keywords: [
    "free resume builder",
    "free cv builder",
    "resume builder free pdf export",
    "resume builder no credit card",
    "free resume templates",
  ],
  alternates: {
    canonical: toAbsoluteUrl("/free-resume-builder"),
  },
  openGraph: {
    title: "Free Resume Builder with PDF Export | ResumeZeus",
    description:
      "Build and export resumes to PDF for free. Includes 30 AI credits at signup.",
    url: toAbsoluteUrl("/free-resume-builder"),
  },
};

export default function FreeResumeBuilderPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: toAbsoluteUrl("/") },
    { name: "Free Resume Builder", url: toAbsoluteUrl("/free-resume-builder") },
  ]);
  const softwareSchema = getSoftwareApplicationSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
        <Header />
        <main className="container mx-auto px-4 py-12 md:py-16">
          <section className="max-w-4xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="w-3 h-3" />
              Free Account
            </Badge>
            <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">
              Free Resume Builder with PDF Export
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              ResumeZeus lets you create resumes, export PDFs, and use AI writing
              help with a free account. You get {FREE_TIER_LIMITS.monthlyAICredits} AI
              credits at signup to improve bullets, summaries, and skills.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link href="/register">
                  Create free account
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/templates">View templates</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              No credit card required for the free account
            </p>
          </section>

          <section className="max-w-5xl mx-auto mt-14 grid md:grid-cols-3 gap-4">
            {[
              {
                icon: FileText,
                title: "Create resumes",
                desc: "Build ATS-friendly resumes with guided sections and live preview.",
              },
              {
                icon: Zap,
                title: `${FREE_TIER_LIMITS.monthlyAICredits} AI credits`,
                desc: "Use AI at signup for summaries, bullet rewrites, and skills suggestions.",
              },
              {
                icon: Check,
                title: "Free PDF export",
                desc: "Export a clean PDF for job applications directly from your account.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border bg-card p-5 text-left space-y-3"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="font-semibold">{item.title}</h2>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              );
            })}
          </section>

          <section className="max-w-4xl mx-auto mt-14 rounded-3xl border bg-muted/30 p-6 md:p-8">
            <h2 className="text-2xl font-serif font-bold mb-4">
              What the free account includes
            </h2>
            <ul className="space-y-3 text-sm md:text-base text-muted-foreground">
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-green-600 mt-1 shrink-0" />
                Resume builder with professional templates and live preview
              </li>
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-green-600 mt-1 shrink-0" />
                PDF export for applications and JSON export for backup
              </li>
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-green-600 mt-1 shrink-0" />
                {FREE_TIER_LIMITS.monthlyAICredits} AI credits at signup (one-time bonus)
              </li>
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-green-600 mt-1 shrink-0" />
                Upgrade later only if you need more AI credits or higher limits
              </li>
            </ul>
          </section>

          <section className="max-w-4xl mx-auto mt-14 grid md:grid-cols-2 gap-4">
            <Link
              href="/ai-resume-builder"
              className="rounded-2xl border p-5 hover:border-primary/40 transition-colors"
            >
              <h2 className="font-semibold mb-2">Free AI Resume Builder</h2>
              <p className="text-sm text-muted-foreground">
                See how AI credits are used for bullet improvements, summaries, and job-specific optimizations.
              </p>
            </Link>
            <Link
              href="/resume-pdf-export"
              className="rounded-2xl border p-5 hover:border-primary/40 transition-colors"
            >
              <h2 className="font-semibold mb-2">Resume PDF Export</h2>
              <p className="text-sm text-muted-foreground">
                Learn how PDF export works and why ResumeZeus is useful for job application workflows.
              </p>
            </Link>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
