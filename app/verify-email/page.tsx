"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingInline } from "@/components/shared/loading";
import { authService } from "@/lib/services/auth";
import { useUser } from "@/hooks/use-user";

const POLL_INTERVAL_MS = 3000;

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [isResending, setIsResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll for email verification status
  const startPolling = useCallback(() => {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      const isVerified = await authService.checkEmailVerified();
      if (isVerified) {
        setVerified(true);
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }
    }, POLL_INTERVAL_MS);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
      return;
    }
    if (user) {
      startPolling();
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [user, isLoading, router, startPolling]);

  // Redirect after verification
  useEffect(() => {
    if (verified) {
      toast.success("Email verified successfully!");
      const timer = setTimeout(() => {
        router.push("/templates");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [verified, router]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    setIsResending(true);
    const result = await authService.sendEmailVerificationToCurrentUser();
    if (result.success) {
      toast.success("Verification email sent!");
      setResendCooldown(60);
    } else {
      toast.error(result.error || "Failed to send verification email");
    }
    setIsResending(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/40">
        <SiteHeader />
        <main className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-md mx-auto flex justify-center py-20">
            <LoadingInline className="w-6 h-6" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-md mx-auto">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>

          <Card className="shadow-xl border-primary/10">
            <CardHeader className="space-y-2">
              <CardTitle className="font-serif">
                {verified ? "Email Verified" : "Check your email"}
              </CardTitle>
              <CardDescription>
                {verified
                  ? "Your email has been verified. Redirecting you..."
                  : "We sent a verification link to your email address."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {verified ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Redirecting to templates...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    {user?.email && (
                      <p className="text-sm text-muted-foreground">
                        We&apos;ve sent a verification link to{" "}
                        <span className="font-medium text-foreground">
                          {user.email}
                        </span>
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Click the link in the email to verify your account. This
                      page will update automatically.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleResend}
                      disabled={isResending || resendCooldown > 0}
                    >
                      {isResending ? (
                        <LoadingInline className="mr-2" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : "Resend verification email"}
                    </Button>

                    <Button asChild variant="ghost" className="w-full">
                      <Link href="/templates">Skip for now</Link>
                    </Button>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    Don&apos;t see the email? Check your spam or junk folder.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
