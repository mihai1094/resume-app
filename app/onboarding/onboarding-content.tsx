"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowLeft,
  FileText,
  Upload,
  Loader2,
  Sparkles,
  CheckCircle2,
  Briefcase,
  Zap,
  Shield,
  Target,
} from "lucide-react";
import { TemplateStep } from "./components/template-step";
import { JobTitleStep } from "./components/job-title-step";
import { TemplateId } from "@/lib/constants/templates";
import { ResumeData } from "@/lib/types/resume";
import Link from "next/link";
import { AuthGuard } from "@/components/auth/auth-guard";
import { toast } from "sonner";
import { importFromLinkedIn } from "@/lib/services/import";
import { ImportSummaryDialog } from "./components/import-summary-dialog";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, title: "Start", description: "Choose how to begin" },
  { id: 2, title: "Template", description: "Pick your design" },
];

const benefits = [
  { icon: Zap, text: "AI-powered content suggestions" },
  { icon: Shield, text: "ATS-optimized templates" },
  { icon: Target, text: "Tailored to your target role" },
];

export function OnboardingContent() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [jobTitle, setJobTitle] = useState("");
  const [templateId, setTemplateId] = useState<TemplateId | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [parsedData, setParsedData] = useState<ResumeData | null>(null);

  const totalSteps = 2;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === totalSteps) {
      const params = new URLSearchParams({
        template: templateId || "",
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
      } else {
        toast.error(result.error || "Failed to import resume", { id: toastId });
        console.error(result.error);
      }
    } catch (error) {
      toast.error("An unexpected error occurred", { id: toastId });
      console.error(error);
    } finally {
      setIsImporting(false);
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
      <div className="min-h-screen flex">
        {/* Left Panel - Branding & Progress */}
        <div className="hidden lg:flex lg:w-[35%] xl:w-[30%] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 flex flex-col justify-between p-10 xl:p-12 text-white w-full">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 text-xl font-bold">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              ResumeForge
            </Link>

            {/* Steps Progress */}
            <div className="space-y-8">
              <div>
                <p className="text-sm text-slate-400 uppercase tracking-wider mb-2">
                  Getting Started
                </p>
                <h1 className="text-3xl xl:text-4xl font-bold leading-tight">
                  Let's build your
                  <br />
                  <span className="text-primary">perfect resume</span>
                </h1>
              </div>

              {/* Vertical Step Indicator */}
              <div className="space-y-4">
                {steps.map((step, index) => {
                  const isCompleted = step.id < currentStep;
                  const isCurrent = step.id === currentStep;

                  return (
                    <div key={step.id} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300",
                            isCompleted
                              ? "bg-primary text-primary-foreground"
                              : isCurrent
                                ? "bg-primary text-primary-foreground ring-4 ring-primary/30"
                                : "bg-slate-700 text-slate-400"
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            step.id
                          )}
                        </div>
                        {index < steps.length - 1 && (
                          <div
                            className={cn(
                              "w-0.5 h-8 mt-2 transition-all duration-300",
                              isCompleted ? "bg-primary" : "bg-slate-700"
                            )}
                          />
                        )}
                      </div>
                      <div className="pt-2">
                        <p
                          className={cn(
                            "font-semibold transition-colors",
                            isCurrent ? "text-white" : "text-slate-400"
                          )}
                        >
                          {step.title}
                        </p>
                        <p className="text-sm text-slate-500">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Benefits */}
              <div className="space-y-3 pt-4 border-t border-slate-700/50">
                {benefits.map((benefit, i) => (
                  <motion.div
                    key={benefit.text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3 text-sm text-slate-400"
                  >
                    <benefit.icon className="w-4 h-4 text-primary" />
                    {benefit.text}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <p className="text-xs text-slate-600">
              Takes about 2 minutes to set up
            </p>
          </div>
        </div>

        {/* Right Panel - Form Content */}
        <div className="flex-1 flex flex-col bg-background overflow-y-auto">
          {/* Mobile Header */}
          <div className="lg:hidden sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <Link href="/" className="flex items-center gap-2 font-bold">
                  <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                  ResumeForge
                </Link>
                <span className="text-xs text-muted-foreground">
                  Step {currentStep} of {totalSteps}
                </span>
              </div>
              {/* Mobile Progress Bar */}
              <div className="flex gap-2">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-all duration-300",
                      step.id <= currentStep ? "bg-primary" : "bg-muted"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
            <div className="w-full max-w-4xl">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    {/* Step 1 Header */}
                    <div className="text-center space-y-3">
                      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        How would you like to start?
                      </h2>
                      <p className="text-muted-foreground max-w-lg mx-auto">
                        Import your LinkedIn profile for a quick start, or enter
                        your target role to build from scratch.
                      </p>
                    </div>

                    {/* Options Grid */}
                    <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                      {/* Import LinkedIn Option */}
                      <div
                        className={cn(
                          "relative group rounded-2xl border-2 border-dashed p-6 sm:p-8 transition-all duration-300",
                          "bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20",
                          "border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600",
                          "hover:shadow-lg hover:shadow-blue-500/10"
                        )}
                      >
                        {isImporting && (
                          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
                            <div className="flex flex-col items-center gap-3">
                              <Loader2 className="w-8 h-8 animate-spin text-primary" />
                              <p className="font-medium text-sm animate-pulse">
                                Reading your profile...
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col items-center text-center space-y-4">
                          <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                            <Upload className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="space-y-1.5">
                            <h3 className="text-lg font-semibold">
                              Import from LinkedIn
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              We'll extract your experience, skills, and education
                              automatically.
                            </p>
                          </div>
                          <Button
                            className="relative w-full sm:w-auto"
                            variant="outline"
                            size="lg"
                          >
                            <input
                              type="file"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              accept=".pdf"
                              onChange={handleFileUpload}
                            />
                            <Upload className="w-4 h-4 mr-2" />
                            Upload LinkedIn PDF
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            LinkedIn Profile → More → Save to PDF
                          </p>
                        </div>
                      </div>

                      {/* Start Fresh Option */}
                      <div
                        className={cn(
                          "rounded-2xl border-2 p-6 sm:p-8 transition-all duration-300",
                          "border-border hover:border-primary/50",
                          "hover:shadow-lg hover:shadow-primary/5"
                        )}
                      >
                        <div className="flex flex-col items-center text-center space-y-4">
                          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                            <FileText className="w-7 h-7 text-foreground" />
                          </div>
                          <div className="space-y-1.5">
                            <h3 className="text-lg font-semibold">
                              Start from Scratch
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Perfect for a fresh start or if you don't have
                              LinkedIn.
                            </p>
                          </div>

                          {/* Divider */}
                          <div className="w-full pt-2">
                            <div className="relative">
                              <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                              </div>
                              <div className="relative flex justify-center">
                                <span className="bg-background px-3 text-xs text-muted-foreground uppercase tracking-wider">
                                  Enter your target role
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Inline Job Title Input */}
                          <div className="w-full space-y-3">
                            <div className="relative">
                              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <input
                                type="text"
                                placeholder="e.g., Software Engineer"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 text-sm border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-background"
                              />
                            </div>
                            {jobTitle && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Great choice! Click Next to pick a template.
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Popular Roles */}
                    {!jobTitle && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center space-y-3"
                      >
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          Popular roles
                        </p>
                        <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                          {[
                            "Software Engineer",
                            "Product Manager",
                            "Data Scientist",
                            "UX Designer",
                            "Marketing Manager",
                            "Business Analyst",
                          ].map((role) => (
                            <button
                              key={role}
                              onClick={() => setJobTitle(role)}
                              className="px-3 py-1.5 text-sm rounded-full border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TemplateStep
                      jobTitle={jobTitle}
                      selectedTemplate={templateId}
                      onSelectTemplate={setTemplateId}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
            <div className="max-w-4xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className={cn(currentStep === 1 && "invisible")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <div className="flex items-center gap-3">
                  <Link href="/editor/new">
                    <Button variant="ghost" className="text-muted-foreground">
                      Skip setup
                    </Button>
                  </Link>
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="min-w-[120px]"
                  >
                    {currentStep === totalSteps ? "Create Resume" : "Next"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
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
