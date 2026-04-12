import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguagesForm } from "../languages-form";
import { createLanguage, resetIdCounter } from "@/tests/fixtures/resume-data";

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

describe("LanguagesForm", () => {
  const mockOnAdd = vi.fn();
  const mockOnUpdate = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    resetIdCounter();
  });

  const renderForm = (languages = [] as ReturnType<typeof createLanguage>[]) =>
    render(
      <LanguagesForm
        languages={languages}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

  it("renders empty state with Add Language button", () => {
    renderForm();
    expect(screen.getByText(/add your languages/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add language/i })).toBeInTheDocument();
  });

  it("renders language entries with count badge", () => {
    const english = createLanguage({ name: "English", level: "native" });
    const spanish = createLanguage({ name: "Spanish", level: "conversational" });
    renderForm([english, spanish]);
    expect(screen.getByText("2 languages")).toBeInTheDocument();
  });

  it("calls onAdd when clicking add button", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: /add language/i }));
    expect(mockOnAdd).toHaveBeenCalledTimes(1);
  });

  it("calls onRemove when clicking remove button", async () => {
    const user = userEvent.setup();
    const lang = createLanguage();
    renderForm([lang]);
    const removeButton = screen.getAllByRole("button").find(
      (btn) => btn.className.includes("destructive")
    );
    expect(removeButton).toBeDefined();
    await user.click(removeButton!);
    expect(mockOnRemove).toHaveBeenCalledWith(lang.id);
  });
});