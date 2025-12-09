"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chrome } from "lucide-react";
import { toast } from "sonner";
import { firestoreService } from "@/lib/services/firestore";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/hooks/use-user";
import { LoadingInline } from "@/components/shared/loading";

const featureBullets = [
  "Save multiple tailored resumes",
  "One-click exports to PDF or DOCX",
  "AI tips based on your career goals",
];

export default function LoginPage() {
  const router = useRouter();
  const { user, signIn, signInWithGoogle, isLoading, error } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    const success = await signIn(email, password);

    if (success && user) {
      toast.success("Welcome back!");

      try {
        const resumes = await firestoreService.getSavedResumes(user.id);
        const destination = resumes.length > 0 ? "/dashboard" : "/";
        router.push(destination);
      } catch (err) {
        console.error("Failed to load saved resumes:", err);
        router.push("/dashboard");
      }
    } else {
      toast.error(error || "Login failed");
    }
  };

  const handleGoogleLogin = async () => {
    const success = await signInWithGoogle();

    if (success) {
      // Wait a bit for user state to update via auth listener
      setTimeout(async () => {
        try {
          const { authService } = await import("@/lib/services/auth");
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            const { firestoreService } = await import("@/lib/services/firestore");
            const userExists = await firestoreService.userExists(currentUser.uid);
            const resumes = await firestoreService.getSavedResumes(currentUser.uid);
            const isNewUser = !userExists;

            if (isNewUser) {
              toast.success("Account created successfully!");
              router.push("/onboarding");
            } else {
              toast.success("Welcome back!");
              const destination = resumes.length > 0 ? "/dashboard" : "/";
              router.push(destination);
            }
          }
        } catch (err) {
          console.error("Failed to load user data:", err);
          // Still redirect even if check fails
          router.push("/dashboard");
        }
      }, 800);
    } else {
      toast.error(error || "Google login failed");
    }
  };
  return (
    <div className="min-h-screen bg-muted/40">
      <SiteHeader />
      <main className="container mx-auto px-4 py-8 md:py-16">
        {/* Mobile-first: Form comes first */}
        <div className="max-w-md mx-auto lg:hidden mb-12">
          <Card className="shadow-xl border-primary/10">
            <CardHeader className="space-y-2">
              <CardTitle className="font-serif">Log in to ResumeForge</CardTitle>
              <CardDescription>
                Continue building resumes with your saved profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoadingInline className="mr-2" />
                ) : (
                  <Chrome className="h-4 w-4 mr-2" />
                )}
                Continue with Google
              </Button>

              <div className="relative">
                <Separator />
                <span className="bg-background px-3 text-xs font-medium text-muted-foreground absolute left-1/2 -translate-x-1/2 -top-3">
                  or continue with email
                </span>
              </div>

              <form className="space-y-5" onSubmit={handleEmailLogin}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="#" className="text-sm text-primary hover:underline">
                      Forgot?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <LoadingInline className="mr-2" /> : null}
                  Log in
                </Button>
              </form>

              <p className="text-sm text-center text-muted-foreground">
                No account yet?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Get started free
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Desktop: Two-column layout */}
        <div className="hidden lg:grid gap-12 lg:gap-16 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-8 text-center lg:text-left px-2 sm:px-6 md:px-10">
            <Badge
              variant="outline"
              className="px-4 py-1 text-sm inline-flex items-center gap-2"
            >
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Welcome back
            </Badge>
            <div className="space-y-4">
              <h1 className="text-4xl font-serif font-medium tracking-tight text-foreground md:text-5xl">
                Pick up where you left off
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Access drafts, sync changes across devices, and keep every version of your resume
                ready for the next opportunity.
              </p>
            </div>
            <ul className="grid gap-4 text-left">
              {featureBullets.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardDescription>Active resumes</CardDescription>
                  <CardTitle className="text-3xl">6</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-muted-foreground">
                  Keep every tailored version synced and ready to export.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Latest suggestion</CardDescription>
                  <CardTitle className="text-lg">Highlight leadership wins</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-muted-foreground">
                  AI nudges watch for gaps so you never miss recruiter-ready phrasing.
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="w-full max-w-md mx-auto shadow-xl border-primary/10">
            <CardHeader className="space-y-2">
              <CardTitle className="font-serif">Log in to ResumeForge</CardTitle>
              <CardDescription>
                Continue building resumes with your saved profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoadingInline className="mr-2" />
                ) : (
                  <Chrome className="h-4 w-4 mr-2" />
                )}
                Continue with Google
              </Button>

              <div className="relative">
                <Separator />
                <span className="bg-background px-3 text-xs font-medium text-muted-foreground absolute left-1/2 -translate-x-1/2 -top-3">
                  or continue with email
                </span>
              </div>

              <form className="space-y-5" onSubmit={handleEmailLogin}>
                <div className="space-y-2">
                  <Label htmlFor="email-desktop">Email</Label>
                  <Input
                    id="email-desktop"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password-desktop">Password</Label>
                    <Link href="#" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password-desktop"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <LoadingInline className="mr-2" /> : null}
                  Log in
                </Button>
              </form>

              <p className="text-sm text-center text-muted-foreground">
                No account yet?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Get started free
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mobile: Feature content below form */}
        <div className="lg:hidden space-y-6 mt-12 max-w-md mx-auto">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-serif font-medium">Why log in?</h2>
            <p className="text-muted-foreground text-sm">
              Access your saved resumes and unlock personalized features
            </p>
          </div>

          <ul className="grid gap-3">
            {featureBullets.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
