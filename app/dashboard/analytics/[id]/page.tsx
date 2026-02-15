"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, Globe, AlertCircle } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useSavedResumes } from "@/hooks/use-saved-resumes";
import { sharingService } from "@/lib/services/sharing-service";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { authFetch } from "@/lib/api/auth-fetch";
import {
  AnalyticsSummary,
  RecentActivity,
  EMPTY_ANALYTICS_SUMMARY,
} from "@/lib/types/analytics";
import { LoadingPage } from "@/components/shared/loading";
import { Card, CardContent } from "@/components/ui/card";
import { launchFlags } from "@/config/launch";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AnalyticsPage({ params }: PageProps) {
  const { id: resumeId } = use(params);
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const { resumes, isLoading: resumesLoading } = useSavedResumes(
    user?.id || null
  );

  const [summary, setSummary] = useState<AnalyticsSummary>(EMPTY_ANALYTICS_SUMMARY);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!launchFlags.features.analytics) {
      router.replace("/dashboard");
    }
  }, [router]);

  // Find the resume
  const resume = resumes.find((r) => r.id === resumeId);
  const isPremium = user?.plan === "premium";

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!resumeId || resumesLoading) return;

      setIsLoading(true);
      setError(null);

      try {
        // Check if resume is public
        const publicInfo = await sharingService.getPublicResumeInfo(resumeId);
        setIsPublic(publicInfo?.isPublic ?? false);
        setPublicUrl(publicInfo?.url ?? null);

        if (!publicInfo?.isPublic) {
          setError("This resume is not published. Publish it first to track analytics.");
          setIsLoading(false);
          return;
        }

        // Fetch analytics summary
        const response = await authFetch(`/api/analytics/${resumeId}?limit=20`);
        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }
        const data = await response.json();
        setSummary(data.summary || EMPTY_ANALYTICS_SUMMARY);
        setRecentActivity(data.recentActivity || []);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError("Failed to load analytics data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [resumeId, resumesLoading]);

  // Loading state
  if (userLoading || resumesLoading) {
    return <LoadingPage text="Loading analytics..." />;
  }

  // Not logged in
  if (!user) {
    router.push("/login");
    return null;
  }

  // Resume not found
  if (!resumesLoading && !resume) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Resume Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The resume you are looking for does not exist or has been deleted.
              </p>
              <Button asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="w-5 h-5" />
                  <span className="sr-only">Back to Dashboard</span>
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h1 className="text-xl font-semibold">Resume Analytics</h1>
              </div>
            </div>
            {isPublic && publicUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                  <Globe className="w-4 h-4 mr-2" />
                  View Public Page
                </a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {error ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-amber-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                {isPublic ? "Error Loading Analytics" : "Resume Not Published"}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {error}
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" asChild>
                  <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
                {!isPublic && (
                  <Button asChild>
                    <Link href={`/editor/${resumeId}`}>Edit & Publish Resume</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <AnalyticsDashboard
            summary={summary}
            recentActivity={recentActivity}
            isPremium={isPremium}
            isLoading={isLoading}
            resumeName={resume?.name}
          />
        )}
      </main>
    </div>
  );
}
