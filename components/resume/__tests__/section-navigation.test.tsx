import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SectionNavigation } from "../section-navigation";
import { User, Briefcase, GraduationCap } from "lucide-react";

const mockSections = [
  { id: "personal", label: "Personal Info", shortLabel: "Personal", icon: User },
  { id: "experience", label: "Work Experience", shortLabel: "Experience", icon: Briefcase },
  { id: "education", label: "Education", shortLabel: "Education", icon: GraduationCap },
];

const defaultProps = {
  sections: mockSections,
  activeSection: "personal",
  onSectionChange: vi.fn(),
  isSectionComplete: vi.fn(() => false),
  progressPercentage: 33,
};

describe("SectionNavigation", () => {
  it("renders all section navigation items", () => {
    render(<SectionNavigation {...defaultProps} />);

    expect(screen.getByText("Personal")).toBeInTheDocument();
    expect(screen.getByText("Experience")).toBeInTheDocument();
    expect(screen.getByText("Education")).toBeInTheDocument();
  });

  it("highlights the active section", () => {
    render(<SectionNavigation {...defaultProps} activeSection="experience" />);

    const experienceButton = screen.getByText("Experience").closest("button");
    expect(experienceButton).toHaveClass("bg-primary/10");

    const personalButton = screen.getByText("Personal").closest("button");
    expect(personalButton).not.toHaveClass("bg-primary/10");
  });

  it("calls onSectionChange when a section is clicked", async () => {
    const user = userEvent.setup();
    const onSectionChange = vi.fn();

    render(
      <SectionNavigation {...defaultProps} onSectionChange={onSectionChange} />
    );

    await user.click(screen.getByText("Education"));

    expect(onSectionChange).toHaveBeenCalledWith("education");
  });

  it("calls onSectionChange with correct id for each section", async () => {
    const user = userEvent.setup();
    const onSectionChange = vi.fn();

    render(
      <SectionNavigation {...defaultProps} onSectionChange={onSectionChange} />
    );

    await user.click(screen.getByText("Personal"));
    expect(onSectionChange).toHaveBeenCalledWith("personal");

    await user.click(screen.getByText("Experience"));
    expect(onSectionChange).toHaveBeenCalledWith("experience");
  });

  it("displays progress percentage", () => {
    render(<SectionNavigation {...defaultProps} progressPercentage={66} />);

    expect(screen.getByText("66% complete")).toBeInTheDocument();
  });

  it("renders the Sections header when not collapsed", () => {
    render(<SectionNavigation {...defaultProps} />);

    expect(screen.getByText("Sections")).toBeInTheDocument();
  });

  it("calls onToggleCollapse when collapse button is clicked", async () => {
    const user = userEvent.setup();
    const onToggleCollapse = vi.fn();

    render(
      <SectionNavigation
        {...defaultProps}
        onToggleCollapse={onToggleCollapse}
      />
    );

    const collapseButton = screen.getByTitle("Collapse Navigation");
    await user.click(collapseButton);

    expect(onToggleCollapse).toHaveBeenCalledOnce();
  });

  it("does not render collapse button when onToggleCollapse is not provided", () => {
    render(<SectionNavigation {...defaultProps} />);

    expect(screen.queryByTitle("Collapse Navigation")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Expand Navigation")).not.toBeInTheDocument();
  });
});