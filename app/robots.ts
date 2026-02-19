import { MetadataRoute } from "next";
import { getSiteUrl, toAbsoluteUrl } from "@/lib/config/site-url";
import { launchFlags } from "@/config/launch";

const baseUrl = getSiteUrl();

export default function robots(): MetadataRoute.Robots {
  const disallow = [
    "/api/",
    "/_next/",
    "/dashboard",
    "/settings",
    "/applications",
    "/onboarding",
    "/login",
    "/register",
  ];

  if (!launchFlags.features.publicSharing) {
    disallow.push("/u/");
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
    ],
    sitemap: toAbsoluteUrl("/sitemap.xml"),
    host: baseUrl,
  };
}
