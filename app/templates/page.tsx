import Link from "next/link";
import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TemplateMiniPreview } from "@/components/home/template-mini-preview";
import { TEMPLATES } from "@/lib/constants";
import { Star, ArrowLeft, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "All Templates | ResumeForge",
  description: "Browse all resume templates with mini previews.",
};

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 md:py-16">
        <div className="flex items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              Templates
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold">
              Browse all {TEMPLATES.length} templates
            </h1>
            <p className="text-muted-foreground mt-2">
              Same mini previews as the homepage, with quick actions to start.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button asChild>
              <Link href="/onboarding">
                Create a CV
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATES.map((template) => (
            <Card
              key={template.id}
              className="group cursor-pointer border-2 overflow-hidden h-full transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:scale-[1.02] hover:-translate-y-1"
            >
              <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
                  <TemplateMiniPreview templateId={template.id} />
                </div>

                {/* Subtle shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/0 group-hover:via-white/10 group-hover:to-transparent transition-all duration-700 pointer-events-none" />

                {/* Category badge */}
                <div className="absolute top-3 left-3 z-20">
                  <Badge
                    variant="secondary"
                    className="text-[10px] backdrop-blur-sm bg-background/80 shadow-sm border-0"
                  >
                    {template.style}
                  </Badge>
                </div>

                {/* Hover overlay with CTA */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-6 z-10">
                  <Button
                    size="sm"
                    className="shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-gray-900 hover:bg-white/90"
                    asChild
                  >
                    <Link href={`/editor/new?template=${template.id}`}>
                      Use This Template
                      <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="p-5 space-y-2 bg-gradient-to-b from-background to-muted/30">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {template.industry}
                    </p>
                  </div>
                  {template.featured && (
                    <Badge
                      variant="default"
                      className="text-[11px] bg-primary/10 text-primary border-0 hover:bg-primary/10"
                    >
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Popular
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template.description}
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Badge variant="outline" className="text-xs">
                    ATS-Friendly
                  </Badge>
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    {template.industry}
                  </Badge>
                </div>
                <div className="pt-3 flex gap-2">
                  <Button asChild size="sm" className="w-full">
                    <Link href={`/editor/new?template=${template.id}`}>
                      Use Template
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    <Link href={`/preview?template=${template.id}`}>
                      Preview
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

