import type { Metadata } from "next";
import Link from "next/link";
import { Chrome } from "lucide-react";

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

export const metadata: Metadata = {
  title: "Login | ResumeForge",
  description:
    "Sign in to ResumeForge to access your saved resumes, templates, and progress.",
};

const featureBullets = [
  "Save multiple tailored resumes",
  "One-click exports to PDF or DOCX",
  "AI tips based on your career goals",
];

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-muted/40">
      <SiteHeader />
      <main className="container mx-auto px-4 py-16 grid gap-12 lg:gap-16 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <div className="space-y-8 text-center lg:text-left px-2 sm:px-6 md:px-10">
          <Badge
            variant="outline"
            className="px-4 py-1 text-sm inline-flex items-center gap-2"
          >
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Welcome back
          </Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Pick up where you left off
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0">
              Access drafts, sync changes across devices, and keep every version of your resume
              ready for the next opportunity. Logging in lets you save progress and unlock
              personalized AI suggestions.
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
            <CardTitle>Log in to ResumeForge</CardTitle>
            <CardDescription>
              Continue building resumes with your saved profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button variant="outline" className="w-full" type="button">
              <Chrome className="h-4 w-4 mr-2" />
              Continue with Google
            </Button>

            <div className="relative">
              <Separator />
              <span className="bg-background px-3 text-xs font-medium text-muted-foreground absolute left-1/2 -translate-x-1/2 -top-3">
                or continue with email
              </span>
            </div>

            <form className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
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
      </main>
    </div>
  );
}
