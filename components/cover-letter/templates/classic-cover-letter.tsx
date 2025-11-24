"use client";

import { CoverLetterData } from "@/lib/types/cover-letter";

interface ClassicCoverLetterProps {
  data: CoverLetterData;
}

/**
 * Classic Cover Letter Template
 *
 * Traditional business letter format with formal structure,
 * perfect for conservative industries and executive positions.
 */
export function ClassicCoverLetter({ data }: ClassicCoverLetterProps) {
  return (
    <div
      className="w-full bg-white text-gray-800 min-h-[297mm] p-12"
      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
    >
      {/* Sender Information (top right in classic format) */}
      <div className="text-right mb-10 text-sm leading-relaxed">
        <p className="font-semibold text-gray-900 text-base">
          {data.senderName || "Your Name"}
        </p>
        {data.senderLocation && <p className="text-gray-600">{data.senderLocation}</p>}
        {data.senderPhone && <p className="text-gray-600">{data.senderPhone}</p>}
        {data.senderEmail && <p className="text-gray-600">{data.senderEmail}</p>}
        {data.senderLinkedin && (
          <p className="text-gray-500 text-xs">
            LinkedIn: {data.senderLinkedin.replace(/^https?:\/\/(www\.)?/, "")}
          </p>
        )}
        {data.senderWebsite && (
          <p className="text-gray-500 text-xs">
            {data.senderWebsite.replace(/^https?:\/\/(www\.)?/, "")}
          </p>
        )}
      </div>

      {/* Date */}
      <div className="mb-8 text-sm text-gray-700">
        <p>
          {data.date
            ? new Date(data.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
        </p>
      </div>

      {/* Recipient Information */}
      <div className="mb-8 text-sm text-gray-700 leading-relaxed">
        {data.recipient.name && (
          <p className="font-medium">{data.recipient.name}</p>
        )}
        {data.recipient.title && <p>{data.recipient.title}</p>}
        {data.recipient.company && (
          <p className="font-medium">{data.recipient.company}</p>
        )}
        {data.recipient.department && <p>{data.recipient.department}</p>}
        {data.recipient.address && <p>{data.recipient.address}</p>}
      </div>

      {/* Subject Line */}
      {(data.jobTitle || data.jobReference) && (
        <div className="mb-6 text-sm">
          <p className="text-gray-800">
            <span className="font-semibold">RE:</span>{" "}
            Application for {data.jobTitle || "Position"}
            {data.jobReference && (
              <span className="text-gray-500"> (Ref: {data.jobReference})</span>
            )}
          </p>
        </div>
      )}

      {/* Letter Body */}
      <div className="space-y-5 text-[15px] leading-[1.8] text-gray-700">
        {/* Salutation */}
        <p>{data.salutation}</p>

        {/* Opening Paragraph */}
        {data.openingParagraph ? (
          <p className="text-justify">{data.openingParagraph}</p>
        ) : (
          <p className="text-gray-400 italic">
            [Your opening paragraph will appear here.]
          </p>
        )}

        {/* Body Paragraphs */}
        {data.bodyParagraphs.map((paragraph, index) =>
          paragraph.trim() ? (
            <p key={index} className="text-justify">{paragraph}</p>
          ) : null
        )}

        {/* Closing Paragraph */}
        {data.closingParagraph ? (
          <p className="text-justify">{data.closingParagraph}</p>
        ) : (
          <p className="text-gray-400 italic">
            [Your closing paragraph will appear here.]
          </p>
        )}
      </div>

      {/* Sign Off */}
      <div className="mt-10">
        <p className="text-gray-700 mb-12">{data.signOff}</p>

        {/* Signature Space */}
        <div className="border-b border-gray-300 w-48 mb-2" />

        <p className="font-semibold text-gray-900">
          {data.senderName || "Your Name"}
        </p>
      </div>

      {/* Enclosures (optional notation) */}
      <div className="mt-10 text-xs text-gray-500">
        <p>Encl: Resume/CV</p>
      </div>
    </div>
  );
}

