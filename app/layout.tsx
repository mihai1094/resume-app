import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { defaultMetadata } from "@/lib/seo/metadata";
import {
  getOrganizationSchema,
  getWebApplicationSchema,
} from "@/lib/seo/structured-data";
import {
  getAIResumeBuilderSchema,
} from "@/lib/seo/structured-data-advanced";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { KeyboardShortcutsDialog } from "@/components/shared/keyboard-shortcuts-dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { validateRuntimeEnv } from "@/lib/config/runtime-env";
import { ConsentedVercelAnalytics } from "@/components/analytics/consented-vercel-analytics";
import { CookieConsentBanner } from "@/components/privacy/cookie-consent-banner";

export const metadata: Metadata = defaultMetadata;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  validateRuntimeEnv();

  // Read the per-request nonce injected by middleware (for CSP compliance)
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") ?? undefined;

  const organizationSchema = getOrganizationSchema();
  const webAppSchema = getWebApplicationSchema();
  const aiResumeBuilderSchema = getAIResumeBuilderSchema();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Core Structured Data */}
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webAppSchema),
          }}
        />
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(aiResumeBuilderSchema),
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
            <ConsentedVercelAnalytics />
            <CookieConsentBanner />
            <KeyboardShortcutsDialog />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
