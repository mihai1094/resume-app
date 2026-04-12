"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTierLimits } from "@/lib/config/credits";
import { useSavedResumes } from "@/hooks/use-saved-resumes";
import { useUser } from "@/hooks/use-user";
import { PlanLimitDialog } from "@/components/shared/plan-limit-dialog";
import { StickyMobileCTA } from "@/components/home/sticky-mobile-cta";

export function HomeCtaGroup() {
  const router = useRouter();
  const { user } = useUser();
  const { resumes, isLoading: resumesLoading } = useSavedResumes(user?.id || null);
  const [showPlanLimitModal, setShowPlanLimitModal] = useState(false);

  const plan = user?.plan ?? "free";
  const limits = getTierLimits(plan);
  const hasResumes = resumes.length > 0;
  const isResumeLimitReached = Boolean(user) && resumes.length >= limits.maxResumes;

  const labels = useMemo(
    () => ({
      primary: user
        ? hasResumes
          ? "Create your resume"
          : "Start ATS check"
        : "Create free account",
      mobile: user
        ? hasResumes
          ? "Create your resume"
          : "Start ATS check"
        : "Create free account",
      sticky: user ? "Open ATS editor" : "Create free account",
    }),
    [hasResumes, user]
  );

  const handleCreateResume = () => {
    if (user && !resumesLoading && isResumeLimitReached) {
      setShowPlanLimitModal(true);
      return;
    }

    if (!user) {
      router.push("/register");
      return;
    }

    router.push("/templates");
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
        <Button
          size="lg"
          className="text-base px-8 h-12 group"
          aria-label={user ? "Start your ATS-friendly resume workflow" : "Create your free account"}
          onClick={handleCreateResume}
          type="button"
        >
          <span className="sm:hidden">{labels.mobile}</span>
          <span className="hidden sm:inline">{labels.primary}</span>
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>

        <Button
          asChild
          size="lg"
          variant="ghost"
          className="text-base text-muted-foreground border border-secondary-foreground/30 hover:text-secondary-foreground hover:bg-secondary transition-all duration-300 group"
          aria-label="View ATS-friendly resume templates"
        >
          <Link href="/templates">
            <Search className="w-4 h-4 mr-2" />
            Browse ATS templates
          </Link>
        </Button>
      </div>

      <div className="flex flex-row flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-6 pt-2 text-xs sm:text-sm">
        {[
          "Live ATS score",
          "Free PDF export",
          "No credit card required",
        ].map((text) => (
          <div
            key={text}
            className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground bg-muted/50 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5"
          >
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10">
              <Check className="w-3 h-3 text-primary" />
            </div>
            <span className="font-medium">{text}</span>
          </div>
        ))}
      </div>

      <StickyMobileCTA onCreate={handleCreateResume} label={labels.sticky} />
      <PlanLimitDialog
        open={showPlanLimitModal}
        onOpenChange={setShowPlanLimitModal}
        limit={limits.maxResumes}
        onManage={() => {
          setShowPlanLimitModal(false);
          router.push("/dashboard");
        }}
        onUpgrade={() => {
          setShowPlanLimitModal(false);
          router.push("/pricing#pro");
        }}
      />
    </>
  );
}
