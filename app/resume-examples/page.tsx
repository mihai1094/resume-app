import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  GraduationCap,
  HeartPulse,
  Code2,
  Megaphone,
  BarChart2,
  Palette,
  Calculator,
  TrendingUp,
  Package,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { Footer } from "@/components/shared/footer";
import { MarketingBackground } from "@/components/shared/marketing-background";
import { HeroAccent, PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";
import { toAbsoluteUrl, getSiteUrl } from "@/lib/config/site-url";
import { getBreadcrumbSchema, getFAQPageSchema } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/seo/json-ld";
import { resumeExamples } from "@/lib/data/resume-examples";

const baseUrl = getSiteUrl();

const indexListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Resume Examples by Job Title",
  description: `${resumeExamples.length} resume examples with tips and templates for every job title.`,
  url: `${baseUrl}/resume-examples`,
  numberOfItems: resumeExamples.length,
  itemListElement: resumeExamples.map((ex, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: `${ex.jobTitle} Resume Example`,
    url: `${baseUrl}/resume-examples/${ex.slug}`,
  })),
};

const indexFaqs = [
  {
    question: "What is the best resume format for 2026?",
    answer:
      "The reverse-chronological format remains the most widely accepted in 2026. It lists your most recent experience first and is the format that ATS systems parse most reliably. Use a single-column or clean two-column layout, standard section headers (Work Experience, Education, Skills), and avoid graphics or text boxes.",
  },
  {
    question: "How do I tailor my resume for a specific job?",
    answer:
      "Read the job description carefully and identify the 10–15 most important keywords — skills, tools, and job titles. Add these naturally into your bullets and skills section. Use the same job title phrasing as the posting. Run an ATS check before submitting.",
  },
  {
    question: "How long should a resume be in 2026?",
    answer:
      "One page for under 5 years of experience. Two pages for experienced professionals with multiple roles or significant accomplishments. Three pages are very rarely justified — only for academic CVs or C-suite executives. Quality and density beat length.",
  },
  {
    question: "Should I use a resume template or write my resume from scratch?",
    answer:
      "Use a template. Starting from scratch risks inconsistent formatting, poor spacing, and an ATS-unfriendly structure. A good template gives you a proven layout and lets you focus on content. Choose an ATS-compatible template and customize it for each role.",
  },
];

const jobCategories = [
  { slug: "software-engineer", label: "Software Engineer", icon: Code2, industry: "Technology" },
  { slug: "marketing-manager", label: "Marketing Manager", icon: Megaphone, industry: "Marketing" },
  { slug: "project-manager", label: "Project Manager", icon: Briefcase, industry: "Business" },
  { slug: "data-analyst", label: "Data Analyst", icon: BarChart2, industry: "Technology" },
  { slug: "nurse", label: "Nurse", icon: HeartPulse, industry: "Healthcare" },
  { slug: "teacher", label: "Teacher", icon: GraduationCap, industry: "Education" },
  { slug: "graphic-designer", label: "Graphic Designer", icon: Palette, industry: "Creative" },
  { slug: "accountant", label: "Accountant", icon: Calculator, industry: "Finance" },
  { slug: "sales-representative", label: "Sales Representative", icon: TrendingUp, industry: "Sales" },
  { slug: "product-manager", label: "Product Manager", icon: Package, industry: "Technology" },
];

export const metadata: Metadata = {
  title: "Resume Examples for Every Job Title (2026) | ResumeZeus",
  description:
    "Browse resume examples for 10+ job titles. Each example includes tips, key skills, and ATS-optimized templates. Free to use — no credit card required.",
  keywords: [
    "resume examples",
    "resume examples 2026",
    "resume examples by job title",
    "resume samples",
    "cv examples",
    "professional resume examples",
  ],
  alternates: {
    canonical: toAbsoluteUrl("/resume-examples"),
  },
  openGraph: {
    title: "Resume Examples for Every Job Title (2026) | ResumeZeus",
    description:
      "Browse resume examples for 10+ job titles with tips, key skills, and ATS-friendly templates. Free to use.",
    url: toAbsoluteUrl("/resume-examples"),
  },
};

export default function ResumeExamplesPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: toAbsoluteUrl("/") },
    { name: "Resume Examples", url: toAbsoluteUrl("/resume-examples") },
  ]);
  const faqSchema = getFAQPageSchema(indexFaqs);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={indexListSchema} />

      <div className="min-h-screen relative bg-background">
        <MarketingBackground />
        <SiteHeader />
        <main className="container mx-auto px-4 py-12 md:py-16">
          <PageHero
            eyebrow={{ icon: BookOpen, label: "Resume Examples" }}
            title={
              <>
                Resume examples for{" "}
                <HeroAccent>every job title</HeroAccent>
              </>
            }
            description="Real resume examples with tips, key skills, and ATS-friendly templates for 10+ job titles. Pick your role and get a complete guide on what to include, how to quantify your work, and how to pass ATS screening."
            actions={
              <>
                <Button asChild size="lg" className="gap-2">
                  <Link href="/editor/new">
                    Build my resume
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/templates">Browse templates</Link>
                </Button>
              </>
            }
          />

          {/* Job category grid */}
          <section className="max-w-5xl mx-auto mt-14 space-y-6">
            <h2 className="text-2xl md:text-3xl font-serif font-bold">
              Browse resume examples by job title
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {jobCategories.map((job) => {
                const Icon = job.icon;
                return (
                  <Link
                    key={job.slug}
                    href={`/resume-examples/${job.slug}`}
                    className="rounded-2xl border bg-card p-5 hover:border-primary/40 transition-colors space-y-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm leading-snug">{job.label}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{job.industry}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* How to use */}
          <section className="max-w-4xl mx-auto mt-14 rounded-3xl border bg-muted/30 p-6 md:p-8">
            <h2 className="text-2xl font-serif font-bold mb-4">
              How to use these resume examples
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Each resume example page covers what to include for that specific role, which skills
                recruiters screen for, how to quantify your experience, and which templates work best
                for that industry. Examples are updated for 2026 job market expectations.
              </p>
              <p>
                Use the example as a reference, then build your own resume in ResumeZeus with the
                matching template. Run the ATS checker against your target job description before
                submitting.
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section className="max-w-4xl mx-auto mt-14">
            <h2 className="text-2xl font-serif font-bold">
              Frequently asked questions about resumes
            </h2>
            <div className="mt-6 space-y-3">
              {indexFaqs.map((faq) => (
                <details key={faq.question} className="rounded-2xl border bg-card p-5">
                  <summary className="cursor-pointer list-none font-semibold">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="max-w-4xl mx-auto mt-14">
            <h2 className="text-2xl font-serif font-bold mb-4">Related resources</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                href="/templates"
                className="rounded-2xl border p-5 hover:border-primary/40 transition-colors"
              >
                <h3 className="font-semibold mb-2">Resume Templates</h3>
                <p className="text-sm text-muted-foreground">
                  Browse ATS-friendly templates with free PDF export. Pick a layout that matches your industry.
                </p>
              </Link>
              <Link
                href="/ats-resume-checker"
                className="rounded-2xl border p-5 hover:border-primary/40 transition-colors"
              >
                <h3 className="font-semibold mb-2">ATS Resume Checker</h3>
                <p className="text-sm text-muted-foreground">
                  Score your resume against a job description and get a ranked list of improvements before you apply.
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
