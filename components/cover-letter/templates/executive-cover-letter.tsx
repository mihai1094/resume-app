import { CoverLetterData } from "@/lib/types/cover-letter";
import { renderFormattedText } from "@/lib/utils/format-text";

interface ExecutiveCoverLetterProps {
  data: CoverLetterData;
}

const NAVY = "#0f172a";
const GOLD = "#b45309";

export function ExecutiveCoverLetter({ data }: ExecutiveCoverLetterProps) {
  const formattedDate = data.date
    ? new Date(data.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const contactLine = [data.senderEmail, data.senderPhone, data.senderLocation]
    .filter(Boolean)
    .join("  ·  ");

  const linksLine = [data.senderLinkedin, data.senderWebsite]
    .filter(Boolean)
    .map((s) => s!.replace(/^https?:\/\/(www\.)?/, ""))
    .join("  ·  ");

  return (
    <div
      className="w-full bg-white text-gray-800"
      style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
    >
      {/* Navy Header Band */}
      <header
        className="px-12 py-10"
        style={{ backgroundColor: NAVY, color: "white" }}
      >
        <h1
          className="text-3xl font-light uppercase tracking-[0.25em]"
          style={{ color: "white" }}
        >
          {data.senderName || "Your Name"}
        </h1>
        <div
          className="mt-4 h-[2px] w-16"
          style={{ backgroundColor: GOLD }}
        />
        {contactLine && (
          <p
            className="mt-5 text-xs tracking-wider"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            {contactLine}
          </p>
        )}
        {linksLine && (
          <p
            className="mt-1 text-xs tracking-wider"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            {linksLine}
          </p>
        )}
      </header>

      {/* Body */}
      <main className="px-12 pt-10 pb-12">
        {/* Date — right-aligned, formal */}
        <div className="mb-8 text-right">
          <p
            className="text-xs uppercase tracking-widest"
            style={{ color: "#64748b" }}
          >
            {formattedDate}
          </p>
        </div>

        {/* Recipient */}
        <div className="mb-10 text-sm leading-relaxed text-gray-700">
          {data.recipient.name && (
            <p className="font-semibold text-gray-900">{data.recipient.name}</p>
          )}
          {data.recipient.title && <p>{data.recipient.title}</p>}
          {data.recipient.company && (
            <p
              className="font-semibold"
              style={{ color: NAVY }}
            >
              {data.recipient.company}
            </p>
          )}
          {data.recipient.department && (
            <p className="text-gray-600">{data.recipient.department}</p>
          )}
          {data.recipient.address && (
            <p className="text-gray-500">{data.recipient.address}</p>
          )}
        </div>

        {/* Job Reference */}
        {(data.jobTitle || data.jobReference) && (
          <div className="mb-8 pb-3 border-b border-gray-200">
            <p
              className="text-xs uppercase tracking-widest font-semibold"
              style={{ color: NAVY }}
            >
              Re: Application for {data.jobTitle || "Position"}
              {data.jobReference && (
                <span
                  className="ml-2 font-normal"
                  style={{ color: "#64748b" }}
                >
                  · Ref: {data.jobReference}
                </span>
              )}
            </p>
          </div>
        )}

        {/* Letter Body */}
        <div
          className="space-y-5 text-[15px] leading-[1.75] text-gray-700"
          style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
        >
          <p className="font-medium text-gray-900">{data.salutation}</p>

          {data.openingParagraph ? (
            <p>{renderFormattedText(data.openingParagraph)}</p>
          ) : (
            <p className="text-gray-400 italic">
              [Your opening paragraph will appear here.]
            </p>
          )}

          {data.bodyParagraphs.map((paragraph, index) =>
            paragraph.trim() ? (
              <p key={index}>{renderFormattedText(paragraph)}</p>
            ) : null
          )}

          {data.closingParagraph ? (
            <p>{renderFormattedText(data.closingParagraph)}</p>
          ) : (
            <p className="text-gray-400 italic">
              [Your closing paragraph will appear here.]
            </p>
          )}
        </div>

        {/* Sign Off — right-aligned with gold rule */}
        <div className="mt-12 flex flex-col items-end">
          <div
            className="h-[1px] w-24 mb-6"
            style={{ backgroundColor: GOLD }}
          />
          <p className="text-gray-700 mb-4">{data.signOff}</p>
          <p
            className="font-semibold uppercase tracking-widest text-sm"
            style={{ color: NAVY }}
          >
            {data.senderName || "Your Name"}
          </p>
        </div>
      </main>
    </div>
  );
}
