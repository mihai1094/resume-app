import { Metadata } from "next";
import { BackButton } from "@/components/shared/back-button";
import { TemplateGalleryContent } from "@/components/templates/template-gallery-content";
import { toAbsoluteUrl } from "@/lib/config/site-url";

export const metadata: Metadata = {
  title: "Choose Your Template | ResumeForge",
  description:
    "Browse and customize professional resume templates. Filter by layout, style, and industry. Choose colors and start building your resume instantly.",
  openGraph: {
    title: "Choose Your Template | ResumeForge",
    description:
      "Browse and customize professional resume templates with instant color preview.",
    url: toAbsoluteUrl("/templates"),
  },
  alternates: {
    canonical: toAbsoluteUrl("/templates"),
  },
};

export default function TemplatesPage() {
  return (
    <div className="h-[100dvh] bg-background relative overflow-hidden">
      {/* Subtle modern background accent */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/5 via-primary/[0.02] to-transparent pointer-events-none -z-10" />

      <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12 relative z-10 h-full flex flex-col min-h-0">
        {/* Header */}
        <div className="mb-10 shrink-0">
          <div className="flex items-center gap-3 mb-6">
            <BackButton fallback="/" label="Back" variant="secondary" size="sm" className="rounded-full shadow-sm" />
          </div>
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70">
              Choose Your Template
            </h1>
            <p className="text-lg text-muted-foreground mt-3 leading-relaxed">
              Select a template and customize the colors. You can always change it later.
            </p>
          </div>
        </div>

        {/* Gallery */}
        <div className="flex-1 min-h-0">
          <TemplateGalleryContent />
        </div>
      </div>
    </div>
  );
}
