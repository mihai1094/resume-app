import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/scroll-reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HOME_PAGE_FAQS } from "@/lib/seo/structured-data";
import { HeroStats } from "@/components/home/hero-stats";
import { SiteHeader } from "@/components/layout/site-header";
import { ParallaxBackground } from "@/components/home/parallax-background";
import { InteractiveResumePreview } from "@/components/home/interactive-resume-preview";
import { TemplateMiniPreview } from "@/components/home/template-mini-preview";
import { HowItWorks } from "@/components/home/how-it-works";
import { TemplateGallery } from "@/components/home/template-gallery";
import { Footer } from "@/components/shared/footer";
import { HomeCtaGroup } from "@/components/home/home-cta-group";
import { HomeSmoothScroll } from "@/components/home/home-smooth-scroll";
import { SocialProof } from "@/components/home/social-proof";

export function HomeContent() {
  return (
    <>
      <HomeSmoothScroll />
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
                    <h1 className="h-display text-foreground">
                      The ATS Resume Builder{" "}
                      <span className="text-primary italic">
                        that shows your score live.
                      </span>
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
                      Check ATS readiness while you write, fix keyword gaps before
                      you export, and turn your experience into a free PDF resume
                      that is easier for recruiters to parse.
                    </p>
                  </div>

                  <HomeCtaGroup />
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

        <section className="container mx-auto px-6 py-16 md:py-20">
          <div className="max-w-5xl mx-auto">
            <SocialProof />
          </div>
        </section>

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
                  ATS-First Workflow
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium tracking-tight">
                  How do you go from blank page to <span className="text-primary italic">ATS-ready submission?</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-xl">
                  Pick an ATS-friendly template, add your experience, then use live scoring
                  and AI suggestions to close the gaps before export.
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
                  Frequently asked <span className="text-primary italic">questions</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  Get your questions answered and set the foundation for a resume that wins.
                </p>
              </div>
            </ScrollReveal>

            {/* FAQ Accordion — rendered from HOME_PAGE_FAQS (the SEO schema source) */}
            <ScrollReveal delay={200}>
              <Accordion type="single" collapsible className="w-full">
                {HOME_PAGE_FAQS.map((faq, index) => {
                  const isDifferentiator = index === HOME_PAGE_FAQS.length - 1;
                  return (
                    <AccordionItem key={faq.question} value={`item-${index + 1}`}>
                      <AccordionTrigger
                        className={
                          isDifferentiator
                            ? "text-left text-primary italic"
                            : "text-left"
                        }
                      >
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
