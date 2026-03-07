import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, FileText, Sparkles, Zap } from "lucide-react";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TEMPLATES } from "@/lib/constants";
import { FREE_TIER_LIMITS } from "@/lib/config/credits";
import { toAbsoluteUrl } from "@/lib/config/site-url";
import {
  getBreadcrumbSchema,
  getFAQPageSchema,
  getSoftwareApplicationSchema,
} from "@/lib/seo/structured-data";

const atsFriendlyTemplateCount = TEMPLATES.filter((template) =>
  ["excellent", "good"].includes(template.features.atsCompatibility)
).length;

const freeBuilderFaqs = [
  {
    question: "Is ResumeZeus actually free?",
    answer: `Yes. The free account includes resume editing, PDF export, and ${FREE_TIER_LIMITS.monthlyAICredits} AI credits at signup. You only pay if you later want more credits or higher limits.`,
  },
  {
    question: "What is included in the free account?",
    answer: `You can start from ${TEMPLATES.length} templates, edit with live preview, export PDF, export JSON, and use AI for summaries, bullet improvements, and skill suggestions.`,
  },
  {
    question: "Do I need a credit card to start?",
    answer: "No. Creating and using the free account does not require a credit card.",
  },
  {
    question: "How many ATS-friendly templates are included?",
    answer: `ResumeZeus includes ${atsFriendlyTemplateCount} templates rated Good or Excellent for ATS compatibility, plus additional design-forward templates for roles where visual presentation matters.`,
  },
  {
    question: "Can I save more than one resume?",
    answer: "Yes. ResumeZeus supports multiple resume versions within your plan limits so you can tailor applications by role, industry, or seniority.",
  },
  {
    question: "Can I export my resume before upgrading?",
    answer: "Yes. PDF export is included in the free account, so you can build and download a job-ready resume before paying for any upgrade.",
  },
];

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
  const faqSchema = getFAQPageSchema(freeBuilderFaqs);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
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

          <section className="max-w-5xl mx-auto mt-14 space-y-6">
            <div className="max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-serif font-bold">
                What do you get with a free ResumeZeus account?
              </h2>
              <p className="mt-3 text-muted-foreground">
                You can build a resume, export PDF, and use {FREE_TIER_LIMITS.monthlyAICredits} AI
                credits at signup without entering a credit card. The free tier also
                gives you access to {TEMPLATES.length} templates, including{" "}
                {atsFriendlyTemplateCount} rated Good or Excellent for ATS compatibility.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
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
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="max-w-4xl mx-auto mt-14 rounded-3xl border bg-muted/30 p-6 md:p-8">
            <h2 className="text-2xl font-serif font-bold mb-4">
              What does the free account include?
            </h2>
            <p className="text-muted-foreground mb-4">
              The free plan covers the full core workflow: pick a template, write or
              refine content, and export a job-ready PDF. You only need a paid upgrade
              if you want more AI volume or higher account limits.
            </p>
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

          <section className="max-w-5xl mx-auto mt-14 rounded-3xl border bg-card p-6 md:p-8">
            <h2 className="text-2xl font-serif font-bold">
              How does ResumeZeus compare to other free resume builders?
            </h2>
            <p className="mt-3 text-muted-foreground">
              ResumeZeus focuses the free tier on the parts candidates actually use in a
              real job-application flow: ATS-aware templates, editable content, and free export.
            </p>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 font-semibold">Feature</th>
                    <th className="px-4 py-3 font-semibold">ResumeZeus Free</th>
                    <th className="px-4 py-3 font-semibold">Other Free Builders</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-3">PDF export</td>
                    <td className="px-4 py-3">Included in the free account</td>
                    <td className="px-4 py-3 text-muted-foreground">Often paywalled or watermarked</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3">AI help</td>
                    <td className="px-4 py-3">{FREE_TIER_LIMITS.monthlyAICredits} AI credits at signup</td>
                    <td className="px-4 py-3 text-muted-foreground">Often unavailable or heavily limited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3">Templates</td>
                    <td className="px-4 py-3">
                      {TEMPLATES.length} templates, {atsFriendlyTemplateCount} rated Good/Excellent for ATS
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">Usually a smaller free subset</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Export options</td>
                    <td className="px-4 py-3">PDF and JSON export</td>
                    <td className="px-4 py-3 text-muted-foreground">Commonly PDF-only or limited export</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="max-w-4xl mx-auto mt-14">
            <h2 className="text-2xl font-serif font-bold">Frequently asked questions about the free plan</h2>
            <div className="mt-6 space-y-3">
              {freeBuilderFaqs.map((faq) => (
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
                href="/ai-resume-builder"
                className="rounded-2xl border p-5 hover:border-primary/40 transition-colors"
              >
                <h3 className="font-semibold mb-2">Free AI Resume Builder</h3>
                <p className="text-sm text-muted-foreground">
                  See how AI credits are used for bullet improvements, summaries, and job-specific optimizations.
                </p>
              </Link>
              <Link
                href="/resume-pdf-export"
                className="rounded-2xl border p-5 hover:border-primary/40 transition-colors"
              >
                <h3 className="font-semibold mb-2">Resume PDF Export</h3>
                <p className="text-sm text-muted-foreground">
                  Learn how PDF export works and why ResumeZeus is useful for job application workflows.
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
