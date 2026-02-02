import type { Metadata } from "next";
import "./globals.css";
import { defaultMetadata } from "@/lib/seo/metadata";
import {
  getOrganizationSchema,
  getWebApplicationSchema,
  getFAQSchema,
} from "@/lib/seo/structured-data";
import {
  getAIResumeBuilderSchema,
  getHowToResumeSchema,
} from "@/lib/seo/structured-data-advanced";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import { KeyboardShortcutsDialog } from "@/components/shared/keyboard-shortcuts-dialog";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = getOrganizationSchema();
  const webAppSchema = getWebApplicationSchema();
  const faqSchema = getFAQSchema();
  const aiResumeBuilderSchema = getAIResumeBuilderSchema();
  const howToSchema = getHowToResumeSchema();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Core Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webAppSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(aiResumeBuilderSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(howToSchema),
          }}
        />
      </head>
      <body
        className={`font-sans antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
            <Toaster />
            <Analytics />
            <KeyboardShortcutsDialog />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
