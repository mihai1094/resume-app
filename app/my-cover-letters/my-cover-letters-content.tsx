"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { useSavedCoverLetters } from "@/hooks/use-saved-cover-letters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    FileText,
    ArrowLeft,
    Trash2,
    Download,
    Edit,
    Plus,
    Mail,
    Building,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingPage } from "@/components/shared/loading";

export function MyCoverLettersContent() {
    const router = useRouter();
    const { user, isLoading: userLoading } = useUser();
    const { coverLetters, isLoading: lettersLoading, deleteCoverLetter } = useSavedCoverLetters(user?.id || null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this cover letter?")) return;

        setDeletingId(id);
        try {
            await deleteCoverLetter(id);
        } catch (error) {
            console.error("Failed to delete cover letter:", error);
            alert("Failed to delete cover letter");
        } finally {
            setDeletingId(null);
        }
    };

    // Create Cover Letter Card Component
    const CreateCoverLetterCard = () => {
        const hasLetters = coverLetters.length > 0;

        const handleCreate = () => {
            router.push("/cover-letter");
        };

        return (
            <Card
                className="border-dashed border-2 hover:border-primary hover:bg-accent/50 transition-all cursor-pointer group min-h-[300px] flex items-center justify-center"
                onClick={handleCreate}
            >
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Plus className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Create New Cover Letter</h3>
                    <p className="text-sm text-muted-foreground">
                        {hasLetters
                            ? "Write a new cover letter for your next application"
                            : "Get started with our cover letter editor"}
                    </p>
                </CardContent>
            </Card>
        );
    };

    if (userLoading || lettersLoading) {
        return <LoadingPage />;
    }

    if (!user) {
        router.push("/login");
        return null;
    }

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-background">
                {/* Header */}
                <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
                    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold">My Cover Letters</h1>
                                <p className="text-sm text-muted-foreground">
                                    {coverLetters.length} cover {coverLetters.length === 1 ? "letter" : "letters"}
                                </p>
                            </div>
                        </div>
                        <Button asChild>
                            <Link href="/cover-letter">
                                <Plus className="w-4 h-4 mr-2" />
                                New Cover Letter
                            </Link>
                        </Button>
                    </div>
                </header>

                {/* Content */}
                <div className="container mx-auto px-4 py-8">
                    {coverLetters.length === 0 ? (
                        <Card className="max-w-2xl mx-auto">
                            <CardHeader>
                                <CardTitle className="text-center">No Cover Letters Yet</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center space-y-4">
                                <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
                                    <Mail className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground">
                                    Create your first cover letter to complement your resumes
                                </p>
                                <Button asChild size="lg">
                                    <Link href="/cover-letter">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Cover Letter
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Create New Cover Letter Card - ALWAYS FIRST */}
                            <CreateCoverLetterCard />

                            {/* Existing Cover Letters */}
                            {coverLetters.map((letter) => (
                                <Card
                                    key={letter.id}
                                    className="hover:shadow-lg transition-all duration-300"
                                >
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg mb-2">
                                                    {letter.name}
                                                </CardTitle>
                                                {letter.companyName && (
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <Building className="w-3 h-3" />
                                                        {letter.companyName}
                                                    </div>
                                                )}
                                                {letter.jobTitle && (
                                                    <Badge variant="outline" className="mt-2">
                                                        {letter.jobTitle}
                                                    </Badge>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(letter.id)}
                                                disabled={deletingId === letter.id}
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
                                                    Created: {format(new Date(letter.createdAt), "MMM d, yyyy")}
                                                </p>
                                                <p>
                                                    Updated: {format(new Date(letter.updatedAt), "MMM d, yyyy")}
                                                </p>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => router.push(`/cover-letter?id=${letter.id}`)}
                                                    className="w-full"
                                                >
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit Cover Letter
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => {
                                                        // TODO: Implement PDF export
                                                        alert("PDF export coming soon!");
                                                    }}
                                                >
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Export PDF
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
