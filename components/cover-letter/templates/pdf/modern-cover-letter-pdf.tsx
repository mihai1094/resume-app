import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { CoverLetterData } from "@/lib/types/cover-letter";

interface ModernCoverLetterPDFProps {
  data: CoverLetterData;
}

// Teal color to match the modern resume template
const PRIMARY_COLOR = "#0d9488";

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 11,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    lineHeight: 1.6,
  },
  // Header
  header: {
    marginBottom: 30,
  },
  accentBar: {
    width: "100%",
    height: 3,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 2,
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  senderName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
  },
  contactInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  contactItem: {
    fontSize: 9,
    color: "#4b5563",
    marginRight: 10,
  },
  date: {
    fontSize: 10,
    color: "#6b7280",
    textAlign: "right",
  },
  // Recipient
  recipient: {
    marginBottom: 24,
    fontSize: 10,
    color: "#374151",
  },
  recipientName: {
    fontWeight: "bold",
    color: "#111827",
  },
  recipientCompany: {
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    marginTop: 2,
  },
  // Subject
  subject: {
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
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 11,
    color: "#374151",
    marginBottom: 14,
    lineHeight: 1.7,
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
    marginBottom: 24,
  },
  signatureName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 2,
  },
  signatureEmail: {
    fontSize: 9,
    color: "#6b7280",
  },
  // Footer
  footer: {
    marginTop: 30,
  },
  footerAccent: {
    width: 60,
    height: 3,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 2,
  },
});

export function ModernCoverLetterPDF({ data }: ModernCoverLetterPDFProps) {
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
    ? `${data.senderName} - Cover Letter${data.recipient.company ? ` for ${data.recipient.company}` : ""}`
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.accentBar} />
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.senderName}>
                {data.senderName || "Your Name"}
              </Text>
              <View style={styles.contactInfo}>
                {data.senderEmail && (
                  <Text style={styles.contactItem}>{data.senderEmail}</Text>
                )}
                {data.senderPhone && (
                  <Text style={styles.contactItem}>{data.senderPhone}</Text>
                )}
                {data.senderLocation && (
                  <Text style={styles.contactItem}>{data.senderLocation}</Text>
                )}
              </View>
              <View style={styles.contactInfo}>
                {data.senderLinkedin && (
                  <Text style={styles.contactItem}>
                    LinkedIn: {data.senderLinkedin.replace(/^https?:\/\/(www\.)?/, "")}
                  </Text>
                )}
                {data.senderWebsite && (
                  <Text style={styles.contactItem}>
                    {data.senderWebsite.replace(/^https?:\/\/(www\.)?/, "")}
                  </Text>
                )}
              </View>
            </View>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
        </View>

        {/* Recipient */}
        <View style={styles.recipient}>
          {data.recipient.name && (
            <Text style={styles.recipientName}>{data.recipient.name}</Text>
          )}
          {data.recipient.title && <Text>{data.recipient.title}</Text>}
          {data.recipient.company && (
            <Text style={styles.recipientCompany}>{data.recipient.company}</Text>
          )}
          {data.recipient.department && <Text>{data.recipient.department}</Text>}
          {data.recipient.address && <Text>{data.recipient.address}</Text>}
        </View>

        {/* Subject Line */}
        {(data.jobTitle || data.jobReference) && (
          <View style={styles.subject}>
            <Text>
              <Text style={styles.subjectLabel}>Re: </Text>
              {data.jobTitle}
              {data.jobTitle && data.jobReference && " — "}
              {data.jobReference && `Ref: ${data.jobReference}`}
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
          <Text style={styles.signatureName}>
            {data.senderName || "Your Name"}
          </Text>
          {data.senderEmail && (
            <Text style={styles.signatureEmail}>{data.senderEmail}</Text>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerAccent} />
        </View>
      </Page>
    </Document>
  );
}

