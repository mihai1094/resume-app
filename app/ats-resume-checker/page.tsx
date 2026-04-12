import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  FileSearch,
  CheckCircle2,
  BarChart3,
  Target,
  AlignLeft,
  Zap,
  TrendingUp,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { Footer } from "@/components/shared/footer";
import { MarketingBackground } from "@/components/shared/marketing-background";
import { HeroAccent, PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";
import { toAbsoluteUrl } from "@/lib/config/site-url";
import { getBreadcrumbSchema, getFAQPageSchema } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/seo/json-ld";

const atsFaqs = [
  {
    question: "What is an ATS resume checker?",
    answer:
      "An ATS (Applicant Tracking System) resume checker analyzes your resume against a job description and tells you how well it matches what the system is looking for. It checks for relevant keywords, formatting issues, and sections that ATS software commonly flags. ResumeZeus scores your resume across five categories and shows exactly what to improve.",
  },
  {
    question: "What is a good ATS score?",
    answer:
      "An ATS score of 80 or above is considered excellent — it means your resume is well-optimized for the role and likely to pass automated screening. Scores between 60–79 are good and usually pass, but there is room for improvement. Scores below 60 indicate missing keywords or formatting issues that may cause your resume to be filtered out before a recruiter sees it.",
  },
  {
    question: "How does ResumeZeus check ATS compatibility?",
    answer:
      "ResumeZeus uses AI to compare your resume against a job description you paste in. It scores your resume across five categories: keyword match, quantified achievements, formatting, ATS compatibility, and overall impact. You get a 0–100 score, a list of missing keywords, and specific suggestions ranked by severity.",
  },
  {
    question: "Do I need to create an account to check my ATS score?",
    answer:
      "Yes, you need a free account to run the ATS checker. Creating an account is free and takes under a minute. The free account includes 30 AI credits at signup — each ATS analysis costs 3 credits.",
  },
  {
    question: "How often should I check my ATS score?",
    answer:
      "You should check your ATS score every time you apply for a new role, especially if the job description differs significantly from your last application. Even small differences in required skills or job title phrasing can affect your match score. Tailoring your resume per application is the most effective ATS strategy.",
  },
  {
    question: "Does ATS score matter if a human reviews my resume?",
    answer:
      "Yes — because a human reviewer only sees your resume if the ATS passes it first. Most companies using ATS software set a minimum score threshold. Below that threshold, your resume is automatically filtered out regardless of how qualified you are. Optimizing for ATS is step one; making a strong impression on the human reader is step two.",
  },
];

export const metadata: Metadata = {
  title: "Free ATS Resume Checker — Test Your Resume Online | ResumeZeus",
  description:
    "Check if your resume passes ATS screening before you apply. ResumeZeus scores your resume across 5 categories including keywords, formatting, and impact. Free account, no credit card required.",
  keywords: [
    "ats resume checker",
    "ats score checker",
    "ats resume test",
    "ats resume scanner",
    "resume ats compatibility",
    "check resume ats",
    "applicant tracking system checker",
    "free ats checker",
  ],
  alternates: {
    canonical: toAbsoluteUrl("/ats-resume-checker"),
  },
  openGraph: {
    title: "Free ATS Resume Checker — Test Your Resume Online | ResumeZeus",
    description:
      "Check if your resume passes ATS screening before you apply. Scores keywords, formatting, and impact. Free to use.",
    url: toAbsoluteUrl("/ats-resume-checker"),
  },
};

const scoreCategories = [
  {
    icon: Target,
    label: "Keyword match",
    weight: "25%",
    desc: "How well your resume's language aligns with the job description. ATS systems search for exact and related terms from the posting.",
  },
  {
    icon: TrendingUp,
    label: "Quantified achievements",
    weight: "25%",
    desc: "Whether your bullets include numbers, percentages, and measurable impact. ATS and recruiters both reward specificity.",
  },
  {
    icon: AlignLeft,
    label: "Formatting",
    weight: "15%",
    desc: "Section structure, consistent fonts, parseable layout, and appropriate length. Complex formatting breaks ATS parsing.",
  },
  {
    icon: BarChart3,
    label: "ATS compatibility",
    weight: "20%",
    desc: "Standard headers, clean structure, no tables or images in critical sections, and correct date formats.",
  },
  {
    icon: Zap,
    label: "Overall impact",
    weight: "15%",
    desc: "Action verbs, results-oriented language, and achievement focus rather than responsibility lists.",
  },
];

const steps = [
  {
    num: "1",
    title: "Build or paste your resume",
    desc: "Use the ResumeZeus editor to build your resume, or paste your existing content into the builder.",
  },
  {
    num: "2",
    title: "Paste the job description",
    desc: "Copy the full job description from the posting. The more complete the JD, the more accurate the keyword match analysis.",
  },
  {
    num: "3",
    title: "Run the ATS analysis",
    desc: "Click Analyze ATS in the editor. You get a 0–100 score, missing keywords, and ranked suggestions in seconds.",
  },
];

export default function ATSResumeCheckerPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: toAbsoluteUrl("/") },
    { name: "ATS Resume Checker", url: toAbsoluteUrl("/ats-resume-checker") },
  ]);
  const faqSchema = getFAQPageSchema(atsFaqs);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

      <div className="min-h-screen relative bg-background">
        <MarketingBackground />
        <SiteHeader />
        <main className="container mx-auto px-4 py-12 md:py-16">
          <PageHero
            eyebrow={{ icon: FileSearch, label: "ATS Resume Checker" }}
            title={
              <>
                Check if your resume{" "}
                <HeroAccent>passes ATS screening</HeroAccent> before you apply
              </>
            }
            description="ResumeZeus analyzes your resume against a job description and scores it across five categories. See exactly which keywords you are missing, which sections need work, and how to fix them — before the recruiter ever sees your application."
            actions={
              <>
                <Button asChild size="lg" className="gap-2">
                  <Link href="/register">
                    Check your resume free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/editor/new">Start from scratch</Link>
                </Button>
              </>
            }
          />

          {/* How to use */}
          <section className="max-w-4xl mx-auto mt-14 space-y-6">
            <h2 className="text-2xl md:text-3xl font-serif font-bold">
              How to check your ATS score in 3 steps
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {steps.map((step) => (
                <div key={step.num} className="rounded-2xl border bg-card p-5 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-bold text-primary text-lg">{step.num}</span>
                  </div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Score breakdown */}
          <section className="max-w-4xl mx-auto mt-14 rounded-3xl border bg-muted/30 p-6 md:p-8">
            <h2 className="text-2xl font-serif font-bold mb-2">
              How your ATS score is calculated
            </h2>
            <p className="text-muted-foreground mb-6">
              ResumeZeus scores your resume from 0 to 100 across five weighted categories. A score
              of 80 or above is excellent. Below 60 means your resume is likely to be filtered out
              before a human reads it.
            </p>
            <div className="space-y-4">
              {scoreCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div key={cat.label} className="flex gap-4 items-start">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{cat.label}</span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {cat.weight}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{cat.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* What you get */}
          <section className="max-w-5xl mx-auto mt-14 space-y-6">
            <h2 className="text-2xl md:text-3xl font-serif font-bold max-w-3xl">
              What the ATS analysis report shows you
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  title: "Overall score (0–100)",
                  desc: "A single score that reflects how well your resume matches the job description based on all five weighted categories.",
                },
                {
                  title: "Missing keywords",
                  desc: "A list of terms from the job description that are absent from your resume. Each missing keyword is a potential filter-out reason.",
                },
                {
                  title: "Ranked suggestions",
                  desc: "Specific improvements sorted by severity (critical, high, medium, low) so you know exactly where to focus first.",
                },
                {
                  title: "Strengths identified",
                  desc: "What your resume does well against this job description, so you know which sections to keep and reinforce.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border bg-card p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <h3 className="font-semibold">{item.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="max-w-4xl mx-auto mt-14">
            <h2 className="text-2xl font-serif font-bold">
              Frequently asked questions about ATS resume checking
            </h2>
            <div className="mt-6 space-y-3">
              {atsFaqs.map((faq) => (
                <details key={faq.question} className="rounded-2xl border bg-card p-5">
                  <summary className="cursor-pointer list-none font-semibold">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Related features */}
          <section className="max-w-4xl mx-auto mt-14">
            <h2 className="text-2xl font-serif font-bold mb-4">Related features</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                href="/ai-resume-builder"
                className="rounded-2xl border p-5 hover:border-primary/40 transition-colors"
              >
                <h3 className="font-semibold mb-2">AI Resume Builder</h3>
                <p className="text-sm text-muted-foreground">
                  Use AI to improve bullets, generate summaries, and tailor your resume to each job description.
                </p>
              </Link>
              <Link
                href="/free-resume-builder"
                className="rounded-2xl border p-5 hover:border-primary/40 transition-colors"
              >
                <h3 className="font-semibold mb-2">Free Resume Builder</h3>
                <p className="text-sm text-muted-foreground">
                  Build your resume from scratch with free PDF export, ATS-friendly templates, and no credit card required.
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
