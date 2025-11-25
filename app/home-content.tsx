"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Sparkles,
  Download,
  ArrowRight,
  Check,
  Target,
  TrendingUp,
  FileCheck,
  Wand2,
  Star,
} from "lucide-react";
import { TEMPLATES } from "@/lib/constants";
import { ScrollReveal } from "@/components/scroll-reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HeroStats } from "@/components/home/hero-stats";
import { SiteHeader } from "@/components/layout/site-header";
import { SocialProof } from "@/components/home/social-proof";
import { TrustBadges } from "@/components/home/trust-badges";
import { StickyMobileCTA } from "@/components/home/sticky-mobile-cta";
import { ParallaxBackground } from "@/components/home/parallax-background";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { InteractiveResumePreview } from "@/components/home/interactive-resume-preview";
// Template filters removed - showing only featured templates
import { TemplateMiniPreview } from "@/components/home/template-mini-preview";
import { HowItWorks } from "@/components/home/how-it-works";
import { useConfetti } from "@/hooks/use-confetti";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";
import { useSavedResumes } from "@/hooks/use-saved-resumes";
import { useSavedCoverLetters } from "@/hooks/use-saved-cover-letters";
import { useUser } from "@/hooks/use-user";

export function HomeContent() {
  // Celebration effects and smooth scrolling
  const { celebrate } = useConfetti();
  const router = useRouter();
  useSmoothScroll();

  // Get user and their saved resumes
  const { user } = useUser();
  const { resumes, isLoading: resumesLoading } = useSavedResumes(user?.id || null);
  const hasResumes = resumes.length > 0;
  // Check for cover letters
  const { coverLetters, isLoading: coverLettersLoading } = useSavedCoverLetters(user?.id || null);
  const hasCoverLetters = coverLetters.length > 0;


  // Featured templates - top 3 by popularity and diversity
  const featuredTemplates = TEMPLATES.filter((t) =>
    ["adaptive", "modern", "timeline"].includes(t.id)
  );

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Parallax background shapes */}
          <ParallaxBackground />

          <div className="container mx-auto px-6 pt-6 pb-16 md:pt-16 md:pb-24 lg:pt-8 lg:pb-32">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Left: Content */}
                <div className="space-y-8 text-center lg:text-left">
                  {/* Badge */}
                  <div className="inline-flex">
                    {/* Badge removed per user request */}
                  </div>
                  <p className="text-sm text-muted-foreground uppercase tracking-[0.2em]">
                    Forge your future with precision
                  </p>

                  {/* Headline */}
                  <div className="space-y-6">
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium tracking-tight leading-[1.1] text-foreground">
                      Craft your story, <br />
                      <span className="text-primary italic">
                        <TypingAnimation
                          text="beautifully."
                          speed={150}
                          showCursor={false}
                        />
                      </span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                      Create ATS-friendly resumes that pass applicant tracking
                      systems and impress recruiters.{" "}
                      <strong className="text-foreground">
                        40-60% higher callback rates
                      </strong>{" "}
                      with AI optimization.
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    {/* Resume CTA - Dynamic based on user's saved resumes */}
                    <Button
                      asChild
                      size="lg"
                      className="text-base px-8 h-12 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all duration-300 group"
                      aria-label={hasResumes ? "Go to My Resumes" : "Create your resume"}
                    >
                      {hasResumes ? (
                        <Link href="/my-resumes">
                          <FileText className="w-4 h-4 mr-2" />
                          My Resumes
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      ) : (
                        <Link href="/onboarding">
                          Create Your Resume
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      )}
                    </Button>

                    {/* Cover Letter CTA - Dynamic based on user's saved cover letters */}
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="text-base px-8 h-12 hover:scale-105 transition-all duration-300 group"
                      aria-label={hasCoverLetters ? "Go to My Cover Letters" : "Create cover letter"}
                    >
                      {hasCoverLetters ? (
                        <Link href="/my-cover-letters">
                          <FileText className="w-4 h-4 mr-2" />
                          My Cover Letters
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      ) : (
                        <Link href="/cover-letter">
                          <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                          Create Cover Letter
                        </Link>
                      )}
                    </Button>
                  </div>
                  {!user && (
                    <p className="text-sm text-muted-foreground text-center lg:text-left">
                      No credit card needed. Start for free in minutes.
                    </p>
                  )}

                  {/* Trust indicators */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Check className="w-4 h-4 text-primary" />
                      Free to start
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Check className="w-4 h-4 text-primary" />
                      No credit card required
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Check className="w-4 h-4 text-primary" />
                      ATS-optimized
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="pt-6">
                    <TrustBadges />
                  </div>
                </div>

                {/* Right: Visual Preview */}
                <div className="relative mt-8 lg:mt-0">
                  <div className="absolute -top-10 left-6 z-20">
                    <Card className="px-4 py-2 shadow-xl border-primary/30">
                      <div className="flex items-center gap-2 text-sm font-medium text-primary">
                        <TrendingUp className="w-4 h-4" />
                        40-60% more callbacks
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Based on AI-optimized layouts
                      </p>
                    </Card>
                  </div>
                  {/* Interactive Resume Preview with Template Switcher */}
                  <InteractiveResumePreview />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-6 py-12 md:py-24">
          <ScrollReveal>
            <div className="max-w-5xl mx-auto">
              <HeroStats />
            </div>
          </ScrollReveal>
        </section>

        {/* Social Proof Section */}
        <section className="container mx-auto px-6 py-12 md:py-24 bg-muted/20">
          <ScrollReveal>
            <div className="max-w-6xl mx-auto">
              <SocialProof />
            </div>
          </ScrollReveal>
        </section>

        {/* Features Bento Grid */}
        <section className="container mx-auto px-6 py-12 md:py-24">
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Section Header */}
            <ScrollReveal>
              <div className="text-center space-y-4 max-w-3xl mx-auto">
                {/* Badge removed */}
                <h2 className="text-4xl md:text-5xl font-serif font-medium tracking-tight">
                  Everything You Need to Land Interviews
                </h2>
                <p className="text-lg text-muted-foreground">
                  Our AI-powered tools help you create resumes that get noticed
                  by both ATS systems and hiring managers.
                </p>
              </div>
            </ScrollReveal>

            {/* Bento Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Large feature card */}
              <Card className="md:col-span-2 p-4 md:p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                <div className="relative space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Wand2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-2xl font-semibold mb-2">
                      AI Resume Optimization
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                      Paste any job description and our AI automatically
                      optimizes your resume with matching keywords, improved
                      bullet points, and ATS-friendly formatting. Increase your
                      chances by 40-60%.
                    </p>
                  </div>
                  <div className="pt-4">
                    <Badge variant="secondary">Coming in V1.5</Badge>
                  </div>
                </div>
              </Card>

              {/* Feature card */}
              <Card className="p-4 md:p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:border-primary/50">
                <div className="space-y-3 md:space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold mb-2">
                      ATS Score Checker
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Get instant feedback on ATS compatibility with a 0-100
                      score and specific recommendations.
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    V1.5
                  </Badge>
                </div>
              </Card>

              {/* Feature card */}
              <Card className="p-4 md:p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:border-primary/50">
                <div className="space-y-3 md:space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold mb-2">
                      Multiple Templates
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Choose from professional, ATS-friendly templates designed
                      for different industries.
                    </p>
                  </div>
                  <Badge className="text-xs">Available Now</Badge>
                </div>
              </Card>

              {/* Feature card */}
              <Card className="p-4 md:p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:border-primary/50">
                <div className="space-y-3 md:space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Download className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold mb-2">
                      Export to PDF
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Download your resume as a high-quality, ATS-compatible PDF
                      ready to send.
                    </p>
                  </div>
                  <Badge className="text-xs">Available Now</Badge>
                </div>
              </Card>

              {/* Large feature card */}
              <Card className="md:col-span-2 lg:col-span-1 p-4 md:p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                <div className="relative space-y-3 md:space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <FileCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold mb-2">
                      AI Cover Letters
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Generate personalized cover letters that complement your
                      resume in seconds.
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    V1.5
                  </Badge>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Templates Section */}
        <section
          id="templates"
          className="container mx-auto px-6 py-24 bg-muted/30"
        >
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Section Header */}
            <ScrollReveal>
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-serif font-medium tracking-tight">
                  ATS-Friendly Resume Templates
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Every template is designed to pass ATS systems while looking
                  great. Start with one of our most popular templates.
                </p>
              </div>
            </ScrollReveal>

            {/* Featured Templates Grid */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {featuredTemplates.map((template, index) => (
                <ScrollReveal key={template.id} delay={index * 100}>
                  <Link
                    href={`/create?template=${template.id}`}
                    className="block"
                  >
                    <Card className="group cursor-pointer border-2 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden h-full">
                      {/* Template Preview */}
                      <div className="relative h-64 overflow-hidden">
                        <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
                          <TemplateMiniPreview templateId={template.id} />
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
              ))}
            </div>

            {/* View All Templates CTA */}
            <ScrollReveal delay={300}>
              <div className="text-center pt-4">
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="group"
                >
                  <Link href="/onboarding">
                    View All Templates
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground mt-3">
                  Browse {TEMPLATES.length} professional templates in our builder
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-6 py-24">
          <div className="max-w-6xl mx-auto space-y-12">
            <ScrollReveal>
              <div className="text-center space-y-4">
                {/* Badge removed */}
                <h2 className="text-4xl md:text-5xl font-serif font-medium tracking-tight">
                  Create Your Resume in Minutes
                </h2>
              </div>
            </ScrollReveal>

            {/* Interactive How It Works */}
            <ScrollReveal>
              <HowItWorks />
            </ScrollReveal>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-6 py-24 bg-muted/20">
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
                    Our system analyzes job descriptions and automatically
                    optimizes your resume with relevant keywords, proper
                    formatting, and ATS-friendly structure. We ensure your
                    resume passes applicant tracking systems by avoiding tables,
                    images in critical sections, and using standard fonts and
                    formatting that ATS can parse correctly.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left">
                    Is my data secure and private?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Yes. All your resume data is securely stored in Firebase/Firestore
                    with industry-standard encryption. Your data is protected by Firebase
                    security rules, ensuring that only you can access your resumes. We use
                    Firebase Authentication to verify your identity, and your personal
                    information is never shared without your permission.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left">
                    Can I export my resume to different formats?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Currently, you can export your resume as a high-quality PDF
                    that&apos;s ready to send to employers. You can also export your
                    data as JSON for backup purposes. DOCX export is planned for
                    a future release.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left">
                    Is this really free? What&apos;s the catch?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    The core resume builder is completely free to use - no
                    credit card required. You can create resumes, use templates,
                    and export PDFs at no cost. In the future, we&apos;ll offer
                    premium features like AI optimization, ATS scoring, and
                    cover letter generation as part of a Pro subscription, but
                    the basic builder will always remain free.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-left">
                    Can I create multiple versions of my resume?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Yes! You can create and save multiple resume versions
                    tailored to different job types or industries. This feature
                    is available in the &quot;My Resumes&quot; section where you can
                    manage all your resume versions, duplicate existing ones,
                    and switch between them easily.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger className="text-left">
                    How is this different from other resume builders?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Unlike most resume builders, we focus specifically on ATS
                    compatibility and AI-powered optimization. Our upcoming AI
                    features (V1.5) will analyze job descriptions and
                    automatically optimize your resume for each application -
                    something competitors don&apos;t offer. Plus, our templates are
                    designed by professionals specifically to pass ATS systems
                    while still looking great to human reviewers.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger className="text-left">
                    Do I need to create an account?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Currently, no account is required. Your resume data is saved
                    automatically in your browser. However, creating an account
                    (coming soon) will allow you to sync your resumes across
                    devices, access them from anywhere, and ensure your data is
                    backed up securely in the cloud.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8">
                  <AccordionTrigger className="text-left">
                    What about the AI features mentioned?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    AI-powered features like CV Auto-Optimizer, ATS Score
                    Checker, and AI Cover Letter Writer are planned for our V1.5
                    release. These features will analyze job postings and
                    automatically tailor your resume to match requirements,
                    significantly increasing your chances of getting interviews.
                    Early access will be available to our beta users.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </ScrollReveal>
          </div>
        </section>

        {/* Spacer */}
        <div className="h-24" />
      </main>

      {/* Sticky Mobile CTA */}
      <StickyMobileCTA />
    </>
  );
}



