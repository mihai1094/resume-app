import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Edit Cover Letter",
  description: "Edit your cover letter with our powerful editor.",
  robots: {
    index: false,
    follow: false,
  },
};

interface EditCoverLetterPageProps {
  searchParams?: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function EditCoverLetterPage({ searchParams }: EditCoverLetterPageProps) {
  const params = searchParams ? await searchParams : {};
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        query.append(key, item);
      }
      continue;
    }

    if (typeof value === "string") {
      query.set(key, value);
    }
  }

  const queryString = query.toString();
  redirect(queryString ? `/cover-letter?${queryString}` : "/cover-letter");
}
