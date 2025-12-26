"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Calendar,
  Target,
  Trash2,
  Play,
  Eye,
  Clock,
  BarChart3,
  Sparkles,
  ListChecks,
} from "lucide-react";
import { format } from "date-fns";
import { useInterviewPrepHistory } from "@/hooks/use-interview-prep-history";
import { cn } from "@/lib/utils";
import type { SessionSummary } from "@/lib/types/interview-prep";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

function SessionCard({
  session,
  onDelete,
}: {
  session: SessionSummary;
  onDelete: () => void;
}) {
  const router = useRouter();
  const isCompleted = session.status === "completed";
  const isInProgress = session.status === "practicing";

  const handleClick = () => {
    router.push(`/dashboard/interview-prep/${session.id}`);
  };

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all hover:shadow-md",
        isInProgress && "border-primary/50 bg-primary/5"
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Title and status */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">
                {session.jobTitle || "Interview Practice"}
              </h3>
              {isInProgress && (
                <Badge variant="default" className="shrink-0 text-[10px]">
                  In Progress
                </Badge>
              )}
            </div>

            {/* Company and date */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
              {session.companyName && (
                <span className="truncate max-w-[150px]">
                  {session.companyName}
                </span>
              )}
              <span className="flex items-center gap-1 shrink-0">
                <Calendar className="w-3 h-3" />
                {format(new Date(session.createdAt), "MMM d, yyyy")}
              </span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <ListChecks className="w-4 h-4 text-muted-foreground" />
                <span>{session.totalQuestions} questions</span>
              </div>
              {isCompleted && (
                <>
                  <div className="flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-green-500" />
                    <span className="font-medium">
                      {session.nailedPercentage}% nailed
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    <span>{session.overallReadiness}% ready</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex gap-2"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              {isInProgress ? (
                <>
                  <Play className="w-4 h-4" />
                  Continue
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Review
                </>
              )}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Session?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this practice session and all
                    your answers. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Practice Sessions Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Start your first interview practice session to get AI-generated
          questions tailored to your resume and target job.
        </p>
        <Button onClick={onCreateNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Start Your First Session
        </Button>
      </CardContent>
    </Card>
  );
}

function StatsOverview({
  totalSessions,
  averageScore,
  totalPracticeTime,
}: {
  totalSessions: number;
  averageScore: number;
  totalPracticeTime: number;
}) {
  if (totalSessions === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{totalSessions}</div>
          <div className="text-sm text-muted-foreground">Sessions</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {averageScore}%
          </div>
          <div className="text-sm text-muted-foreground">Avg Score</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {formatTime(totalPracticeTime)}
          </div>
          <div className="text-sm text-muted-foreground">Practice Time</div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function InterviewPrepListContent() {
  const router = useRouter();
  const {
    sessions,
    isLoading,
    totalSessions,
    averageScore,
    totalPracticeTime,
    createNewSession,
    deleteSession,
  } = useInterviewPrepHistory();

  const handleCreateNew = () => {
    const sessionId = createNewSession();
    router.push(`/dashboard/interview-prep/${sessionId}`);
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Interview Prep
                </h1>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  Practice questions tailored to your resume
                </p>
              </div>
            </div>
            <Button onClick={handleCreateNew} className="gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Session</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-6 bg-muted rounded w-1/3 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/4 mb-3" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState onCreateNew={handleCreateNew} />
        ) : (
          <>
            <StatsOverview
              totalSessions={totalSessions}
              averageScore={averageScore}
              totalPracticeTime={totalPracticeTime}
            />

            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Your Practice Sessions
              </h2>
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onDelete={() => deleteSession(session.id)}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
