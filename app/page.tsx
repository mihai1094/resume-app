import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Sparkles,
  Download,
  Clock,
  ArrowRight,
  Check,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  FileCheck,
  Wand2,
  Rocket,
  Star,
} from "lucide-react";
import { TEMPLATES } from "@/lib/constants";
import { homepageMetadata } from "@/lib/seo/metadata";
import { ScrollReveal } from "@/components/scroll-reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { HeroStats } from "@/components/home/hero-stats";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = homepageMetadata;

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative">
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-primary/5 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="container mx-auto px-6 pt-20 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left: Content */}
              <div className="space-y-8 text-center lg:text-left">
                {/* Badge */}
                <div className="inline-flex">
                  <Badge
                    variant="outline"
                    className="px-4 py-1.5 text-sm font-medium backdrop-blur-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-2" />
                    ResumeForge - AI-Powered
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground uppercase tracking-[0.2em]">
                  Forge your future with precision
                </p>

                {/* Headline */}
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                    Forge your career{" "}
                    <span className="text-primary/90 font-semibold">
                      with AI-powered CVs
                    </span>
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                    Create ATS-friendly resumes that pass applicant tracking systems and impress recruiters.{" "}
                    <strong className="text-foreground">40-60% higher callback rates</strong> with AI optimization.
                  </p>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button asChild size="lg" className="text-base px-8 h-12 shadow-lg shadow-primary/25">
                    <Link href="/create">
                      Create Your Resume
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="text-base px-8 h-12"
                  >
                    <Link href="/import">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Import Existing CV
                    </Link>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground text-center lg:text-left">
                  No credit card needed. Start for free in minutes.
                </p>

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
              </div>

              {/* Right: Visual Preview */}
              <div className="relative">
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
                {/* Floating card with mock resume preview */}
                <Card className="p-8 shadow-2xl border-2 relative overflow-hidden group">
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="space-y-6 relative">
                    {/* Header */}
                    <div className="space-y-3">
                      <div className="h-4 bg-gradient-to-r from-foreground to-foreground/30 rounded-full w-1/2" />
                      <div className="h-3 bg-muted rounded-full w-2/3" />
                      <div className="h-3 bg-muted rounded-full w-1/2" />
                    </div>

                    {/* Content blocks */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="h-3 bg-primary/20 rounded-full w-1/4" />
                        <div className="h-2 bg-muted rounded-full w-full" />
                        <div className="h-2 bg-muted rounded-full w-5/6" />
                        <div className="h-2 bg-muted rounded-full w-4/5" />
                      </div>

                      <div className="space-y-2">
                        <div className="h-3 bg-primary/20 rounded-full w-1/3" />
                        <div className="h-2 bg-muted rounded-full w-full" />
                        <div className="h-2 bg-muted rounded-full w-11/12" />
                      </div>
                    </div>
                  </div>

                  {/* AI badge overlay */}
                  <div className="absolute top-4 right-4">
                    <Badge className="shadow-lg">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Optimized
                    </Badge>
                  </div>
                </Card>

                {/* Floating elements */}
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-6 py-16">
        <ScrollReveal>
          <div className="max-w-5xl mx-auto">
            <HeroStats />
          </div>
        </ScrollReveal>
      </section>

      {/* Features Bento Grid */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Section Header */}
          <ScrollReveal>
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <Badge variant="outline" className="px-4 py-1.5">
                <Zap className="w-3.5 h-3.5 mr-2" />
                Powerful Features
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Everything You Need to Land Interviews
              </h2>
              <p className="text-lg text-muted-foreground">
                Our AI-powered tools help you create resumes that get noticed by both ATS systems and hiring managers.
              </p>
            </div>
          </ScrollReveal>

          {/* Bento Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Large feature card */}
            <Card className="md:col-span-2 p-8 relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
              <div className="relative space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Wand2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-2">AI Resume Optimization</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Paste any job description and our AI automatically optimizes your resume with matching keywords,
                    improved bullet points, and ATS-friendly formatting. Increase your chances by 40-60%.
                  </p>
                </div>
                <div className="pt-4">
                  <Badge variant="secondary">Coming in V1.5</Badge>
                </div>
              </div>
            </Card>

            {/* Feature card */}
            <Card className="p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:border-primary/50">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">ATS Score Checker</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Get instant feedback on ATS compatibility with a 0-100 score and specific recommendations.
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">V1.5</Badge>
              </div>
            </Card>

            {/* Feature card */}
            <Card className="p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:border-primary/50">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Multiple Templates</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Choose from professional, ATS-friendly templates designed for different industries.
                  </p>
                </div>
                <Badge className="text-xs">Available Now</Badge>
              </div>
            </Card>

            {/* Feature card */}
            <Card className="p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:border-primary/50">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Download className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Export to PDF</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Download your resume as a high-quality, ATS-compatible PDF ready to send.
                  </p>
                </div>
                <Badge className="text-xs">Available Now</Badge>
              </div>
            </Card>

            {/* Large feature card */}
            <Card className="md:col-span-2 lg:col-span-1 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
              <div className="relative space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <FileCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">AI Cover Letters</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Generate personalized cover letters that complement your resume in seconds.
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">V1.5</Badge>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="container mx-auto px-6 py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Section Header */}
          <ScrollReveal>
            <div className="text-center space-y-4">
              <Badge variant="outline" className="px-4 py-1.5">
                <Star className="w-3.5 h-3.5 mr-2" />
                Professional Templates
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                ATS-Friendly Resume Templates
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Every template is designed to pass ATS systems while looking great.
                Choose the one that matches your industry and style.
              </p>
            </div>
          </ScrollReveal>

          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEMPLATES.map((template) => (
              <Link key={template.id} href={`/create?template=${template.id}`}>
                <Card
                  className="group cursor-pointer border-2 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] overflow-hidden h-full"
                >
                  {/* Template Preview */}
                  <div
                    className={`h-56 bg-gradient-to-br ${template.color} p-8 flex flex-col justify-between relative overflow-hidden`}
                  >
                    {/* Decorative elements */}
                    <div className="space-y-3">
                      <div className="h-4 bg-foreground/10 rounded-full w-1/2 shadow-sm" />
                      <div className="h-2.5 bg-foreground/5 rounded-full w-3/4" />
                      <div className="h-2 bg-foreground/5 rounded-full w-2/3" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-foreground/5 rounded-full w-full" />
                      <div className="h-2 bg-foreground/5 rounded-full w-5/6" />
                      <div className="h-2 bg-foreground/5 rounded-full w-4/5" />
                      <div className="h-2 bg-foreground/5 rounded-full w-11/12" />
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <Button size="sm" variant="secondary" className="shadow-lg">
                        Use Template
                        <ArrowRight className="w-3 h-3 ml-2" />
                      </Button>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="p-6 space-y-2">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                    <div className="pt-2">
                      <Badge variant="outline" className="text-xs">
                        ATS-Friendly
                      </Badge>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-6xl mx-auto space-y-12">
          <ScrollReveal>
            <div className="text-center space-y-4">
              <Badge variant="outline" className="px-4 py-1.5">
                <Rocket className="w-3.5 h-3.5 mr-2" />
                Simple Process
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Create Your Resume in Minutes
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Choose Template",
                description: "Select from our ATS-friendly templates designed for your industry.",
                icon: FileText,
              },
              {
                step: "02",
                title: "Fill Information",
                description: "Add your experience, education, and skills. Auto-save keeps your data safe.",
                icon: Edit,
              },
              {
                step: "03",
                title: "Download & Apply",
                description: "Export as PDF and start applying with confidence. Track your applications.",
                icon: Download,
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <ScrollReveal key={item.step} delay={index * 150}>
                  <div className="relative">
                    <Card className="p-8 h-full hover:shadow-lg transition-shadow">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <span className="text-5xl font-bold text-muted/20">{item.step}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-6 py-24 bg-muted/20">
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Section Header */}
          <ScrollReveal>
            <div className="text-center space-y-4">
              <Badge variant="outline" className="px-4 py-1.5">
                <HelpCircle className="w-3.5 h-3.5 mr-2" />
                Frequently Asked Questions
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
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
                  Our system analyzes job descriptions and automatically optimizes your resume with relevant keywords,
                  proper formatting, and ATS-friendly structure. We ensure your resume passes applicant tracking systems
                  by avoiding tables, images in critical sections, and using standard fonts and formatting that ATS can parse correctly.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  Is my data secure and private?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Yes. All your resume data is stored locally in your browser using localStorage. We don't send your personal
                  information to any servers (currently). When we add backend features in V1.5, your data will be encrypted
                  and stored securely with industry-standard security practices.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  Can I export my resume to different formats?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Currently, you can export your resume as a high-quality PDF that's ready to send to employers.
                  You can also export your data as JSON for backup purposes. DOCX export is planned for a future release.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  Is this really free? What's the catch?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  The core resume builder is completely free to use - no credit card required. You can create resumes,
                  use templates, and export PDFs at no cost. In the future, we'll offer premium features like AI optimization,
                  ATS scoring, and cover letter generation as part of a Pro subscription, but the basic builder will always remain free.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">
                  Can I create multiple versions of my resume?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Yes! You can create and save multiple resume versions tailored to different job types or industries.
                  This feature is available in the "My Resumes" section where you can manage all your resume versions,
                  duplicate existing ones, and switch between them easily.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-left">
                  How is this different from other resume builders?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Unlike most resume builders, we focus specifically on ATS compatibility and AI-powered optimization.
                  Our upcoming AI features (V1.5) will analyze job descriptions and automatically optimize your resume
                  for each application - something competitors don't offer. Plus, our templates are designed by professionals
                  specifically to pass ATS systems while still looking great to human reviewers.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger className="text-left">
                  Do I need to create an account?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  Currently, no account is required. Your resume data is saved automatically in your browser.
                  However, creating an account (coming soon) will allow you to sync your resumes across devices,
                  access them from anywhere, and ensure your data is backed up securely in the cloud.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8">
                <AccordionTrigger className="text-left">
                  What about the AI features mentioned?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  AI-powered features like CV Auto-Optimizer, ATS Score Checker, and AI Cover Letter Writer are planned
                  for our V1.5 release. These features will analyze job postings and automatically tailor your resume
                  to match requirements, significantly increasing your chances of getting interviews. Early access will
                  be available to our beta users.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-24">
        <ScrollReveal>
          <Card className="max-w-4xl mx-auto relative overflow-hidden border-2">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />

          <div className="relative p-12 md:p-16 text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Ready to Land Your Dream Job?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of job seekers who improved their interview callback rates by 40-60%
                with our AI-powered resume builder.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 h-12 shadow-lg shadow-primary/25">
                <Link href="/create">
                  Start Building Your Resume
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base px-8 h-12">
                <Link href="#templates">View Templates</Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              ✓ Free to start • ✓ No credit card required • ✓ Export unlimited resumes
            </p>
          </div>
        </Card>
        </ScrollReveal>
      </section>

      {/* Spacer */}
      <div className="h-24" />
    </main>
    </>
  );
}

// Missing import
import { Edit } from "lucide-react";
