import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Mail, MapPin, ShieldCheck } from "lucide-react";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/config/app";
import { getBreadcrumbSchema } from "@/lib/seo/structured-data";
import { getSiteUrl, toAbsoluteUrl } from "@/lib/config/site-url";

export const metadata: Metadata = {
  title: "About ResumeZeus",
  description:
    "Learn about ResumeZeus, the mission behind the product, and the company information and contact details behind the service.",
  alternates: {
    canonical: toAbsoluteUrl("/about"),
  },
  openGraph: {
    title: "About ResumeZeus",
    description:
      "Learn about ResumeZeus, the mission behind the product, and the company information and contact details behind the service.",
    url: toAbsoluteUrl("/about"),
  },
};

export default function AboutPage() {
  const siteUrl = getSiteUrl();
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: toAbsoluteUrl("/") },
    { name: "About", url: toAbsoluteUrl("/about") },
  ]);
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: appConfig.name,
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: appConfig.description,
    email: appConfig.supportEmail,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: appConfig.supportEmail,
        availableLanguage: ["en"],
      },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: appConfig.company.address,
      addressCountry: "RO",
    },
    sameAs: [appConfig.urls.github, appConfig.urls.twitter].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
        <Header />
        <main className="container mx-auto px-4 py-12 md:py-16">
          <section className="max-w-4xl mx-auto text-center space-y-6">
            <Badge variant="secondary">About ResumeZeus</Badge>
            <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">
              ResumeZeus helps job seekers move faster from draft to application
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              ResumeZeus is built for candidates who want a practical workflow:
              create a resume, export a PDF, improve content with AI when useful,
              and keep the process simple enough to repeat for every application.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link href="/register">Create free account</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/templates">Browse templates</Link>
              </Button>
            </div>
          </section>

          <section className="max-w-5xl mx-auto mt-14 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border bg-card p-6 space-y-3">
              <Building2 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">What we are building</h2>
              <p className="text-sm text-muted-foreground">
                A resume and cover letter workflow that stays useful for real applications,
                not just for generating a draft once.
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-6 space-y-3">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">What we prioritize</h2>
              <p className="text-sm text-muted-foreground">
                Clear templates, practical export flows, and AI assistance that speeds up
                editing instead of hiding the final content from the user.
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-6 space-y-3">
              <Mail className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">How to reach us</h2>
              <p className="text-sm text-muted-foreground">
                Contact the team at{" "}
                <a href={`mailto:${appConfig.supportEmail}`} className="text-foreground hover:underline">
                  {appConfig.supportEmail}
                </a>
                {" "}for product and support questions.
              </p>
            </div>
          </section>

          <section className="max-w-4xl mx-auto mt-14 rounded-3xl border bg-muted/30 p-6 md:p-8 space-y-4">
            <h2 className="text-2xl font-serif font-bold">Why ResumeZeus exists</h2>
            <p className="text-muted-foreground">
              Applying for jobs usually means repeating the same cycle: update a resume,
              adjust language for the role, export a PDF, then write a matching cover letter.
              ResumeZeus is meant to reduce that friction and keep the workflow in one place.
            </p>
            <p className="text-muted-foreground">
              The product is especially focused on candidates who want a fast first draft,
              clearer ATS-friendly formatting, and enough editing control to tailor each
              application without starting from zero every time.
            </p>
          </section>

          <section className="max-w-4xl mx-auto mt-14 rounded-3xl border bg-card p-6 md:p-8 space-y-5">
            <h2 className="text-2xl font-serif font-bold">Company information</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Operator</p>
                <p className="text-sm text-muted-foreground">{appConfig.company.legalName}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Support email</p>
                <a
                  href={`mailto:${appConfig.supportEmail}`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {appConfig.supportEmail}
                </a>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Tax ID (CUI)</p>
                <p className="text-sm text-muted-foreground">{appConfig.company.cui}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Trade Register</p>
                <p className="text-sm text-muted-foreground">{appConfig.company.regCom}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Registered address</p>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{appConfig.company.address}</span>
              </div>
            </div>
          </section>

          <section className="max-w-4xl mx-auto mt-14 rounded-3xl border bg-card p-6 md:p-8 space-y-4">
            <h2 className="text-2xl font-serif font-bold">Policies and contact</h2>
            <p className="text-muted-foreground">
              If you need details about privacy, terms, cookies, or data handling, the main
              legal pages are linked below. For support or product questions, contact us directly.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href="/privacy">Privacy Policy</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/terms">Terms of Service</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/cookies">Cookie Policy</Link>
              </Button>
              <Button asChild variant="outline">
                <a href={`mailto:${appConfig.supportEmail}`}>Contact Support</a>
              </Button>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
