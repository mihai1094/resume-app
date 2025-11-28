import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createPageMetadata } from "@/lib/seo/metadata";

// Export metadata for SEO - this only works in Server Components
export const metadata: Metadata = createPageMetadata;

interface CreatePageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export default function CreateResumePage({ searchParams }: CreatePageProps) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === "string") {
      params.set(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
    }
  });

  const query = params.toString();
  const target = query ? `/editor/new?${query}` : "/editor/new";
  redirect(target);
}
