"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ModernTemplate } from "@/components/resume/templates/modern-template";
import { ClassicTemplate } from "@/components/resume/templates/classic-template";
import { ExecutiveTemplate } from "@/components/resume/templates/executive-template";
import { MinimalistTemplate } from "@/components/resume/templates/minimalist-template";
import { CreativeTemplate } from "@/components/resume/templates/creative-template";
import { TechnicalTemplate } from "@/components/resume/templates/technical-template";
import { AdaptiveTemplate } from "@/components/resume/templates/adaptive-template";
import { TimelineTemplate } from "@/components/resume/templates/timeline-template";
import { IvyTemplate } from "@/components/resume/templates/ivy-template";
import { mockResumeData } from "@/data/mock-resume";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Download, Eye, LayoutGrid, Grid3x3 } from "lucide-react";
import Link from "next/link";
import { TEMPLATES } from "@/lib/constants";

// All templates are now implemented
const templates = TEMPLATES;

// Template component mapping
const templateComponents = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  executive: ExecutiveTemplate,
  minimalist: MinimalistTemplate,
  creative: CreativeTemplate,
  technical: TechnicalTemplate,
  adaptive: AdaptiveTemplate,
  timeline: TimelineTemplate,
  ivy: IvyTemplate,
};

function PreviewContentInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedTemplate = searchParams.get("template") || null;
  const [viewMode, setViewMode] = useState<"gallery" | "single">(
    selectedTemplate ? "single" : "gallery"
  );
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  // Template renderer
  const renderTemplate = (templateId: string) => {
    const TemplateComponent = templateComponents[templateId as keyof typeof templateComponents];
    if (!TemplateComponent) return null;
    return <TemplateComponent data={mockResumeData} />;
  };

  const handleTemplateSelect = (templateId: string) => {
    router.push(`/preview?template=${templateId}`);
    setViewMode("single");
    setIsTemplateDialogOpen(false);
  };

  const handleViewAll = () => {
    router.push("/preview");
    setViewMode("gallery");
  };

  // Single template view
  if (viewMode === "single" && selectedTemplate) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Eye className="w-5 h-5" />
                <h1 className="text-2xl font-semibold">Template Preview</h1>
                <Badge variant="outline" className="capitalize">
                  {selectedTemplate}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleViewAll}>
                  <Grid3x3 className="w-4 h-4 mr-2" />
                  View All Templates
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={`/create?template=${selectedTemplate}`}>
                    <Download className="w-4 h-4 mr-2" />
                    Use This Template
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Preview Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            {/* Info Card */}
            <Card className="p-4 mb-6 bg-muted/50">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">
                  <strong>Note:</strong> This is a preview with mock data. Use
                  this page to see how the{" "}
                  <span className="font-semibold capitalize">{selectedTemplate}</span>{" "}
                  template looks when completed.
                </p>
                <p>
                  Ready to create your own?{" "}
                  <Link
                    href={`/create?template=${selectedTemplate}`}
                    className="text-primary underline font-medium"
                  >
                    Start with {templates.find((t) => t.id === selectedTemplate)?.name}{" "}
                    Template →
                  </Link>
                </p>
              </div>
            </Card>

            {/* Template Preview */}
            <div className="bg-gray-100 p-8 rounded-lg shadow-lg">
              <div className="bg-white shadow-2xl">{renderTemplate(selectedTemplate)}</div>
            </div>
          </div>
        </div>

        {/* Floating Template Selector Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            size="lg"
            onClick={() => setIsTemplateDialogOpen(true)}
            className="rounded-full shadow-lg h-14 w-14 p-0"
            title="Choose Template"
          >
            <LayoutGrid className="w-6 h-6" />
          </Button>
        </div>

        {/* Template Selection Dialog */}
        <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5" />
                Choose a Template
              </DialogTitle>
              <DialogDescription>
                Select a template to preview with sample data
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 max-h-[60vh] overflow-y-auto">
              {templates.map((t) => {
                const isActive = selectedTemplate === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateSelect(t.id)}
                    className={`text-left transition-all rounded-lg border p-4 ${
                      isActive
                        ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                        : "border-border hover:border-primary/50 hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold capitalize">{t.name}</h3>
                      {isActive && (
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{t.description}</p>
                  </button>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Gallery view - show all templates
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Grid3x3 className="w-5 h-5" />
              <h1 className="text-2xl font-semibold">All Templates Preview</h1>
              <Badge variant="outline">{templates.length} Templates</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Gallery Content */}
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 mb-6 bg-muted/50">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Browse all templates:</strong> Click on any template below to see a detailed preview.
              Each template is shown with sample data to help you choose the best design for your resume.
            </p>
            <p>
              All templates are fully customizable with colors, fonts, and spacing options.
            </p>
          </div>
        </Card>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {templates.map((template) => {
            const TemplateComponent = templateComponents[template.id as keyof typeof templateComponents];
            if (!TemplateComponent) return null;

            return (
              <Card
                key={template.id}
                className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
                onClick={() => handleTemplateSelect(template.id)}
              >
                {/* Template Header */}
                <div className="p-4 border-b bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg capitalize">{template.name}</h3>
                    <Badge variant="outline" className="capitalize text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>

                {/* Template Preview */}
                <div className="bg-gray-100 p-4 overflow-hidden">
                  <div
                    className="bg-white shadow-lg mx-auto overflow-hidden relative"
                    style={{
                      width: "100%",
                      height: "350px",
                    }}
                  >
                    <div
                      className="absolute top-0 left-0 pointer-events-none"
                      style={{
                        transform: "scale(0.3)",
                        transformOrigin: "top left",
                        width: "210mm", // Standard A4 width
                        minHeight: "297mm", // Standard A4 height
                      }}
                    >
                      <TemplateComponent data={mockResumeData} />
                    </div>
                  </div>
                </div>

                {/* Template Footer */}
                <div className="p-4 border-t bg-muted/30 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {template.industry} • {template.style}
                  </span>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/preview?template=${template.id}`}>
                      View Full →
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function PreviewContent() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading preview...</p>
          </div>
        </div>
      }
    >
      <PreviewContentInner />
    </Suspense>
  );
}



