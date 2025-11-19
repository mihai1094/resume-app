"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ModernTemplate } from "@/components/resume/templates/modern-template";
import { ClassicTemplate } from "@/components/resume/templates/classic-template";
import { ExecutiveTemplate } from "@/components/resume/templates/executive-template";
import { mockResumeData } from "@/data/mock-resume";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Eye } from "lucide-react";
import Link from "next/link";
import { TEMPLATES } from "@/lib/constants";

// Filter only implemented templates
const implementedTemplateIds = ["modern", "classic", "executive"];
const templates = TEMPLATES.filter((t) =>
  implementedTemplateIds.includes(t.id)
);

function PreviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const template = searchParams.get("template") || "modern";

  // Template renderer
  const renderTemplate = () => {
    switch (template) {
      case "classic":
        return <ClassicTemplate data={mockResumeData} />;
      case "executive":
        return <ExecutiveTemplate data={mockResumeData} />;
      case "modern":
      default:
        return <ModernTemplate data={mockResumeData} />;
    }
  };

  const handleTemplateChange = (templateId: string) => {
    router.push(`/preview?template=${templateId}`);
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
          {/* Template Selector */}
          <Card className="p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="font-semibold mb-1">Choose a Template</h2>
                <p className="text-sm text-muted-foreground">
                  Preview different templates with sample data
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {templates.map((t) => (
                  <Button
                    key={t.id}
                    variant={template === t.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTemplateChange(t.id)}
                    className="capitalize"
                  >
                    {t.name}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

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

          {/* Template Descriptions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map((t) => (
              <Card
                key={t.id}
                className={`p-4 cursor-pointer transition-all ${
                  template === t.id
                    ? "border-primary border-2 bg-primary/5"
                    : "hover:border-primary/50"
                }`}
                onClick={() => handleTemplateChange(t.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold capitalize">{t.name}</h3>
                  {template === t.id && (
                    <Badge variant="default" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {t.description}
                </p>
                <Button
                  variant={template === t.id ? "default" : "outline"}
                  size="sm"
                  className="w-full"
                  asChild
                >
                  <Link href={`/create?template=${t.id}`}>Use {t.name}</Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
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
