import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HobbiesForm } from "../hobbies-form";
import { createHobby, resetIdCounter } from "@/tests/fixtures/resume-data";

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

describe("HobbiesForm", () => {
  const mockOnAdd = vi.fn();
  const mockOnUpdate = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    resetIdCounter();
  });

  const renderForm = (hobbies = [] as ReturnType<typeof createHobby>[]) =>
    render(
      <HobbiesForm
        hobbies={hobbies}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

  it("renders empty state with Add Hobby button", () => {
    renderForm();
    expect(screen.getByText(/show your personality/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add hobby/i })).toBeInTheDocument();
  });

  it("renders hobby entries when data is provided", () => {
    const hobby = createHobby({ name: "Photography" });
    renderForm([hobby]);
    expect(screen.getByDisplayValue("Photography")).toBeInTheDocument();
    expect(screen.getByText("1 hobbies")).toBeInTheDocument();
  });

  it("calls onAdd when clicking add button", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: /add hobby/i }));
    expect(mockOnAdd).toHaveBeenCalledTimes(1);
  });

  it("calls onRemove when clicking remove button", async () => {
    const user = userEvent.setup();
    const hobby = createHobby();
    renderForm([hobby]);
    const removeButton = screen.getAllByRole("button").find(
      (btn) => btn.className.includes("destructive")
    );
    expect(removeButton).toBeDefined();
    await user.click(removeButton!);
    expect(mockOnRemove).toHaveBeenCalledWith(hobby.id);
  });
});