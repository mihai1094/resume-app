import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles, Wand2, FileSearch, ListChecks } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { Footer } from "@/components/shared/footer";
import { MarketingBackground } from "@/components/shared/marketing-background";
import { HeroAccent, PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";
import { FREE_TIER_LIMITS } from "@/lib/config/credits";
import { toAbsoluteUrl } from "@/lib/config/site-url";
import { getBreadcrumbSchema, getFAQPageSchema } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/seo/json-ld";

const aiResumeFaqs = [
  {
    question: "What can ResumeZeus AI help me write?",
    answer: "ResumeZeus AI can improve bullets, generate summaries, suggest skills, and compare your resume to a job description so you can close obvious gaps faster.",
  },
  {
    question: "How many AI credits do I get at signup?",
    answer: `Free accounts include ${FREE_TIER_LIMITS.signupAICredits} AI credits at signup, which you can use across supported AI actions.`,
  },
  {
    question: "How much does each AI action cost?",
    answer: "Costs vary by action size. Quick tasks like improving a single bullet typically use fewer credits, while larger tasks like generating a cover letter use more. ResumeZeus shows the cost before you run the action.",
  },
  {
    question: "Can I tailor my resume to a specific job description?",
    answer: "Yes. You can paste a job description and use ATS analysis plus AI suggestions to identify missing keywords, tighten phrasing, and improve match quality.",
  },
  {
    question: "Do I need to use AI for every edit?",
    answer: "No. You can write manually whenever you want and use AI only for sections where you need speed, rewrites, or role-specific phrasing.",
  },
  {
    question: "What happens when I use all of my included credits?",
    answer: "You can keep editing manually for free and upgrade later if you want more AI usage or higher limits.",
  },
];

export const metadata: Metadata = {
  title: "AI Resume Builder (30 AI Credits Included)",
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
  const faqSchema = getFAQPageSchema(aiResumeFaqs);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

      <div className="min-h-screen relative bg-background">
        <MarketingBackground />
        <SiteHeader />
        <main className="container mx-auto px-4 py-12 md:py-16">
          <PageHero
            eyebrow={{ icon: Sparkles, label: "AI Resume Builder" }}
            title={
              <>
                AI Resume Builder with{" "}
                <HeroAccent>30 credits included</HeroAccent> at signup
              </>
            }
            description={
              <>
                ResumeZeus helps you write faster with AI-assisted bullet
                rewrites, summary generation, skills suggestions, and ATS
                analysis. The free account includes{" "}
                {FREE_TIER_LIMITS.signupAICredits} AI credits at signup.
              </>
            }
            actions={
              <>
                <Button asChild size="lg" className="gap-2">
                  <Link href="/register">
                    Create free account
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/pricing">See plans</Link>
                </Button>
              </>
            }
          />

          <section className="max-w-5xl mx-auto mt-14 space-y-6">
            <div className="max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-serif font-bold">
                How does AI resume optimization work?
              </h2>
              <p className="mt-3 text-muted-foreground">
                ResumeZeus uses AI to speed up the editing work that normally slows candidates down:
                rewriting weak bullets, drafting summaries, suggesting missing skills, and comparing
                your resume against a target job description. The free account includes{" "}
                {FREE_TIER_LIMITS.signupAICredits} AI credits at signup so you can test the workflow
                before upgrading.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
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
                    <h3 className="font-semibold">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">{card.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="max-w-4xl mx-auto mt-14 rounded-3xl border bg-muted/30 p-6 md:p-8">
            <h2 className="text-2xl font-serif font-bold mb-4">How do AI credits work?</h2>
            <p className="text-muted-foreground mb-4">
              ResumeZeus uses a credit system so smaller AI tasks stay lightweight and larger tasks
              consume more only when you actually use them. The UI shows the cost before each action.
            </p>
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

          <section className="max-w-4xl mx-auto mt-14">
            <h2 className="text-2xl font-serif font-bold">Frequently asked questions about AI resume writing</h2>
            <div className="mt-6 space-y-3">
              {aiResumeFaqs.map((faq) => (
                <details key={faq.question} className="rounded-2xl border bg-card p-5">
                  <summary className="cursor-pointer list-none font-semibold">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="max-w-4xl mx-auto mt-14">
            <h2 className="text-2xl font-serif font-bold mb-4">Related features</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                href="/free-resume-builder"
                className="rounded-2xl border p-5 hover:border-primary/40 transition-colors"
              >
                <h3 className="font-semibold mb-2">Free Resume Builder</h3>
                <p className="text-sm text-muted-foreground">
                  See the full free account offer, including PDF export and what you get at signup.
                </p>
              </Link>
              <Link
                href="/cover-letter"
                className="rounded-2xl border p-5 hover:border-primary/40 transition-colors"
              >
                <h3 className="font-semibold mb-2">AI Cover Letter Builder</h3>
                <p className="text-sm text-muted-foreground">
                  Generate a matching cover letter alongside your resume when you want a faster application workflow.
                </p>
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
