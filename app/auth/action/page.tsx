"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Suspense } from "react";

import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authService } from "@/lib/services/auth";

type ActionState = "loading" | "success" | "error";

function AuthActionContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<ActionState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const processedRef = useRef(false);

  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    if (!oobCode) {
      setState("error");
      setErrorMessage("Invalid or missing verification code.");
      return;
    }

    if (mode === "verifyEmail") {
      authService.confirmEmailVerification(oobCode).then((result) => {
        if (result.success) {
          setState("success");
        } else {
          setState("error");
          setErrorMessage(
            result.error || "Failed to verify email. The link may have expired."
          );
        }
      });
    } else if (mode === "resetPassword") {
      // Redirect to reset password page with the code
      window.location.href = `/forgot-password?oobCode=${oobCode}`;
    } else {
      setState("error");
      setErrorMessage("Unknown action type.");
    }
  }, [mode, oobCode]);

  return (
    <div className="max-w-md mx-auto">
      <Card className="shadow-xl border-primary/10">
        {state === "loading" && (
          <>
            <CardHeader className="space-y-2">
              <CardTitle className="font-serif">Verifying...</CardTitle>
              <CardDescription>
                Please wait while we verify your email address.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </CardContent>
          </>
        )}

        {state === "success" && (
          <>
            <CardHeader className="space-y-2">
              <CardTitle className="font-serif">Email Verified</CardTitle>
              <CardDescription>
                Your email address has been verified successfully.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    You can now use all features of ResumeZeus.
                  </p>
                </div>
                <Button asChild className="w-full">
                  <Link href="/templates">Get Started</Link>
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {state === "error" && (
          <>
            <CardHeader className="space-y-2">
              <CardTitle className="font-serif">Verification Failed</CardTitle>
              <CardDescription>{errorMessage}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/verify-email">Request new verification link</Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full">
                    <Link href="/login">Back to login</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}

export default function AuthActionPage() {
  return (
    <div className="min-h-screen bg-muted/40">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 md:py-16">
        <Suspense
          fallback={
            <div className="max-w-md mx-auto flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
        >
          <AuthActionContent />
        </Suspense>
      </main>
    </div>
  );
}
