/* eslint-disable jsx-a11y/alt-text, @next/next/no-img-element */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ComponentType } from "react";
import { ResumeData } from "@/lib/types/resume";
import { TemplateCustomization } from "@/components/resume/template-customizer";
import { MOCK_RESUME_DATA } from "@/lib/constants/mock-resume";
import {
  TEMPLATES,
  PHOTO_SUPPORTED_TEMPLATE_IDS,
  type TemplateId,
} from "@/lib/constants/templates";
import {
  createEmptyResume,
  createCompleteResume,
  createExtraCurricular,
} from "@/tests/fixtures/resume-data";

// ─── Mocks ───

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, priority, unoptimized, sizes, ...rest } = props;
    return (
      <img
        {...rest}
        data-fill={fill ? "true" : undefined}
        data-priority={priority ? "true" : undefined}
        data-unoptimized={unoptimized ? "true" : undefined}
        data-sizes={typeof sizes === "string" ? sizes : undefined}
      />
    );
  },
}));

vi.mock("@/lib/fonts/template-fonts", () => ({
  getTemplateFontFamily: vi.fn(() => "'Arial', sans-serif"),
}));

vi.mock("@/lib/utils/image", () => ({
  getProfilePhotoImageProps: vi.fn(() => ({
    sizes: "100px",
    unoptimized: false,
  })),
  isValidDataUrl: vi.fn((s: string) =>
    typeof s === "string" && s.startsWith("data:image/")
  ),
}));

// ─── Template Imports ───

import { ModernTemplate } from "../modern-template";
import { ClassicTemplate } from "../classic-template";
import { ExecutiveTemplate } from "../executive-template";
import { CreativeTemplate } from "../creative-template";
import { MinimalistTemplate } from "../minimalist-template";
import { TechnicalTemplate } from "../technical-template";
import { TimelineTemplate } from "../timeline-template";
import { IvyTemplate } from "../ivy-template";
import { ATSClarityTemplate } from "../ats-clarity-template";
import { ATSStructuredTemplate } from "../ats-structured-template";
import { ATSCompactTemplate } from "../ats-compact-template";
import { BoldTemplate } from "../bold-template";
import { CubicTemplate } from "../cubic-template";
import { DublinTemplate } from "../dublin-template";
import { FunctionalTemplate } from "../functional-template";
import { IconicTemplate } from "../iconic-template";
import { InfographicTemplate } from "../infographic-template";
import { SimpleTemplate } from "../simple-template";
import { StudentTemplate } from "../student-template";
import { NotionTemplate } from "../notion-template";
import { NordicTemplate } from "../nordic-template";
import { HorizonTemplate } from "../horizon-template";
import { AdaptiveTemplate } from "../adaptive-template";
import { CascadeTemplate } from "../cascade-template";
import { DiamondTemplate } from "../diamond-template";
import { ATSPureTemplate } from "../ats-pure-template";
import { SydneyTemplate } from "../sydney-template";

// ─── Template Registry ───

interface TemplateEntry {
  name: string;
  Component: ComponentType<{
    data: ResumeData;
    customization?: TemplateCustomization;
  }>;
}

const templates: TemplateEntry[] = [
  { name: "ModernTemplate", Component: ModernTemplate },
  { name: "ClassicTemplate", Component: ClassicTemplate },
  { name: "ExecutiveTemplate", Component: ExecutiveTemplate },
  { name: "CreativeTemplate", Component: CreativeTemplate },
  { name: "MinimalistTemplate", Component: MinimalistTemplate },
  { name: "TechnicalTemplate", Component: TechnicalTemplate },
  { name: "TimelineTemplate", Component: TimelineTemplate },
  { name: "IvyTemplate", Component: IvyTemplate },
  { name: "ATSClarityTemplate", Component: ATSClarityTemplate },
  { name: "ATSStructuredTemplate", Component: ATSStructuredTemplate },
  { name: "ATSCompactTemplate", Component: ATSCompactTemplate },
  { name: "BoldTemplate", Component: BoldTemplate },
  { name: "CubicTemplate", Component: CubicTemplate },
  { name: "DublinTemplate", Component: DublinTemplate },
  { name: "FunctionalTemplate", Component: FunctionalTemplate },
  { name: "IconicTemplate", Component: IconicTemplate },
  { name: "InfographicTemplate", Component: InfographicTemplate },
  { name: "SimpleTemplate", Component: SimpleTemplate },
  { name: "StudentTemplate", Component: StudentTemplate },
  { name: "NotionTemplate", Component: NotionTemplate },
  { name: "NordicTemplate", Component: NordicTemplate },
  { name: "HorizonTemplate", Component: HorizonTemplate },
  { name: "AdaptiveTemplate", Component: AdaptiveTemplate },
  { name: "CascadeTemplate", Component: CascadeTemplate },
  { name: "DiamondTemplate", Component: DiamondTemplate },
  { name: "ATSPureTemplate", Component: ATSPureTemplate },
  { name: "SydneyTemplate", Component: SydneyTemplate },
];

// ─── Shared Data ───

const completeData = MOCK_RESUME_DATA;
const emptyData = createEmptyResume();

const dataWithoutOptionalSections: ResumeData = {
  ...completeData,
  projects: undefined,
  languages: undefined,
  certifications: undefined,
  courses: undefined,
  hobbies: undefined,
  extraCurricular: undefined,
  customSections: undefined,
};

// ─── Tests ───

const activityOrganization = "Activity Org Sentinel";
const dataWithExtraCurricular: ResumeData = {
  ...createCompleteResume(),
  extraCurricular: [
    createExtraCurricular({
      title: "Food Bank Volunteer",
      organization: activityOrganization,
      role: "Lead Organizer",
    }),
  ],
};

describe("HTML Resume Templates", () => {
  describe.each(templates)("$name", ({ Component }) => {
    it("renders without crashing with complete data", () => {
      const { container } = render(<Component data={completeData} />);
      expect(container.firstChild).toBeTruthy();
      expect(container.textContent).toContain("James");
      expect(container.textContent).toContain("Mitchell");
    });

    it("renders without crashing with empty resume data", () => {
      const { container } = render(<Component data={emptyData} />);
      expect(container.firstChild).toBeTruthy();
    });

    it("renders without crashing when optional sections are missing", () => {
      const { container } = render(
        <Component data={dataWithoutOptionalSections} />
      );
      expect(container.firstChild).toBeTruthy();
      expect(container.textContent).toContain("James");
      expect(container.textContent).toContain("Mitchell");
    });

    it("renders Activities section when extraCurricular is populated", () => {
      const { container } = render(
        <Component data={dataWithExtraCurricular} />
      );
      // Case-insensitive because TechnicalTemplate uses code-style lowercase `activities`
      expect(container.textContent?.toLowerCase()).toContain("activities");
      expect(container.textContent).toContain(activityOrganization);
    });
  });
});

// ─── Profile photo contract ───

/**
 * Lookup template Component by id so the contract tests can iterate
 * PHOTO_SUPPORTED_TEMPLATE_IDS without maintaining a parallel registry.
 */
const TEMPLATE_BY_ID: Partial<Record<TemplateId, ComponentType<{
  data: ResumeData;
  customization?: TemplateCustomization;
}>>> = Object.fromEntries(
  templates
    .map((t) => {
      // Map component class name like "ModernTemplate" → id "modern"
      const id = t.name.replace(/Template$/, "").toLowerCase();
      // Handle the ATS-prefixed names (e.g. "ATSClarityTemplate" → "ats-clarity")
      const withDashes = id.startsWith("ats") ? `ats-${id.slice(3)}` : id;
      return [withDashes, t.Component] as const;
    })
);

describe("Profile photo rendering (photo-supporting templates)", () => {
  const photoResume: ResumeData = MOCK_RESUME_DATA;

  it.each(PHOTO_SUPPORTED_TEMPLATE_IDS)(
    "%s renders a profile-photo slot when data.photo is set",
    (id) => {
      const Component = TEMPLATE_BY_ID[id]!;
      expect(Component, `no component registered for ${id}`).toBeDefined();
      render(<Component data={photoResume} />);
      const slot = screen.getAllByTestId("profile-photo")[0];
      expect(slot).toBeDefined();
    }
  );

  it.each(PHOTO_SUPPORTED_TEMPLATE_IDS)(
    "%s passes a shape matching features.photoShape metadata",
    (id) => {
      const Component = TEMPLATE_BY_ID[id]!;
      expect(Component).toBeDefined();
      render(<Component data={photoResume} />);
      const slot = screen.getAllByTestId("profile-photo")[0];
      const renderedShape = slot.getAttribute("data-shape");
      const metadataShape = TEMPLATES.find((t) => t.id === id)?.features
        .photoShape;
      expect(renderedShape, `template ${id} rendered shape`).toBe(
        metadataShape
      );
    }
  );
});