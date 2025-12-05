import Link from "next/link";
import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Lock, Shield, Sparkles, Zap, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing & Upgrades | ResumeForge",
  description:
    "Choose Pro for more capacity or Ultra for AI-powered optimization plus everything in Pro.",
};

const proBenefits = [
  "Up to 999 resumes and cover letters",
  "Unlimited exports (PDF & JSON)",
  "All templates included",
  "Priority email support",
];

const ultraBenefits = [
  "Everything in Pro (capacity + exports)",
  "AI Optimize with keyword suggestions",
  "ATS readiness checks and improvement tips",
  "Job-specific recommendations and insights",
];

function BenefitList({ items }: { items: string[] }) {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left w-full">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-3 text-sm bg-muted/40 rounded-lg p-3 border border-border/50"
        >
          <Check className="w-4 h-4 text-green-500 mt-0.5" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      <div className="max-w-5xl mx-auto px-4 py-10 md:py-16 space-y-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="self-start gap-2 md:hidden"
            asChild
          >
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </Button>
          <div className="text-center md:text-left space-y-3 max-w-3xl">
            <Badge variant="secondary" className="gap-1 self-center md:self-start inline-flex">
              <Sparkles className="w-4 h-4" />
              Plans & AI
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold">Upgrade your toolkit</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto md:mx-0">
              Choose Pro for capacity and exports, or Ultra for AI optimization plus everything in Pro.
              One-time pricing during beta. No auto-renew.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="self-start md:self-start gap-2 hidden md:inline-flex"
            asChild
          >
            <Link href="/dashboard">← Back to dashboard</Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 items-stretch">
          <Card
            id="pro"
            className="w-full shadow-lg border-border/60 bg-card/80 backdrop-blur-sm flex flex-col"
          >
            <CardHeader className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <CardTitle>Pro</CardTitle>
                <Badge variant="outline">Capacity</Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                Keep more resumes and cover letters without limits.
              </p>
              <div className="text-3xl font-bold tracking-tight">$12</div>
              <span className="text-sm text-muted-foreground">full storage & exports</span>
            </CardHeader>
            <CardContent className="space-y-6 flex flex-col h-full">
              <div className="flex-1">
                <BenefitList items={proBenefits} />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center sm:items-center sm:justify-center">
                <Button size="lg" className="w-full" asChild>
                  <Link href="/checkout/pro">Upgrade to Pro</Link>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Best for storing more resumes and exporting without limits.
              </p>
            </CardContent>
          </Card>

          <Card
            id="ultra"
            className="w-full shadow-xl border-primary/15 bg-card/80 backdrop-blur-sm flex flex-col relative overflow-hidden"
          >
            <div className="md:hidden absolute top-3 right-3">
              <Badge variant="default" className="text-[11px]">Most popular</Badge>
            </div>
            <CardHeader className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <CardTitle>Ultra</CardTitle>
                <Badge variant="default">Recommended</Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                AI optimization plus all Pro capacity and exports in one bundle.
              </p>
              <div className="text-3xl font-bold tracking-tight">$19</div>
              <span className="text-sm text-muted-foreground">one-time, beta pricing</span>
            </CardHeader>
            <CardContent className="space-y-6 flex flex-col h-full">
              <div className="flex-1">
                <BenefitList items={ultraBenefits} />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center sm:items-center sm:justify-center">
                <Button size="lg" className="w-full" asChild>
                  <Link href="/checkout/ai">Unlock Ultra</Link>
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" />
                Cancel anytime during beta · No auto-renew while in beta
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile quick actions */}
        <div className="md:hidden sticky bottom-4 left-0 right-0 px-1">
          <div className="mx-auto max-w-md rounded-2xl border bg-background/95 shadow-lg backdrop-blur-sm p-4 space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Ready to upgrade?</span>
              <span className="text-primary font-semibold">One-time beta pricing</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button asChild size="lg" className="w-full">
                <Link href="/checkout/pro">Get Pro</Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="w-full">
                <Link href="/checkout/ai">Get Ultra</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

