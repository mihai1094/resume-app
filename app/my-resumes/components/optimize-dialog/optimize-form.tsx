import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Target, Sparkles, ArrowRight } from "lucide-react";
import { calculateATSScore } from "@/lib/ai/mock-analyzer";
import { ResumeData } from "@/lib/types/resume";
import { cn } from "@/lib/utils";
import { Card as UiCard } from "@/components/ui/card";

interface ResumeItem {
    id: string;
    name: string;
    templateId: string;
    data: ResumeData;
}

interface OptimizeFormProps {
    resumes: ResumeItem[];
    selectedResumeId: string;
    setSelectedResumeId: (id: string) => void;
    jobDescription: string;
    setJobDescription: (desc: string) => void;
    onAnalyze: () => void;
    isAnalyzing: boolean;
}

export function OptimizeForm({
    resumes,
    selectedResumeId,
    setSelectedResumeId,
    jobDescription,
    setJobDescription,
    onAnalyze,
    isAnalyzing,
}: OptimizeFormProps) {
    const selectedResume = resumes.find((r) => r.id === selectedResumeId);
    const atsScore = selectedResume
        ? calculateATSScore(selectedResume.data)
        : null;

    return (
        <div className="space-y-6 mt-4">
            {/* Step 1: Select Resume */}
            <div className="space-y-3">
                <label className="text-sm font-medium">
                    Step 1: Select Resume to Optimize
                </label>
                <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Choose a resume..." />
                    </SelectTrigger>
                    <SelectContent>
                        {resumes.map((resume) => (
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
                    <UiCard className="p-4 border-2 mt-3">
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
                    </UiCard>
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
                    placeholder={`Paste the full job description here...

Example:
We are seeking a Senior Full Stack Developer with 5+ years of experience in React, Node.js, and TypeScript. Must have experience with AWS, Docker, and CI/CD pipelines. Strong communication skills required...`}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                />
            </div>

            {/* Analyze Button */}
            <Button
                onClick={onAnalyze}
                disabled={!jobDescription.trim() || !selectedResumeId || isAnalyzing}
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
        </div>
    );
}
