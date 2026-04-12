import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, ExternalLink, Scale, ShieldCheck, Sparkles } from "lucide-react";
import { Footer } from "@/components/shared/footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MarketingBackground } from "@/components/shared/marketing-background";
import { PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";
import { getComparisonPage, comparisonPages } from "@/lib/data/comparison-pages";
import { toAbsoluteUrl } from "@/lib/config/site-url";
import { getBreadcrumbSchema, getFAQPageSchema } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/seo/json-ld";

type PageProps = {
  params: Promise<{ competitor: string }>;
};

export function generateStaticParams() {
  return comparisonPages.map((page) => ({ competitor: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { competitor } = await params;
  const page = getComparisonPage(competitor);

  if (!page) {
    return {
      title: "Comparison Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalUrl = toAbsoluteUrl(`/vs/${page.slug}`);

  return {
    title: page.title,
    description: page.description,
    keywords: [
      `${page.competitorName} alternative`,
      `ResumeZeus vs ${page.competitorName}`,
      `${page.competitorName} resume builder comparison`,
      "resume builder comparison",
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${page.title} | ResumeZeus`,
      description: page.description,
      url: canonicalUrl,
    },
  };
}

export default async function ComparisonPage({ params }: PageProps) {
  const { competitor } = await params;
  const page = getComparisonPage(competitor);

  if (!page) {
    notFound();
  }

  const relatedPages = comparisonPages.filter((entry) => entry.slug !== page.slug).slice(0, 2);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: toAbsoluteUrl("/") },
    { name: "Pricing", url: toAbsoluteUrl("/pricing") },
    { name: page.title, url: toAbsoluteUrl(`/vs/${page.slug}`) },
  ]);
  const faqSchema = getFAQPageSchema(page.faqs);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

      <div className="min-h-screen relative bg-background">
        <MarketingBackground />
        <SiteHeader />
        <main className="container mx-auto px-4 py-12 md:py-16">
          <PageHero
            eyebrow={{ icon: Scale, label: "Comparison Guide" }}
            title={page.title}
            description={page.summary}
            maxWidth="max-w-5xl"
            actions={
              <>
                <Button asChild size="lg" className="gap-2">
                  <Link href="/register">
                    Create free account
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/pricing">See pricing</Link>
                </Button>
              </>
            }
            footnote={`Based on public competitor product and pricing pages. Last verified on ${page.lastVerified}.`}
          />

          <section className="mx-auto mt-14 grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1.1fr)_320px]">
            <div className="rounded-3xl border bg-card p-6 md:p-8">
              <h2 className="text-2xl font-serif font-bold">
                Which builder is the better fit?
              </h2>
              <p className="mt-3 text-muted-foreground">{page.verdict}</p>
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 font-semibold">Feature</th>
                      <th className="px-4 py-3 font-semibold">ResumeZeus</th>
                      <th className="px-4 py-3 font-semibold">{page.competitorName}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.featureRows.map((row) => (
                      <tr key={row.feature} className="border-b last:border-b-0">
                        <td className="px-4 py-3 font-medium">{row.feature}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.resumeZeus}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.competitor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="rounded-3xl border bg-muted/30 p-6">
              <div className="space-y-3">
                <h2 className="text-xl font-serif font-bold">Comparison basis</h2>
                <p className="text-sm text-muted-foreground">
                  This page summarizes information visible on official public pages. Product details and pricing can change.
                </p>
              </div>
              <div className="mt-4 space-y-3">
                {page.sourceUrls.map((sourceUrl) => (
                  <a
                    key={sourceUrl}
                    href={sourceUrl}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="flex items-center justify-between rounded-2xl border bg-background px-4 py-3 text-sm transition-colors hover:bg-muted"
                  >
                    <span className="truncate">{sourceUrl.replace(/^https?:\/\//, "")}</span>
                    <ExternalLink className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </aside>
          </section>

          <section className="mx-auto mt-14 grid max-w-6xl gap-6 md:grid-cols-2">
            <div className="rounded-3xl border bg-card p-6 md:p-8">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-serif font-bold">Why choose ResumeZeus?</h2>
              </div>
              <ul className="mt-5 space-y-3 text-sm md:text-base text-muted-foreground">
                {page.resumeZeusAdvantages.map((advantage) => (
                  <li key={advantage} className="flex gap-2">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-green-600" />
                    <span>{advantage}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border bg-card p-6 md:p-8">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-serif font-bold">
                  Where {page.competitorName} is stronger
                </h2>
              </div>
              <ul className="mt-5 space-y-3 text-sm md:text-base text-muted-foreground">
                {page.competitorStrengths.map((strength) => (
                  <li key={strength} className="flex gap-2">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mx-auto mt-14 max-w-4xl">
            <h2 className="text-2xl font-serif font-bold">
              Frequently asked questions about {page.title}
            </h2>
            <div className="mt-6 space-y-3">
              {page.faqs.map((faq) => (
                <details key={faq.question} className="rounded-2xl border bg-card p-5">
                  <summary className="cursor-pointer list-none font-semibold">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="mx-auto mt-14 max-w-5xl rounded-3xl border bg-muted/30 p-6 md:p-8">
            <h2 className="text-2xl font-serif font-bold">Compare more alternatives</h2>
            <p className="mt-3 text-muted-foreground">
              Different builders optimize for different hiring workflows. Compare more options before you commit to a long-term process.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {relatedPages.map((relatedPage) => (
                <Link
                  key={relatedPage.slug}
                  href={`/vs/${relatedPage.slug}`}
                  className="rounded-2xl border bg-card p-5 transition-colors hover:bg-background"
                >
                  <p className="font-semibold">{relatedPage.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {relatedPage.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
