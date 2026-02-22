import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles, Wand2, FileSearch, ListChecks } from "lucide-react";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FREE_TIER_LIMITS } from "@/lib/config/credits";
import { toAbsoluteUrl } from "@/lib/config/site-url";
import { getBreadcrumbSchema } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: "AI Resume Builder (30 AI Credits Included) | ResumeZeus",
  description:
    "Use ResumeZeus as an AI resume builder with 30 AI credits included at signup. Improve bullets, generate summaries, suggest skills, and run ATS analysis.",
  keywords: [
    "ai resume builder",
    "free ai resume builder",
    "ai resume writer",
    "resume ai bullet improvement",
    "ai summary generator resume",
  ],
  alternates: {
    canonical: toAbsoluteUrl("/ai-resume-builder"),
  },
  openGraph: {
    title: "AI Resume Builder (30 AI Credits Included) | ResumeZeus",
    description:
      "Improve resume bullets, summaries, and skills with AI. Free account includes 30 AI credits at signup.",
    url: toAbsoluteUrl("/ai-resume-builder"),
  },
};

export default function AIResumeBuilderPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: toAbsoluteUrl("/") },
    { name: "AI Resume Builder", url: toAbsoluteUrl("/ai-resume-builder") },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-amber-50/30 via-background to-background dark:from-amber-950/10">
        <Header />
        <main className="container mx-auto px-4 py-12 md:py-16">
          <section className="max-w-4xl mx-auto space-y-6 text-center">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="w-3 h-3" />
              AI Resume Builder
            </Badge>
            <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">
              AI Resume Builder with 30 Credits Included at Signup
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              ResumeZeus helps you write faster with AI-assisted bullet rewrites,
              summary generation, skills suggestions, and ATS analysis. The free
              account includes {FREE_TIER_LIMITS.monthlyAICredits} AI credits at signup.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link href="/register">
                  Create free account
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/pricing">See plans</Link>
              </Button>
            </div>
          </section>

          <section className="max-w-5xl mx-auto mt-14 grid md:grid-cols-2 gap-4">
            {[
              {
                icon: Wand2,
                title: "Improve bullet points",
                desc: "Rewrite bullets for stronger action verbs, clearer impact, and better readability.",
              },
              {
                icon: Sparkles,
                title: "Generate summaries",
                desc: "Create professional summaries from your experience and adjust tone and length.",
              },
              {
                icon: ListChecks,
                title: "Suggest skills",
                desc: "Get AI suggestions for skills based on your resume content and target role context.",
              },
              {
                icon: FileSearch,
                title: "ATS analysis",
                desc: "Compare your resume against a job description and identify gaps to improve match quality.",
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="rounded-2xl border bg-card p-5 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="font-semibold">{card.title}</h2>
                  <p className="text-sm text-muted-foreground">{card.desc}</p>
                </div>
              );
            })}
          </section>

          <section className="max-w-4xl mx-auto mt-14 rounded-3xl border bg-muted/30 p-6 md:p-8">
            <h2 className="text-2xl font-serif font-bold mb-4">How AI credits work</h2>
            <p className="text-muted-foreground mb-4">
              Different AI actions use different credit amounts depending on how
              much work the model performs. ResumeZeus shows the credit cost in
              the UI before you run each AI command, so you always know the cost
              before you click.
            </p>
            <p className="text-muted-foreground">
              If you need more AI usage after your signup credits, you can upgrade
              for more credits and higher usage limits.
            </p>
          </section>

          <section className="max-w-4xl mx-auto mt-14 grid md:grid-cols-2 gap-4">
            <Link
              href="/free-resume-builder"
              className="rounded-2xl border p-5 hover:border-primary/40 transition-colors"
            >
              <h2 className="font-semibold mb-2">Free Resume Builder</h2>
              <p className="text-sm text-muted-foreground">
                See the full free account offer, including PDF export and what you get at signup.
              </p>
            </Link>
            <Link
              href="/resume-pdf-export"
              className="rounded-2xl border p-5 hover:border-primary/40 transition-colors"
            >
              <h2 className="font-semibold mb-2">Free Resume PDF Export</h2>
              <p className="text-sm text-muted-foreground">
                Learn how to export job-ready PDFs and use ResumeZeus in a simple apply workflow.
              </p>
            </Link>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
