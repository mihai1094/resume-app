"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { useApplications } from "@/hooks/use-applications";
import { useSavedResumes } from "@/hooks/use-saved-resumes";
import { LoadingPage } from "@/components/shared/loading";
import { AppHeader } from "@/components/shared/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getTierLimits, FREE_TIER_LIMITS } from "@/lib/config/credits";
import { PlanLimitDialog } from "@/components/shared/plan-limit-dialog";
import {
  JobApplication,
  ApplicationStatus,
  CreateApplicationInput,
  UpdateApplicationInput,
} from "@/lib/types/application";
import { PlanLimitError } from "@/lib/services/application-service";

// Components
import { KanbanBoard } from "@/components/applications/kanban-board";
import { ApplicationStats } from "@/components/applications/application-stats";
import { ApplicationDialog } from "@/components/applications/application-dialog";
import { ApplicationDetailsDialog } from "@/components/applications/application-details-dialog";

export function ApplicationsContent() {
  const router = useRouter();
  const { user, isLoading: userLoading, logout } = useUser();
  const {
    applications,
    applicationsByStatus,
    stats,
    isLoading: appsLoading,
    createApplication,
    updateApplication,
    deleteApplication,
    moveApplication,
    getApplicationById,
  } = useApplications(user?.id || null);
  const { resumes } = useSavedResumes(user?.id || null);

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [showPlanLimitModal, setShowPlanLimitModal] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
  const [viewingApplication, setViewingApplication] = useState<JobApplication | null>(null);

  // Plan limits
  const plan = user?.plan ?? "free";
  const limits = getTierLimits(plan);
  const applicationLimit = limits.jobApplications;
  const isLimitReached = applications.length >= applicationLimit;

  // Filter applications by search query
  const filteredApplicationsByStatus = Object.fromEntries(
    Object.entries(applicationsByStatus).map(([status, apps]) => [
      status,
      apps.filter(
        (app) =>
          app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.location?.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    ])
  ) as Record<ApplicationStatus, JobApplication[]>;

  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/");
  }, [logout, router]);

  const handleCreateClick = () => {
    if (isLimitReached) {
      setShowPlanLimitModal(true);
      return;
    }
    setCreateDialogOpen(true);
  };

  const handleCreateApplication = async (data: CreateApplicationInput) => {
    const result = await createApplication(data);

    if (result && "code" in result && result.code === "PLAN_LIMIT") {
      setShowPlanLimitModal(true);
      return false;
    }

    if (result && "id" in result) {
      toast.success("Application added!", {
        description: `${data.company} - ${data.position}`,
      });
      setCreateDialogOpen(false);
      return true;
    }

    toast.error("Failed to create application");
    return false;
  };

  const handleUpdateApplication = async (
    id: string,
    updates: UpdateApplicationInput
  ) => {
    const success = await updateApplication(id, updates);

    if (success) {
      toast.success("Application updated");
      setEditingApplication(null);
      return true;
    }

    toast.error("Failed to update application");
    return false;
  };

  const handleDeleteApplication = async (id: string) => {
    const app = getApplicationById(id);
    const success = await deleteApplication(id);

    if (success) {
      toast.success("Application deleted", {
        description: app ? `${app.company} - ${app.position}` : undefined,
      });
      setViewingApplication(null);
      setEditingApplication(null);
      return true;
    }

    toast.error("Failed to delete application");
    return false;
  };

  const handleMoveApplication = async (
    id: string,
    newStatus: ApplicationStatus
  ) => {
    const success = await moveApplication(id, newStatus);

    if (!success) {
      toast.error("Failed to move application");
    }

    return success;
  };

  const handleCardClick = (app: JobApplication) => {
    setViewingApplication(app);
  };

  const handleEditFromDetails = () => {
    if (viewingApplication) {
      setEditingApplication(viewingApplication);
      setViewingApplication(null);
    }
  };

  if (userLoading || appsLoading) {
    return <LoadingPage text="Loading your applications..." />;
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <AppHeader
          title="Job Applications"
          showBack={false}
          user={user}
          onLogout={handleLogout}
        >
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="gap-2"
              onClick={handleCreateClick}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Application</span>
            </Button>
          </div>
        </AppHeader>

        <div className="container mx-auto px-4 py-6 max-w-[1600px]">
          {/* Stats */}
          <ApplicationStats stats={stats} className="mb-6" />

          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by company, position, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Plan limit indicator */}
            {plan === "free" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {applications.length} / {applicationLimit} applications
                </span>
                {isLimitReached && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-primary"
                    onClick={() => router.push("/pricing#pro")}
                  >
                    Upgrade for unlimited
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Kanban Board */}
          <KanbanBoard
            applicationsByStatus={
              searchQuery ? filteredApplicationsByStatus : applicationsByStatus
            }
            onMoveApplication={handleMoveApplication}
            onCardClick={handleCardClick}
            onAddApplication={handleCreateClick}
          />
        </div>

        {/* Create/Edit Dialog */}
        <ApplicationDialog
          open={createDialogOpen || !!editingApplication}
          onOpenChange={(open) => {
            if (!open) {
              setCreateDialogOpen(false);
              setEditingApplication(null);
            }
          }}
          application={editingApplication}
          resumes={resumes}
          onSubmit={async (data) => {
            if (editingApplication) {
              return handleUpdateApplication(editingApplication.id, data as UpdateApplicationInput);
            }
            const result = await handleCreateApplication(data as CreateApplicationInput);
            return result !== false && result !== null;
          }}
          onDelete={
            editingApplication
              ? () => handleDeleteApplication(editingApplication.id)
              : undefined
          }
        />

        {/* Details Dialog */}
        <ApplicationDetailsDialog
          open={!!viewingApplication}
          onOpenChange={(open) => {
            if (!open) setViewingApplication(null);
          }}
          application={viewingApplication}
          resumes={resumes}
          onEdit={handleEditFromDetails}
          onDelete={async () => {
            if (!viewingApplication) return false;
            return handleDeleteApplication(viewingApplication.id);
          }}
          onStatusChange={async (newStatus) => {
            if (!viewingApplication) return false;
            await handleMoveApplication(viewingApplication.id, newStatus);
            return true;
          }}
        />

        {/* Plan Limit Modal */}
        <PlanLimitDialog
          open={showPlanLimitModal}
          onOpenChange={setShowPlanLimitModal}
          limit={applicationLimit}
          resourceType="job applications"
          onManage={() => setShowPlanLimitModal(false)}
          onUpgrade={() => {
            setShowPlanLimitModal(false);
            router.push("/pricing#pro");
          }}
        />
      </div>
    </TooltipProvider>
  );
}
