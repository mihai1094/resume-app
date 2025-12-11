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
import { cn } from "@/lib/utils";


export default function RegisterPage() {
  const router = useRouter();
  const { user, register, signInWithGoogle, isLoading, error } = useUser();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const passwordValidation = useMemo(() => validatePassword(password), [password]);

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

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  const handleEmailRegister = async (e: FormEvent) => {
    e.preventDefault();

    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.errors[0] || "Password does not meet requirements");
      return;
    }

    if (!acceptedTerms) {
      toast.error("Please accept the Terms of Service and Privacy Policy");
      return;
    }

    const displayName = `${firstName} ${lastName}`.trim();
    const success = await register(email, password, displayName);

    if (success) {
      toast.success("Account created successfully!");
      router.push("/onboarding");
    } else {
      toast.error(error || "Registration failed");
    }
  };

  const handleGoogleRegister = async () => {
    const success = await signInWithGoogle();

    if (success) {
      toast.success("Account created successfully!");
      router.push("/onboarding");
    } else {
      toast.error(error || "Google sign up failed");
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
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-white w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            ResumeForge
          </Link>

          {/* Main content */}
          <div className="space-y-10">
            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
                Land your dream job faster
              </h1>
              <p className="text-lg text-slate-300 max-w-md">
                Create professional, ATS-friendly resumes in minutes with AI assistance.
              </p>
            </div>

          </div>

          {/* Footer */}
          <p className="text-sm text-slate-500">
            Join thousands of job seekers who landed their dream roles
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
            ResumeForge
          </div>

          {/* Header */}
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Create your free account
            </h2>
            <p className="text-muted-foreground">
              Start building professional resumes in minutes
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
          <form className="space-y-4" onSubmit={handleEmailRegister}>
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
                  onChange={(e) => setFirstName(e.target.value)}
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
                  onChange={(e) => setLastName(e.target.value)}
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
                onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-11"
              />

              {/* Password strength indicator */}
              {password.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={cn(
                      "font-medium",
                      passwordStrengthScore >= 80 ? "text-green-600" : "text-muted-foreground"
                    )}>
                      {getStrengthLabel()}
                    </span>
                    <span className="text-muted-foreground">{passwordStrengthScore}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full transition-all duration-300", getStrengthColor())}
                      style={{ width: `${passwordStrengthScore}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
                    {passwordRequirements.map((req) => (
                      <div
                        key={req.label}
                        className={cn(
                          "flex items-center gap-1 text-[11px] transition-colors",
                          req.met ? "text-green-600" : "text-muted-foreground/60"
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
                onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                disabled={isLoading}
                className="mt-0.5"
              />
              <Label htmlFor="terms" className="text-sm font-normal leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:underline font-medium">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline font-medium">
                  Privacy Policy
                </Link>
              </Label>
            </div>

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
            <span>Your data is encrypted and never shared</span>
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Log in
            </Link>
          </p>

        </motion.div>
      </div>
    </div>
  );
}
