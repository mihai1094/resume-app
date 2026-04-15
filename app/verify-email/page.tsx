"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, RefreshCw, LogOut } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { authService } from "@/lib/services/auth";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, isLoading, logout, reloadEmailVerification } = useUser();
  const [resendLoading, setResendLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.emailVerified) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    setResendLoading(true);
    const result = await authService.sendEmailVerificationToCurrentUser();
    setResendLoading(false);
    if (result.success) {
      setResendCooldown(60);
      toast.success("Verification email sent! Check your inbox.");
    } else {
      toast.error(result.error || "Failed to send verification email.");
    }
  };

  const handleCheckVerification = async () => {
    setCheckLoading(true);
    const verified = await reloadEmailVerification();
    setCheckLoading(false);
    if (verified) {
      toast.success("Email verified! Redirecting...");
      router.push("/dashboard");
    } else {
      toast.error("Email not yet verified. Please check your inbox.");
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <Link href="/" aria-label="ResumeZeus home" className="inline-flex">
          <Logo size={160} />
        </Link>

        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Verify your email</h1>
          <p className="text-muted-foreground">
            We sent a verification link to{" "}
            <span className="font-medium text-foreground">{user.email}</span>.
            Click the link to activate your account.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={handleCheckVerification}
            disabled={checkLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${checkLoading ? "animate-spin" : ""}`} />
            I&apos;ve verified my email
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={resendLoading || resendCooldown > 0}
          >
            {resendLoading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend verification email"}
          </Button>

          <button
            type="button"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mx-auto transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Check your spam folder if you don&apos;t see the email.
        </p>
      </div>
    </div>
  );
}
