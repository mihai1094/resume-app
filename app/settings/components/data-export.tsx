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
import { convertToJSONResume } from "@/lib/services/export";
import { authFetch } from "@/lib/api/auth-fetch";

// Schema version for batch exports
const BATCH_EXPORT_VERSION = "1.0.0";

export function DataExport() {
    const { user } = useUser();
    const { resumes } = useSavedResumes(user?.id ?? null);
    const { coverLetters } = useSavedCoverLetters(user?.id ?? null);
    const [isExportingResumes, setIsExportingResumes] = useState(false);
    const [isExportingCoverLetters, setIsExportingCoverLetters] = useState(false);
    const [isExportingAccount, setIsExportingAccount] = useState(false);

    const downloadJSON = (jsonString: string, filename: string) => {
        const blob = new Blob([jsonString], { type: "application/json" });
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
            // Export in JSON Resume compatible format with metadata
            const exportData = {
                $schema: "https://resumezeus.app/schema/batch-export/v1",
                meta: {
                    version: BATCH_EXPORT_VERSION,
                    exportedAt: new Date().toISOString(),
                    generator: "ResumeZeus",
                    generatorVersion: "1.0.0",
                    documentType: "resume-collection",
                    count: resumes.length,
                },
                items: resumes.map((resume) => ({
                    id: resume.id,
                    name: resume.name,
                    createdAt: resume.createdAt,
                    updatedAt: resume.updatedAt,
                    // Convert each resume to JSON Resume format
                    jsonResume: convertToJSONResume(resume.data),
                })),
            };

            const timestamp = new Date().toISOString().split("T")[0];
            downloadJSON(JSON.stringify(exportData, null, 2), `resumezeus-resumes-${timestamp}.json`);
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
                $schema: "https://resumezeus.app/schema/batch-export/v1",
                meta: {
                    version: BATCH_EXPORT_VERSION,
                    exportedAt: new Date().toISOString(),
                    generator: "ResumeZeus",
                    generatorVersion: "1.0.0",
                    documentType: "cover-letter-collection",
                    count: coverLetters.length,
                },
                items: coverLetters.map((letter) => ({
                    id: letter.id,
                    name: letter.name,
                    createdAt: letter.createdAt,
                    updatedAt: letter.updatedAt,
                    data: letter.data,
                })),
            };

            const timestamp = new Date().toISOString().split("T")[0];
            downloadJSON(JSON.stringify(exportData, null, 2), `resumezeus-cover-letters-${timestamp}.json`);
            toast.success(`Exported ${coverLetters.length} cover letter${coverLetters.length === 1 ? "" : "s"}`);
        } catch (error) {
            console.error("Error exporting cover letters:", error);
            toast.error("Failed to export cover letters");
        } finally {
            setIsExportingCoverLetters(false);
        }
    };

    const handleExportAccount = async () => {
        if (!user) {
            toast.error("You must be signed in to export account data");
            return;
        }

        setIsExportingAccount(true);
        try {
            const response = await authFetch("/api/user/export", {
                method: "GET",
            });

            if (!response.ok) {
                throw new Error("Failed to export account data");
            }

            const exportData = await response.json();
            const timestamp = new Date().toISOString().split("T")[0];
            downloadJSON(
                JSON.stringify(exportData, null, 2),
                `resumezeus-account-${timestamp}.json`
            );
            toast.success("Exported account data");
        } catch (error) {
            console.error("Error exporting account data:", error);
            toast.error("Failed to export account data");
        } finally {
            setIsExportingAccount(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Export & Backup
                </CardTitle>
                <CardDescription>
                    Download your resumes, cover letters, and account metadata as JSON files for
                    backup, migration, or portability requests.
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
                    <Button
                        variant="outline"
                        onClick={handleExportAccount}
                        disabled={isExportingAccount || !user}
                        className="flex-1"
                    >
                        {isExportingAccount ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="mr-2 h-4 w-4" />
                        )}
                        Export Account Data
                    </Button>
                </div>
                {resumes.length === 0 && coverLetters.length === 0 && !user && (
                    <p className="text-sm text-muted-foreground">
                        You don&apos;t have any account data available to export yet.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
