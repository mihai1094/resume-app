import Link from "next/link";
import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/shared/footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Check, Crown, Sparkles, Zap, ArrowRight, X } from "lucide-react";
import { FREE_TIER_LIMITS } from "@/lib/config/credits";
import { toAbsoluteUrl } from "@/lib/config/site-url";
import { comparisonPages } from "@/lib/data/comparison-pages";
import { FreePlanCTA } from "./free-plan-cta";

export const metadata: Metadata = {
  title: "Pricing | ResumeZeus",
  description:
    "Free account includes PDF export and 30 AI credits at signup. Upgrade later if you need more AI credits and higher limits.",
  alternates: {
    canonical: toAbsoluteUrl("/pricing"),
  },
  openGraph: {
    title: "Pricing | ResumeZeus",
    description:
      "Free account includes PDF export and 30 AI credits at signup. Upgrade later for more AI credits and higher limits.",
    url: toAbsoluteUrl("/pricing"),
  },
};

interface PlanFeature {
  name: string;
  free: string | boolean;
  premium: string | boolean;
}

const features: PlanFeature[] = [
  { name: "Resumes", free: `${FREE_TIER_LIMITS.maxResumes}`, premium: "Unlimited" },
  { name: "Cover Letters", free: `${FREE_TIER_LIMITS.maxCoverLetters}`, premium: "Unlimited" },
  { name: "AI Credits (signup bonus)", free: `${FREE_TIER_LIMITS.monthlyAICredits}`, premium: "Unlimited" },
  { name: "All Templates", free: true, premium: true },
  { name: "PDF Export", free: true, premium: true },
  { name: "JSON Backup Export", free: true, premium: true },
  { name: "AI Writing Tools", free: true, premium: true },
];

function FeatureValue({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="w-5 h-5 text-success" />
    ) : (
      <X className="w-5 h-5 text-muted-foreground/30" />
    );
  }
  return <span className="font-semibold">{value}</span>;
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="overflow-x-hidden">
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Ambient background — matches homepage pattern */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-primary/3 to-background pointer-events-none" />
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative container mx-auto px-6 pt-16 pb-12 md:pt-24 md:pb-16">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <ScrollReveal>
                <Badge variant="secondary" className="gap-1.5 px-4 py-1.5 text-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  Free to Start
                </Badge>
              </ScrollReveal>

              <ScrollReveal delay={80}>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight leading-[1.08]">
                  Start free. Upgrade{" "}
                  <span className="text-orange-500 italic">only when you need to.</span>
                </h1>
              </ScrollReveal>

              <ScrollReveal delay={160}>
                <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed max-w-xl mx-auto">
                  Create an account to build resumes, export PDFs, and use a one-time bonus of {FREE_TIER_LIMITS.monthlyAICredits} AI credits.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="container mx-auto px-6 pb-16 md:pb-24">
          <div className="grid gap-6 md:grid-cols-2 items-stretch max-w-4xl mx-auto">
            {/* Free Plan */}
            <ScrollReveal delay={100}>
              <div className="h-full rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-6 md:p-8 flex flex-col shadow-sm hover:border-border transition-colors">
                <div className="text-center space-y-4 mb-8">
                  <div className="mx-auto w-11 h-11 rounded-xl border border-border bg-gradient-to-br from-muted to-background flex items-center justify-center">
                    <Zap className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif font-medium tracking-tight">Free</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Create resumes, export PDFs, use AI right away
                    </p>
                  </div>
                  <div>
                    <span className="text-4xl font-bold tracking-tight">€0</span>
                    <span className="text-muted-foreground ml-1">/month</span>
                  </div>
                </div>

                <ul className="space-y-3 flex-1">
                  {[
                    `${FREE_TIER_LIMITS.maxResumes} resumes & ${FREE_TIER_LIMITS.maxCoverLetters} cover letters`,
                    `${FREE_TIER_LIMITS.monthlyAICredits} AI credits included at signup`,
                    "All professional templates",
                    "Unlimited PDF export",
                    "JSON backup export",
                    "AI writing tools",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <FreePlanCTA />
              </div>
            </ScrollReveal>

            {/* Premium Plan */}
            <ScrollReveal delay={200}>
              <div className="h-full rounded-2xl border border-primary/25 bg-gradient-to-b from-primary/5 via-background to-background p-6 md:p-8 flex flex-col shadow-lg relative overflow-hidden">
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-orange-500 to-accent" />

                <div className="text-center space-y-4 mb-8">
                  <div className="mx-auto w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-md shadow-primary/20">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-2">
                      <h2 className="text-2xl font-serif font-medium tracking-tight">Premium</h2>
                      <Badge className="bg-primary hover:bg-primary text-primary-foreground text-[10px] px-2">
                        Best Value
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mt-1">
                      More credits and higher limits for heavier usage
                    </p>
                  </div>
                  <div>
                    <span className="text-4xl font-bold tracking-tight">€12</span>
                    <span className="text-muted-foreground ml-1">/month</span>
                  </div>
                </div>

                <ul className="space-y-3 flex-1">
                  {[
                    { text: "Unlimited resumes & cover letters", bold: true },
                    { text: "Unlimited AI credits", bold: true },
                    { text: "All templates included", bold: false },
                    { text: "PDF + JSON export", bold: false },
                    { text: "AI writing tools", bold: false },
                  ].map(({ text, bold }) => (
                    <li key={text} className={`flex items-start gap-2.5 text-sm ${bold ? "font-medium" : ""}`}>
                      <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  className="w-full mt-8 h-12 text-base bg-primary hover:bg-primary/90 shadow-md"
                  disabled
                >
                  Coming Soon
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  Upgrade when you need more AI credits or higher limits.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-6 py-16 md:py-24">
            <ScrollReveal>
              <h2 className="text-3xl md:text-4xl font-serif font-medium tracking-tight text-center mb-10">
                Compare <span className="text-orange-500 italic">plans</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <div className="max-w-3xl mx-auto overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/60">
                      <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">Feature</th>
                      <th className="text-center py-4 px-4 text-sm font-medium text-muted-foreground uppercase tracking-wider w-28">Free</th>
                      <th className="text-center py-4 px-4 text-sm font-medium text-muted-foreground uppercase tracking-wider w-28">Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    {features.map((feature, i) => (
                      <tr key={feature.name} className="border-b border-border/30 last:border-0">
                        <td className="py-3.5 px-4 text-sm">{feature.name}</td>
                        <td className="py-3.5 px-4 text-center text-sm">
                          <div className="flex justify-center">
                            <FeatureValue value={feature.free} />
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center text-sm">
                          <div className="flex justify-center">
                            <FeatureValue value={feature.premium} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-6 py-16 md:py-24">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-serif font-medium tracking-tight text-center mb-10">
              Frequently asked <span className="text-orange-500 italic">questions</span>
            </h2>
          </ScrollReveal>

          <div className="max-w-2xl mx-auto space-y-4">
            {[
              {
                q: "What happens when I run out of AI credits?",
                a: `Free accounts get ${FREE_TIER_LIMITS.monthlyAICredits} AI credits as a one-time signup bonus. Once used, you can upgrade for more credits and higher limits.`,
              },
              {
                q: "Can I cancel my subscription?",
                a: "Premium subscriptions are not live yet. Billing, cancellation, and subscription management will be available once Premium launches.",
              },
              {
                q: "What counts as an AI credit?",
                a: "Different AI features use different amounts of credits. Quick operations like improving a bullet point typically use 1 credit, while larger actions like generating a cover letter use more. Costs are shown in the app before you run each AI action.",
              },
            ].map((faq, i) => (
              <ScrollReveal key={faq.q} delay={i * 80}>
                <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-5 md:p-6 hover:border-border transition-colors">
                  <h3 className="font-semibold text-[15px] mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
          </div>
        </section>

        {/* Compare builders */}
        <section id="compare-builders" className="container mx-auto px-6 py-16 md:py-24 scroll-mt-24">
          <ScrollReveal>
            <h2 className="text-2xl md:text-3xl font-serif font-medium tracking-tight text-center">
              Compare with <span className="text-orange-500 italic">other builders</span>
            </h2>
            <p className="mt-3 text-center text-muted-foreground max-w-xl mx-auto">
              Evaluating alternatives? Compare the free workflow, export limits, and pricing model before committing.
            </p>
          </ScrollReveal>
          <div className="mt-8 grid gap-4 md:grid-cols-3 max-w-4xl mx-auto">
            {comparisonPages.map((page, i) => (
              <ScrollReveal key={page.slug} delay={i * 80}>
                <Link
                  href={`/vs/${page.slug}`}
                  className="group block h-full rounded-xl border border-border/60 bg-card/80 p-5 transition-all hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="font-semibold text-[15px]">{page.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{page.description}</p>
                  <p className="mt-4 inline-flex items-center text-sm font-medium text-primary">
                    Read comparison
                    <ArrowRight className="ml-1.5 w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </p>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
