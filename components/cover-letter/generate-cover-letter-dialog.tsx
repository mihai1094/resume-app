"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles, FileText } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useSavedResumes, SavedResume } from "@/hooks/use-saved-resumes";
import { useUser } from "@/hooks/use-user";
import { CoverLetterOutput } from "@/lib/ai/content-generator";
import { authPost } from "@/lib/api/auth-fetch";

interface GenerateCoverLetterDialogProps {
    onGenerate: (coverLetter: CoverLetterOutput) => void;
    trigger?: React.ReactNode;
}

export function GenerateCoverLetterDialog({
    onGenerate,
    trigger,
}: GenerateCoverLetterDialogProps) {
    const [open, setOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedResumeId, setSelectedResumeId] = useState<string>("");
    const [companyName, setCompanyName] = useState("");
    const [positionTitle, setPositionTitle] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [hiringManagerName, setHiringManagerName] = useState("");

    const { user } = useUser();
    const { resumes, isLoading: resumesLoading } = useSavedResumes(
        user?.id ?? null
    );

    const handleGenerate = async () => {
        // Validation
        if (!selectedResumeId) {
            toast.error("Please select a resume");
            return;
        }

        if (!companyName.trim()) {
            toast.error("Please enter the company name");
            return;
        }

        if (!positionTitle.trim()) {
            toast.error("Please enter the position title");
            return;
        }

        if (!jobDescription.trim() || jobDescription.length < 50) {
            toast.error("Please enter a job description (at least 50 characters)");
            return;
        }

        setIsGenerating(true);

        try {
            // Find the selected resume
            const selectedResume = resumes.find((r: SavedResume) => r.id === selectedResumeId);
            if (!selectedResume) {
                throw new Error("Selected resume not found");
            }

            const response = await authPost("/api/ai/generate-cover-letter", {
                resumeData: selectedResume.data,
                jobDescription,
                companyName,
                positionTitle,
                hiringManagerName: hiringManagerName.trim() || undefined,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to generate cover letter");
            }

            const data = await response.json();
            const { coverLetter, meta } = data;

            // Show success message with cache info
            if (meta.fromCache) {
                toast.success(
                    `Cover letter generated from cache! (${meta.responseTime}ms)`,
                    {
                        description: `Cache hit rate: ${meta.cacheStats.hitRate} | Savings: ${meta.cacheStats.estimatedSavings}`,
                    }
                );
            } else {
                toast.success(`Cover letter generated! (${meta.responseTime}ms)`, {
                    description: `Using ${meta.model}`,
                });
            }

            // Pass the generated cover letter to parent
            onGenerate(coverLetter);

            // Close dialog
            setOpen(false);

            // Reset form
            setSelectedResumeId("");
            setCompanyName("");
            setPositionTitle("");
            setJobDescription("");
            setHiringManagerName("");
        } catch (error) {
            console.error("Error generating cover letter:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to generate cover letter"
            );
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate with AI
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Generate Cover Letter with AI
                    </DialogTitle>
                    <DialogDescription>
                        Select a resume and provide job details to generate a personalized
                        cover letter
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Resume Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="resume-select">
                            Select Resume <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={selectedResumeId}
                            onValueChange={setSelectedResumeId}
                            disabled={resumesLoading || isGenerating}
                        >
                            <SelectTrigger id="resume-select">
                                <SelectValue placeholder="Choose a resume..." />
                            </SelectTrigger>
                            <SelectContent>
                                {resumes.length === 0 ? (
                                    <div className="p-4 text-sm text-muted-foreground text-center">
                                        No saved resumes found
                                    </div>
                                ) : (
                                    resumes.map((resume: SavedResume) => (
                                        <SelectItem key={resume.id} value={resume.id}>
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                <span>{resume.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Company Name */}
                    <div className="space-y-2">
                        <Label htmlFor="company-name">
                            Company Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="company-name"
                            placeholder="e.g., Google, Microsoft, Acme Corp"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            disabled={isGenerating}
                        />
                    </div>

                    {/* Position Title */}
                    <div className="space-y-2">
                        <Label htmlFor="position-title">
                            Position Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="position-title"
                            placeholder="e.g., Senior Software Engineer, Product Manager"
                            value={positionTitle}
                            onChange={(e) => setPositionTitle(e.target.value)}
                            disabled={isGenerating}
                        />
                    </div>

                    {/* Hiring Manager Name (Optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="hiring-manager">
                            Hiring Manager Name (Optional)
                        </Label>
                        <Input
                            id="hiring-manager"
                            placeholder="e.g., John Smith"
                            value={hiringManagerName}
                            onChange={(e) => setHiringManagerName(e.target.value)}
                            disabled={isGenerating}
                        />
                        <p className="text-xs text-muted-foreground">
                            If known, this will personalize the salutation
                        </p>
                    </div>

                    {/* Job Description */}
                    <div className="space-y-2">
                        <Label htmlFor="job-description">
                            Job Description <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="job-description"
                            placeholder="Paste the full job description here (minimum 50 characters)..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            disabled={isGenerating}
                            rows={8}
                            className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                            {jobDescription.length} characters
                            {jobDescription.length < 50 &&
                                ` (${50 - jobDescription.length} more needed)`}
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isGenerating}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleGenerate} disabled={isGenerating}>
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Generate Cover Letter
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
