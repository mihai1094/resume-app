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
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingPage } from "@/components/shared/loading";
import { ResumeCardSkeleton } from "@/components/loading-skeleton";

export default function MyResumesPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const {
    resumes,
    isLoading: resumesLoading,
    deleteResume,
  } = useSavedResumes(user?.id || null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  if (userLoading || resumesLoading) {
    return <LoadingPage text="Loading your resumes..." />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <UserCircle className="w-6 h-6" />
              <div>
                <h1 className="text-2xl font-semibold">My Resumes</h1>
                {user && (
                  <p className="text-sm text-muted-foreground">
                    {user.name} • {user.email}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Resume
                </Link>
              </Button>
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
              <Button asChild>
                <Link href="/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Resume
                </Link>
              </Button>
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
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleLoadResume(resume.data)}
                        className="w-full"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Resume
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
