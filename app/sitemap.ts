import { MetadataRoute } from "next";
import { appConfig } from "@/config/app";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://resume-builder.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}${appConfig.urls.create}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}${appConfig.urls.preview}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    // Future blog/articles pages (ready for content marketing)
    // {
    //   url: `${baseUrl}/blog/how-to-pass-ats`,
    //   lastModified: new Date(),
    //   changeFrequency: "monthly" as const,
    //   priority: 0.7,
    // },
    // {
    //   url: `${baseUrl}/blog/ai-resume-optimization`,
    //   lastModified: new Date(),
    //   changeFrequency: "monthly" as const,
    //   priority: 0.7,
    // },
  ];

  return routes;
}
