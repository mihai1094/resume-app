import { CoverLetterData } from "@/lib/types/cover-letter";
import { renderFormattedText } from "@/lib/utils/format-text";

interface MinimalistCoverLetterProps {
  data: CoverLetterData;
}

export function MinimalistCoverLetter({ data }: MinimalistCoverLetterProps) {
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

  return (
    <div
      className="w-full bg-white text-gray-800"
      style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
    >
      <div className="px-16 pt-16 pb-16">
        {/* Top: sender block left, date right */}
        <header className="flex justify-between items-start mb-16">
          <div className="text-xs uppercase tracking-wider text-gray-500 leading-relaxed">
            <p
              className="text-sm font-medium tracking-wider mb-2"
              style={{ color: "#111", letterSpacing: "0.15em" }}
            >
              {data.senderName || "Your Name"}
            </p>
            {data.senderEmail && (
              <p className="normal-case tracking-normal text-gray-600">
                {data.senderEmail}
              </p>
            )}
            {data.senderPhone && (
              <p className="normal-case tracking-normal text-gray-600">
                {data.senderPhone}
              </p>
            )}
            {data.senderLocation && (
              <p className="normal-case tracking-normal text-gray-600">
                {data.senderLocation}
              </p>
            )}
            {data.senderLinkedin && (
              <p className="normal-case tracking-normal text-gray-500">
                {data.senderLinkedin.replace(/^https?:\/\/(www\.)?/, "")}
              </p>
            )}
            {data.senderWebsite && (
              <p className="normal-case tracking-normal text-gray-500">
                {data.senderWebsite.replace(/^https?:\/\/(www\.)?/, "")}
              </p>
            )}
          </div>

          <div className="text-xs uppercase tracking-wider text-gray-500">
            {formattedDate}
          </div>
        </header>

        {/* Recipient */}
        <div className="mb-12 text-sm text-gray-700 leading-relaxed">
          {data.recipient.name && (
            <p className="text-gray-900">{data.recipient.name}</p>
          )}
          {data.recipient.title && <p>{data.recipient.title}</p>}
          {data.recipient.company && (
            <p className="text-gray-900">{data.recipient.company}</p>
          )}
          {data.recipient.department && (
            <p className="text-gray-600">{data.recipient.department}</p>
          )}
          {data.recipient.address && (
            <p className="text-gray-500">{data.recipient.address}</p>
          )}
        </div>

        {/* Subject */}
        {(data.jobTitle || data.jobReference) && (
          <div className="mb-10 text-xs uppercase tracking-widest text-gray-500">
            {data.jobTitle && <span>{data.jobTitle}</span>}
            {data.jobTitle && data.jobReference && <span> · </span>}
            {data.jobReference && <span>Ref {data.jobReference}</span>}
          </div>
        )}

        {/* Body */}
        <div
          className="space-y-5 text-[14px] leading-[1.7] text-gray-700"
          style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
        >
          <p className="text-gray-900">{data.salutation}</p>

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

        {/* Sign-off */}
        <div className="mt-12 space-y-8">
          <p className="text-gray-700 text-sm">{data.signOff}</p>
          <p
            className="text-sm tracking-wider text-gray-900"
            style={{ letterSpacing: "0.12em" }}
          >
            {data.senderName || "Your Name"}
          </p>
        </div>
      </div>
    </div>
  );
}
