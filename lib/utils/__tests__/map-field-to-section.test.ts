import { describe, it, expect } from "vitest";
import { SectionId } from "@/lib/constants/defaults";

/**
 * Extracted mapFieldToSection logic for testing
 * Maps validation error field paths to resume sections
 */
function mapFieldToSection(fieldPath: string): SectionId {
  // Work experience
  if (fieldPath.startsWith("workExperience") || fieldPath.startsWith("experience"))
    return "experience";
  // Education
  if (fieldPath.startsWith("education")) return "education";
  // Skills
  if (fieldPath.startsWith("skills")) return "skills";
  // Languages
  if (fieldPath.startsWith("languages")) return "languages";
  // Courses & Certifications
  if (fieldPath.startsWith("courses")) return "courses";
  // Hobbies & Interests
  if (fieldPath.startsWith("hobbies")) return "hobbies";
  // Extra-curricular Activities
  if (
    fieldPath.startsWith("extraCurricular") ||
    fieldPath.startsWith("extra")
  )
    return "extra";
  // Personal information (default)
  const personalFields = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "location",
    "summary",
    "website",
    "linkedin",
    "github",
    "personalInfo",
  ];
  if (personalFields.some((key) => fieldPath.startsWith(key))) {
    return "personal";
  }
  // Fallback to personal for unknown fields
  return "personal";
}

describe("mapFieldToSection", () => {
  describe("personal section", () => {
    it("should map firstName to personal", () => {
      expect(mapFieldToSection("firstName")).toBe("personal");
    });

    it("should map lastName to personal", () => {
      expect(mapFieldToSection("lastName")).toBe("personal");
    });

    it("should map email to personal", () => {
      expect(mapFieldToSection("email")).toBe("personal");
    });

    it("should map phone to personal", () => {
      expect(mapFieldToSection("phone")).toBe("personal");
    });

    it("should map location to personal", () => {
      expect(mapFieldToSection("location")).toBe("personal");
    });

    it("should map summary to personal", () => {
      expect(mapFieldToSection("summary")).toBe("personal");
    });

    it("should map website to personal", () => {
      expect(mapFieldToSection("website")).toBe("personal");
    });

    it("should map linkedin to personal", () => {
      expect(mapFieldToSection("linkedin")).toBe("personal");
    });

    it("should map github to personal", () => {
      expect(mapFieldToSection("github")).toBe("personal");
    });

    it("should map personalInfo.* to personal", () => {
      expect(mapFieldToSection("personalInfo.email")).toBe("personal");
    });

    it("should default unknown fields to personal", () => {
      expect(mapFieldToSection("unknownField")).toBe("personal");
    });
  });

  describe("experience section", () => {
    it("should map workExperience to experience", () => {
      expect(mapFieldToSection("workExperience")).toBe("experience");
    });

    it("should map workExperience[0].position to experience", () => {
      expect(mapFieldToSection("workExperience[0].position")).toBe("experience");
    });

    it("should map experience to experience", () => {
      expect(mapFieldToSection("experience")).toBe("experience");
    });
  });

  describe("education section", () => {
    it("should map education to education", () => {
      expect(mapFieldToSection("education")).toBe("education");
    });

    it("should map education[0].school to education", () => {
      expect(mapFieldToSection("education[0].school")).toBe("education");
    });
  });

  describe("skills section", () => {
    it("should map skills to skills", () => {
      expect(mapFieldToSection("skills")).toBe("skills");
    });

    it("should map skills[0] to skills", () => {
      expect(mapFieldToSection("skills[0]")).toBe("skills");
    });
  });

  describe("languages section", () => {
    it("should map languages to languages", () => {
      expect(mapFieldToSection("languages")).toBe("languages");
    });

    it("should map languages[0].language to languages", () => {
      expect(mapFieldToSection("languages[0].language")).toBe("languages");
    });
  });

  describe("courses section", () => {
    it("should map courses to courses", () => {
      expect(mapFieldToSection("courses")).toBe("courses");
    });

    it("should map courses[0].name to courses", () => {
      expect(mapFieldToSection("courses[0].name")).toBe("courses");
    });
  });

  describe("hobbies section", () => {
    it("should map hobbies to hobbies", () => {
      expect(mapFieldToSection("hobbies")).toBe("hobbies");
    });

    it("should map hobbies[0] to hobbies", () => {
      expect(mapFieldToSection("hobbies[0]")).toBe("hobbies");
    });
  });

  describe("extra-curricular section", () => {
    it("should map extraCurricular to extra", () => {
      expect(mapFieldToSection("extraCurricular")).toBe("extra");
    });

    it("should map extraCurricular[0].activity to extra", () => {
      expect(mapFieldToSection("extraCurricular[0].activity")).toBe("extra");
    });

    it("should map extra to extra", () => {
      expect(mapFieldToSection("extra")).toBe("extra");
    });
  });
});
