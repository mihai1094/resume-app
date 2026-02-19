import { Metadata } from "next";
import Link from "next/link";
import { appConfig } from "@/config/app";
import { ArrowLeft, Cookie, Shield, BarChart2, Settings, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/shared/footer";
import { toAbsoluteUrl } from "@/lib/config/site-url";

export const metadata: Metadata = {
  title: "Cookie Policy | ResumeForge",
  description: "Learn what cookies and similar technologies ResumeForge uses, why we use them, and how to manage your preferences.",
  alternates: {
    canonical: toAbsoluteUrl("/cookies"),
  },
  openGraph: {
    title: "Cookie Policy | ResumeForge",
    description:
      "Learn what cookies and similar technologies ResumeForge uses, why we use them, and how to manage your preferences.",
    url: toAbsoluteUrl("/cookies"),
  },
};

export default function CookiesPage() {
  const lastUpdated = "February 15, 2026";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold">Cookie Policy</h1>
              <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-slate dark:prose-invert max-w-none">

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Cookie className="w-6 h-6 text-primary" />
              What Are Cookies?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small text files stored on your device when you visit a website. They can
              help remember preferences, keep services secure, and improve user experience.
              This page also covers similar browser technologies (for example, local storage) when relevant.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              For users in the EU/EEA (including Romania), this policy is provided in line with
              ePrivacy and data protection requirements, including Directive 2002/58/EC (ePrivacy),
              Law no. 506/2004 (Romania), and Regulation (EU) 2016/679 (GDPR).
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary" />
              Strictly Necessary Cookies
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              These cookies are required for core functionality and preference handling.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-semibold">Name</th>
                    <th className="text-left py-2 pr-4 font-semibold">Purpose</th>
                    <th className="text-left py-2 font-semibold">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-mono text-xs">rf_cookie_consent</td>
                    <td className="py-2 pr-4">Stores your consent preference for optional analytics</td>
                    <td className="py-2">180 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Note: theme preference and Firebase authentication state are stored using browser storage
              mechanisms, not first-party cookies set by this app.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-primary" />
              Analytics and Monitoring Technologies
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use limited analytics and reliability monitoring to improve the service.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-semibold">Service</th>
                    <th className="text-left py-2 pr-4 font-semibold">Purpose</th>
                    <th className="text-left py-2 pr-4 font-semibold">Activation</th>
                    <th className="text-left py-2 font-semibold">Third-Party Policy</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="py-2 pr-4">Vercel Analytics</td>
                    <td className="py-2 pr-4">Aggregated usage analytics (for example, page usage and region)</td>
                    <td className="py-2 pr-4">Enabled only when you accept optional analytics consent</td>
                    <td className="py-2">
                      <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">vercel.com/privacy</a>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">Sentry</td>
                    <td className="py-2 pr-4">Error monitoring and service reliability diagnostics (with masking/redaction controls)</td>
                    <td className="py-2 pr-4">Enabled in production for security and reliability operations</td>
                    <td className="py-2">
                      <a href="https://sentry.io/privacy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">sentry.io/privacy</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Consent and Withdrawal</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              On first visit, you can accept or reject optional web analytics from our cookie banner.
              Refusing optional analytics does not block core app functionality.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Your consent choice is stored in the <code>rf_cookie_consent</code> cookie for up to 180 days</li>
              <li>If you reject, optional Vercel web analytics remains disabled</li>
              <li>You can reset your choice by clearing this site&apos;s cookies and reloading the page</li>
              <li>Public resume analytics events are retained for up to 30 days</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              What We Do Not Use
            </h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Advertising or remarketing cookies</li>
              <li>Social media tracking cookies</li>
              <li>Data sharing with ad networks for targeted advertising</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">How to Manage Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You can control and/or delete cookies through your browser settings. Disabling necessary
              technologies may impact parts of the application.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>
                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a>
              </li>
              <li>
                <a href="https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a>
              </li>
              <li>
                <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Apple Safari</a>
              </li>
              <li>
                <a href="https://support.microsoft.com/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a>
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Your GDPR Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Under GDPR, you may have rights of access, rectification, erasure, restriction,
              portability, and objection, depending on the legal basis and context of processing.
              You may lodge complaints with:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>
                <strong>ANSPDCP</strong> (Romanian National Supervisory Authority for Personal Data Processing):{" "}
                <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.dataprotection.ro</a>
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-primary" />
              Contact
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about cookies and similar technologies, contact us at:{" "}
              <a href={`mailto:${appConfig.supportEmail}`} className="text-primary hover:underline">
                {appConfig.supportEmail}
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
