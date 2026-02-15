import Link from "next/link";
import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Sparkles, Zap, ArrowRight, X } from "lucide-react";
import { BackButton } from "@/components/shared/back-button";
import { FREE_TIER_LIMITS } from "@/lib/config/credits";

export const metadata: Metadata = {
  title: "Pricing | ResumeForge",
  description:
    "Choose Free for essential features or Premium for unlimited AI-powered resume building.",
};

interface PlanFeature {
  name: string;
  free: string | boolean;
  premium: string | boolean;
}

const features: PlanFeature[] = [
  { name: "Resumes", free: `${FREE_TIER_LIMITS.maxResumes}`, premium: "Unlimited" },
  { name: "Cover Letters", free: `${FREE_TIER_LIMITS.maxCoverLetters}`, premium: "Unlimited" },
  { name: "AI Credits / Month", free: `${FREE_TIER_LIMITS.monthlyAICredits}`, premium: "Unlimited" },
  { name: "All Templates", free: true, premium: true },
  { name: "PDF Export", free: true, premium: true },
  { name: "JSON Backup Export", free: true, premium: true },
  { name: "Basic AI Writing Tools", free: true, premium: true },
  { name: "Priority Support", free: false, premium: true },
];

function FeatureValue({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="w-5 h-5 text-green-500" />
    ) : (
      <X className="w-5 h-5 text-muted-foreground/50" />
    );
  }
  return <span className="font-medium">{value}</span>;
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      <div className="max-w-5xl mx-auto px-4 py-10 md:py-16 space-y-8">
        {/* Back button */}
        <div className="sticky top-0 z-10 -mx-4 px-4 pb-3 bg-background/80 backdrop-blur border-b">
          <div className="max-w-5xl mx-auto">
            <BackButton fallback="/dashboard" className="pl-0" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="w-4 h-4" />
            Simple Pricing
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold">
            Choose your plan
          </h1>
          <p className="text-muted-foreground text-lg">
            Start free with essential features. Upgrade anytime for unlimited AI power.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-6 md:grid-cols-2 items-stretch max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="w-full shadow-lg border-border/60 bg-card/80 backdrop-blur-sm flex flex-col">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Zap className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl">Free</CardTitle>
                <p className="text-muted-foreground text-sm mt-1">
                  Everything you need to get started
                </p>
              </div>
              <div>
                <span className="text-4xl font-bold">€0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <ul className="space-y-3 flex-1">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{FREE_TIER_LIMITS.maxResumes} resumes & {FREE_TIER_LIMITS.maxCoverLetters} cover letters</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{FREE_TIER_LIMITS.monthlyAICredits} AI credits per month</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>All professional templates</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>PDF export</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>JSON backup export</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Basic AI writing tools</span>
                </li>
              </ul>
              <Button variant="outline" size="lg" className="w-full mt-6" asChild>
                <Link href="/dashboard">Get Started Free</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="w-full shadow-xl border-primary/30 bg-gradient-to-b from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center justify-center gap-2">
                  <CardTitle className="text-2xl">Premium</CardTitle>
                  <Badge variant="default" className="bg-gradient-to-r from-amber-500 to-orange-500">
                    Best Value
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                  Unlimited everything for serious job seekers
                </p>
              </div>
              <div>
                <span className="text-4xl font-bold">€12</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <ul className="space-y-3 flex-1">
                <li className="flex items-center gap-2 text-sm font-medium">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Unlimited resumes & cover letters</span>
                </li>
                <li className="flex items-center gap-2 text-sm font-medium">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Unlimited AI credits</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>All templates included</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>PDF + JSON export</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Basic AI writing tools</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Button
                size="lg"
                className="w-full mt-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                disabled
              >
                Coming Soon
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">
                Premium subscriptions launching soon!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">Compare Plans</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Feature</th>
                  <th className="text-center py-3 px-4 font-medium">Free</th>
                  <th className="text-center py-3 px-4 font-medium">Premium</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, i) => (
                  <tr key={feature.name} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                    <td className="py-3 px-4 text-sm">{feature.name}</td>
                    <td className="py-3 px-4 text-center text-sm">
                      <div className="flex justify-center">
                        <FeatureValue value={feature.free} />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-sm">
                      <div className="flex justify-center">
                        <FeatureValue value={feature.premium} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-medium mb-2">What happens when I run out of AI credits?</h3>
              <p className="text-sm text-muted-foreground">
                Free users get {FREE_TIER_LIMITS.monthlyAICredits} AI credits per month. When you run out, you can wait until they reset on the 1st of next month, or upgrade to Premium for unlimited credits.
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-medium mb-2">Can I cancel my subscription?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! You can cancel anytime. Your Premium benefits will continue until the end of your billing period.
              </p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-medium mb-2">What counts as an AI credit?</h3>
              <p className="text-sm text-muted-foreground">
                Different AI features use different amounts of credits. Quick operations like improving a bullet point use 1 credit, while generating a cover letter uses 5 credits. Premium users have unlimited credits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
