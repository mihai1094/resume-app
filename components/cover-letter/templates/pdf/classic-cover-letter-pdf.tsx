import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { CoverLetterData } from "@/lib/types/cover-letter";

interface ClassicCoverLetterPDFProps {
  data: CoverLetterData;
}

const styles = StyleSheet.create({
  page: {
    padding: 60,
    fontSize: 11,
    fontFamily: "Times-Roman",
    backgroundColor: "#ffffff",
    lineHeight: 1.8,
  },
  // Sender block (top right)
  senderBlock: {
    textAlign: "right",
    marginBottom: 30,
    fontSize: 10,
    lineHeight: 1.6,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 2,
  },
  senderInfo: {
    color: "#4b5563",
  },
  // Date
  dateBlock: {
    marginBottom: 24,
    fontSize: 10,
    color: "#374151",
  },
  // Recipient block
  recipientBlock: {
    marginBottom: 24,
    fontSize: 10,
    lineHeight: 1.6,
    color: "#374151",
  },
  recipientName: {
    fontWeight: "bold",
    color: "#111827",
  },
  recipientCompany: {
    fontWeight: "bold",
  },
  // Subject line
  subjectLine: {
    marginBottom: 20,
    fontSize: 10,
    color: "#374151",
  },
  subjectLabel: {
    fontWeight: "bold",
    color: "#111827",
  },
  // Body
  salutation: {
    fontSize: 11,
    color: "#111827",
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 11,
    color: "#374151",
    marginBottom: 14,
    lineHeight: 1.9,
    textAlign: "justify",
  },
  placeholderParagraph: {
    fontSize: 11,
    color: "#9ca3af",
    fontStyle: "italic",
    marginBottom: 14,
  },
  // Sign off
  signOff: {
    marginTop: 30,
  },
  signOffText: {
    fontSize: 11,
    color: "#374151",
    marginBottom: 36,
  },
  signatureLine: {
    width: 150,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    marginBottom: 6,
  },
  signatureName: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
  },
  // Enclosure
  enclosure: {
    marginTop: 30,
    fontSize: 9,
    color: "#6b7280",
  },
});

export function ClassicCoverLetterPDF({ data }: ClassicCoverLetterPDFProps) {
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

  const documentTitle = data.senderName
    ? `${data.senderName} - Cover Letter${
        data.recipient.company ? ` for ${data.recipient.company}` : ""
      }`
    : "Cover Letter";

  return (
    <Document
      title={documentTitle}
      author={data.senderName || "ResumeForge User"}
      subject={`Cover Letter${data.jobTitle ? ` - ${data.jobTitle}` : ""}`}
      keywords="cover letter, job application, professional"
      creator="ResumeForge"
      producer="ResumeForge - react-pdf"
    >
      <Page size="A4" style={styles.page}>
        {/* Sender Block */}
        <View style={styles.senderBlock}>
          <Text style={styles.senderName}>
            {data.senderName || "Your Name"}
          </Text>
          {data.senderLocation && (
            <Text style={styles.senderInfo}>{data.senderLocation}</Text>
          )}
          {data.senderPhone && (
            <Text style={styles.senderInfo}>{data.senderPhone}</Text>
          )}
          {data.senderEmail && (
            <Text style={styles.senderInfo}>{data.senderEmail}</Text>
          )}
          {data.senderLinkedin && (
            <Text style={styles.senderInfo}>
              LinkedIn:{" "}
              {data.senderLinkedin.replace(/^https?:\/\/(www\.)?/, "")}
            </Text>
          )}
          {data.senderWebsite && (
            <Text style={styles.senderInfo}>
              {data.senderWebsite.replace(/^https?:\/\/(www\.)?/, "")}
            </Text>
          )}
        </View>

        {/* Date */}
        <View style={styles.dateBlock}>
          <Text>{formattedDate}</Text>
        </View>

        {/* Recipient Block */}
        <View style={styles.recipientBlock}>
          {data.recipient.name && (
            <Text style={styles.recipientName}>{data.recipient.name}</Text>
          )}
          {data.recipient.title && <Text>{data.recipient.title}</Text>}
          {data.recipient.company && (
            <Text style={styles.recipientCompany}>
              {data.recipient.company}
            </Text>
          )}
          {data.recipient.department && (
            <Text>{data.recipient.department}</Text>
          )}
          {data.recipient.address && <Text>{data.recipient.address}</Text>}
        </View>

        {/* Subject Line */}
        {(data.jobTitle || data.jobReference) && (
          <View style={styles.subjectLine}>
            <Text>
              <Text style={styles.subjectLabel}>RE: </Text>
              Application for {data.jobTitle || "Position"}
              {data.jobReference && ` (Ref: ${data.jobReference})`}
            </Text>
          </View>
        )}

        {/* Salutation */}
        <Text style={styles.salutation}>{data.salutation}</Text>

        {/* Opening Paragraph */}
        {data.openingParagraph ? (
          <Text style={styles.paragraph}>{data.openingParagraph}</Text>
        ) : (
          <Text style={styles.placeholderParagraph}>
            [Your opening paragraph will appear here.]
          </Text>
        )}

        {/* Body Paragraphs */}
        {data.bodyParagraphs.map((paragraph, index) =>
          paragraph.trim() ? (
            <Text key={index} style={styles.paragraph}>
              {paragraph}
            </Text>
          ) : null
        )}

        {/* Closing Paragraph */}
        {data.closingParagraph ? (
          <Text style={styles.paragraph}>{data.closingParagraph}</Text>
        ) : (
          <Text style={styles.placeholderParagraph}>
            [Your closing paragraph will appear here.]
          </Text>
        )}

        {/* Sign Off */}
        <View style={styles.signOff}>
          <Text style={styles.signOffText}>{data.signOff}</Text>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureName}>
            {data.senderName || "Your Name"}
          </Text>
        </View>

        {/* Enclosure Note */}
        <View style={styles.enclosure}>
          <Text>Encl: Resume/CV</Text>
        </View>
      </Page>
    </Document>
  );
}
