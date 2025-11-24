"use client";

import { CoverLetterData } from "@/lib/types/cover-letter";
import { cn } from "@/lib/utils";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  Calendar,
} from "lucide-react";

interface ModernCoverLetterProps {
  data: CoverLetterData;
}

/**
 * Modern Cover Letter Template
 *
 * A clean, contemporary design with a colored header accent,
 * clear typography, and professional spacing.
 */
export function ModernCoverLetter({ data }: ModernCoverLetterProps) {
  const primaryColor = "#0d9488"; // Teal to match modern resume template

  const hasContactInfo = data.senderEmail || data.senderPhone || data.senderLocation;

  return (
    <div
      className="w-full bg-white text-gray-800 min-h-[297mm] font-sans"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Header */}
      <header className="p-8 pb-0">
        {/* Accent bar */}
        <div
          className="w-full h-1 rounded-full mb-8"
          style={{ backgroundColor: primaryColor }}
        />

        {/* Sender Info */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">
              {data.senderName || "Your Name"}
            </h1>
            {hasContactInfo && (
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-3">
                {data.senderEmail && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" style={{ color: primaryColor }} />
                    {data.senderEmail}
                  </span>
                )}
                {data.senderPhone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4" style={{ color: primaryColor }} />
                    {data.senderPhone}
                  </span>
                )}
                {data.senderLocation && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" style={{ color: primaryColor }} />
                    {data.senderLocation}
                  </span>
                )}
              </div>
            )}
            {(data.senderLinkedin || data.senderWebsite) && (
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                {data.senderLinkedin && (
                  <span className="flex items-center gap-1.5">
                    <Linkedin className="w-4 h-4" style={{ color: primaryColor }} />
                    {data.senderLinkedin.replace(/^https?:\/\/(www\.)?/, "")}
                  </span>
                )}
                {data.senderWebsite && (
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4" style={{ color: primaryColor }} />
                    {data.senderWebsite.replace(/^https?:\/\/(www\.)?/, "")}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Date */}
          <div className="text-right text-sm text-gray-500">
            <div className="flex items-center gap-1.5 justify-end">
              <Calendar className="w-4 h-4" />
              {data.date ? new Date(data.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 pt-10">
        {/* Recipient Info */}
        <div className="mb-8 text-sm text-gray-700">
          {data.recipient.name && (
            <p className="font-medium">{data.recipient.name}</p>
          )}
          {data.recipient.title && (
            <p>{data.recipient.title}</p>
          )}
          {data.recipient.company && (
            <p className="font-medium" style={{ color: primaryColor }}>
              {data.recipient.company}
            </p>
          )}
          {data.recipient.department && (
            <p>{data.recipient.department}</p>
          )}
          {data.recipient.address && (
            <p className="text-gray-500">{data.recipient.address}</p>
          )}
        </div>

        {/* Job Reference (if provided) */}
        {(data.jobTitle || data.jobReference) && (
          <div className="mb-6 text-sm">
            <p className="text-gray-600">
              <span className="font-medium">Re:</span>{" "}
              {data.jobTitle && <span>{data.jobTitle}</span>}
              {data.jobTitle && data.jobReference && " — "}
              {data.jobReference && (
                <span className="text-gray-500">Ref: {data.jobReference}</span>
              )}
            </p>
          </div>
        )}

        {/* Letter Body */}
        <div className="space-y-5 text-[15px] leading-relaxed text-gray-700">
          {/* Salutation */}
          <p className="font-medium text-gray-900">{data.salutation}</p>

          {/* Opening Paragraph */}
          {data.openingParagraph ? (
            <p>{data.openingParagraph}</p>
          ) : (
            <p className="text-gray-400 italic">
              [Your opening paragraph will appear here. Start with why you're writing and what position you're applying for.]
            </p>
          )}

          {/* Body Paragraphs */}
          {data.bodyParagraphs.map((paragraph, index) =>
            paragraph.trim() ? (
              <p key={index}>{paragraph}</p>
            ) : index === 0 && !data.openingParagraph ? (
              <p key={index} className="text-gray-400 italic">
                [Add your qualifications and relevant experience here.]
              </p>
            ) : null
          )}

          {/* Closing Paragraph */}
          {data.closingParagraph ? (
            <p>{data.closingParagraph}</p>
          ) : (
            <p className="text-gray-400 italic">
              [Your closing paragraph will appear here. Express enthusiasm and include a call to action.]
            </p>
          )}
        </div>

        {/* Sign Off */}
        <div className="mt-10 space-y-6">
          <p className="text-gray-700">{data.signOff}</p>

          {/* Signature area */}
          <div className="space-y-1">
            <p className="font-semibold text-gray-900 text-lg">
              {data.senderName || "Your Name"}
            </p>
            {data.senderEmail && (
              <p className="text-sm text-gray-500">{data.senderEmail}</p>
            )}
          </div>
        </div>
      </main>

      {/* Footer accent */}
      <footer className="p-8 pt-0">
        <div
          className="w-24 h-1 rounded-full mt-8"
          style={{ backgroundColor: primaryColor }}
        />
      </footer>
    </div>
  );
}

