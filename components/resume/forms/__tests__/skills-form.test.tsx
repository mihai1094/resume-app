import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { SkillsForm } from "../skills-form";
import { Skill } from "@/lib/types/resume";
import { generateId } from "@/lib/utils";
import { SKILL_CATEGORIES } from "@/lib/constants";
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
    title,
  }: {
    open: boolean;
    children: ReactNode;
    title: string;
  }) => (open ? <div aria-label={title}>{children}</div> : null),
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
        name: "TypeScript",
        category: "Technical",
        relevance: "high" as const,
        reason: "Essential for modern web development",
      },
      {
        name: "AWS",
        category: "Technical",
        relevance: "high" as const,
        reason: "Cloud platform proficiency is in demand",
      },
      {
        name: "Agile",
        category: "Soft Skills",
        relevance: "medium" as const,
        reason: "Common methodology in tech teams",
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

  it("renders existing skills and grouped categories", () => {
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
    expect(screen.getAllByText("Languages").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Frameworks").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /add another skill/i })).toBeInTheDocument();
  });

  it("shows the empty state and adds a blank skill with defaults", async () => {
    const user = userEvent.setup();

    render(
      <SkillsForm
        skills={[]}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.getByText("Highlight your expertise")).toBeInTheDocument();
    const addSkillButtons = screen.getAllByRole("button", { name: /add skill/i });
    await user.click(addSkillButtons[addSkillButtons.length - 1]);

    expect(mockOnAdd).toHaveBeenCalledWith({
      name: "",
      category: SKILL_CATEGORIES[0],
      level: "intermediate",
    });
  });

  it("updates and removes an existing skill", async () => {
    const user = userEvent.setup();

    render(
      <SkillsForm
        skills={defaultSkills}
        onAdd={mockOnAdd}
        onRemove={mockOnRemove}
        onUpdate={mockOnUpdate}
      />
    );

    const skillInputs = screen.getAllByLabelText(/edit skill name/i);
    await user.clear(skillInputs[0]);
    await user.type(skillInputs[0], "Go");
    await user.click(screen.getByRole("button", { name: /remove skill typescript/i }));

    expect(mockOnUpdate).toHaveBeenCalled();
    expect(mockOnRemove).toHaveBeenCalledWith(defaultSkills[0].id);
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
      json: () => Promise.resolve(mockSkillSuggestions),
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
      expect(screen.getByText("AWS")).toBeInTheDocument();
    });
    expect(
      screen.queryByText("Essential for modern web development")
    ).not.toBeInTheDocument();
  });

  it("adds an AI suggestion using the mapped proficiency level", async () => {
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
      expect(screen.getByText("AWS")).toBeInTheDocument();
    });

    const suggestionSheet = screen.getByLabelText("AI Skill Suggestions");
    await user.click(
      within(suggestionSheet).getAllByRole("button", { name: /^add$/i })[0]
    );

    expect(mockOnAdd).toHaveBeenCalledWith({
      name: "TypeScript",
      category: "Technical",
      level: "advanced",
    });
  });
});
