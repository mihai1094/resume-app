import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Download, Eye, Palette, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/shared/footer";
import { Header } from "@/components/shared/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TEMPLATES, getATSBadgeInfo, getCustomizationInfo } from "@/lib/constants/templates";
import { getTemplateDefaultColor } from "@/lib/constants/color-palettes";
import { generateTemplateMetadata } from "@/lib/seo/metadata";
import { getBreadcrumbSchema } from "@/lib/seo/structured-data";
import { toAbsoluteUrl } from "@/lib/config/site-url";
import { TemplateMiniPreview } from "@/components/home/template-mini-preview";

type PageProps = {
  params: Promise<{ id: string }>;
};

const styleLabels = {
  modern: "Modern",
  classic: "Classic",
  creative: "Creative",
  "ats-optimized": "ATS Optimized",
} as const;

const layoutLabels = {
  "single-column": "Single-column layout",
  "two-column": "Two-column layout",
  sidebar: "Sidebar layout",
} as const;

export function generateStaticParams() {
  return TEMPLATES.map((template) => ({ id: template.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const template = TEMPLATES.find((entry) => entry.id === id);

  if (!template) {
    return {
      title: "Template Not Found | ResumeZeus",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return generateTemplateMetadata(
    template.id,
    template.name,
    template.description,
    template.industry,
    `/templates/${template.id}`
  );
}

export default async function TemplateDetailPage({ params }: PageProps) {
  const { id } = await params;
  const template = TEMPLATES.find((entry) => entry.id === id);

  if (!template) {
    notFound();
  }

  const atsInfo = getATSBadgeInfo(template.features.atsCompatibility);
  const customizationInfo = getCustomizationInfo(template.features.customizationSupport);
  const defaultPalette = getTemplateDefaultColor(template.id);
  const relatedTemplates = TEMPLATES.filter(
    (entry) => entry.id !== template.id && entry.styleCategory === template.styleCategory
  ).slice(0, 3);
  const supportedCustomizations = Object.entries(template.features.supportedCustomizations)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key);

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: toAbsoluteUrl("/") },
    { name: "Templates", url: toAbsoluteUrl("/templates") },
    { name: template.name, url: toAbsoluteUrl(`/templates/${template.id}`) },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
        <Header />
        <main className="container mx-auto px-4 py-12 md:py-16">
          <section className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_420px] items-start">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{styleLabels[template.styleCategory]}</Badge>
                <Badge variant="outline">{template.industry}</Badge>
                <Badge className={`${atsInfo.bgColor} ${atsInfo.color} border-0`}>
                  {atsInfo.label}
                </Badge>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">
                  {template.name} Resume Template
                </h1>
                <p className="text-lg text-muted-foreground max-w-3xl">
                  {template.description}. This template is designed for {template.targetIndustries.join(", ").toLowerCase()} roles
                  and gives you a {layoutLabels[template.layout].toLowerCase()} with {template.features.hasPDFTemplate ? "PDF export support" : "preview-only support"}.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="gap-2">
                  <Link href={`/editor/new?template=${template.id}`}>
                    Use this template
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2">
                  <Link href={`/preview?template=${template.id}`}>
                    Preview full size
                    <Eye className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border bg-card p-5 shadow-sm">
              <div className="aspect-[8.5/11] overflow-hidden rounded-2xl border bg-white">
                <TemplateMiniPreview
                  templateId={template.id}
                  primaryColor={defaultPalette.primary}
                  secondaryColor={defaultPalette.secondary}
                />
              </div>
            </div>
          </section>

          <section className="max-w-6xl mx-auto mt-14 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border bg-card p-6 space-y-3">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">ATS compatibility</h2>
              <p className="text-sm text-muted-foreground">{atsInfo.description}</p>
            </div>
            <div className="rounded-2xl border bg-card p-6 space-y-3">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">{customizationInfo.label}</h2>
              <p className="text-sm text-muted-foreground">{customizationInfo.description}</p>
            </div>
            <div className="rounded-2xl border bg-card p-6 space-y-3">
              <Download className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Export workflow</h2>
              <p className="text-sm text-muted-foreground">
                {template.features.hasPDFTemplate
                  ? "This template supports PDF export as part of the normal ResumeZeus workflow."
                  : "This template is designed mainly for on-screen preview and may use a fixed PDF fallback."}
              </p>
            </div>
          </section>

          <section className="max-w-6xl mx-auto mt-14 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-3xl border bg-muted/30 p-6 md:p-8 space-y-5">
              <h2 className="text-2xl font-serif font-bold">
                What is the {template.name} template best for?
              </h2>
              <p className="text-muted-foreground">
                The {template.name} template works best for {template.targetIndustries.join(", ").toLowerCase()} candidates who want a{" "}
                {styleLabels[template.styleCategory].toLowerCase()} presentation. Its {layoutLabels[template.layout].toLowerCase()} makes it a strong fit for applicants who want a clear visual hierarchy and a template that can still be adapted for different roles.
              </p>
              <p className="text-muted-foreground">
                ResumeZeus lets you start with this structure, then adjust colors, content, and supported spacing controls before exporting a job-ready PDF.
              </p>
              <ul className="space-y-3 text-sm md:text-base text-muted-foreground">
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 shrink-0" />
                  Best-fit industries: {template.targetIndustries.join(", ")}
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 shrink-0" />
                  Layout: {layoutLabels[template.layout]}
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 shrink-0" />
                  Photo support: {template.features.supportsPhoto ? "Supported" : "Not supported"}
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 shrink-0" />
                  Default color theme: {defaultPalette.name}
                </li>
              </ul>
            </div>

            <aside className="rounded-3xl border bg-card p-6 space-y-4">
              <h2 className="text-xl font-serif font-bold">Template details</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Industry focus</p>
                  <p className="text-muted-foreground">{template.industry}</p>
                </div>
                <div>
                  <p className="font-medium">Style</p>
                  <p className="text-muted-foreground">{template.style}</p>
                </div>
                <div>
                  <p className="font-medium">Customization</p>
                  <p className="text-muted-foreground">
                    {supportedCustomizations.length > 0
                      ? supportedCustomizations.join(", ")
                      : "Fixed styling"}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Popularity score</p>
                  <p className="text-muted-foreground">{template.popularity}/100</p>
                </div>
              </div>
            </aside>
          </section>

          <section className="max-w-6xl mx-auto mt-14">
            <h2 className="text-2xl font-serif font-bold mb-4">Related templates</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {relatedTemplates.map((related) => (
                <Link
                  key={related.id}
                  href={`/templates/${related.id}`}
                  className="rounded-2xl border bg-card p-5 hover:border-primary/40 transition-colors"
                >
                  <h3 className="font-semibold mb-2">{related.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {related.description}. Best for {related.targetIndustries.slice(0, 2).join(" and ").toLowerCase()} roles.
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
