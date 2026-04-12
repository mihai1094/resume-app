"use client";

import { useState, useEffect, useMemo, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Chrome, ArrowRight, Sparkles, Check, Shield } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@/hooks/use-user";
import { LoadingInline } from "@/components/shared/loading";
import { validatePassword } from "@/lib/services/auth";
import { capture } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";
import { advanceFormOnEnter } from "@/lib/utils/form-navigation";
import { sanitizeAuthRedirectPath } from "@/lib/utils/auth-redirect";
import { getOrCreateClientDeviceId } from "@/lib/client/device-id";

export default function RegisterPage() {
  const router = useRouter();
  const { user, register, signInWithGoogle, isLoading, error } = useUser();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [returnTo, setReturnTo] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Preserve redirect from auth_redirect (e.g. /editor/new?template=X) when user came via login
  useEffect(() => {
    const redirectInfo = sessionStorage.getItem("auth_redirect");
    if (redirectInfo) {
      try {
        const { returnTo: savedReturnTo } = JSON.parse(redirectInfo);
        setReturnTo(sanitizeAuthRedirectPath(savedReturnTo));
      } catch {
        // ignore
      }
    }
  }, []);

  const passwordValidation = useMemo(
    () => validatePassword(password),
    [password],
  );

  const passwordStrengthScore = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 20;
    if (/[A-Z]/.test(password)) score += 20;
    if (/[a-z]/.test(password)) score += 20;
    if (/[0-9]/.test(password)) score += 20;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 20;
    return score;
  }, [password]);

  const passwordRequirements = [
    { label: "8+ characters", met: password.length >= 8 },
    { label: "Uppercase", met: /[A-Z]/.test(password) },
    { label: "Lowercase", met: /[a-z]/.test(password) },
    { label: "Number", met: /[0-9]/.test(password) },
    { label: "Special char", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  // After signup: go to returnTo (editor with template) if set, else templates
  useEffect(() => {
    if (isLoading || !user) return;
    sessionStorage.removeItem("auth_redirect_toast_key");
    if (returnTo && returnTo.includes("/editor")) {
      sessionStorage.removeItem("auth_redirect");
      router.push(returnTo);
      return;
    }
    router.push("/templates");
  }, [user, isLoading, returnTo, router]);

  const checkSignupEligibility = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/security/signup-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Client-Device-Id": getOrCreateClientDeviceId(),
        },
        body: JSON.stringify({ deviceId: getOrCreateClientDeviceId() }),
      });

      if (response.ok) return true;

      const payload = await response.json().catch(() => null);
      if (response.status === 429) {
        const retryAfter = payload?.retryAfterSeconds;
        toast.error(
          retryAfter
            ? `Too many signup attempts. Please try again in about ${Math.ceil(retryAfter / 60)} minutes.`
            : "Too many signup attempts. Please try again later."
        );
        return false;
      }

      toast.error(payload?.error || "Unable to verify signup eligibility.");
      return false;
    } catch {
      toast.error("Signup protection check failed. Please try again.");
      return false;
    }
  };

  const handleEmailRegister = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!passwordValidation.isValid) {
      const message =
        passwordValidation.errors[0] || "Password does not meet requirements";
      setSubmitError(message);
      toast.error(message);
      return;
    }

    if (!acceptedTerms) {
      const message = "Please accept the Terms of Service and Privacy Policy";
      setSubmitError(message);
      toast.error(message);
      return;
    }

    const eligible = await checkSignupEligibility();
    if (!eligible) return;

    const displayName = `${firstName} ${lastName}`.trim();
    const success = await register(email, password, displayName);

    if (success) {
      capture("signup_completed", { method: "email" });
      toast.success(
        "Account created! Check your email to verify your address."
      );
      // Redirect handled by useEffect when user state updates (respects returnTo)
    } else {
      const message = error || "Registration failed";
      setSubmitError(message);
      toast.error(message);
    }
  };

  const handleGoogleRegister = async () => {
    setSubmitError(null);
    const eligible = await checkSignupEligibility();
    if (!eligible) return;

    const success = await signInWithGoogle();

    if (success) {
      capture("signup_completed", { method: "google" });
      toast.success("Account created successfully!");
      // Redirect handled by useEffect when user state updates (respects returnTo)
    } else {
      const message = error || "Google sign up failed";
      setSubmitError(message);
      toast.error(message);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrengthScore < 40) return "bg-red-500";
    if (passwordStrengthScore < 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthLabel = () => {
    if (passwordStrengthScore < 40) return "Weak";
    if (passwordStrengthScore < 80) return "Medium";
    return "Strong";
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding & Features */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] bg-gradient-to-br from-primary/10 via-background to-accent/10 relative overflow-hidden border-r border-border/60">
        {/* Decorative elements — warm, matches onboarding/homepage */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-foreground w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            ResumeZeus
          </Link>

          {/* Main content */}
          <div className="space-y-10">
            <div className="space-y-4">
              <h1 className="h-display">
                Build resumes that <span className="text-primary italic">beat the ATS</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Create ATS-friendly resumes, export PDFs for free, and get 30 AI credits at signup.
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-sm text-muted-foreground/70">
            Start free. Export PDFs. Keep your data private.
          </p>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-background overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[420px] space-y-6 py-8"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 text-xl font-bold">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            ResumeZeus
          </div>

          {/* Header */}
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Create your free account
            </h2>
            <p className="text-muted-foreground">
              Build resumes, export PDFs, and use 30 AI credits included at signup
            </p>
          </div>

          {/* Google Button */}
          <Button
            variant="outline"
            className="w-full h-12 text-base font-medium border-2 hover:bg-muted/50"
            type="button"
            onClick={handleGoogleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <LoadingInline className="mr-2" />
            ) : (
              <Chrome className="h-5 w-5 mr-3" />
            )}
            Sign up with Google
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            No credit card required for the free account
          </p>

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
            className="space-y-4"
            onSubmit={handleEmailRegister}
            onKeyDown={advanceFormOnEnter}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first-name" className="text-sm font-medium">
                  First name
                </Label>
                <Input
                  id="first-name"
                  placeholder="Alex"
                  autoComplete="given-name"
                  required
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (submitError) setSubmitError(null);
                  }}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name" className="text-sm font-medium">
                  Last name
                </Label>
                <Input
                  id="last-name"
                  placeholder="Rivera"
                  autoComplete="family-name"
                  required
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (submitError) setSubmitError(null);
                  }}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
            </div>

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
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <PasswordInput
                id="password"
                placeholder="Create a strong password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (submitError) setSubmitError(null);
                }}
                disabled={isLoading}
                className="h-11"
                aria-describedby={password.length > 0 ? "password-strength" : undefined}
              />

              {/* Password strength indicator */}
              {password.length > 0 && (
                <div id="password-strength" className="space-y-2 pt-1" aria-live="polite">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={cn(
                        "font-medium",
                        passwordStrengthScore >= 80
                          ? "text-green-600"
                          : "text-muted-foreground",
                      )}
                    >
                      {getStrengthLabel()}
                    </span>
                    <span className="text-muted-foreground">
                      {passwordStrengthScore}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-300",
                        getStrengthColor(),
                      )}
                      style={{ width: `${passwordStrengthScore}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
                    {passwordRequirements.map((req) => (
                      <div
                        key={req.label}
                        className={cn(
                          "flex items-center gap-1 text-[11px] transition-colors",
                          req.met
                            ? "text-green-600"
                            : "text-muted-foreground/60",
                        )}
                      >
                        {req.met ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <div className="w-3 h-3 flex items-center justify-center">
                            <div className="w-1 h-1 rounded-full bg-current" />
                          </div>
                        )}
                        {req.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 pt-1">
              <Checkbox
                id="terms"
                required
                checked={acceptedTerms}
                onCheckedChange={(checked) =>
                  setAcceptedTerms(checked === true)
                }
                disabled={isLoading}
                className="mt-0.5"
                aria-labelledby="terms-label"
              />
              <Label
                id="terms-label"
                htmlFor="terms"
                className="text-sm font-normal leading-relaxed"
              >
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-primary hover:underline font-medium"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-primary hover:underline font-medium"
                >
                  Privacy Policy
                </Link>
              </Label>
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
              Create account
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* Security note */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
            <Shield className="w-3.5 h-3.5" />
            <span>We protect your data with industry-standard security practices</span>
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-semibold"
            >
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
