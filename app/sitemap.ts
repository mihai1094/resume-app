import { MetadataRoute } from "next";
import { appConfig } from "@/config/app";
import { TEMPLATES } from "@/lib/constants";
import { launchFlags } from "@/config/launch";
import { blogPosts } from "@/lib/data/blog-posts";
import { comparisonPages } from "@/lib/data/comparison-pages";
import { resumeExamples } from "@/lib/data/resume-examples";
import { getSiteUrl, toAbsoluteUrl } from "@/lib/config/site-url";
import { getAdminDb } from "@/lib/firebase/admin";
import { logger } from "@/lib/services/logger";

const baseUrl = getSiteUrl();
const CORE_PAGE_LASTMOD = new Date("2026-03-01T00:00:00.000Z");
const BLOG_INDEX_LASTMOD = blogPosts.reduce((latest, post) => {
  const updatedAt = new Date(post.updatedAt);
  return updatedAt > latest ? updatedAt : latest;
}, new Date("2024-01-01T00:00:00.000Z"));

export const revalidate = 3600;

function getLastModifiedDate(value: unknown, fallback: Date): Date {
  if (value instanceof Date) {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value.toDate();
  }

  return fallback;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Core application routes
  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: CORE_PAGE_LASTMOD,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: toAbsoluteUrl(appConfig.urls.create),
      lastModified: CORE_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: toAbsoluteUrl(appConfig.urls.preview),
      lastModified: CORE_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: toAbsoluteUrl(appConfig.urls.templates),
      lastModified: CORE_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: toAbsoluteUrl("/pricing"),
      lastModified: CORE_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: toAbsoluteUrl("/about"),
      lastModified: CORE_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: toAbsoluteUrl("/free-resume-builder"),
      lastModified: CORE_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: toAbsoluteUrl("/ai-resume-builder"),
      lastModified: CORE_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: toAbsoluteUrl("/resume-pdf-export"),
      lastModified: CORE_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: toAbsoluteUrl("/cover-letter"),
      lastModified: CORE_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: toAbsoluteUrl("/ats-resume-checker"),
      lastModified: CORE_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: toAbsoluteUrl("/privacy"),
      lastModified: CORE_PAGE_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: toAbsoluteUrl("/terms"),
      lastModified: CORE_PAGE_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: toAbsoluteUrl("/cookies"),
      lastModified: CORE_PAGE_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Blog routes
  const blogRoutes: MetadataRoute.Sitemap = [
    {
      url: toAbsoluteUrl("/blog"),
      lastModified: BLOG_INDEX_LASTMOD,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    ...blogPosts.map((post) => ({
      url: toAbsoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly" as const,
      priority: post.featured ? 0.8 : 0.7,
    })),
  ];

  const templateRoutes: MetadataRoute.Sitemap = TEMPLATES.map((template) => ({
    url: toAbsoluteUrl(`/templates/${template.id}`),
    lastModified: CORE_PAGE_LASTMOD,
    changeFrequency: "monthly",
    priority: 0.72,
  }));

  const comparisonRoutes: MetadataRoute.Sitemap = comparisonPages.map((page) => ({
    url: toAbsoluteUrl(`/vs/${page.slug}`),
    lastModified: new Date(`${page.lastVerified}T00:00:00.000Z`),
    changeFrequency: "monthly",
    priority: 0.68,
  }));

  const resumeExampleRoutes: MetadataRoute.Sitemap = [
    {
      url: toAbsoluteUrl("/resume-examples"),
      lastModified: CORE_PAGE_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    ...resumeExamples.map((ex) => ({
      url: toAbsoluteUrl(`/resume-examples/${ex.slug}`),
      lastModified: CORE_PAGE_LASTMOD,
      changeFrequency: "monthly" as const,
      priority: 0.72,
    })),
  ];

  let publicResumeRoutes: MetadataRoute.Sitemap = [];

  if (launchFlags.features.publicSharing) {
    try {
      const publicSnap = await getAdminDb()
        .collection("publicResumes")
        .where("isPublic", "==", true)
        .select("username", "slug", "lastUpdated")
        .limit(1000)
        .get();

      publicResumeRoutes = publicSnap.docs.reduce<MetadataRoute.Sitemap>((routes, doc) => {
        const data = doc.data();
        if (typeof data.username !== "string" || typeof data.slug !== "string") {
          return routes;
        }

        routes.push({
          url: toAbsoluteUrl(`/u/${data.username}/${data.slug}`),
          lastModified: getLastModifiedDate(data.lastUpdated, CORE_PAGE_LASTMOD),
          changeFrequency: "monthly",
          priority: 0.5,
        });

        return routes;
      }, []);
    } catch (error) {
      logger.warn("Skipping public resume sitemap routes", { module: "Sitemap" });
    }
  }

  return [
    ...coreRoutes,
    ...blogRoutes,
    ...templateRoutes,
    ...comparisonRoutes,
    ...resumeExampleRoutes,
    ...publicResumeRoutes,
  ];
}
