import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  DM_Sans,
  Inter,
  JetBrains_Mono,
  Playfair_Display,
  Source_Serif_4,
} from "next/font/google";
import "./globals.css";
import { defaultMetadata } from "@/lib/seo/metadata";
import { getOrganizationSchema } from "@/lib/seo/structured-data";
import { getAIResumeBuilderSchema } from "@/lib/seo/structured-data-advanced";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { KeyboardShortcutsDialog } from "@/components/shared/keyboard-shortcuts-dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { validateRuntimeEnv } from "@/lib/config/runtime-env";
import { ConsentedVercelAnalytics } from "@/components/analytics/consented-vercel-analytics";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { CookieConsentBanner } from "@/components/privacy/cookie-consent-banner";
import { SkipLink } from "@/components/shared/skip-link";
import { TestToolbar } from "@/components/test/test-toolbar";
import { JsonLd } from "@/components/seo/json-ld";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

const sourceSerif4 = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-serif-4",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-cormorant-garamond",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono-raw",
});

export const metadata: Metadata = defaultMetadata;

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  validateRuntimeEnv();

  const organizationSchema = getOrganizationSchema();
  const aiResumeBuilderSchema = getAIResumeBuilderSchema();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfairDisplay.variable} ${dmSans.variable} ${sourceSerif4.variable} ${cormorantGaramond.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <JsonLd data={organizationSchema} />
        <JsonLd data={aiResumeBuilderSchema} />
      </head>
      <body className="font-sans antialiased bg-background text-foreground" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <SkipLink href="#main">Skip to main content</SkipLink>
            {/* SkipLink target. NOT a <main> landmark — many pages render their
                own <main> and nesting would violate WCAG 2.4.1. */}
            <div id="main" tabIndex={-1} className="outline-none">
              {children}
            </div>
            <Toaster />
            <ConsentedVercelAnalytics />
            <PostHogProvider />
            <CookieConsentBanner />
            <KeyboardShortcutsDialog />
            {process.env.NEXT_PUBLIC_ENABLE_TEST_TOOLBAR === "true" && (
              <TestToolbar />
            )}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
