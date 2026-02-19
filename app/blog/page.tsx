import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Calendar, Tag, Sparkles } from "lucide-react";
import { blogPosts, getFeaturedPosts, getAllCategories } from "@/lib/data/blog-posts";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { Badge } from "@/components/ui/badge";
import { getBreadcrumbSchemaWithContext } from "@/lib/seo/structured-data-advanced";
import { BlogFilters } from "@/components/blog/blog-filters";
import { getSiteUrl } from "@/lib/config/site-url";

const baseUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Resume & Career Tips Blog | ATS Optimization & AI Resume Guides",
  description:
    "Expert guides on ATS optimization, AI resume building, cover letter writing, and job search strategies. Learn how to create resumes that pass applicant tracking systems and land interviews.",
  keywords: [
    "resume tips blog",
    "ats optimization guide",
    "ai resume guide",
    "cover letter tips",
    "job search advice",
    "career blog",
    "resume writing tips",
  ],
  openGraph: {
    title: "Resume & Career Tips Blog | ResumeForge",
    description:
      "Expert guides on ATS optimization, AI resume building, and job search strategies. Learn to create resumes that land interviews.",
    url: `${baseUrl}/blog`,
    type: "website",
  },
  twitter: {
    title: "Resume & Career Tips Blog | ResumeForge",
    description:
      "Expert guides on ATS optimization, AI resume building, and job search strategies.",
  },
  alternates: {
    canonical: `${baseUrl}/blog`,
  },
};

export default function BlogPage() {
  const featuredPosts = getFeaturedPosts();
  const categories = getAllCategories();

  const breadcrumbSchema = getBreadcrumbSchemaWithContext([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <div className="min-h-screen bg-gradient-to-b from-amber-50/30 via-background to-background dark:from-amber-950/10">
        <Header />

        <main className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="mb-4 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Career Resources
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 tracking-tight">
              Resume & Career{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400">
                Insights
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Expert guides on ATS optimization, AI-powered resume building, and
              strategies to land your dream job.
            </p>
          </div>

          {/* Featured Post */}
          {featuredPosts[0] && (
            <section className="mb-16">
              <Link href={`/blog/${featuredPosts[0].slug}`} className="group block">
                <article className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 to-orange-700 dark:from-amber-700 dark:to-orange-800 p-8 md:p-12 text-white shadow-2xl transition-transform duration-300 group-hover:scale-[1.01]">
                  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                  <div className="relative z-10">
                    <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">
                      Featured Article
                    </Badge>
                    <h2 className="text-2xl md:text-4xl font-serif font-bold mb-4 group-hover:underline decoration-2 underline-offset-4">
                      {featuredPosts[0].title}
                    </h2>
                    <p className="text-white/90 text-lg mb-6 max-w-3xl">
                      {featuredPosts[0].description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {featuredPosts[0].readingTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(featuredPosts[0].publishedAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        {featuredPosts[0].category}
                      </span>
                    </div>
                    <div className="mt-8 flex items-center gap-2 text-white font-medium group-hover:gap-3 transition-all">
                      Read Article <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </article>
              </Link>
            </section>
          )}

          {/* Blog Filters and Posts Grid */}
          <BlogFilters posts={blogPosts} categories={categories} />

          {/* CTA Section */}
          <section className="mt-20 text-center bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-12 text-white">
            <h2 className="text-3xl font-serif font-bold mb-4">
              Ready to Build Your ATS-Optimized Resume?
            </h2>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Put these insights into action. Create a professional resume that passes
              ATS screening and impresses recruiters.
            </p>
            <Link
              href="/editor/new"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/30 text-black font-semibold px-8 py-4 rounded-full transition-all duration-300"
            >
              Start Building Your Resume
              <ArrowRight className="w-5 h-5" />
            </Link>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}











