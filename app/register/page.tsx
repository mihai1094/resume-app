import type { Metadata } from "next";
import Link from "next/link";
import { Chrome, ShieldCheck, Sparkles } from "lucide-react";

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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Register | ResumeForge",
  description:
    "Create a ResumeForge account to save drafts, sync progress, and unlock AI-powered resume insights.",
};

const onboardingSteps = [
  {
    title: "Tell us about your goals",
    description: "Share the roles you are targeting so AI can tailor phrasing.",
  },
  {
    title: "Import or start fresh",
    description: "Upload an existing CV or begin with one of our expert templates.",
  },
  {
    title: "Receive smart prompts",
    description: "Realtime guidance highlights wins and quantifies impact.",
  },
];

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <SiteHeader />
      <main className="container mx-auto px-4 py-16 grid gap-12 lg:gap-16 lg:grid-cols-[1.1fr_0.9fr] items-start">
        <div className="space-y-8 text-center lg:text-left px-2 sm:px-6 md:px-10">
          <Badge
            variant="outline"
            className="px-4 py-1 text-sm inline-flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            Launch faster with AI
          </Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Create a free ResumeForge account
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0">
              Unlock collaborative editing, auto-generated bullet points, and step-by-step
              tracking toward your next role. Your data stays private and export-ready at all times.
            </p>
          </div>

          <div className="grid gap-4">
            {onboardingSteps.map((step) => (
              <Card key={step.title} className="border-border/50">
                <CardHeader className="space-y-1 pb-2">
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <Card className="w-full max-w-md mx-auto shadow-xl border-primary/10">
          <CardHeader className="space-y-2">
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Start building resumes with guided AI assistance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button variant="outline" className="w-full" type="button">
              <Chrome className="h-4 w-4 mr-2" />
              Sign up with Google
            </Button>

            <div className="relative">
              <Separator />
              <span className="bg-background px-3 text-xs font-medium text-muted-foreground absolute left-1/2 -translate-x-1/2 -top-3">
                or create with email
              </span>
            </div>

            <form className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input
                    id="first-name"
                    name="firstName"
                    placeholder="Alex"
                    autoComplete="given-name"
                    required
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
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="flex items-start gap-3">
                <Checkbox id="terms" required />
                <Label htmlFor="terms" className="text-sm text-muted-foreground">
                  I agree to the{" "}
                  <Link href="/docs/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>
                  {" "}and{" "}
                  <Link href="/docs/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </Label>
              </div>

              <Button type="submit" className="w-full">
                Create account
              </Button>
            </form>

            <div className="flex items-center gap-3 rounded-lg border border-dashed border-primary/20 p-4 text-sm text-muted-foreground">
              <ShieldCheck className="h-5 w-5 text-primary" />
              We encrypt your resume data and never share it without permission.
            </div>

            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
