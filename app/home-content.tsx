"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, ArrowRight, Check, Search } from "lucide-react";
import { getTierLimits } from "@/lib/config/credits";
import { ScrollReveal } from "@/components/scroll-reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HeroStats } from "@/components/home/hero-stats";
import { SiteHeader } from "@/components/layout/site-header";
import { StickyMobileCTA } from "@/components/home/sticky-mobile-cta";
import { ParallaxBackground } from "@/components/home/parallax-background";
import { InteractiveResumePreview } from "@/components/home/interactive-resume-preview";
import { PlanLimitDialog } from "@/components/shared/plan-limit-dialog";
import { TemplateMiniPreview } from "@/components/home/template-mini-preview";
import { HowItWorks } from "@/components/home/how-it-works";
import { TemplateGallery } from "@/components/home/template-gallery";
import { Footer } from "@/components/shared/footer";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";
import { useSavedResumes } from "@/hooks/use-saved-resumes";
import { useUser } from "@/hooks/use-user";

export function HomeContent() {
  const router = useRouter();
  useSmoothScroll();

  // Get user and their saved resumes
  const { user, isLoading: userLoading } = useUser();

  const { resumes, isLoading: resumesLoading } = useSavedResumes(
    user?.id || null
  );
  const hasResumes = resumes.length > 0;
  // Check for cover letters
  const [showPlanLimitModal, setShowPlanLimitModal] = useState(false);

  const plan = user?.plan ?? "free";
  const limits = getTierLimits(plan);
  const isResumeLimitReached = user
    ? resumes.length >= limits.maxResumes
    : false;
  const primaryCtaLabel = user ? (hasResumes ? "Create YOUR resume" : "Start building") : "Create free account";
  const primaryCtaLabelMobile = user ? (hasResumes ? "Create YOUR resume" : "Start building resume") : "Create free account";
  const stickyCtaLabel = user ? "Start building" : "Create free account";

  const handleCreateResume = () => {
    if (user && !resumesLoading && isResumeLimitReached) {
      setShowPlanLimitModal(true);
      return;
    }

    if (!user) {
      router.push("/register");
      return;
    }

    // Route to template gallery for template + color selection
    router.push("/templates");
  };

  // No loading spinner — render page immediately with default (unauthenticated) state.
  // CTA labels already fall back to "Create free account" when user is null.

  return (
    <>
      <a
        href="#home-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-primary text-primary-foreground px-4 py-2 rounded shadow-lg"
      >
        Skip to main content
      </a>
      <SiteHeader />
      <main id="home-main" className="min-h-screen overflow-x-hidden pb-16 lg:pb-0">
        {/* 1. Hero Section */}
        <section className="relative overflow-hidden">
          {/* Parallax background shapes */}
          <ParallaxBackground />

          <div className="container mx-auto px-6 py-8 md:py-6 lg:py-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
                {/* Left: Content */}
                <div className="space-y-10 sm:space-y-6 text-center lg:text-left">
                  {/* Headline */}
                  <div className="space-y-8 sm:space-y-4">
                    <h1 className="text-6xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-medium tracking-tight leading-[1.05] text-foreground">
                      The Resume Builder{" "}
                      <span className="text-orange-500 italic">
                        that gets you in.
                      </span>
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
                      OUR templates, YOUR experience. Get a FREE exported
                      version of your resume with AI-powered suggestions that
                      will help you create a competitive edge.
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    {/* Primary CTA - Create Resume */}
                    <Button
                      size="lg"
                      className="text-base px-8 h-12 group"
                      aria-label={user ? "Start building your resume" : "Create your free account"}
                      onClick={handleCreateResume}
                      type="button"
                    >
                      <span className="sm:hidden">{primaryCtaLabelMobile}</span>
                      <span className="hidden sm:inline">{primaryCtaLabel}</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    {/* Secondary CTA - Templates */}
                    <Button
                      asChild
                      size="lg"
                      variant="ghost"
                      className="text-base text-muted-foreground border border-secondary-foreground/30 hover:text-secondary-foreground hover:bg-secondary transition-all duration-300 group"
                      aria-label="View resume templates"
                    >
                      <Link href="/templates">
                        <Search className="w-4 h-4 mr-2" />
                        See OUR Templates
                      </Link>
                    </Button>
                  </div>

                  {/* Trust indicators - compact list on mobile, pills on desktop */}
                  <div className="flex flex-row flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-6 pt-2 text-xs sm:text-sm">
                    {["Free PDF export", "AI Enhanced", "No credit card required"].map((text) => (
                      <div key={text} className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground bg-muted/50 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="font-medium">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Visual Preview - hidden on mobile */}
                <div className="relative mt-8 lg:mt-0 hidden lg:block pt-8">
                  {/* Interactive Resume Preview with Template Switcher */}
                  <div className="max-w-[430px] mx-auto">
                    <InteractiveResumePreview />
                  </div>
                </div>

                {/* Tablet: Single template preview (hidden on phone and desktop) */}
                <div className="mt-4 hidden sm:block lg:hidden">
                  <div className="max-w-[280px] mx-auto">
                    <Card className="overflow-hidden shadow-xl border aspect-[8.5/11]">
                      <TemplateMiniPreview templateId="modern" />
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Stats Section (Validation) */}
        <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background border-y border-primary/10">
          <div className="container mx-auto px-6 py-12 md:py-16 lg:py-20">
            <ScrollReveal>
              <div className="max-w-5xl mx-auto">
                <HeroStats />
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Trust Signals section removed — redundant with HeroStats */}

        {/* 4. Templates Gallery */}
        <section
          id="templates"
          className="container mx-auto px-6 py-16 md:py-24 lg:py-28"
        >
          <TemplateGallery />
        </section>

        {/* 5. How It Works (Clarity) */}
        <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background border-y border-primary/10">
          <div className="container mx-auto px-6 py-12 md:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto space-y-12">
            <ScrollReveal>
              <div className="text-center lg:text-left space-y-4">
                <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  3-Step Workflow
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium tracking-tight">
                  How do you turn a blank page into a <span className="text-orange-500 italic">job-ready resume?</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-xl">
                  Pick a template, add your experience, then polish with AI before you export.
                  The goal is a fast path from first draft to PDF-ready application material.
                </p>
              </div>
            </ScrollReveal>

            {/* Interactive How It Works */}
            <ScrollReveal>
              <HowItWorks />
            </ScrollReveal>
          </div>
          </div>
        </section>


        {/* 7. FAQ Section */}
        <section className="container mx-auto px-6 py-12 md:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Section Header */}
            <ScrollReveal>
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium tracking-tight">
                  Frequently asked <span className="text-orange-500 italic">questions</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  Get your questions answered and set the foundation for a resume that wins.
                </p>
              </div>
            </ScrollReveal>

            {/* FAQ Accordion */}
            <ScrollReveal delay={200}>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left">
                    How do ATS-friendly templates work?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Each template includes an ATS compatibility rating
                    (Excellent, Good, Moderate, or Low). Most templates use
                    clean formatting and structure for reliable ATS parsing,
                    while some design-first templates trade ATS performance for
                    visual style. If ATS is your top priority, choose a
                    template marked Excellent or Good.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left">
                    Is my data secure and private?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Yes. Draft changes are kept in your browser session for
                    quick recovery, and signed-in data is synced to your
                    account for cross-device access. AI features process only
                    the resume and job-description content needed for each
                    request. You can use AI privacy controls and delete your
                    account data anytime from Settings.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left">
                    Can I export my resume to PDF for free?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Yes. Free accounts can export resumes as high-quality PDFs
                    ready to send to employers. You can also export your data as
                    JSON for backup or transfer between devices.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left">
                    Is ResumeZeus free and do I need a credit card?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    ResumeZeus offers a free account for creating resumes,
                    exporting PDFs, and using AI features with a one-time signup
                    bonus of 30 AI credits. No credit card is required for the
                    free account. You only need billing details if you later
                    choose to buy more AI credits or upgrade.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-left">
                    Can I create multiple versions of my resume?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Yes! You can create and save multiple resume versions
                    tailored to different job types or industries. Access them
                    from your dashboard where you can manage, edit, export, and
                    switch between versions easily (within your plan limits).
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger className="text-left">
                    What AI features are available?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Current AI features include bullet generation, bullet
                    improvement, professional summary writing, skills
                    suggestions, ATS analysis, and AI cover letter generation.
                    Free accounts include 30 AI credits at signup.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger className="text-left text-orange-500 italic">
                    How is this different from other resume builders?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    ResumeZeus is built by a small EU-based team focused on ATS
                    compatibility and privacy. Unlike most builders, free
                    accounts get full PDF export with no watermarks. AI features
                    use one-time credits instead of a subscription, so you only
                    pay for what you need — and many users never need to.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />

      {/* Sticky Mobile CTA */}
      <StickyMobileCTA onCreate={handleCreateResume} label={stickyCtaLabel} />
      <PlanLimitDialog
        open={showPlanLimitModal}
        onOpenChange={setShowPlanLimitModal}
        limit={limits.maxResumes}
        onManage={() => {
          setShowPlanLimitModal(false);
          router.push("/dashboard");
        }}
        onUpgrade={() => {
          setShowPlanLimitModal(false);
          router.push("/pricing#pro");
        }}
      />
    </>
  );
}
