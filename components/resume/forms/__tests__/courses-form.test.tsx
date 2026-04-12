import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CoursesForm } from "../courses-form";
import { createCourse, resetIdCounter } from "@/tests/fixtures/resume-data";

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

describe("CoursesForm", () => {
  const mockOnAdd = vi.fn();
  const mockOnUpdate = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    resetIdCounter();
  });

  const renderForm = (courses = [] as ReturnType<typeof createCourse>[]) =>
    render(
      <CoursesForm
        courses={courses}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

  it("renders empty state with Add Course button", () => {
    renderForm();
    expect(screen.getByText(/no courses added yet/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add course/i })).toBeInTheDocument();
  });

  it("renders course entries when data is provided", () => {
    const course = createCourse({ name: "React Masterclass" });
    renderForm([course]);
    expect(screen.getByDisplayValue("React Masterclass")).toBeInTheDocument();
    expect(screen.getByText("1 courses")).toBeInTheDocument();
  });

  it("calls onAdd when clicking add button", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: /add course/i }));
    expect(mockOnAdd).toHaveBeenCalledTimes(1);
  });

  it("calls onRemove when clicking remove button", async () => {
    const user = userEvent.setup();
    const course = createCourse();
    renderForm([course]);
    const removeButton = screen.getAllByRole("button").find(
      (btn) => btn.className.includes("destructive")
    );
    expect(removeButton).toBeDefined();
    await user.click(removeButton!);
    expect(mockOnRemove).toHaveBeenCalledWith(course.id);
  });
});