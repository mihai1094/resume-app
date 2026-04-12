import { Metadata } from "next";
import { BackButton } from "@/components/shared/back-button";
import { TemplateGalleryContent } from "@/components/templates/template-gallery-content";
import { toAbsoluteUrl, getSiteUrl } from "@/lib/config/site-url";
import { TEMPLATES } from "@/lib/constants/templates";
import { JsonLd } from "@/components/seo/json-ld";

const baseUrl = getSiteUrl();

const templateListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Free ATS-Friendly Resume Templates",
  description: "22 free ATS-friendly resume templates with PDF export.",
  url: `${baseUrl}/templates`,
  numberOfItems: TEMPLATES.length,
  itemListElement: TEMPLATES.map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: t.name,
    url: `${baseUrl}/templates/${t.id}`,
  })),
};

export const metadata: Metadata = {
  title: "Free ATS-friendly resume templates for 2026",
  description:
    "22 free ATS-friendly resume templates. Free PDF export, no watermark, no credit card. Filter by layout, style, and photo support.",
  openGraph: {
    title: "Free ATS-friendly resume templates for 2026 | ResumeZeus",
    description:
      "22 free ATS-optimized templates. Free PDF export with no paywall. Pick a layout and start building in seconds.",
    url: toAbsoluteUrl("/templates"),
  },
  alternates: {
    canonical: toAbsoluteUrl("/templates"),
  },
};

export default function TemplatesPage() {
  return (
    <main className="h-[100dvh] bg-background relative overflow-hidden">
      <JsonLd data={templateListSchema} />
      {/* Subtle modern background accent */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/5 via-primary/[0.02] to-transparent pointer-events-none -z-10" />

      <div className="mx-auto w-full max-w-[2200px] px-4 sm:px-6 xl:px-8 2xl:px-10 py-3 md:py-4 relative z-10 h-full flex flex-col min-h-0">
        {/* Header */}
        <div className="mb-2 sm:mb-3 shrink-0 lg:hidden">
          <div className="flex items-center gap-3">
            <BackButton fallback="/" label="" size="icon" variant="secondary" className="rounded-full shadow-sm h-9 w-9 shrink-0 sm:hidden" />
            <BackButton fallback="/" label="Back" variant="secondary" size="sm" className="rounded-full shadow-sm hidden sm:inline-flex" />
            <div className="min-w-0">
              <h1 className="h-1">
                Resume Templates
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 hidden sm:block">
                22 ATS-friendly layouts with free PDF export
              </p>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="flex-1 min-h-0">
          <TemplateGalleryContent />
        </div>
      </div>
    </main>
  );
}
