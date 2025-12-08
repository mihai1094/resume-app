"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, X, FileText, Upload, Loader2, FileIcon } from "lucide-react";
import { BackButton } from "@/components/shared/back-button";
// import { GoalStep, Goal } from "./components/goal-step";
import { TemplateStep } from "./components/template-step";

import { JobTitleStep } from "./components/job-title-step";
import { WizardProgress } from "./components/wizard-progress";
import { TemplateId } from "@/lib/constants/templates";
import { ResumeData } from "@/lib/types/resume";
import Link from "next/link";
import { AuthGuard } from "@/components/auth/auth-guard";
import { toast } from "sonner";
import { importFromLinkedIn, importResume } from "@/lib/services/import";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { ImportSummaryDialog } from "./components/import-summary-dialog";

export function OnboardingContent() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [jobTitle, setJobTitle] = useState("");
  // const [goal, setGoal] = useState<Goal | null>(null);
  const [templateId, setTemplateId] = useState<TemplateId | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [parsedData, setParsedData] = useState<ResumeData | null>(null);

  // We actually have 3 steps now if we consider "Type" selection, 
  // but let's keep it simple: Step 1 is "Choice: Import vs Create", Step 2 is "Job Title" (if create), Step 3 is "Template"
  // To minimize friction, let's just add the Import card to Step 1 (Job Title) as an alternative.

  const totalSteps = 2;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === totalSteps) {
      // Create resume
      const params = new URLSearchParams({
        template: templateId || "",
        // goal: goal || "",
        ...(jobTitle && { jobTitle }),
      });
      router.push(`/editor/new?${params.toString()}`);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) return jobTitle.trim() !== "";
    if (currentStep === 2) return templateId !== null;
    return true;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const toastId = toast.loading("Parsing LinkedIn PDF...");

    try {
      const result = await importFromLinkedIn(file);

      if (result.success && result.data) {
        toast.success("Resume parsed successfully!", { id: toastId });
        setParsedData(result.data);
        // We don't redirect here anymore, we show the dialog
      } else {
        toast.error(result.error || "Failed to import resume", { id: toastId });
        console.error(result.error);
      }
    } catch (error) {
      toast.error("An unexpected error occurred", { id: toastId });
      console.error(error);
    } finally {
      setIsImporting(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleConfirmImport = () => {
    if (!parsedData) return;

    if (typeof window !== "undefined") {
      sessionStorage.setItem("importedResumeData", JSON.stringify(parsedData));
    }
    router.push("/editor/new?import=true");
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-xl font-bold">
                ResumeForge
              </Link>
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <X className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-6xl mx-auto space-y-12">

            {/* Steps */}
            <div className="min-h-[500px]">
              {currentStep === 1 && (
                <div className="space-y-8">
                  {/* New Import Option Header */}
                  <div className="text-center space-y-4 mb-8">
                    <h1 className="text-3xl font-bold">How do you want to start?</h1>
                    <p className="text-muted-foreground">Import your LinkedIn profile for a head start, or build from scratch.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {/* Option 1: Valid Import */}
                    <Card className="relative overflow-hidden border-2 border-dashed border-primary/20 hover:border-primary/50 transition-colors bg-blue-50/50 dark:bg-blue-950/10">
                      {isImporting && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 backdrop-blur-sm">
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="font-medium animate-pulse">Reading your career history...</p>
                          </div>
                        </div>
                      )}
                      <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4 h-full">
                        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <FileIcon className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-bold text-xl">Import LinkedIn PDF</h3>
                          <p className="text-sm text-muted-foreground">We'll extract your experience, skills, and education automatically.</p>
                        </div>
                        <div className="pt-4 w-full">
                          <Button className="w-full relative" size="lg">
                            <input
                              type="file"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              accept=".pdf"
                              onChange={handleFileUpload}
                            />
                            <Upload className="w-4 h-4 mr-2" />
                            Upload PDF
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">
                            Go to LinkedIn Profile {">"} More {">"} Save to PDF
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Option 2: Manual Start (Existing Flow) */}
                    <Card className="border-muted hover:border-primary/50 transition-colors">
                      <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4 h-full">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-foreground">
                          <FileText className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-bold text-xl">Start from Scratch</h3>
                          <p className="text-sm text-muted-foreground">Perfect if you want a fresh start or don't have a LinkedIn profile.</p>
                        </div>

                        <div className="pt-4 w-full space-y-4">
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-background px-2 text-muted-foreground">Then enter your role</span>
                            </div>
                          </div>
                          <JobTitleStep
                            selectedJobTitle={jobTitle}
                            onSelectJobTitle={setJobTitle}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
              {currentStep === 2 && (
                <>
                  <WizardProgress currentStep={currentStep} totalSteps={totalSteps} />
                  <div className="mt-8">
                    <TemplateStep
                      // goal={goal}
                      jobTitle={jobTitle}
                      selectedTemplate={templateId}
                      onSelectTemplate={setTemplateId}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between max-w-5xl mx-auto">
              <BackButton
                onClick={handleBack}
                className={currentStep === 1 ? "invisible" : ""}
              />

              <div className="flex items-center gap-4">
                <Link href="/editor/new">
                  <Button variant="ghost">Skip</Button>
                </Link>
                <Button onClick={handleNext} disabled={!canProceed()}>
                  {currentStep === totalSteps ? "Create Resume" : "Next"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Import Summary Dialog */}
        <ImportSummaryDialog
          isOpen={!!parsedData}
          data={parsedData}
          onConfirm={handleConfirmImport}
          onCancel={() => setParsedData(null)}
        />
      </div>
    </AuthGuard>
  );
}







