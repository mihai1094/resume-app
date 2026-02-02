"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, Check, Star, Zap } from "lucide-react";
import { TEMPLATES } from "@/lib/constants";
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
// KeyBenefits removed to reduce duplication with HeroStats
import { StickyMobileCTA } from "@/components/home/sticky-mobile-cta";
import { ParallaxBackground } from "@/components/home/parallax-background";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { InteractiveResumePreview } from "@/components/home/interactive-resume-preview";
import { PlanLimitDialog } from "@/components/shared/plan-limit-dialog";
import { TemplateMiniPreview } from "@/components/home/template-mini-preview";
import { HowItWorks } from "@/components/home/how-it-works";
import { SiteFooter } from "@/components/layout/site-footer";
import { useConfetti } from "@/hooks/use-confetti";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";
import { useSavedResumes } from "@/hooks/use-saved-resumes";
import { useUser } from "@/hooks/use-user";

export function HomeContent() {
  // Celebration effects and smooth scrolling
  const { celebrate } = useConfetti();
  const router = useRouter();
  useSmoothScroll();

  // Get user and their saved resumes
  const { user, isLoading: userLoading } = useUser();

  const { resumes, isLoading: resumesLoading } = useSavedResumes(
    user?.id || null,
  );
  const hasResumes = resumes.length > 0;
  // Check for cover letters
  const [showPlanLimitModal, setShowPlanLimitModal] = useState(false);
  const [heroParallax, setHeroParallax] = useState(0);

  const plan = user?.plan ?? "free";
  const limits = getTierLimits(plan);
  const isResumeLimitReached = user
    ? resumes.length >= limits.maxResumes
    : false;

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

  // Featured templates - top 3 by popularity and diversity
  const featuredTemplates = TEMPLATES.filter((t) =>
    ["adaptive", "modern", "timeline"].includes(t.id),
  );

  useEffect(() => {
    let raf = 0;
    const handleScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const offset = Math.min(window.scrollY, 300);
        setHeroParallax(offset);
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <a
        href="#home-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-primary text-primary-foreground px-4 py-2 rounded shadow-lg"
      >
        Skip to main content
      </a>
      <SiteHeader />
      <main id="home-main" className="min-h-screen overflow-x-hidden">
        {/* 1. Hero Section */}
        <section className="relative overflow-hidden">
          {/* Parallax background shapes */}
          <ParallaxBackground />

          <div className="container mx-auto px-6 py-8 md:py-10 lg:py-12">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Left: Content */}
                <div className="space-y-8 text-center lg:text-left">
                  {/* Headline */}
                  <div className="space-y-6">
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium tracking-tight leading-[1.1] text-foreground">
                      Land interviews, <br />
                      <span className="text-primary italic">
                        <TypingAnimation
                          text="not rejections."
                          speed={120}
                          showCursor={false}
                        />
                      </span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                      Land more interviews with AI-powered resumes. Beat
                      applicant tracking systems and get noticed by
                      recruiters—in minutes, not hours.
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    {/* Primary CTA - Create Resume */}
                    <Button
                      size="lg"
                      className="text-base px-8 h-12 group"
                      aria-label="Create your resume"
                      onClick={handleCreateResume}
                      type="button"
                    >
                      Create Your Resume
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    {/* Secondary CTA - Cover Letter (smaller, ghost style) */}
                    <Button
                      asChild
                      size="lg"
                      variant="ghost"
                      className="text-base text-muted-foreground hover:text-foreground transition-all duration-300 group"
                      aria-label="Create your cover letter"
                    >
                      <Link href={user ? "/cover-letter" : "/register"}>
                        <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                        or create a Cover Letter
                      </Link>
                    </Button>
                  </div>

                  {/* Trust indicators - streamlined */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-6 text-sm">
                    <div className="flex items-center gap-2.5 text-muted-foreground bg-muted/50 rounded-full px-3 py-1.5">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="font-medium">Free to start</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-muted-foreground bg-muted/50 rounded-full px-3 py-1.5">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="font-medium">No credit card</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-muted-foreground bg-muted/50 rounded-full px-3 py-1.5">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="font-medium">ATS-optimized</span>
                    </div>
                  </div>
                </div>

                {/* Right: Visual Preview - hidden on mobile */}
                <div className="relative mt-8 lg:mt-0 hidden lg:block pt-16">
                  <div className="absolute top-4 left-6 z-20">
                    <Card className="px-4 py-3 shadow-xl border-primary/30 bg-background/95 backdrop-blur-sm">
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <Sparkles className="w-4 h-4" />
                        Ready in 5 minutes
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        From blank page to polished PDF
                      </p>
                    </Card>
                  </div>
                  {/* Interactive Resume Preview with Template Switcher */}
                  <div
                    className="max-w-[430px] mx-auto"
                    style={{
                      transform: `translateY(${heroParallax * 0.08}px)`,
                      transition: "transform 180ms ease-out",
                    }}
                  >
                    <div
                      style={{
                        transform: `translateY(${heroParallax * -0.03}px)`,
                      }}
                    >
                      <InteractiveResumePreview />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By */}
        <section className="container mx-auto px-6 py-8 md:py-10">
          <div className="flex flex-col items-center gap-6">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Trusted by professionals at
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-semibold text-muted-foreground/80">
              {[
                "Google",
                "Microsoft",
                "Amazon",
                "Meta",
                "Apple",
                "Netflix",
                "Salesforce",
              ].map((brand) => (
                <span
                  key={brand}
                  className="px-3 py-1 rounded-full bg-muted/40 border border-border/60 tracking-wide"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 2. Stats Section (Validation) */}
        <section className="container mx-auto px-6 py-12 md:py-16 lg:py-20">
          <ScrollReveal>
            <div className="max-w-5xl mx-auto">
              <HeroStats />
            </div>
          </ScrollReveal>
        </section>

        {/* 3. Key Benefits Section Removed - Redundant */}

        {/* 4. Templates Section (Desire) */}
        <section
          id="templates"
          className="container mx-auto px-6 py-12 md:py-16 lg:py-20 bg-muted/30"
        >
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Section Header */}
            <ScrollReveal>
              <div className="text-center space-y-4">
                <Badge variant="secondary" className="text-xs font-medium">
                  {TEMPLATES.length} Professional Designs
                </Badge>
                <h2 className="text-4xl md:text-5xl font-serif font-medium tracking-tight">
                  Pick a Template, Start Building
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Every template passes ATS scans and looks great to human
                  recruiters. Choose one and customize it in minutes.
                </p>
              </div>
            </ScrollReveal>

            {/* Featured Templates - Horizontal Scroll */}
            <div className="relative">
              <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory -mx-6 px-6 scrollbar-hide">
                {featuredTemplates.map((template, index) => (
                  <div
                    key={template.id}
                    className="min-w-[280px] md:min-w-[340px] snap-center"
                  >
                    <ScrollReveal delay={index * 100}>
                      <Link
                        href={`/editor/new?template=${template.id}`}
                        className="block h-full"
                      >
                        <Card className="group cursor-pointer border-2 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden h-full">
                          {/* Template Preview */}
                          <div className="relative h-64 overflow-hidden bg-muted/20">
                            <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105 p-4 flex items-center justify-center">
                              <div className="w-full h-full shadow-sm rounded overflow-hidden">
                                <TemplateMiniPreview templateId={template.id} />
                              </div>
                            </div>

                            {/* Subtle shine effect on hover */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/0 group-hover:via-white/10 group-hover:to-transparent transition-all duration-700 pointer-events-none" />

                            {/* Category badge */}
                            <div className="absolute top-3 left-3 z-20">
                              <Badge
                                variant="secondary"
                                className="text-[10px] backdrop-blur-sm bg-background/80 shadow-sm border-0"
                              >
                                {template.style}
                              </Badge>
                            </div>

                            {/* Hover overlay with CTA */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-6 z-10">
                              <Button
                                size="sm"
                                className="shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-gray-900 hover:bg-white/90"
                              >
                                Use This Template
                                <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </div>
                          </div>

                          {/* Template Info */}
                          <div className="p-5 space-y-2 bg-gradient-to-b from-background to-muted/30">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                {template.name}
                              </h3>
                              {template.popularity >= 90 && (
                                <Badge
                                  variant="default"
                                  className="text-[10px] shrink-0 bg-primary/10 text-primary border-0 hover:bg-primary/10"
                                >
                                  <Star className="w-2.5 h-2.5 mr-1 fill-current" />
                                  Popular
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {template.description}
                            </p>
                            <div className="flex items-center gap-2 pt-2">
                              <Badge variant="outline" className="text-xs">
                                ATS-Friendly
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-xs text-muted-foreground"
                              >
                                {template.industry}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </ScrollReveal>
                  </div>
                ))}
              </div>

              {/* Scroll indicators hint */}
              <div className="absolute top-1/2 -right-4 translate-x-full hidden lg:block text-muted-foreground/30">
                <ArrowRight className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            {/* View All Templates CTA */}
            <ScrollReveal delay={300}>
              <div className="text-center pt-4">
                <Button asChild variant="outline" size="lg" className="group">
                  <Link href="/templates">
                    View All Templates
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground mt-3">
                  Browse {TEMPLATES.length} professional templates in our
                  builder
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 5. How It Works (Clarity) */}
        <section className="container mx-auto px-6 py-12 md:py-16 lg:py-20">
          <div className="max-w-6xl mx-auto space-y-12">
            <ScrollReveal>
              <div className="text-center space-y-4">
                <Badge variant="secondary" className="text-xs font-medium">
                  <Zap className="w-3 h-3 mr-1" />3 Simple Steps
                </Badge>
                <h2 className="text-4xl md:text-5xl font-serif font-medium tracking-tight">
                  From Zero to Interview-Ready
                </h2>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                  No design skills needed. Our builder guides you through every
                  step.
                </p>
              </div>
            </ScrollReveal>

            {/* Interactive How It Works */}
            <ScrollReveal>
              <HowItWorks />
            </ScrollReveal>
          </div>
        </section>

        {/* 6. Promotion Section - Final CTA */}
        <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background border-y border-primary/10 overflow-hidden">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />

          {/* Decorative Blobs */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] translate-y-1/2" />

          <div className="container relative mx-auto px-6 py-16 md:py-20 lg:py-24">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-1.5 text-sm font-semibold shadow-sm">
                <Sparkles className="w-4 h-4 animate-pulse" />
                AI-Powered Resume Builder
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-foreground">
                Your next job is one resume away
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Join thousands of job seekers creating professional resumes with
                AI-powered tools. No credit card required.
              </p>
              <div className="pt-4">
                <Button
                  size="lg"
                  onClick={handleCreateResume}
                  className="text-base px-8 h-12 gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
                >
                  Create Your Resume Now
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 7. FAQ Section */}
        <section className="container mx-auto px-6 py-12 md:py-16 lg:py-20 bg-muted/20">
          <div className="max-w-3xl mx-auto space-y-12">
            {/* Section Header */}
            <ScrollReveal>
              <div className="text-center space-y-4">
                {/* Badge removed */}
                <h2 className="text-4xl md:text-5xl font-serif font-medium tracking-tight">
                  Common Questions
                </h2>
                <p className="text-lg text-muted-foreground">
                  Everything you need to know about our resume builder
                </p>
              </div>
            </ScrollReveal>

            {/* FAQ Accordion */}
            <ScrollReveal delay={200}>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left">
                    How does ATS optimization work?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Our templates are designed with ATS compatibility in mind,
                    using clean formatting, standard fonts, and proper structure
                    that applicant tracking systems can parse correctly. We
                    avoid tables, images in critical sections, and complex
                    layouts that can confuse ATS scanners. Our AI can also
                    analyze job descriptions and suggest relevant keywords to
                    include in your resume.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left">
                    Is my data secure and private?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Yes. Your resume data is securely stored with
                    industry-standard encryption. We use secure authentication
                    to verify your identity, and your personal information is
                    never shared with third parties. You have full control over
                    your data and can delete it at any time.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left">
                    Can I export my resume to different formats?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    You can export your resume as a high-quality PDF that&apos;s
                    ready to send to employers. You can also export your data as
                    JSON for backup purposes or to transfer between devices.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left">
                    Is this really free? What&apos;s the catch?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    During our launch period, all features including AI-powered
                    tools are completely free. We&apos;re gathering feedback to
                    improve the product. In the future, some advanced AI
                    features may become part of a Pro subscription, but the core
                    resume builder will always remain free.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-left">
                    Can I create multiple versions of my resume?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Yes! You can create and save multiple resume versions
                    tailored to different job types or industries. Access them
                    from your dashboard where you can manage all your resumes,
                    duplicate existing ones, and switch between them easily.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger className="text-left">
                    What AI features are available?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    We offer AI-powered bullet point generation, professional
                    summary writing, skill suggestions based on your experience,
                    and job description analysis to help tailor your resume. Our
                    AI Cover Letter Writer can also generate personalized cover
                    letters based on your resume and target job.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger className="text-left">
                    How is this different from other resume builders?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    We combine beautiful, professional templates with AI-powered
                    content optimization. Our Resume Readiness checklist gives
                    you actionable feedback instead of meaningless scores. Plus,
                    our Job Match feature analyzes how well your resume matches
                    specific job descriptions, helping you tailor each
                    application.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </ScrollReveal>
          </div>
        </section>

        {/* Footer */}
        <SiteFooter />
      </main>

      {/* Sticky Mobile CTA */}
      <StickyMobileCTA onCreate={handleCreateResume} />
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
