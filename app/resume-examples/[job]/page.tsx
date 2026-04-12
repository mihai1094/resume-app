import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Lightbulb } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { Footer } from "@/components/shared/footer";
import { MarketingBackground } from "@/components/shared/marketing-background";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toAbsoluteUrl } from "@/lib/config/site-url";
import { getBreadcrumbSchema, getFAQPageSchema } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/seo/json-ld";
import { resumeExamples, getResumeExample } from "@/lib/data/resume-examples";

type PageProps = {
  params: Promise<{ job: string }>;
};

export function generateStaticParams() {
  return resumeExamples.map((ex) => ({ job: ex.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { job } = await params;
  const example = getResumeExample(job);

  if (!example) {
    return { title: "Resume Example Not Found", robots: { index: false, follow: false } };
  }

  return {
    title: `${example.jobTitle} Resume Example for 2026 | ResumeZeus`,
    description: `${example.description.slice(0, 155)}`,
    keywords: example.keywords,
    alternates: {
      canonical: toAbsoluteUrl(`/resume-examples/${example.slug}`),
    },
    openGraph: {
      title: `${example.jobTitle} Resume Example for 2026 | ResumeZeus`,
      description: example.description.slice(0, 155),
      url: toAbsoluteUrl(`/resume-examples/${example.slug}`),
    },
  };
}

export default async function ResumeExampleDetailPage({ params }: PageProps) {
  const { job } = await params;
  const example = getResumeExample(job);

  if (!example) {
    notFound();
  }

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: toAbsoluteUrl("/") },
    { name: "Resume Examples", url: toAbsoluteUrl("/resume-examples") },
    { name: `${example.jobTitle} Resume`, url: toAbsoluteUrl(`/resume-examples/${example.slug}`) },
  ]);
  const faqSchema = getFAQPageSchema(example.faqs);

  const relatedExamples = resumeExamples
    .filter((ex) => ex.slug !== example.slug && ex.industry === example.industry)
    .slice(0, 3);

  const fallbackRelated = resumeExamples
    .filter((ex) => ex.slug !== example.slug)
    .slice(0, 3 - relatedExamples.length);

  const displayRelated = [...relatedExamples, ...fallbackRelated].slice(0, 3);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

      <div className="min-h-screen relative bg-background">
        <MarketingBackground />
        <SiteHeader />
        <main className="container mx-auto px-4 py-12 md:py-16">
          {/* Hero */}
          <section className="max-w-4xl mx-auto space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary">{example.industry}</Badge>
              <Badge variant="outline">2026 Guide</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-medium">
              {example.jobTitle} Resume Example
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">{example.description}</p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button asChild size="lg" className="gap-2">
                <Link href={`/editor/new`}>
                  Build my {example.jobTitle} resume
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/templates">Browse templates</Link>
              </Button>
            </div>
          </section>

          {/* What to include */}
          <section className="max-w-4xl mx-auto mt-14 space-y-6">
            <h2 className="text-2xl md:text-3xl font-serif font-bold">
              What to include on a {example.jobTitle} resume
            </h2>
            <div className="space-y-3">
              {example.highlights.map((tip, i) => (
                <div key={i} className="flex gap-3 items-start rounded-2xl border bg-card p-4">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <p className="text-sm leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Key skills */}
          <section className="max-w-4xl mx-auto mt-14 rounded-3xl border bg-muted/30 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-serif font-bold">
                Key skills for a {example.jobTitle} resume
              </h2>
            </div>
            <p className="text-muted-foreground mb-4 text-sm">
              Include the skills that match the job description. These are the keywords ATS systems
              screen for in {example.industry} roles.
            </p>
            <div className="flex flex-wrap gap-2">
              {example.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-background border px-3 py-1 text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="max-w-4xl mx-auto mt-14">
            <h2 className="text-2xl font-serif font-bold">
              {example.jobTitle} resume — frequently asked questions
            </h2>
            <div className="mt-6 space-y-3">
              {example.faqs.map((faq) => (
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
          <section className="max-w-4xl mx-auto mt-14 rounded-3xl border bg-primary/5 p-6 md:p-8 text-center space-y-4">
            <h2 className="text-2xl font-serif font-bold">
              Ready to build your {example.jobTitle} resume?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Use ResumeZeus to build an ATS-optimized {example.jobTitle} resume with free PDF
              export. 30 AI credits included at signup — no credit card required.
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Button asChild size="lg" className="gap-2">
                <Link href="/register">
                  Create free account
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/ats-resume-checker">Check ATS score</Link>
              </Button>
            </div>
          </section>

          {/* Related examples */}
          {displayRelated.length > 0 && (
            <section className="max-w-4xl mx-auto mt-14">
              <h2 className="text-2xl font-serif font-bold mb-4">More resume examples</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {displayRelated.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/resume-examples/${related.slug}`}
                    className="rounded-2xl border bg-card p-5 hover:border-primary/40 transition-colors"
                  >
                    <h3 className="font-semibold mb-2">{related.jobTitle} Resume</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {related.description.slice(0, 90)}...
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}
