import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Calendar,
  User,
  Tag,
  Share2,
  BookOpen,
} from "lucide-react";
import { blogPosts, getBlogPost, getAllBlogSlugs } from "@/lib/data/blog-posts";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getArticleSchema,
  getBreadcrumbSchemaWithContext,
} from "@/lib/seo/structured-data-advanced";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://resume-builder.com";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${baseUrl}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.keywords,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: `${baseUrl}/blog/${post.slug}`,
    },
  };
}

// Simple markdown-like content renderer
function renderContent(content: string) {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];
  let inList = false;
  let listType: "ul" | "ol" = "ul";

  const flushList = () => {
    if (currentList.length > 0) {
      const ListTag = listType;
      elements.push(
        <ListTag
          key={`list-${elements.length}`}
          className={`${listType === "ol" ? "list-decimal" : "list-disc"} pl-6 mb-6 space-y-2`}
        >
          {currentList.map((item, i) => (
            <li key={i} className="text-muted-foreground">
              {formatInlineText(item)}
            </li>
          ))}
        </ListTag>
      );
      currentList = [];
      inList = false;
    }
  };

  const formatInlineText = (text: string) => {
    // Handle bold text
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Empty line
    if (!trimmedLine) {
      flushList();
      continue;
    }

    // Headers
    if (trimmedLine.startsWith("## ")) {
      flushList();
      elements.push(
        <h2
          key={`h2-${i}`}
          className="text-2xl md:text-3xl font-serif font-bold mt-12 mb-6 text-foreground"
        >
          {trimmedLine.slice(3)}
        </h2>
      );
      continue;
    }

    if (trimmedLine.startsWith("### ")) {
      flushList();
      elements.push(
        <h3
          key={`h3-${i}`}
          className="text-xl md:text-2xl font-semibold mt-8 mb-4 text-foreground"
        >
          {trimmedLine.slice(4)}
        </h3>
      );
      continue;
    }

    // Unordered list items
    if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
      if (!inList || listType !== "ul") {
        flushList();
        inList = true;
        listType = "ul";
      }
      currentList.push(trimmedLine.slice(2));
      continue;
    }

    // Ordered list items
    if (/^\d+\.\s/.test(trimmedLine)) {
      if (!inList || listType !== "ol") {
        flushList();
        inList = true;
        listType = "ol";
      }
      currentList.push(trimmedLine.replace(/^\d+\.\s/, ""));
      continue;
    }

    // Checkbox items (convert to list)
    if (trimmedLine.startsWith("☐ ") || trimmedLine.startsWith("✅ ") || trimmedLine.startsWith("❌ ")) {
      if (!inList) {
        flushList();
        inList = true;
        listType = "ul";
      }
      currentList.push(trimmedLine);
      continue;
    }

    // Table handling (simple version - just render as formatted text)
    if (trimmedLine.startsWith("|")) {
      flushList();
      // Skip table separator lines
      if (trimmedLine.includes("---")) continue;

      const cells = trimmedLine
        .split("|")
        .filter((cell) => cell.trim())
        .map((cell) => cell.trim());

      elements.push(
        <div
          key={`table-row-${i}`}
          className="grid grid-cols-2 md:grid-cols-4 gap-2 py-2 border-b text-sm"
        >
          {cells.map((cell, ci) => (
            <span
              key={ci}
              className={ci === 0 ? "font-medium" : "text-muted-foreground"}
            >
              {formatInlineText(cell)}
            </span>
          ))}
        </div>
      );
      continue;
    }

    // Blockquote
    if (trimmedLine.startsWith("> ")) {
      flushList();
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="border-l-4 border-amber-500 pl-4 py-2 my-6 italic text-muted-foreground bg-amber-50/50 dark:bg-amber-950/20 rounded-r"
        >
          {formatInlineText(trimmedLine.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Code blocks (inline)
    if (trimmedLine.includes("`")) {
      flushList();
      const parts = trimmedLine.split(/(`[^`]+`)/g);
      elements.push(
        <p key={`p-${i}`} className="mb-4 text-muted-foreground leading-relaxed">
          {parts.map((part, pi) => {
            if (part.startsWith("`") && part.endsWith("`")) {
              return (
                <code
                  key={pi}
                  className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono text-amber-600 dark:text-amber-400"
                >
                  {part.slice(1, -1)}
                </code>
              );
            }
            return formatInlineText(part);
          })}
        </p>
      );
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={`p-${i}`} className="mb-4 text-muted-foreground leading-relaxed">
        {formatInlineText(trimmedLine)}
      </p>
    );
  }

  flushList();
  return elements;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  // Find adjacent posts for navigation
  const currentIndex = blogPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null;
  const nextPost =
    currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null;

  // Related posts (same category, excluding current)
  const relatedPosts = blogPosts
    .filter((p) => p.category === post.category && p.slug !== slug)
    .slice(0, 2);

  const articleSchema = getArticleSchema(
    post.title,
    post.description,
    post.author,
    post.publishedAt,
    post.updatedAt
  );

  const breadcrumbSchema = getBreadcrumbSchemaWithContext([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${post.slug}` },
  ]);

  // FAQ Schema for posts that have Q&A sections
  const faqSchema = post.content.includes("### Q:") ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.content
      .split("### Q:")
      .slice(1)
      .map((section) => {
        const parts = section.split("A:");
        const question = parts[0]?.trim();
        const answer = parts[1]?.split("\n\n")[0]?.trim();
        return question && answer
          ? {
              "@type": "Question",
              name: question,
              acceptedAnswer: {
                "@type": "Answer",
                text: answer,
              },
            }
          : null;
      })
      .filter(Boolean),
  } : null;

  // HowTo Schema for how-to posts
  const isHowToPost = post.slug.includes("how-to") || post.title.toLowerCase().includes("guide");
  const howToSchema = isHowToPost ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: post.title,
    description: post.description,
    totalTime: post.readingTime.replace(" min read", "M").replace(" ", "PT"),
    step: post.content
      .split(/### \d+\./g)
      .slice(1)
      .map((section, index) => {
        const lines = section.trim().split("\n");
        const name = lines[0]?.trim();
        const text = lines.slice(1).join(" ").trim().slice(0, 200);
        return {
          "@type": "HowToStep",
          position: index + 1,
          name,
          text,
        };
      })
      .filter((step) => step.name),
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema),
          }}
        />
      )}
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(howToSchema),
          }}
        />
      )}

      <div className="min-h-screen bg-gradient-to-b from-amber-50/30 via-background to-background dark:from-amber-950/10">
        <Header />

        <main className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/blog" className="hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground truncate max-w-[200px]">{post.title}</li>
            </ol>
          </nav>

          <article className="max-w-4xl mx-auto">
            {/* Header */}
            <header className="mb-12">
              <Badge
                variant="secondary"
                className="mb-4 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
              >
                <Tag className="w-3 h-3 mr-1" />
                {post.category}
              </Badge>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-6 leading-tight">
                {post.title}
              </h1>

              <p className="text-xl text-muted-foreground mb-8">{post.description}</p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pb-8 border-b">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {post.author}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {post.readingTime}
                </span>
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  {Math.round(post.content.split(/\s+/).length)} words
                </span>
              </div>
            </header>

            {/* Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              {renderContent(post.content)}
            </div>

            {/* Tags */}
            <div className="mt-12 pt-8 border-t">
              <h3 className="text-sm font-semibold mb-4">Related Topics</h3>
              <div className="flex flex-wrap gap-2">
                {post.keywords.slice(0, 6).map((keyword) => (
                  <Badge key={keyword} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Share */}
            <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Found this helpful?</h3>
                  <p className="text-sm text-muted-foreground">
                    Share it with others who might benefit
                  </p>
                </div>
                <Button variant="outline" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-12 p-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl text-white text-center">
              <h2 className="text-2xl font-serif font-bold mb-3">
                Ready to Apply These Tips?
              </h2>
              <p className="text-white/90 mb-6 max-w-xl mx-auto">
                Create an ATS-optimized resume with ResumeForge&apos;s AI-powered builder.
                Get instant feedback and improve your chances of landing interviews.
              </p>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 bg-white text-amber-700 hover:bg-amber-50 font-semibold px-8 py-3 rounded-full transition-colors"
              >
                Start Building Your Resume
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section className="mt-16">
                <h2 className="text-2xl font-serif font-bold mb-6">Related Articles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.slug}
                      href={`/blog/${relatedPost.slug}`}
                      className="group"
                    >
                      <article className="p-6 border rounded-2xl hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                        <Badge variant="secondary" className="mb-3 text-xs">
                          {relatedPost.category}
                        </Badge>
                        <h3 className="font-semibold mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {relatedPost.description}
                        </p>
                      </article>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Post Navigation */}
            <nav className="mt-12 pt-8 border-t">
              <div className="flex justify-between gap-4">
                {prevPost ? (
                  <Link
                    href={`/blog/${prevPost.slug}`}
                    className="group flex-1 p-4 rounded-xl border hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
                  >
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <ArrowLeft className="w-3 h-3" /> Previous
                    </span>
                    <span className="font-medium group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                      {prevPost.title}
                    </span>
                  </Link>
                ) : (
                  <div className="flex-1" />
                )}
                {nextPost ? (
                  <Link
                    href={`/blog/${nextPost.slug}`}
                    className="group flex-1 p-4 rounded-xl border hover:border-amber-300 dark:hover:border-amber-700 transition-colors text-right"
                  >
                    <span className="text-xs text-muted-foreground flex items-center justify-end gap-1 mb-1">
                      Next <ArrowRight className="w-3 h-3" />
                    </span>
                    <span className="font-medium group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                      {nextPost.title}
                    </span>
                  </Link>
                ) : (
                  <div className="flex-1" />
                )}
              </div>
            </nav>
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
}





