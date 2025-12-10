"use client";

import { useState, useEffect, useMemo, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chrome, ShieldCheck, Sparkles, Check, X } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/hooks/use-user";
import { LoadingInline } from "@/components/shared/loading";
import { validatePassword } from "@/lib/services/auth";
import { Progress } from "@/components/ui/progress";

const onboardingSteps = [
  {
    title: "Tell us about your goals",
    description: "Share the roles you are targeting so AI can tailor phrasing.",
  },
  {
    title: "Import or start fresh",
    description:
      "Upload an existing CV or begin with one of our expert templates.",
  },
  {
    title: "Receive smart prompts",
    description: "Realtime guidance highlights wins and quantifies impact.",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const { user, register, signInWithGoogle, isLoading, error } = useUser();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Password validation
  const passwordValidation = useMemo(
    () => validatePassword(password),
    [password]
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
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
    {
      label: "One special character",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ];

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  const handleEmailRegister = async (e: FormEvent) => {
    e.preventDefault();

    // Validate password strength
    if (!passwordValidation.isValid) {
      toast.error(
        passwordValidation.errors[0] || "Password does not meet requirements"
      );
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
  return (
    <div className="min-h-screen bg-muted/30">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 lg:py-16 grid gap-12 lg:gap-16 lg:grid-cols-[1.1fr_0.9fr] items-start">
        {/* Left Side: Marketing Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8 text-center lg:text-left px-2 sm:px-6 md:px-10"
        >
          <Badge
            variant="outline"
            className="px-4 py-1 text-sm inline-flex items-center gap-2 bg-background/50 backdrop-blur"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            Launch faster with AI
          </Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Create a free ResumeForge account
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0">
              Unlock collaborative editing, auto-generated bullet points, and
              step-by-step tracking toward your next role. Your data stays
              private and export-ready at all times.
            </p>
          </div>

          <div className="grid gap-4">
            {onboardingSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
              >
                <Card className="border-border/50 hover:border-primary/20 transition-colors bg-background/50 backdrop-blur-sm">
                  <CardHeader className="space-y-1 pb-2">
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side: Registration Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="w-full max-w-md mx-auto shadow-xl border-primary/10 overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
            <CardHeader className="space-y-2 text-center sm:text-left">
              <CardTitle className="text-2xl">Create your account</CardTitle>
              <CardDescription>
                Start building resumes with guided AI assistance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                variant="outline"
                className="w-full h-11 text-base"
                type="button"
                onClick={handleGoogleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoadingInline className="mr-2" />
                ) : (
                  <Chrome className="h-4 w-4 mr-2" />
                )}
                Sign up with Google
              </Button>

              <div className="relative">
                <Separator />
                <span className="bg-background px-3 text-xs font-medium text-muted-foreground absolute left-1/2 -translate-x-1/2 -top-3">
                  or create with email
                </span>
              </div>

              <form className="space-y-5" onSubmit={handleEmailRegister}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First name</Label>
                    <Input
                      id="first-name"
                      name="firstName"
                      placeholder="Alex"
                      autoComplete="given-name"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isLoading}
                      className="transition-all focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last name</Label>
                    <Input
                      id="last-name"
                      name="lastName"
                      placeholder="Rivera"
                      autoComplete="family-name"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isLoading}
                      className="transition-all focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="transition-all focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <PasswordInput
                    id="password"
                    name="password"
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    aria-describedby="password-strength"
                    className="transition-all focus:ring-2 focus:ring-primary/20"
                  />
                  {/* Visual Strength Meter */}
                  {password.length > 0 && (
                    <div className="space-y-2" id="password-strength">
                      <div className="flex justify-between items-center text-xs">
                        <span className={passwordStrengthScore < 60 ? "text-muted-foreground" : "text-green-600 font-medium"}>
                          Strength: {passwordStrengthScore < 40 ? "Weak" : passwordStrengthScore < 80 ? "Medium" : "Strong"}
                        </span>
                        <span className="text-muted-foreground">{passwordStrengthScore}%</span>
                      </div>
                      <Progress value={passwordStrengthScore} className="h-1.5" />

                      <div className="grid grid-cols-2 gap-1 mt-2">
                        {passwordRequirements.map((req) => (
                          <div
                            key={req.label}
                            className={`flex items-center gap-1.5 text-[11px] transition-colors duration-200 ${req.met
                              ? "text-green-600 dark:text-green-400 font-medium"
                              : "text-muted-foreground/70"
                              }`}
                          >
                            {req.met ? (
                              <Check className="h-3 w-3 shrink-0" />
                            ) : (
                              <div className="h-1 w-1 rounded-full bg-current shrink-0" />
                            )}
                            {req.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <Checkbox
                    id="terms"
                    required
                    checked={acceptedTerms}
                    onCheckedChange={(checked) =>
                      setAcceptedTerms(checked === true)
                    }
                    disabled={isLoading}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm text-foreground font-normal leading-normal"
                  >
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:underline font-medium">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-primary hover:underline font-medium"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </Label>
                </div>

                <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold" disabled={isLoading}>
                  {isLoading ? <LoadingInline className="mr-2" /> : null}
                  Create account
                </Button>
              </form>

              <div className="flex items-center gap-3 rounded-lg border border-primary/10 bg-primary/5 p-4 text-sm text-muted-foreground">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                <span>We encrypt your resume data and never share it without permission.</span>
              </div>

              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Log in
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
