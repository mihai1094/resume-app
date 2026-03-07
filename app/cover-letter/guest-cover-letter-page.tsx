import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, ScrollText, Sparkles } from "lucide-react";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CoverLetterFaq {
  question: string;
  answer: string;
}

interface GuestCoverLetterPageProps {
  faqs: CoverLetterFaq[];
}

export function GuestCoverLetterPage({ faqs }: GuestCoverLetterPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-16">
        <section className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="secondary" className="gap-1">
            <ScrollText className="w-3 h-3" />
            Cover Letter Builder
          </Badge>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">
            Create a Cover Letter That Matches Your Resume
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            ResumeZeus helps you write a professional cover letter for each application,
            keep it aligned with your resume, and use AI help when you want a faster first draft.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link href="/register">
                Create free account
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login?redirect=%2Fcover-letter">Log in to continue</Link>
            </Button>
          </div>
        </section>

        <section className="max-w-5xl mx-auto mt-14 space-y-6">
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-serif font-bold">
              Why should you tailor a cover letter for each application?
            </h2>
            <p className="mt-3 text-muted-foreground">
              A tailored cover letter shows why your background fits the exact role, not just why
              you are generally employable. It gives you space to connect your resume highlights
              to the company, job description, and hiring context.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: FileText,
                title: "Start from a clear structure",
                desc: "Build around a simple format that explains fit, evidence, and interest without sounding generic.",
              },
              {
                icon: Sparkles,
                title: "Use AI when you need speed",
                desc: "Generate a faster first draft, then refine the tone and details before sending it.",
              },
              {
                icon: CheckCircle2,
                title: "Keep resume and letter aligned",
                desc: "Match the same role focus, achievements, and language across your application materials.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border bg-card p-5 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="max-w-4xl mx-auto mt-14 rounded-3xl border bg-muted/30 p-6 md:p-8 space-y-4">
          <h2 className="text-2xl font-serif font-bold">
            What should a strong cover letter include?
          </h2>
          <p className="text-muted-foreground">
            A strong cover letter should quickly explain why you fit the role, back that up with
            relevant achievements, show that you understand the company or team, and end with a
            clear next step. ResumeZeus helps you draft that structure faster so you can focus on
            tailoring the message.
          </p>
          <ul className="space-y-3 text-sm md:text-base text-muted-foreground">
            <li className="flex gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 shrink-0" />
              An opening that names the role and why it fits your background
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 shrink-0" />
              One or two concrete examples that reinforce the resume
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 shrink-0" />
              Company-specific language that avoids a copy-paste feel
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 shrink-0" />
              A concise closing that invites the next conversation
            </li>
          </ul>
        </section>

        <section className="max-w-4xl mx-auto mt-14">
          <h2 className="text-2xl font-serif font-bold">Frequently asked questions about cover letters</h2>
          <div className="mt-6 space-y-3">
            {faqs.map((faq) => (
              <details key={faq.question} className="rounded-2xl border bg-card p-5">
                <summary className="cursor-pointer list-none font-semibold">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="max-w-4xl mx-auto mt-14">
          <h2 className="text-2xl font-serif font-bold mb-4">Related features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/ai-resume-builder"
              className="rounded-2xl border p-5 hover:border-primary/40 transition-colors"
            >
              <h3 className="font-semibold mb-2">AI Resume Builder</h3>
              <p className="text-sm text-muted-foreground">
                Improve your resume bullets, summaries, and role targeting before you draft the letter.
              </p>
            </Link>
            <Link
              href="/free-resume-builder"
              className="rounded-2xl border p-5 hover:border-primary/40 transition-colors"
            >
              <h3 className="font-semibold mb-2">Free Resume Builder</h3>
              <p className="text-sm text-muted-foreground">
                Build the matching resume first, then keep the cover letter aligned with the same application story.
              </p>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
