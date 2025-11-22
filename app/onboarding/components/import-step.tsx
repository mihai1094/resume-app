"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ResumeData } from "@/lib/types/resume";
import { importCV } from "@/lib/services/cv-import";

interface ImportStepProps {
    onImport: (data: ResumeData) => void;
    onStartFresh: () => void;
}

export function ImportStep({ onImport, onStartFresh }: ImportStepProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFile = useCallback(
        async (file: File) => {
            setIsUploading(true);
            setError(null);

            try {
                const parsed = await importCV(file);
                // Convert ParsedCV to ResumeData by merging with defaults
                const resumeData: ResumeData = {
                    personalInfo: parsed.data.personalInfo || {
                        firstName: "",
                        lastName: "",
                        email: "",
                        phone: "",
                        location: "",
                    },
                    workExperience: parsed.data.workExperience || [],
                    education: parsed.data.education || [],
                    skills: parsed.data.skills || [],
                    projects: parsed.data.projects || [],
                    languages: parsed.data.languages || [],
                    courses: parsed.data.courses || [],
                    hobbies: parsed.data.hobbies || [],
                    extraCurricular: parsed.data.extraCurricular || [],
                };
                onImport(resumeData);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to parse resume"
                );
            } finally {
                setIsUploading(false);
            }
        },
        [onImport]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);

            const file = e.dataTransfer.files[0];
            if (file) {
                handleFile(file);
            }
        },
        [handleFile]
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                handleFile(file);
            }
        },
        [handleFile]
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold tracking-tight">
                    How would you like to begin?
                </h2>
                <p className="text-muted-foreground text-lg">
                    Import your existing resume or start from scratch
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Upload Option */}
                <Card
                    className={cn(
                        "relative p-8 border-2 transition-all duration-300",
                        isDragging
                            ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                            : "border-dashed border-border hover:border-primary/50 hover:shadow-lg"
                    )}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                >
                    <div className="space-y-6 text-center">
                        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center">
                            {isUploading ? (
                                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                            ) : (
                                <Upload className="w-10 h-10 text-blue-500" />
                            )}
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold">Upload Resume</h3>
                            <p className="text-sm text-muted-foreground">
                                Import from PDF or DOCX
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}

                        <div className="space-y-3">
                            <Button
                                variant="outline"
                                className="w-full"
                                disabled={isUploading}
                                onClick={() => document.getElementById("file-upload")?.click()}
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                {isUploading ? "Uploading..." : "Choose File"}
                            </Button>
                            <input
                                id="file-upload"
                                type="file"
                                accept=".pdf,.docx"
                                className="hidden"
                                onChange={handleFileInput}
                            />
                            <p className="text-xs text-muted-foreground">
                                or drag and drop here
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Start Fresh Option */}
                <Card className="relative p-8 border-2 border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <div
                        className="space-y-6 text-center h-full flex flex-col justify-center"
                        onClick={onStartFresh}
                    >
                        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText className="w-10 h-10 text-emerald-500" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold">Start Fresh</h3>
                            <p className="text-sm text-muted-foreground">
                                Build from scratch with our guided editor
                            </p>
                        </div>

                        <Button className="w-full">
                            Create New Resume
                        </Button>
                    </div>
                </Card>
            </div>

            <div className="text-center">
                <p className="text-xs text-muted-foreground">
                    Supported formats: PDF, DOCX • Max file size: 10MB
                </p>
            </div>
        </div>
    );
}
