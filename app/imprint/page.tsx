import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Building2, Mail, MapPin, Scale, ShieldCheck, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { Footer } from "@/components/shared/footer";
import { appConfig } from "@/config/app";
import { toAbsoluteUrl } from "@/lib/config/site-url";
import { JsonLd } from "@/components/seo/json-ld";
import { getBreadcrumbSchema } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: "Company Information & Imprint",
  description:
    "Legal identification details for AXTECH CONSULTING S.R.L., the company behind ResumeZeus. Includes registration data, contact information, and consumer protection links.",
  alternates: {
    canonical: toAbsoluteUrl("/imprint"),
  },
  robots: { index: true, follow: true },
};

const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <section className="py-8 border-b border-border/50 last:border-0">
    <div className="flex items-center gap-2.5 mb-5">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
    </div>
    {children}
  </section>
);

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:gap-8 py-2.5 border-b border-border/30 last:border-0">
    <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70 sm:w-44 shrink-0 mb-0.5 sm:mb-0 pt-0.5">
      {label}
    </dt>
    <dd className="text-sm text-foreground">{value}</dd>
  </div>
);

export default function ImprintPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: toAbsoluteUrl("/") },
    { name: "Imprint", url: toAbsoluteUrl("/imprint") },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container mx-auto px-5 sm:px-6 py-12 md:py-16 max-w-2xl">
          {/* Page header */}
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-3">
              Legal
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
              Company Information
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Identification and contact details for the legal entity operating{" "}
              <strong className="font-medium text-foreground">ResumeZeus</strong>,
              published in accordance with Romanian e-commerce legislation
              (Legea nr. 365/2002, OUG 34/2014).
            </p>
          </div>

          <div className="divide-y divide-border/50">
            {/* Company identity */}
            <Section icon={Building2} title="Company Identity">
              <dl className="divide-y divide-border/30">
                <Row label="Legal name" value={appConfig.company.legalName} />
                <Row label="Legal form" value="Societate cu Răspundere Limitată (S.R.L.)" />
                <Row label="CUI" value={appConfig.company.cui} />
                <Row label="Nr. Reg. Com." value={appConfig.company.regCom} />
                <Row
                  label="Registered office"
                  value={appConfig.company.address}
                />
                <Row label="Country" value="Romania" />
              </dl>
            </Section>

            {/* Contact */}
            <Section icon={Mail} title="Contact">
              <dl className="divide-y divide-border/30">
                <Row
                  label="Support email"
                  value={
                    <a
                      href={`mailto:${appConfig.supportEmail}`}
                      className="text-primary hover:underline underline-offset-4"
                    >
                      {appConfig.supportEmail}
                    </a>
                  }
                />
                <Row
                  label="Legal / privacy"
                  value={
                    <a
                      href={`mailto:${appConfig.company.email}?subject=Legal%20Inquiry`}
                      className="text-primary hover:underline underline-offset-4"
                    >
                      {appConfig.company.email}
                    </a>
                  }
                />
              </dl>
            </Section>

            {/* Regulatory authorities */}
            <Section icon={ShieldCheck} title="Regulatory Authorities">
              <dl className="divide-y divide-border/30">
                <Row
                  label="Data protection"
                  value={
                    <a
                      href="https://www.dataprotection.ro"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-primary hover:underline underline-offset-4"
                    >
                      ANSPDCP — Autoritatea Națională de Supraveghere a
                      Prelucrării Datelor cu Caracter Personal
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  }
                />
                <Row
                  label="Consumer protection"
                  value={
                    <a
                      href="https://anpc.ro"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-primary hover:underline underline-offset-4"
                    >
                      ANPC — Autoritatea Națională pentru Protecția
                      Consumatorilor
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  }
                />
              </dl>
            </Section>

            {/* Alternative dispute resolution */}
            <Section icon={Scale} title="Alternative Dispute Resolution (ADR)">
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                In accordance with OUG 38/2015 and EU Regulation 524/2013, consumers
                may resolve disputes through alternative dispute resolution
                without going to court.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <a
                  href="https://anpc.ro/ce-este-sal/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-3 p-4 rounded-xl border border-border/60 hover:border-primary/30 bg-card hover:bg-primary/5 transition-colors"
                >
                  <Image
                    src="/assets/anpc-sal.svg"
                    alt="SAL — Soluționarea Alternativă a Litigiilor (ANPC)"
                    width={200}
                    height={40}
                    className="h-9 w-auto"
                  />
                  <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    Soluționarea Alternativă a Litigiilor — ANPC
                  </p>
                </a>
                <a
                  href="https://consumer-redress.ec.europa.eu/dispute-resolution-bodies_en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-3 p-4 rounded-xl border border-border/60 hover:border-primary/30 bg-card hover:bg-primary/5 transition-colors"
                >
                  <Image
                    src="/assets/anpc-sol.svg"
                    alt="SOL — Online Dispute Resolution (EU)"
                    width={200}
                    height={40}
                    className="h-9 w-auto"
                  />
                  <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    EU Online Dispute Resolution Platform
                  </p>
                </a>
              </div>
            </Section>

            {/* Legal links */}
            <section className="py-8">
              <h2 className="text-base font-semibold text-foreground mb-5">
                Legal Documents
              </h2>
              <div className="flex flex-wrap gap-3 text-sm">
                <Link
                  href="/privacy"
                  className="px-4 py-2 rounded-lg border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="px-4 py-2 rounded-lg border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/cookies"
                  className="px-4 py-2 rounded-lg border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground"
                >
                  Cookie Policy
                </Link>
              </div>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
