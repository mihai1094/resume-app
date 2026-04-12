import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectsForm } from "../projects-form";
import { createProject, resetIdCounter } from "@/tests/fixtures/resume-data";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

vi.mock("@/lib/services/logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    child: () => ({ error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() }),
  },
}));

describe("ProjectsForm", () => {
  const mockOnAdd = vi.fn();
  const mockOnUpdate = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    resetIdCounter();
  });

  const renderForm = (projects = [] as ReturnType<typeof createProject>[]) =>
    render(
      <ProjectsForm
        projects={projects}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

  it("renders empty state with Add Project button", () => {
    renderForm();
    expect(screen.getByText(/showcase what you've built/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add project/i })).toBeInTheDocument();
  });

  it("renders project entries when data is provided", () => {
    const project = createProject({ name: "My Portfolio" });
    renderForm([project]);
    expect(screen.getByDisplayValue("My Portfolio")).toBeInTheDocument();
    expect(screen.getByText("1 projects")).toBeInTheDocument();
  });

  it("calls onAdd when clicking add button", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: /add project/i }));
    expect(mockOnAdd).toHaveBeenCalledTimes(1);
  });

  it("calls onRemove when clicking remove button", async () => {
    const user = userEvent.setup();
    const project = createProject();
    renderForm([project]);
    await user.click(screen.getByRole("button", { name: /remove project/i }));
    expect(mockOnRemove).toHaveBeenCalledWith(project.id);
  });
});