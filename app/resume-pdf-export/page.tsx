import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Download, CheckCircle2, FileText, ShieldCheck } from "lucide-react";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toAbsoluteUrl } from "@/lib/config/site-url";
import { getBreadcrumbSchema } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: "Resume PDF Export (Free) | ResumeZeus",
  description:
    "Export your resume to PDF for free with ResumeZeus. Build, preview, and download job-ready resume PDFs from your free account.",
  keywords: [
    "resume pdf export",
    "free resume pdf export",
    "resume builder pdf download",
    "export resume to pdf free",
    "cv pdf export",
  ],
  alternates: {
    canonical: toAbsoluteUrl("/resume-pdf-export"),
  },
  openGraph: {
    title: "Resume PDF Export (Free) | ResumeZeus",
    description:
      "Create and export resume PDFs for free with ResumeZeus.",
    url: toAbsoluteUrl("/resume-pdf-export"),
  },
};

export default function ResumePdfExportPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: toAbsoluteUrl("/") },
    { name: "Resume PDF Export", url: toAbsoluteUrl("/resume-pdf-export") },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-blue-50/30 via-background to-background dark:from-blue-950/10">
        <Header />
        <main className="container mx-auto px-4 py-12 md:py-16">
          <section className="max-w-4xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="gap-1">
              <Download className="w-3 h-3" />
              Free PDF Export
            </Badge>
            <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">
              Export Resume PDFs for Free
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              ResumeZeus lets you build and export professional resume PDFs from
              your free account. Use templates, live preview, and AI assistance,
              then download a job-ready PDF when you are finished editing.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link href="/register">
                  Create free account
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/preview">Preview templates</Link>
              </Button>
            </div>
          </section>

          <section className="max-w-5xl mx-auto mt-14 space-y-6">
            <div className="max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-serif font-bold">
                Can I export my resume as PDF for free?
              </h2>
              <p className="mt-3 text-muted-foreground">
                Yes. ResumeZeus includes PDF export in the free account, so you can move from draft
                to job-ready file without paying first. That makes it useful for applicants who want
                one clean workflow from editing to sending applications.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  icon: FileText,
                  title: "Build with live preview",
                  desc: "Edit your content and see your resume update in real time before export.",
                },
                {
                  icon: ShieldCheck,
                  title: "ATS-friendly templates",
                  desc: "Start with templates designed for clean parsing and recruiter readability.",
                },
                {
                  icon: CheckCircle2,
                  title: "Export when ready",
                  desc: "Download a polished PDF to send with applications or save for later.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border bg-card p-5 space-y-3">
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

          <section className="max-w-4xl mx-auto mt-14 rounded-3xl border bg-muted/30 p-6 md:p-8 space-y-4">
            <h2 className="text-2xl font-serif font-bold">Who is free PDF resume export best for?</h2>
            <p className="text-muted-foreground">
              It is best for candidates who need a fast, practical workflow: create an account,
              edit content, export PDF, and apply. That includes students, software engineers,
              product candidates, and internship applicants who want less setup friction.
            </p>
            <p className="text-muted-foreground">
              Students, junior developers, and tech professionals who want a
              simple resume workflow: create an account, build a resume quickly,
              export PDF, and apply. If you want extra help writing content, the
              free account also includes AI credits at signup.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Students</Badge>
              <Badge variant="outline">Software engineers</Badge>
              <Badge variant="outline">Data & product roles</Badge>
              <Badge variant="outline">Tech internships</Badge>
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
                  Full overview of the free account, including PDF export and AI credits at signup.
                </p>
              </Link>
              <Link
                href="/ai-resume-builder"
                className="rounded-2xl border p-5 hover:border-primary/40 transition-colors"
              >
                <h3 className="font-semibold mb-2">AI Resume Builder</h3>
                <p className="text-sm text-muted-foreground">
                  Explore the AI writing features and how credits are used before you upgrade.
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
