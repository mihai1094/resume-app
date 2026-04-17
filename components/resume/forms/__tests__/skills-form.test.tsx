import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { SkillsForm } from "../skills-form";
import { Skill } from "@/lib/types/resume";
import { generateId } from "@/lib/utils";
import { launchFlags } from "@/config/launch";

vi.mock("@/lib/api/auth-fetch", () => ({
  authPost: vi.fn(),
}));

vi.mock("@/components/ai/ai-action", () => ({
  AiAction: ({
    label,
    onClick,
    disabled,
  }: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {label}
    </button>
  ),
}));

vi.mock("@/components/ai/ai-preview-sheet", () => ({
  AiPreviewSheet: ({
    open,
    children,
    footer,
    title,
  }: {
    open: boolean;
    children: ReactNode;
    footer?: ReactNode;
    title: string;
  }) =>
    open ? (
      <div aria-label={title}>
        <div>{children}</div>
        {footer && <div data-testid="sheet-footer">{footer}</div>}
      </div>
    ) : null,
}));

import { authPost } from "@/lib/api/auth-fetch";

describe("SkillsForm", () => {
  const mockOnAdd = vi.fn();
  const mockOnRemove = vi.fn();
  const mockOnUpdate = vi.fn();

  const defaultSkills: Skill[] = [
    {
      id: generateId(),
      name: "TypeScript",
      category: "Languages",
      level: "expert",
    },
    {
      id: generateId(),
      name: "React",
      category: "Frameworks",
      level: "advanced",
    },
  ];

  const mockSkillSuggestions = {
    skills: [
      {
        name: "Node.js",
        category: "Technical",
        relevance: "high" as const,
        reason: "Seen in your backend bullet points",
        source: "experience" as const,
        citedFrom: "Senior Engineer at a technology company",
      },
      {
        name: "AWS",
        category: "Technical",
        relevance: "high" as const,
        reason: "Cloud platform proficiency is in demand",
        source: "industry-trend" as const,
      },
      {
        name: "Agile",
        category: "Soft Skills",
        relevance: "medium" as const,
        reason: "Common methodology in tech teams",
        source: "complementary" as const,
        pairedWith: "React",
      },
    ],
    meta: { fromCache: false },
  };

  let previousAiSuggestSkills: boolean;

  beforeEach(() => {
    vi.clearAllMocks();
    previousAiSuggestSkills = launchFlags.features.aiSuggestSkills;
    (launchFlags.features as { aiSuggestSkills: boolean }).aiSuggestSkills = true;
  });

  afterEach(() => {
    (launchFlags.features as { aiSuggestSkills: boolean }).aiSuggestSkills =
      previousAiSuggestSkills;
  });

  it("renders existing skills in the table", () => {
    render(
      <SkillsForm
        skills={defaultSkills}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByDisplayValue("TypeScript")).toBeInTheDocument();
    expect(screen.getByDisplayValue("React")).toBeInTheDocument();
    expect(screen.getByText("2 skills")).toBeInTheDocument();
  });

  it("shows the empty state when no skills exist", () => {
    render(
      <SkillsForm
        skills={[]}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText("No skills added yet")).toBeInTheDocument();
    expect(
      screen.getByText(/add your first skill above to get started/i)
    ).toBeInTheDocument();
  });

  it("removes a skill via the X button on the row", async () => {
    const user = userEvent.setup();

    render(
      <SkillsForm
        skills={defaultSkills}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    await user.click(screen.getByRole("button", { name: /remove typescript/i }));
    expect(mockOnRemove).toHaveBeenCalledWith(defaultSkills[0].id);
  });

  it("quick adds a skill with Enter", async () => {
    const user = userEvent.setup();

    render(
      <SkillsForm
        skills={defaultSkills}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    const input = screen.getByLabelText("Add skill");
    await user.type(input, "Docker{Enter}");

    expect(mockOnAdd).toHaveBeenCalledWith({
      name: "Docker",
      category: "Other",
      level: "intermediate",
    });
  });

  it("quick adds a skill with the Add button", async () => {
    const user = userEvent.setup();

    render(
      <SkillsForm
        skills={defaultSkills}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    const input = screen.getByLabelText("Add skill");
    await user.type(input, "Python");
    await user.click(screen.getByRole("button", { name: /^add$/i }));

    expect(mockOnAdd).toHaveBeenCalledWith({
      name: "Python",
      category: "Other",
      level: "intermediate",
    });
  });

  it("disables AI suggestions until a job title exists", () => {
    render(
      <SkillsForm
        skills={[]}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByRole("button", { name: /suggest/i })).toBeDisabled();
  });

  it("requests AI suggestions with the current role context", async () => {
    const user = userEvent.setup();
    vi.mocked(authPost).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSkillSuggestions),
    } as Response);

    render(
      <SkillsForm
        skills={[]}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
        jobTitle="Software Engineer"
        jobDescription="Build modern frontend systems"
        industry="technology"
        seniorityLevel="mid"
      />
    );

    await user.click(screen.getByRole("button", { name: /suggest/i }));

    await waitFor(() => {
      expect(authPost).toHaveBeenCalledWith("/api/ai/suggest-skills", {
        jobTitle: "Software Engineer",
        jobDescription: "Build modern frontend systems",
        industry: "technology",
        seniorityLevel: "mid",
      });
    });
  });

  it("filters existing skills out of AI suggestions", async () => {
    const user = userEvent.setup();
    vi.mocked(authPost).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          ...mockSkillSuggestions,
          skills: [
            ...mockSkillSuggestions.skills,
            {
              name: "TypeScript",
              category: "Technical",
              relevance: "high" as const,
              reason: "Already added",
              source: "experience" as const,
            },
          ],
        }),
    } as Response);

    render(
      <SkillsForm
        skills={[defaultSkills[0]]}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
        jobTitle="Software Engineer"
      />
    );

    await user.click(screen.getByRole("button", { name: /suggest/i }));

    await waitFor(() => {
      expect(screen.getByText("Node.js")).toBeInTheDocument();
    });
    // TypeScript was filtered out despite appearing in the response.
    const sheet = screen.getByLabelText(/Skills from your work history/i);
    expect(within(sheet).queryByText("TypeScript")).not.toBeInTheDocument();
  });

  it("pre-checks demonstrable skills and adds only selected ones", async () => {
    const user = userEvent.setup();
    vi.mocked(authPost).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSkillSuggestions),
    } as Response);

    render(
      <SkillsForm
        skills={[]}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
        jobTitle="Software Engineer"
      />
    );

    await user.click(screen.getByRole("button", { name: /suggest/i }));

    await waitFor(() => {
      expect(screen.getByText("Node.js")).toBeInTheDocument();
    });

    // Node.js is source="experience" → demonstrable → pre-checked.
    // AWS and Agile are aspirational → unchecked.
    // Clicking "Add selected" should only add Node.js.
    const footer = screen.getByTestId("sheet-footer");
    const addButton = within(footer).getByRole("button", {
      name: /add 1 selected skill/i,
    });
    await user.click(addButton);

    expect(mockOnAdd).toHaveBeenCalledTimes(1);
    expect(mockOnAdd).toHaveBeenCalledWith({
      name: "Node.js",
      category: "Technical",
      level: "advanced",
    });
  });

  it("maps medium-relevance suggestions to intermediate proficiency", async () => {
    const user = userEvent.setup();
    vi.mocked(authPost).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          skills: [
            {
              name: "Jira",
              category: "Tools",
              relevance: "medium" as const,
              reason: "Mentioned across your bullet points",
              source: "experience" as const,
            },
          ],
          meta: { fromCache: false },
        }),
    } as Response);

    render(
      <SkillsForm
        skills={[]}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
        jobTitle="Software Engineer"
      />
    );

    await user.click(screen.getByRole("button", { name: /suggest/i }));

    await waitFor(() => {
      expect(screen.getByText("Jira")).toBeInTheDocument();
    });

    const footer = screen.getByTestId("sheet-footer");
    await user.click(
      within(footer).getByRole("button", { name: /add 1 selected skill/i })
    );

    expect(mockOnAdd).toHaveBeenCalledWith({
      name: "Jira",
      category: "Tools",
      level: "intermediate",
    });
  });

  it("hides the industry-trend section once the user has 15+ skills", async () => {
    const user = userEvent.setup();
    vi.mocked(authPost).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockSkillSuggestions),
    } as Response);

    // 15 existing skills → aspirational section should collapse.
    const bulkSkills: Skill[] = Array.from({ length: 15 }, (_, i) => ({
      id: generateId(),
      name: `Skill ${i}`,
      category: "Other",
      level: "intermediate" as const,
    }));

    render(
      <SkillsForm
        skills={bulkSkills}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
        jobTitle="Software Engineer"
      />
    );

    await user.click(screen.getByRole("button", { name: /suggest/i }));

    await waitFor(() => {
      expect(screen.getByText("Node.js")).toBeInTheDocument();
    });

    const sheet = screen.getByLabelText(/Skills from your work history/i);
    expect(
      within(sheet).queryByText(/common in your industry/i)
    ).not.toBeInTheDocument();
    // Aspirational suggestions aren't shown at all.
    expect(within(sheet).queryByText("AWS")).not.toBeInTheDocument();
  });
});
