"use client";

import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { useSavedResumes } from "@/hooks/use-saved-resumes";
import { useSavedCoverLetters } from "@/hooks/use-saved-cover-letters";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Download, FileText, FolderOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function DataExport() {
    const { user } = useUser();
    const { resumes } = useSavedResumes(user?.id ?? null);
    const { coverLetters } = useSavedCoverLetters(user?.id ?? null);
    const [isExportingResumes, setIsExportingResumes] = useState(false);
    const [isExportingCoverLetters, setIsExportingCoverLetters] = useState(false);

    const downloadJSON = (data: unknown, filename: string) => {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExportResumes = async () => {
        if (resumes.length === 0) {
            toast.error("No resumes to export");
            return;
        }

        setIsExportingResumes(true);
        try {
            const exportData = {
                exportedAt: new Date().toISOString(),
                version: "1.0",
                count: resumes.length,
                resumes: resumes.map((resume) => ({
                    id: resume.id,
                    name: resume.name,
                    createdAt: resume.createdAt,
                    updatedAt: resume.updatedAt,
                    data: resume.data,
                })),
            };

            const timestamp = new Date().toISOString().split("T")[0];
            downloadJSON(exportData, `resumeforge-resumes-${timestamp}.json`);
            toast.success(`Exported ${resumes.length} resume${resumes.length === 1 ? "" : "s"}`);
        } catch (error) {
            console.error("Error exporting resumes:", error);
            toast.error("Failed to export resumes");
        } finally {
            setIsExportingResumes(false);
        }
    };

    const handleExportCoverLetters = async () => {
        if (coverLetters.length === 0) {
            toast.error("No cover letters to export");
            return;
        }

        setIsExportingCoverLetters(true);
        try {
            const exportData = {
                exportedAt: new Date().toISOString(),
                version: "1.0",
                count: coverLetters.length,
                coverLetters: coverLetters.map((letter) => ({
                    id: letter.id,
                    name: letter.name,
                    createdAt: letter.createdAt,
                    updatedAt: letter.updatedAt,
                    data: letter.data,
                })),
            };

            const timestamp = new Date().toISOString().split("T")[0];
            downloadJSON(exportData, `resumeforge-cover-letters-${timestamp}.json`);
            toast.success(`Exported ${coverLetters.length} cover letter${coverLetters.length === 1 ? "" : "s"}`);
        } catch (error) {
            console.error("Error exporting cover letters:", error);
            toast.error("Failed to export cover letters");
        } finally {
            setIsExportingCoverLetters(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Export Your Data
                </CardTitle>
                <CardDescription>
                    Download all your resumes and cover letters as JSON files. You can use these
                    backups to import your data later or transfer to another account.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        variant="outline"
                        onClick={handleExportResumes}
                        disabled={isExportingResumes || resumes.length === 0}
                        className="flex-1"
                    >
                        {isExportingResumes ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <FolderOpen className="mr-2 h-4 w-4" />
                        )}
                        Export All Resumes ({resumes.length})
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleExportCoverLetters}
                        disabled={isExportingCoverLetters || coverLetters.length === 0}
                        className="flex-1"
                    >
                        {isExportingCoverLetters ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <FileText className="mr-2 h-4 w-4" />
                        )}
                        Export All Cover Letters ({coverLetters.length})
                    </Button>
                </div>
                {resumes.length === 0 && coverLetters.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        You don&apos;t have any documents to export yet. Create a resume or cover
                        letter to get started.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

