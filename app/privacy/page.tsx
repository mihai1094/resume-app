import { Metadata } from "next";
import Link from "next/link";
import { appConfig } from "@/config/app";
import { ArrowLeft, Shield, Eye, Database, Cookie, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Privacy Policy | ResumeForge",
  description: "Learn how ResumeForge protects your privacy and handles your personal data. We prioritize your data security with local-first storage.",
};

export default function PrivacyPage() {
  const lastUpdated = "November 24, 2025";

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
              <h1 className="text-xl font-semibold">Privacy Policy</h1>
              <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Card className="p-4 text-center">
            <Database className="w-8 h-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold text-sm">Local-First Storage</h3>
            <p className="text-xs text-muted-foreground mt-1">Your data stays on your device</p>
          </Card>
          <Card className="p-4 text-center">
            <Eye className="w-8 h-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold text-sm">No Data Selling</h3>
            <p className="text-xs text-muted-foreground mt-1">We never sell your information</p>
          </Card>
          <Card className="p-4 text-center">
            <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
            <h3 className="font-semibold text-sm">Your Control</h3>
            <p className="text-xs text-muted-foreground mt-1">Delete your data anytime</p>
          </Card>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Introduction
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to {appConfig.name} (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting
              your privacy and ensuring you have a positive experience when using our resume builder
              application. This Privacy Policy explains how we collect, use, and protect your information.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-primary" />
              Information We Collect
            </h2>

            <h3 className="text-lg font-semibold mt-6 mb-3">Information You Provide</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you use our resume builder, you may provide personal information including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Name and contact information (email, phone, address)</li>
              <li>Professional experience and employment history</li>
              <li>Educational background</li>
              <li>Skills, certifications, and achievements</li>
              <li>Any other information you choose to include in your resume</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-3">Automatically Collected Information</h3>
            <p className="text-muted-foreground leading-relaxed">
              We may collect certain information automatically when you use our service:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Browser type and version</li>
              <li>Device type and operating system</li>
              <li>Usage patterns and feature interactions (anonymized)</li>
              <li>Error logs for debugging purposes</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-primary" />
              How We Use Your Information
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Provide and maintain our resume builder service</li>
              <li>Generate PDF exports of your resume</li>
              <li>Improve our application based on usage patterns</li>
              <li>Fix bugs and technical issues</li>
              <li>Respond to your inquiries and support requests</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-primary" />
              Data Storage
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Local Storage:</strong> Your resume data is primarily stored locally in your
              browser&apos;s localStorage. This means:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Your data remains on your device</li>
              <li>We do not have access to your resume content on our servers</li>
              <li>Clearing your browser data will remove your saved resumes</li>
              <li>Data is not synced across devices unless you export and import it</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Export Files:</strong> When you export your resume (PDF or JSON), the file is
              generated in your browser and downloaded directly to your device.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Cookie className="w-6 h-6 text-primary" />
              Cookies and Tracking
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use minimal cookies and similar technologies:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Essential Cookies:</strong> Required for basic functionality (theme preference)</li>
              <li><strong>Analytics:</strong> We may use privacy-focused analytics to understand usage patterns</li>
              <li><strong>No Advertising Cookies:</strong> We do not use cookies for advertising purposes</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Data Security
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate security measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>HTTPS encryption for all data transmission</li>
              <li>Local-first architecture minimizes server-side data exposure</li>
              <li>Regular security updates and monitoring</li>
              <li>No storage of sensitive data like passwords on our servers</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You have the following rights regarding your data:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Access:</strong> Your resume data is stored locally and accessible anytime</li>
              <li><strong>Export:</strong> Download your data as JSON at any time</li>
              <li><strong>Delete:</strong> Clear your browser&apos;s localStorage or use the reset function</li>
              <li><strong>Portability:</strong> Export and import your data freely</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may use the following third-party services:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Vercel:</strong> Hosting and deployment (no personal data shared)</li>
              <li><strong>Vercel Analytics:</strong> Privacy-focused, anonymized usage analytics</li>
              <li><strong>Sentry:</strong> Error tracking for application stability (no personal data)</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Children&apos;s Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our service is not intended for children under 13 years of age. We do not knowingly
              collect personal information from children under 13.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              Changes to This Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-primary" />
              Contact Us
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at:{" "}
              <a href={`mailto:${appConfig.supportEmail || "support@resumeforge.app"}`} className="text-primary hover:underline">
                {appConfig.supportEmail || "support@resumeforge.app"}
              </a>
            </p>
          </section>
        </div>

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

