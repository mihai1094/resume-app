"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { importCV, ParsedCV } from "@/lib/services/cv-import";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { templates } from "@/lib/constants/templates";
import { ResumeData } from "@/lib/types/resume";

export default function ImportCVPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("modern");
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsed, setParsed] = useState<ParsedCV | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: template, 2: upload, 3: review
  const [showDebug, setShowDebug] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleProcess = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await importCV(file);
      setParsed(result);
      setStep(3);
    } catch (err: any) {
      setError(err.message || "Failed to process CV. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    if (!parsed) return;

    // Merge parsed data with default values
    const resumeData: ResumeData = {
      personalInfo: {
        firstName: parsed.data.personalInfo?.firstName || "",
        lastName: parsed.data.personalInfo?.lastName || "",
        email: parsed.data.personalInfo?.email || "",
        phone: parsed.data.personalInfo?.phone || "",
        location: parsed.data.personalInfo?.location || "",
        website: parsed.data.personalInfo?.website,
        linkedin: parsed.data.personalInfo?.linkedin,
        github: parsed.data.personalInfo?.github,
        summary: parsed.data.personalInfo?.summary,
      },
      workExperience: parsed.data.workExperience || [],
      education: parsed.data.education || [],
      skills: parsed.data.skills || [],
      languages: parsed.data.languages || [],
      courses: parsed.data.courses || [],
      hobbies: parsed.data.hobbies || [],
      extraCurricular: parsed.data.extraCurricular || [],
    };

    // Store in sessionStorage and redirect
    sessionStorage.setItem("resume-to-load", JSON.stringify(resumeData));
    router.push(`/create?template=${selectedTemplate}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-semibold">Import Your CV</h1>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                1
              </div>
              <span
                className={`text-sm font-medium ${
                  step >= 1 ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Select Template
              </span>
            </div>
            <div className="w-12 h-px bg-border" />
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                2
              </div>
              <span
                className={`text-sm font-medium ${
                  step >= 2 ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Upload CV
              </span>
            </div>
            <div className="w-12 h-px bg-border" />
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 3
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                3
              </div>
              <span
                className={`text-sm font-medium ${
                  step >= 3 ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Review & Import
              </span>
            </div>
          </div>

          {/* Step 1: Template Selection */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Choose Your Template</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select the template you want to use for your imported CV
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedTemplate === template.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{template.name}</h3>
                          <Badge variant="outline" className="mt-1 capitalize text-xs">
                            {template.category}
                          </Badge>
                        </div>
                        {selectedTemplate === template.id && (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <Button onClick={() => setStep(2)} size="lg">
                    Continue to Upload
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Upload CV */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Upload Your CV</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload your existing CV in PDF, DOCX, or TXT format
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* File Upload */}
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                      id="cv-upload"
                    />
                    <label
                      htmlFor="cv-upload"
                      className="cursor-pointer flex flex-col items-center gap-4"
                    >
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <p className="text-lg font-medium mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-muted-foreground">
                          PDF, DOCX, or TXT (max 10MB)
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Selected File */}
                  {file && (
                    <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                      <FileText className="w-8 h-8 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="w-5 h-5" />
                        <p className="font-medium">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Info */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div className="text-sm text-blue-900 dark:text-blue-100">
                        <p className="font-medium mb-1">AI-Powered Extraction</p>
                        <p className="text-blue-700 dark:text-blue-300">
                          Our system will automatically extract your personal information,
                          work experience, education, skills, and more from your CV.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={handleProcess}
                      disabled={!file || isProcessing}
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing CV...
                        </>
                      ) : (
                        <>
                          Process CV
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review & Import */}
          {step === 3 && parsed && (
            <Card>
              <CardHeader>
                <CardTitle>Step 3: Review Extracted Data</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Review the extracted information and import to the builder
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Confidence Score */}
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Extraction Confidence</span>
                      <span className="text-2xl font-bold text-primary">
                        {parsed.confidence}%
                      </span>
                    </div>
                    <Progress value={parsed.confidence} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {parsed.confidence >= 70
                        ? "Great! Most information was successfully extracted."
                        : "Some information may need manual adjustment in the builder."}
                    </p>
                  </div>

                  <Separator />

                  {/* Debug: Raw Text */}
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDebug(!showDebug)}
                    >
                      {showDebug ? "Hide" : "Show"} Raw Extracted Text (Debug)
                    </Button>
                    {showDebug && (
                      <Card className="p-4 max-h-96 overflow-auto">
                        <pre className="text-xs whitespace-pre-wrap font-mono">
                          {parsed.text}
                        </pre>
                      </Card>
                    )}
                  </div>

                  <Separator />

                  {/* Extracted Data Preview */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Extracted Information</h3>

                    {/* Personal Info */}
                    {parsed.data.personalInfo && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Personal Information
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {parsed.data.personalInfo.firstName && (
                            <div>
                              <span className="text-muted-foreground">Name:</span>{" "}
                              {parsed.data.personalInfo.firstName}{" "}
                              {parsed.data.personalInfo.lastName}
                            </div>
                          )}
                          {parsed.data.personalInfo.email && (
                            <div>
                              <span className="text-muted-foreground">Email:</span>{" "}
                              {parsed.data.personalInfo.email}
                            </div>
                          )}
                          {parsed.data.personalInfo.phone && (
                            <div>
                              <span className="text-muted-foreground">Phone:</span>{" "}
                              {parsed.data.personalInfo.phone}
                            </div>
                          )}
                          {parsed.data.personalInfo.linkedin && (
                            <div>
                              <span className="text-muted-foreground">LinkedIn:</span>{" "}
                              {parsed.data.personalInfo.linkedin}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Work Experience */}
                    {parsed.data.workExperience &&
                      parsed.data.workExperience.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Work Experience
                          </h4>
                          <div className="space-y-2">
                            {parsed.data.workExperience.map((exp) => (
                              <Card key={exp.id} className="p-3">
                                <div className="space-y-1">
                                  {exp.position && (
                                    <p className="font-medium text-sm">{exp.position}</p>
                                  )}
                                  {exp.company && (
                                    <p className="text-sm text-muted-foreground">
                                      {exp.company}
                                    </p>
                                  )}
                                  {exp.description && exp.description.length > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                      {exp.description.length} responsibility/achievement(s)
                                    </p>
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Education */}
                    {parsed.data.education && parsed.data.education.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Education
                        </h4>
                        <div className="space-y-2">
                          {parsed.data.education.map((edu) => (
                            <Card key={edu.id} className="p-3">
                              <div className="space-y-1">
                                {edu.degree && (
                                  <p className="font-medium text-sm">{edu.degree}</p>
                                )}
                                {edu.institution && (
                                  <p className="text-sm text-muted-foreground">
                                    {edu.institution}
                                  </p>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {parsed.data.skills && parsed.data.skills.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {parsed.data.skills.slice(0, 10).map((skill) => (
                            <Badge key={skill.id} variant="outline">
                              {skill.name}
                            </Badge>
                          ))}
                          {parsed.data.skills.length > 10 && (
                            <Badge variant="outline">
                              +{parsed.data.skills.length - 10} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Debug: Show if no data was extracted */}
                    {(!parsed.data.workExperience || parsed.data.workExperience.length === 0) &&
                     (!parsed.data.education || parsed.data.education.length === 0) && (
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                              Limited Data Extracted
                            </p>
                            <p className="text-yellow-700 dark:text-yellow-300">
                              The CV structure wasn't fully recognized. You'll need to manually add most information in the builder.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Info */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      You can review and edit all extracted information in the resume
                      builder. Missing or incorrect information can be easily corrected.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStep(2);
                        setParsed(null);
                      }}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Upload Different CV
                    </Button>
                    <Button onClick={handleImport} size="lg">
                      Import to Builder
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
