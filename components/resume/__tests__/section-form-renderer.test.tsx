import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SectionFormRenderer } from "../section-form-renderer";
import { ResumeData } from "@/lib/types/resume";

// Mock all form components
vi.mock("../forms/personal-info-form", () => ({
  PersonalInfoForm: () => (
    <div data-testid="personal-info-form">Personal Info Form</div>
  ),
}));

vi.mock("../forms/work-experience-form", () => ({
  WorkExperienceForm: () => (
    <div data-testid="work-experience-form">Work Experience Form</div>
  ),
}));

vi.mock("../forms/education-form", () => ({
  EducationForm: () => <div data-testid="education-form">Education Form</div>,
}));

vi.mock("../forms/skills-form", () => ({
  SkillsForm: () => <div data-testid="skills-form">Skills Form</div>,
}));

vi.mock("../forms/languages-form", () => ({
  LanguagesForm: () => <div data-testid="languages-form">Languages Form</div>,
}));

vi.mock("../forms/projects-form", () => ({
  ProjectsForm: () => <div data-testid="projects-form">Projects Form</div>,
}));

vi.mock("../forms/certifications-form", () => ({
  CertificationsForm: () => (
    <div data-testid="certifications-form">Certifications Form</div>
  ),
}));

vi.mock("../forms/additional-sections-form", () => ({
  AdditionalSectionsForm: () => (
    <div data-testid="additional-sections-form">Additional Sections Form</div>
  ),
}));

describe("SectionFormRenderer", () => {
  const mockResumeData: ResumeData = {
    personalInfo: {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      location: "New York",
    },
    workExperience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    extraCurricular: [],
    hobbies: [],
    customSections: [],
  };

  const mockHandlers = {
    updatePersonalInfo: vi.fn(),
    addWorkExperience: vi.fn(),
    updateWorkExperience: vi.fn(),
    removeWorkExperience: vi.fn(),
    setWorkExperience: vi.fn(),
    addEducation: vi.fn(),
    updateEducation: vi.fn(),
    removeEducation: vi.fn(),
    setEducation: vi.fn(),
    addSkill: vi.fn(),
    updateSkill: vi.fn(),
    removeSkill: vi.fn(),
    addProject: vi.fn(),
    updateProject: vi.fn(),
    removeProject: vi.fn(),
    reorderProjects: vi.fn(),
    addCertification: vi.fn(),
    addCourseAsCertification: vi.fn(),
    updateCertification: vi.fn(),
    removeCertification: vi.fn(),
    addLanguage: vi.fn(),
    updateLanguage: vi.fn(),
    removeLanguage: vi.fn(),
    addExtraCurricular: vi.fn(),
    updateExtraCurricular: vi.fn(),
    removeExtraCurricular: vi.fn(),
    setExtraCurricular: vi.fn(),
    addHobby: vi.fn(),
    updateHobby: vi.fn(),
    removeHobby: vi.fn(),
    addCustomSection: vi.fn(),
    updateCustomSection: vi.fn(),
    removeCustomSection: vi.fn(),
    addCustomSectionItem: vi.fn(),
    updateCustomSectionItem: vi.fn(),
    removeCustomSectionItem: vi.fn(),
  };

  const defaultProps = {
    resumeData: mockResumeData,
    validationErrors: [],
    showErrors: false,
    templateSupportsPhoto: false,
    ...mockHandlers,
  };

  describe("Section Rendering", () => {
    it('should render PersonalInfoForm when activeSection is "personal"', () => {
      render(
        <SectionFormRenderer {...defaultProps} activeSection="personal" />
      );
      expect(screen.getByTestId("personal-info-form")).toBeInTheDocument();
    });

    it('should render WorkExperienceForm when activeSection is "experience"', () => {
      render(
        <SectionFormRenderer {...defaultProps} activeSection="experience" />
      );
      expect(screen.getByTestId("work-experience-form")).toBeInTheDocument();
    });

    it('should render EducationForm when activeSection is "education"', () => {
      render(
        <SectionFormRenderer {...defaultProps} activeSection="education" />
      );
      expect(screen.getByTestId("education-form")).toBeInTheDocument();
    });

    it('should render SkillsForm when activeSection is "skills"', () => {
      render(<SectionFormRenderer {...defaultProps} activeSection="skills" />);
      expect(screen.getByTestId("skills-form")).toBeInTheDocument();
    });

    it('should render ProjectsForm when activeSection is "projects"', () => {
      render(
        <SectionFormRenderer {...defaultProps} activeSection="projects" />
      );
      expect(screen.getByTestId("projects-form")).toBeInTheDocument();
    });

    it('should render CertificationsForm when activeSection is "certifications"', () => {
      render(
        <SectionFormRenderer {...defaultProps} activeSection="certifications" />
      );
      expect(screen.getByTestId("certifications-form")).toBeInTheDocument();
    });

    it('should render LanguagesForm when activeSection is "languages"', () => {
      render(
        <SectionFormRenderer {...defaultProps} activeSection="languages" />
      );
      expect(screen.getByTestId("languages-form")).toBeInTheDocument();
    });

    it('should render AdditionalSectionsForm when activeSection is "additional"', () => {
      render(
        <SectionFormRenderer {...defaultProps} activeSection="additional" />
      );
      expect(
        screen.getByTestId("additional-sections-form")
      ).toBeInTheDocument();
    });
  });

  describe("Exclusive Rendering", () => {
    it("should only render one form at a time", () => {
      render(
        <SectionFormRenderer {...defaultProps} activeSection="personal" />
      );

      expect(screen.getByTestId("personal-info-form")).toBeInTheDocument();
      expect(
        screen.queryByTestId("work-experience-form")
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId("education-form")).not.toBeInTheDocument();
      expect(screen.queryByTestId("skills-form")).not.toBeInTheDocument();
    });

    it("should switch forms when activeSection changes", () => {
      const { rerender } = render(
        <SectionFormRenderer {...defaultProps} activeSection="personal" />
      );
      expect(screen.getByTestId("personal-info-form")).toBeInTheDocument();

      rerender(
        <SectionFormRenderer {...defaultProps} activeSection="experience" />
      );
      expect(
        screen.queryByTestId("personal-info-form")
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("work-experience-form")).toBeInTheDocument();
    });
  });

  describe("Wrapper Structure", () => {
    it("should wrap forms in a div with space-y-6 class", () => {
      const { container } = render(
        <SectionFormRenderer {...defaultProps} activeSection="personal" />
      );
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("space-y-6");
    });
  });

  describe("All Sections", () => {
    const sections = [
      "personal",
      "experience",
      "education",
      "skills",
      "projects",
      "certifications",
      "languages",
      "additional",
    ] as const;

    sections.forEach((section) => {
      it(`should render correctly for "${section}" section`, () => {
        const { container } = render(
          <SectionFormRenderer {...defaultProps} activeSection={section} />
        );
        expect(container.firstChild).toBeInTheDocument();
      });
    });
  });
});
