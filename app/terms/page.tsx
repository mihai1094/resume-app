import { Metadata } from "next";
import Link from "next/link";
import { appConfig } from "@/config/app";
import { ArrowLeft, FileText, Scale, AlertTriangle, CheckCircle, Ban, Mail, Clock, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/shared/footer";

export const metadata: Metadata = {
  title: "Terms of Service | ResumeForge",
  description: "Read the Terms of Service for ResumeForge resume builder. Understand your rights and responsibilities when using our service.",
};

export default function TermsPage() {
  const lastUpdated = "February 15, 2026";
  const effectiveDate = "February 15, 2026";

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
              <h1 className="text-xl font-semibold">Terms of Service</h1>
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
              <FileText className="w-6 h-6 text-primary" />
              Agreement to Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using {appConfig.name} (&quot;Service&quot;), you agree to be bound by these
              Terms of Service (&quot;Terms&quot;). If you disagree with any part of these terms, you do not
              have permission to access the Service.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              These Terms are effective as of {effectiveDate}.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-primary" />
              Use of Service
            </h2>

            <h3 className="text-lg font-semibold mt-6 mb-3">Permitted Use</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You may use our Service to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Create, edit, and manage professional resumes</li>
              <li>Export resumes in PDF and JSON formats</li>
              <li>Use various templates provided by the Service</li>
              <li>Store resume data locally in your browser</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-3">Account Responsibility</h3>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for maintaining the confidentiality of your data and for all
              activities that occur with your resume data. You are also responsible for maintaining
              account access and creating backups of important resume versions.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Ban className="w-6 h-6 text-primary" />
              Prohibited Uses
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree not to use the Service:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
              <li>To upload or transmit viruses or any other type of malicious code</li>
              <li>To interfere with or circumvent the security features of the Service</li>
              <li>To scrape, data mine, or use automated tools to access the Service</li>
              <li>To reverse engineer or attempt to extract the source code of the Service</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Scale className="w-6 h-6 text-primary" />
              Intellectual Property
            </h2>

            <h3 className="text-lg font-semibold mt-6 mb-3">Our Content</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The Service and its original content (excluding content provided by users), features,
              and functionality are and will remain the exclusive property of {appConfig.name} and
              its licensors. The Service is protected by copyright, trademark, and other laws.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">Your Content</h3>
            <p className="text-muted-foreground leading-relaxed">
              You retain all rights to the resume content you create using our Service. By using
              the Service, you grant us a limited license to process your content solely for the
              purpose of providing the Service to you.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-primary" />
              Disclaimer of Warranties
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. We make no
              warranties, expressed or implied, regarding:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>The operation or availability of the Service</li>
              <li>The accuracy, reliability, or completeness of any content</li>
              <li>That the Service will be uninterrupted, timely, secure, or error-free</li>
              <li>The results that may be obtained from the use of the Service</li>
              <li>The effectiveness of your resume in obtaining employment</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              In no event shall {appConfig.name}, nor its directors, employees, partners, agents,
              suppliers, or affiliates, be liable for any indirect, incidental, special, consequential,
              or punitive damages, including without limitation, loss of profits, data, use, goodwill,
              or other intangible losses, resulting from:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
              <li>Your access to or use of or inability to access or use the Service</li>
              <li>Any conduct or content of any third party on the Service</li>
              <li>Any content obtained from the Service</li>
              <li>Unauthorized access, use, or alteration of your transmissions or content</li>
              <li>Loss of data due to browser storage clearing or device issues</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Data Loss Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              Resume data may exist both locally (browser storage) and in cloud storage when signed in:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
              <li>Clearing browser data will delete your saved resumes</li>
              <li>Cloud-sync features depend on account status and service availability</li>
              <li>You are responsible for exporting and backing up critical resume data</li>
              <li>We are not liable for any data loss due to browser or device issues</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We strongly recommend regularly exporting your resume data as JSON for backup purposes.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to defend, indemnify, and hold harmless {appConfig.name} and its licensees
              and licensors, and their employees, contractors, agents, officers, and directors, from
              and against any and all claims, damages, obligations, losses, liabilities, costs, or
              debt, and expenses (including but not limited to attorney&apos;s fees), resulting from or
              arising out of your use and access of the Service.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may terminate or suspend your access to our Service immediately, without prior
              notice or liability, for any reason whatsoever, including without limitation if you
              breach these Terms. Upon termination, your right to use the Service will immediately
              cease.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-primary" />
              Service Provider
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              This service is provided by:
            </p>
            <address className="not-italic text-muted-foreground leading-relaxed space-y-1">
              <p><strong>{appConfig.company.legalName}</strong></p>
              <p>Tax ID (CUI): {appConfig.company.cui}</p>
              <p>Trade Register No.: {appConfig.company.regCom}</p>
              <p>Registered office: {appConfig.company.address}</p>
              <p>
                Email:{" "}
                <a href={`mailto:${appConfig.company.email}`} className="text-primary hover:underline">
                  {appConfig.company.email}
                </a>
              </p>
            </address>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms are governed by Romanian law and applicable European Union law, including
              consumer protection and data protection rules (such as GDPR, where applicable). Any dispute
              is subject to the jurisdiction of the competent courts in Romania.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Scale className="w-6 h-6 text-primary" />
              Alternative Dispute Resolution (ADR)
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you are a consumer and a complaint cannot be resolved directly with us, you may use
              alternative dispute resolution channels, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>
                <strong>ANPC (Romania) — ADR information (SAL):</strong>{" "}
                <a href="https://anpc.ro/ce-este-sal/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  anpc.ro/ce-este-sal
                </a>
              </li>
              <li>
                <strong>EU list of dispute resolution bodies:</strong>{" "}
                <a href="https://consumer-redress.ec.europa.eu/dispute-resolution-bodies_en" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  consumer-redress.ec.europa.eu/dispute-resolution-bodies_en
                </a>
              </li>
              <li>
                <strong>ANPC official website:</strong>{" "}
                <a href="https://anpc.ro" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  anpc.ro
                </a>
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Note: the EU Online Dispute Resolution (ODR) platform under Regulation (EU) No 524/2013
              was discontinued on July 20, 2025. Before initiating ADR, please contact us at{" "}
              <a href={`mailto:${appConfig.supportEmail}`} className="text-primary hover:underline">
                {appConfig.supportEmail}
              </a>{" "}
              so we can try to resolve the matter amicably.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Severability</h2>
            <p className="text-muted-foreground leading-relaxed">
              If any provision of these Terms is held to be invalid or unenforceable by a court,
              the remaining provisions of these Terms will remain in effect.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              Changes to Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any
              time. If a revision is material, we will try to provide at least 30 days&apos; notice prior
              to any new terms taking effect. What constitutes a material change will be determined
              at our sole discretion. By continuing to access or use our Service after those revisions
              become effective, you agree to be bound by the revised terms.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-primary" />
              Contact Us
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms, please contact us at:{" "}
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
      <Footer />
    </div>
  );
}
