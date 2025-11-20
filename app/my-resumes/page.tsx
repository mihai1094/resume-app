"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { useSavedResumes } from "@/hooks/use-saved-resumes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  ArrowLeft,
  Trash2,
  Download,
  Edit,
  Plus,
  UserCircle,
  Sparkles,
  Menu,
} from "lucide-react";
import { exportToPDF } from "@/lib/services/export";
import { JobMatcher } from "@/components/ai/job-matcher";
import { analyzeJobMatch, calculateATSScore, JobAnalysis } from "@/lib/ai/mock-analyzer";
import { ResumeData } from "@/lib/types/resume";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingPage } from "@/components/shared/loading";
import { ResumeCardSkeleton } from "@/components/loading-skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Lightbulb,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function MyResumesPage() {
  const router = useRouter();
  const { user, isLoading: userLoading, createUser, isAuthenticated } = useUser();
  const {
    resumes,
    isLoading: resumesLoading,
    deleteResume,
  } = useSavedResumes(user?.id || null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exportingPdfId, setExportingPdfId] = useState<string | null>(null);

  // Optimize flow state
  const [optimizeDialogOpen, setOptimizeDialogOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Create user account if not exists
  useEffect(() => {
    if (!isAuthenticated && !userLoading && typeof window !== "undefined") {
      // Create a default user account
      createUser("user@example.com", "User");
    }
  }, [isAuthenticated, userLoading, createUser]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;

    setDeletingId(id);
    try {
      deleteResume(id);
    } catch (error) {
      console.error("Failed to delete resume:", error);
      alert("Failed to delete resume");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLoadResume = (resumeData: any) => {
    // Store the resume data temporarily and redirect to create page
    sessionStorage.setItem("resume-to-load", JSON.stringify(resumeData));
    router.push("/create");
  };

  const handleExportPDF = async (resume: any) => {
    setExportingPdfId(resume.id);
    try {
      const result = await exportToPDF(resume.data, resume.templateId, {
        fileName: `${resume.name}-${resume.id}.pdf`,
      });

      if (result.success && result.blob) {
        const url = URL.createObjectURL(result.blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${resume.name}-${resume.id}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        alert(result.error || "Failed to export PDF");
      }
    } catch (error) {
      console.error("PDF export error:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setExportingPdfId(null);
    }
  };

  const handleOptimize = () => {
    if (!jobDescription.trim() || !selectedResumeId) return;

    const selectedResume = resumes.find((r) => r.id === selectedResumeId);
    if (!selectedResume) return;

    setIsAnalyzing(true);
    setAnalysis(null);

    // Simulate AI processing delay
    setTimeout(() => {
      const result = analyzeJobMatch(jobDescription, selectedResume.data);
      setAnalysis(result);
      setIsAnalyzing(false);
    }, 1500);
  };

  const selectedResume = resumes.find((r) => r.id === selectedResumeId);
  const atsScore = selectedResume ? calculateATSScore(selectedResume.data) : null;

  if (userLoading || resumesLoading) {
    return <LoadingPage text="Loading your resumes..." />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-2.5 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Left: Back Arrow (Mobile) / Icon & Title */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              {/* Mobile: Back Arrow */}
              <Link href="/" className="sm:hidden">
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              {/* Desktop: User Icon */}
              <UserCircle className="w-6 h-6 flex-shrink-0 hidden sm:block" />

              <div className="min-w-0">
                <h1 className="text-base sm:text-2xl font-semibold truncate">My Resumes</h1>
                {user && (
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                    {user.name} • {user.email}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Desktop buttons */}
              <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <Dialog open={optimizeDialogOpen} onOpenChange={setOptimizeDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="default" className="gap-2 hidden sm:inline-flex">
                    <Sparkles className="w-4 h-4" />
                    Optimize Resume for Job
                    <Badge variant="secondary" className="ml-1 text-xs">
                      AI
                    </Badge>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                      <Sparkles className="w-6 h-6 text-primary" />
                      Optimize Resume for Job
                    </DialogTitle>
                    <DialogDescription>
                      Paste a job description and select which resume to optimize
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6 mt-4">
                    {/* Step 1: Select Resume */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">
                        Step 1: Select Resume to Optimize
                      </label>
                      <Select
                        value={selectedResumeId}
                        onValueChange={setSelectedResumeId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a resume..." />
                        </SelectTrigger>
                        <SelectContent>
                          {resumes
                            .filter(
                              (r) =>
                                r.data?.personalInfo?.firstName &&
                                r.data?.personalInfo?.lastName &&
                                (r.data?.workExperience?.length > 0 ||
                                  r.data?.education?.length > 0)
                            )
                            .map((resume) => (
                              <SelectItem key={resume.id} value={resume.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{resume.name}</span>
                                  <Badge variant="outline" className="ml-2 capitalize text-xs">
                                    {resume.templateId}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {selectedResume && atsScore && (
                        <Card className="p-4 border-2 mt-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-sm">Current ATS Score</h3>
                              <p className="text-xs text-muted-foreground">
                                {selectedResume.name}
                              </p>
                            </div>
                            <div className="text-right">
                              <div
                                className={cn(
                                  "text-3xl font-bold",
                                  atsScore.score >= 80
                                    ? "text-green-600"
                                    : atsScore.score >= 60
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                )}
                              >
                                {atsScore.score}
                              </div>
                              <div className="text-xs text-muted-foreground">out of 100</div>
                            </div>
                          </div>
                          <Progress value={atsScore.score} className="h-2 mt-2" />
                        </Card>
                      )}
                    </div>

                    {/* Step 2: Job Description */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                          Step 2: Paste Job Description
                        </label>
                        <Badge variant="outline" className="text-xs">
                          <Target className="w-3 h-3 mr-1" />
                          Better matching = Higher callbacks
                        </Badge>
                      </div>
                      <Textarea
                        placeholder="Paste the full job description here...

Example:
We are seeking a Senior Full Stack Developer with 5+ years of experience in React, Node.js, and TypeScript. Must have experience with AWS, Docker, and CI/CD pipelines. Strong communication skills required..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="min-h-[200px] font-mono text-sm"
                      />
                    </div>

                    {/* Analyze Button */}
                    <Button
                      onClick={handleOptimize}
                      disabled={
                        !jobDescription.trim() ||
                        !selectedResumeId ||
                        isAnalyzing
                      }
                      className="w-full"
                      size="lg"
                    >
                      {isAnalyzing ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Analyze Match & Get Suggestions
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>

                    {/* Analysis Results */}
                    {analysis && selectedResume && (
                      <div className="space-y-6 animate-in fade-in duration-500 border-t pt-6">
                        {/* Match Score */}
                        <Card
                          className={cn(
                            "p-6 border-2",
                            analysis.score >= 80
                              ? "border-green-600/50 bg-green-50/50 dark:bg-green-950/20"
                              : analysis.score >= 60
                              ? "border-yellow-600/50 bg-yellow-50/50 dark:bg-yellow-950/20"
                              : "border-red-600/50 bg-red-50/50 dark:bg-red-950/20"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-lg flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Job Match Score
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {analysis.score >= 80
                                  ? "Excellent match! Your resume aligns well with this job."
                                  : analysis.score >= 60
                                  ? "Good match with room for improvement"
                                  : "Consider optimizing your resume for better results"}
                              </p>
                            </div>
                            <div className="text-right">
                              <div
                                className={cn(
                                  "text-5xl font-bold",
                                  analysis.score >= 80
                                    ? "text-green-600"
                                    : analysis.score >= 60
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                )}
                              >
                                {analysis.score}%
                              </div>
                              <div className="text-xs text-muted-foreground">match rate</div>
                            </div>
                          </div>
                          <Progress value={analysis.score} className="mt-4 h-3" />
                        </Card>

                        {/* Strengths */}
                        {analysis.strengths.length > 0 && (
                          <Card className="p-6">
                            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              Your Strengths
                            </h3>
                            <div className="space-y-2">
                              {analysis.strengths.map((strength, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                                  <span className="text-sm">{strength}</span>
                                </div>
                              ))}
                            </div>
                          </Card>
                        )}

                        {/* Missing Keywords */}
                        {analysis.missingKeywords.length > 0 && (
                          <Card className="p-6">
                            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                              <AlertCircle className="w-5 h-5 text-yellow-600" />
                              Missing Keywords
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              These important keywords from the job description are missing from
                              your resume:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {analysis.missingKeywords.map((keyword, index) => (
                                <Badge key={index} variant="outline" className="gap-1">
                                  {keyword}
                                  <button
                                    className="ml-1 hover:text-primary"
                                    onClick={() => {
                                      navigator.clipboard.writeText(keyword);
                                    }}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </Card>
                        )}

                        {/* AI Suggestions */}
                        <Card className="p-6">
                          <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                            <Lightbulb className="w-5 h-5 text-primary" />
                            AI Suggestions ({analysis.suggestions.length})
                          </h3>
                          <div className="space-y-4">
                            {analysis.suggestions.map((suggestion) => (
                              <div
                                key={suggestion.id}
                                className={cn(
                                  "p-4 rounded-lg border-2 transition-colors",
                                  suggestion.severity === "high"
                                    ? "border-red-200 bg-red-50/50 dark:bg-red-950/20"
                                    : suggestion.severity === "medium"
                                    ? "border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20"
                                    : "border-blue-200 bg-blue-50/50 dark:bg-blue-950/20"
                                )}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant={
                                          suggestion.severity === "high"
                                            ? "destructive"
                                            : suggestion.severity === "medium"
                                            ? "secondary"
                                            : "outline"
                                        }
                                        className="text-xs"
                                      >
                                        {suggestion.severity} priority
                                      </Badge>
                                      <Badge variant="outline" className="text-xs capitalize">
                                        {suggestion.type}
                                      </Badge>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold">{suggestion.title}</h4>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {suggestion.description}
                                      </p>
                                    </div>

                                    {/* Before/After comparison */}
                                    {(suggestion.current || suggestion.suggested) && (
                                      <div className="mt-3 space-y-2">
                                        {suggestion.current && (
                                          <div className="text-sm">
                                            <span className="font-medium text-muted-foreground">
                                              Current:
                                            </span>
                                            <p className="mt-1 p-2 bg-background rounded border italic">
                                              {suggestion.current}
                                            </p>
                                          </div>
                                        )}
                                        {suggestion.suggested && (
                                          <div className="text-sm">
                                            <span className="font-medium text-primary">
                                              Suggested:
                                            </span>
                                            <p className="mt-1 p-2 bg-primary/5 rounded border border-primary/20 font-medium">
                                              {suggestion.suggested}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    <div className="flex items-center gap-2 mt-3">
                                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-sm font-medium">
                                        {suggestion.action}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <Button
                            className="flex-1"
                            onClick={() => {
                              handleLoadResume(selectedResume.data);
                              setOptimizeDialogOpen(false);
                            }}
                          >
                            Edit Resume to Apply Changes
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setJobDescription("");
                              setAnalysis(null);
                              setSelectedResumeId("");
                            }}
                          >
                            Analyze Another Job
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Info Footer */}
                    <div className="text-center text-xs text-muted-foreground pt-4 border-t">
                      <Badge variant="outline" className="mb-2">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Mock AI - Real AI coming in V1.5
                      </Badge>
                      <p>
                        Currently using mock AI for demo purposes. Real AI optimization with
                        OpenAI GPT-4 will be available in the next release.
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Resume
                </Link>
              </Button>

              {/* Mobile: Hamburger menu */}
              <div className="sm:hidden flex items-center gap-2">
                <Button size="sm" asChild>
                  <Link href="/create">
                    <Plus className="w-4 h-4" />
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.name || "User"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email || "user@example.com"}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/create">
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Create New Resume</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setOptimizeDialogOpen(true)}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      <span>Optimize Resume</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        <span>Back to Home</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {resumes.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="w-16 h-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No Resumes Yet</h2>
              <p className="text-muted-foreground text-center mb-6">
                You haven't saved any resumes yet. Create your first resume to
                get started!
              </p>
              <div className="flex gap-3">
                <Button asChild>
                  <Link href="/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Resume
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/utils/add-dummy-cv">
                    Add Dummy CV (Dev)
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <Card
                key={resume.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {resume.name}
                      </CardTitle>
                      <Badge variant="outline" className="capitalize">
                        {resume.templateId}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(resume.id)}
                      disabled={deletingId === resume.id}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      <p>
                        Created:{" "}
                        {format(new Date(resume.createdAt), "MMM d, yyyy")}
                      </p>
                      <p>
                        Updated:{" "}
                        {format(new Date(resume.updatedAt), "MMM d, yyyy")}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      {/* Optimize Button - Only show if resume has meaningful content */}
                      {resume.data?.personalInfo?.firstName &&
                       resume.data?.personalInfo?.lastName &&
                       (resume.data?.workExperience?.length > 0 || resume.data?.education?.length > 0) && (
                        <JobMatcher
                          resumeData={resume.data}
                          buttonClassName="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/50 hover:shadow-purple-600/60 transition-all duration-300"
                        />
                      )}
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleLoadResume(resume.data)}
                        className="w-full"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Resume
                      </Button>

                      <Separator className="my-2" />

                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleExportPDF(resume)}
                        disabled={exportingPdfId === resume.id}
                        className="w-full"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        {exportingPdfId === resume.id
                          ? "Exporting PDF..."
                          : "Export PDF"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Export as JSON
                          const dataStr = JSON.stringify(resume.data, null, 2);
                          const dataBlob = new Blob([dataStr], {
                            type: "application/json",
                          });
                          const url = URL.createObjectURL(dataBlob);
                          const link = document.createElement("a");
                          link.href = url;
                          link.download = `${resume.name}-${resume.id}.json`;
                          link.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export JSON
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
    </ErrorBoundary>
  );
}
