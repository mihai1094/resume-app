"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ModernTemplate } from "@/components/resume/templates/modern-template";
import { ClassicTemplate } from "@/components/resume/templates/classic-template";
import { ExecutiveTemplate } from "@/components/resume/templates/executive-template";
import { MinimalistTemplate } from "@/components/resume/templates/minimalist-template";
import { CreativeTemplate } from "@/components/resume/templates/creative-template";
import { TechnicalTemplate } from "@/components/resume/templates/technical-template";
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
import { ArrowLeft, Download, Eye, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { TEMPLATES } from "@/lib/constants";

// Filter only implemented templates
const implementedTemplateIds = [
  "modern",
  "classic",
  "executive",
  "minimalist",
  "creative",
  "technical",
];
const templates = TEMPLATES.filter((t) =>
  implementedTemplateIds.includes(t.id)
);

function PreviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const template = searchParams.get("template") || "modern";
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  // Template renderer
  const renderTemplate = () => {
    switch (template) {
      case "classic":
        return <ClassicTemplate data={mockResumeData} />;
      case "executive":
        return <ExecutiveTemplate data={mockResumeData} />;
      case "minimalist":
        return <MinimalistTemplate data={mockResumeData} />;
      case "creative":
        return <CreativeTemplate data={mockResumeData} />;
      case "technical":
        return <TechnicalTemplate data={mockResumeData} />;
      case "modern":
      default:
        return <ModernTemplate data={mockResumeData} />;
    }
  };

  const handleTemplateChange = (templateId: string) => {
    router.push(`/preview?template=${templateId}`);
    setIsTemplateDialogOpen(false);
  };

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
                {template}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={`/create?template=${template}`}>
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
                <span className="font-semibold capitalize">{template}</span>{" "}
                template looks when completed.
              </p>
              <p>
                Ready to create your own?{" "}
                <Link
                  href={`/create?template=${template}`}
                  className="text-primary underline font-medium"
                >
                  Start with {templates.find((t) => t.id === template)?.name}{" "}
                  Template →
                </Link>
              </p>
            </div>
          </Card>

          {/* Template Preview */}
          <div className="bg-gray-100 p-8 rounded-lg shadow-lg">
            <div className="bg-white shadow-2xl">{renderTemplate()}</div>
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
              const isActive = template === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleTemplateChange(t.id)}
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

export default function PreviewPage() {
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
      <PreviewContent />
    </Suspense>
  );
}
