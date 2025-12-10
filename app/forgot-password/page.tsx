"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingInline } from "@/components/shared/loading";
import { authService } from "@/lib/services/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await authService.sendPasswordReset(email);

    if (result.success) {
      setIsEmailSent(true);
      toast.success("Password reset email sent!");
    } else {
      toast.error(result.error || "Failed to send reset email");
    }

    setIsLoading(false);
  };

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
              <CardTitle className="font-serif">Reset your password</CardTitle>
              <CardDescription>
                {isEmailSent
                  ? "Check your email for a password reset link."
                  : "Enter your email address and we'll send you a link to reset your password."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEmailSent ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      We&apos;ve sent a password reset link to{" "}
                      <span className="font-medium text-foreground">{email}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Didn&apos;t receive the email? Check your spam folder or{" "}
                      <button
                        type="button"
                        onClick={() => setIsEmailSent(false)}
                        className="text-primary hover:underline"
                      >
                        try again
                      </button>
                    </p>
                  </div>
                  <Button asChild className="w-full">
                    <Link href="/login">Return to login</Link>
                  </Button>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
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

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <LoadingInline className="mr-2" /> : null}
                    Send reset link
                  </Button>

                  <p className="text-sm text-center text-muted-foreground">
                    Remember your password?{" "}
                    <Link href="/login" className="text-primary hover:underline">
                      Log in
                    </Link>
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
