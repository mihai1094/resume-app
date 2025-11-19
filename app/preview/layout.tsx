import type { Metadata } from "next";
import { previewPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = previewPageMetadata;

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

