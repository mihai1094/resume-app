"use client";

import { useState } from "react";
import Link from "next/link";
import { Flame, Bell, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ComingSoonContent() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO: wire up to email collection (e.g. Firestore, Mailchimp, etc.)
    setSubmitted(true);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden bg-background">
      {/* Ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse at 25% 40%, hsl(15 85% 52% / 0.08) 0%, transparent 60%)",
            "radial-gradient(ellipse at 75% 30%, hsl(38 95% 54% / 0.06) 0%, transparent 55%)",
            "radial-gradient(ellipse at 50% 80%, hsl(205 85% 60% / 0.04) 0%, transparent 50%)",
          ].join(", "),
        }}
      />

      {/* Dot grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(var(--foreground) / 0.08) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full text-center space-y-10">
        {/* Logo */}
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 font-bold text-2xl hover:opacity-80 transition-opacity"
        >
          <Flame className="w-7 h-7 text-primary" />
          <span>
            Resume<span className="text-orange-500 italic">Zeus</span>
          </span>
        </Link>

        {/* Headline */}
        <div className="space-y-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Coming Soon
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-medium tracking-tight leading-[1.05]">
            Something{" "}
            <span className="text-orange-500 italic">exciting</span> is
            on the way.
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground font-light leading-relaxed max-w-lg mx-auto">
            We&apos;re working on something new to help you land your next role
            faster. Be the first to know when it&apos;s ready.
          </p>
        </div>

        {/* Email notify form */}
        <div className="max-w-md mx-auto">
          {submitted ? (
            <div className="flex items-center justify-center gap-2.5 text-sm font-medium text-primary animate-fade-in">
              <CheckCircle2 className="w-5 h-5" />
              <span>You&apos;re on the list. We&apos;ll be in touch!</span>
            </div>
          ) : (
            <form
              onSubmit={handleNotify}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email address for notifications"
                className="h-12 text-base flex-1"
              />
              <Button type="submit" size="lg" className="h-12 px-6 gap-2">
                <Bell className="w-4 h-4" />
                Notify Me
              </Button>
            </form>
          )}
        </div>


      </div>
    </div>
  );
}
