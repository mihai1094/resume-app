"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Chrome, ArrowRight, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/hooks/use-user";
import { LoadingInline } from "@/components/shared/loading";
import { sanitizeAuthRedirectPath } from "@/lib/utils/auth-redirect";
import { capture } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";
import { advanceFormOnEnter } from "@/lib/utils/form-navigation";

const benefits = [
  "Access your saved resumes and cover letters",
  "See remaining AI credits while you edit",
  "Export PDFs anytime from your account",
  "ATS-friendly templates and AI tools",
];

const AUTH_REDIRECT_TOAST_KEY = "auth_redirect_toast_key";

export default function LoginPage() {
  const router = useRouter();
  const { user, signIn, signInWithGoogle, isLoading, error } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [returnTo, setReturnTo] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Read redirect intent on mount; keep in sessionStorage so register/onboarding can use it
  useEffect(() => {
    // Skip the "Please log in" toast if the user just logged out — they
    // already saw "Logged out successfully" and the double toast is noisy.
    const justLoggedOut = sessionStorage.getItem("just_logged_out");
    if (justLoggedOut) {
      sessionStorage.removeItem("just_logged_out");
      sessionStorage.removeItem("auth_redirect");
      sessionStorage.removeItem(AUTH_REDIRECT_TOAST_KEY);
      return;
    }

    const redirectInfo = sessionStorage.getItem("auth_redirect");
    if (redirectInfo) {
      try {
        const { feature, returnTo: savedReturnTo } = JSON.parse(redirectInfo);
        const safeReturnTo = sanitizeAuthRedirectPath(savedReturnTo);
        const toastDedupeKey = `${feature}:${savedReturnTo ?? ""}`;
        if (sessionStorage.getItem(AUTH_REDIRECT_TOAST_KEY) !== toastDedupeKey) {
          toast.info(`Please log in to access the ${feature}`, {
            id: "auth-redirect-required",
            duration: 3000,
          });
          sessionStorage.setItem(AUTH_REDIRECT_TOAST_KEY, toastDedupeKey);
        }
        setReturnTo(safeReturnTo);
        // Do not remove auth_redirect here — remove only when we actually redirect to returnTo
        // so that register page and onboarding can use it if user signs up instead
      } catch {
        sessionStorage.removeItem(AUTH_REDIRECT_TOAST_KEY);
        sessionStorage.removeItem("auth_redirect");
      }
    }
  }, []);

  // When user is logged in, prefer returnTo (e.g. /editor/new?template=X) over dashboard
  useEffect(() => {
    if (isLoading || !user) return;
    sessionStorage.removeItem(AUTH_REDIRECT_TOAST_KEY);
    if (returnTo) {
      sessionStorage.removeItem("auth_redirect");
      router.push(returnTo);
      return;
    }
    // No returnTo: new users go to templates, existing users to dashboard or home
    let cancelled = false;
    (async () => {
      try {
        const { firestoreService } = await import(
          "@/lib/services/firestore"
        );
        const exists = await firestoreService.userExists(user.id);
        if (cancelled) return;
        if (!exists) {
          router.push("/templates");
          return;
        }
        const resumes = await firestoreService.getSavedResumes(user.id);
        router.push(resumes.length > 0 ? "/dashboard" : "/");
      } catch {
        if (!cancelled) router.push("/dashboard");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, isLoading, returnTo, router]);

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    try {
      const success = await signIn(email, password);
      if (success) {
        capture("login_completed", { method: "email" });
        toast.success("Welcome back!");
        // Redirect is handled by useEffect when user state updates (respects returnTo)
        return;
      }
      // `error` from the hook may not have flushed yet at this point, so
      // always fall back to a concrete user-facing message.
      const message =
        error || "Incorrect email or password. Please try again.";
      setSubmitError(message);
      toast.error(message);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Login failed. Please try again.";
      setSubmitError(message);
      toast.error(message);
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitError(null);
    try {
      const success = await signInWithGoogle();
      if (success) {
        capture("login_completed", { method: "google" });
        toast.success("Welcome back!");
        return;
      }
      const message = error || "Google login failed. Please try again.";
      setSubmitError(message);
      toast.error(message);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Google login failed.";
      setSubmitError(message);
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding & Benefits */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] bg-gradient-to-br from-primary/10 via-background to-accent/10 relative overflow-hidden border-r border-border/60">
        {/* Decorative elements — warm, matches onboarding/register */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-foreground w-full">
          {/* Logo */}
          <Link href="/" aria-label="ResumeZeus home">
            <Logo size={200} />
          </Link>

          {/* Main content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="h-display">
                Welcome <span className="text-primary italic">back</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Pick up where you left off. Your resumes, exports, and AI work are waiting.
              </p>
            </div>

            <div className="space-y-4">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-muted-foreground">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-sm text-muted-foreground/70">
            Trusted by thousands of job seekers worldwide
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[400px] space-y-8"
        >
          {/* Mobile Logo — icon-only, doesn't compete with the heading */}
          <div className="lg:hidden flex justify-center">
            <Link href="/" aria-label="ResumeZeus home">
              <Logo size={36} variant="icon" />
            </Link>
          </div>

          {/* Header */}
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Log in to your account
            </h2>
            <p className="text-muted-foreground">
              Sign in to continue editing, exporting PDFs, and using your AI credits
            </p>
          </div>

          {/* Google Button */}
          <Button
            variant="outline"
            className="w-full h-12 text-base font-medium border-2 text-foreground hover:bg-accent/10 hover:text-foreground"
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <LoadingInline className="mr-2" />
            ) : (
              <Chrome className="h-5 w-5 mr-3" />
            )}
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">
                or continue with email
              </span>
            </div>
          </div>

          {/* Email Form */}
          <form
            className="space-y-5"
            onSubmit={handleEmailLogin}
            onKeyDown={advanceFormOnEnter}
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (submitError) setSubmitError(null);
                }}
                disabled={isLoading}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (submitError) setSubmitError(null);
                }}
                disabled={isLoading}
                className="h-12"
              />
            </div>

            {submitError && (
              <div
                role="alert"
                aria-live="polite"
                className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2.5"
              >
                {submitError}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? <LoadingInline className="mr-2" /> : null}
              Log in
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* Sign up link */}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-primary hover:underline font-semibold"
            >
              Sign up for free
            </Link>
          </p>

        </motion.div>
      </div>
    </div>
  );
}
