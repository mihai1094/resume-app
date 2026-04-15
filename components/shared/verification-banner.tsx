"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Mail } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";
import { authService } from "@/lib/services/auth";

const DISMISSED_KEY = "email_verification_banner_dismissed";

export function VerificationBanner() {
  const { user } = useUser();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const wasDismissed = sessionStorage.getItem(DISMISSED_KEY) === "true";
    setDismissed(wasDismissed);
  }, []);

  if (!user || user.emailVerified || dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, "true");
    setDismissed(true);
  };

  const handleResend = async () => {
    setResendLoading(true);
    const result = await authService.sendEmailVerificationToCurrentUser();
    setResendLoading(false);
    if (result.success) {
      toast.success("Verification email sent! Check your inbox.");
    } else {
      toast.error(result.error || "Failed to send verification email.");
    }
  };

  return (
    <div
      role="alert"
      className="flex items-center gap-3 px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-900 text-sm"
    >
      <Mail className="w-4 h-4 shrink-0 text-amber-600" />
      <span className="flex-1">
        Verify your email to unlock PDF export.{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={resendLoading}
          className="underline font-medium hover:text-amber-700 disabled:opacity-50"
        >
          {resendLoading ? "Sending…" : "Resend email"}
        </button>
        {" · "}
        <button
          type="button"
          onClick={() => router.push("/verify-email")}
          className="underline font-medium hover:text-amber-700"
        >
          Verify now
        </button>
      </span>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={handleDismiss}
        className="shrink-0 text-amber-600 hover:text-amber-900 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
