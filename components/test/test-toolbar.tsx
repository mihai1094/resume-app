"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/hooks/use-user";
import { authFetch } from "@/lib/api/auth-fetch";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FlaskConical,
  Database,
  RefreshCw,
  ArrowLeftRight,
  Coins,
  Trash2,
  FileText,
  Loader2,
  X,
} from "lucide-react";

interface TestStatus {
  plan: "free" | "premium";
  aiCreditsUsed: number;
  aiCreditsResetDate: string | null;
  resumeCount: number;
  resumeIds: string[];
  coverLetterCount: number;
}

const TEST_EMAIL = process.env.NEXT_PUBLIC_TEST_USER_EMAIL;

export function TestToolbar() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<TestStatus | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const isTestUser = user?.email === TEST_EMAIL;

  const fetchStatus = useCallback(async () => {
    if (!isTestUser) return;
    try {
      const res = await authFetch("/api/test/status");
      if (res.ok) {
        setStatus(await res.json());
      }
    } catch {
      // silently fail
    }
  }, [isTestUser]);

  useEffect(() => {
    if (open && isTestUser) {
      fetchStatus();
    }
  }, [open, isTestUser, fetchStatus]);

  if (!isTestUser) return null;

  const runAction = async (
    endpoint: string,
    label: string,
    method = "POST",
    body?: Record<string, unknown>
  ) => {
    setLoading(label);
    try {
      const res = await authFetch(`/api/test/${endpoint}`, {
        method,
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`${label}: Success`, {
          description: JSON.stringify(data, null, 2).slice(0, 200),
        });
        await fetchStatus();
      } else {
        toast.error(`${label}: Failed`, {
          description: data.error || "Unknown error",
        });
      }
    } catch (err) {
      toast.error(`${label}: Error`, {
        description: err instanceof Error ? err.message : "Network error",
      });
    } finally {
      setLoading(null);
    }
  };

  const isLoading = (label: string) => loading === label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="fixed bottom-4 right-4 z-[9999] flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg hover:bg-amber-600 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
          aria-label="Test toolbar"
        >
          <FlaskConical className="h-5 w-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-80 p-0"
        sideOffset={8}
      >
        <div className="border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-amber-500" />
            <span className="font-semibold text-sm">Test Toolbar</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close toolbar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Status */}
        {status && (
          <div className="border-b px-4 py-3 space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Plan</span>
              <Badge
                variant={status.plan === "premium" ? "default" : "secondary"}
              >
                {status.plan}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Credits used</span>
              <span className="font-mono">{status.aiCreditsUsed}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Resumes</span>
              <span className="font-mono">{status.resumeCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cover letters</span>
              <span className="font-mono">{status.coverLetterCount}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-3 space-y-1.5">
          <ActionButton
            icon={<Database className="h-4 w-4" />}
            label="Seed Data"
            description="Create 3 resumes + 1 cover letter"
            loading={isLoading("Seed Data")}
            disabled={loading !== null}
            onClick={() => runAction("seed", "Seed Data")}
          />
          <ActionButton
            icon={<RefreshCw className="h-4 w-4" />}
            label="Reset All"
            description="Delete everything and re-seed"
            loading={isLoading("Reset All")}
            disabled={loading !== null}
            onClick={() => runAction("reset", "Reset All")}
            variant="destructive"
          />
          <ActionButton
            icon={<ArrowLeftRight className="h-4 w-4" />}
            label="Toggle Plan"
            description={`Switch to ${status?.plan === "premium" ? "free" : "premium"}`}
            loading={isLoading("Toggle Plan")}
            disabled={loading !== null}
            onClick={() => runAction("toggle-plan", "Toggle Plan")}
          />
          <ActionButton
            icon={<Coins className="h-4 w-4" />}
            label="Reset Credits"
            description="Set credits used to 0"
            loading={isLoading("Reset Credits")}
            disabled={loading !== null}
            onClick={() => runAction("reset-credits", "Reset Credits")}
          />
          <ActionButton
            icon={<FileText className="h-4 w-4" />}
            label="Seed Cover Letter"
            description="Add another cover letter"
            loading={isLoading("Seed Cover Letter")}
            disabled={loading !== null}
            onClick={() => runAction("seed-cover-letter", "Seed Cover Letter")}
          />

          {/* Clear specific resume */}
          {status && status.resumeIds.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-1.5">
                Delete specific resume
              </p>
              <div className="space-y-1">
                {status.resumeIds.map((id) => (
                  <ActionButton
                    key={id}
                    icon={<Trash2 className="h-3.5 w-3.5" />}
                    label={id}
                    loading={isLoading(id)}
                    disabled={loading !== null}
                    onClick={() =>
                      runAction("clear-resume", id, "POST", { resumeId: id })
                    }
                    size="sm"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ActionButton({
  icon,
  label,
  description,
  loading,
  disabled,
  onClick,
  variant,
  size = "default",
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
  variant?: "destructive";
  size?: "default" | "sm";
}) {
  return (
    <Button
      variant={variant === "destructive" ? "destructive" : "ghost"}
      size={size === "sm" ? "sm" : "default"}
      className={`w-full justify-start gap-2 ${size === "sm" ? "h-7 text-xs" : "h-9"}`}
      disabled={disabled}
      onClick={onClick}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      <div className="flex flex-col items-start">
        <span>{label}</span>
        {description && size !== "sm" && (
          <span className="text-[10px] text-muted-foreground font-normal">
            {description}
          </span>
        )}
      </div>
    </Button>
  );
}
