import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  DM_Sans,
  EB_Garamond,
  Inter,
  JetBrains_Mono,
  Lato,
  Libre_Baskerville,
  Playfair_Display,
  Source_Serif_4,
} from "next/font/google";
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

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-libre-baskerville",
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

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-eb-garamond-raw",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-lato-raw",
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

  // Read the per-request nonce injected by middleware (for CSP compliance)
  const headersList = await headers();
  const nonce = headersList.get("x-nonce") ?? undefined;

  const organizationSchema = getOrganizationSchema();
  const webAppSchema = getWebApplicationSchema();
  const aiResumeBuilderSchema = getAIResumeBuilderSchema();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfairDisplay.variable} ${libreBaskerville.variable} ${dmSans.variable} ${sourceSerif4.variable} ${cormorantGaramond.variable} ${jetbrainsMono.variable} ${ebGaramond.variable} ${lato.variable}`}
      suppressHydrationWarning
    >
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
      <body className="font-sans antialiased bg-background text-foreground" suppressHydrationWarning>
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
