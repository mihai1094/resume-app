import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EducationForm } from "../education-form";
import {
  createEducation,
  resetIdCounter,
} from "@/tests/fixtures/resume-data";

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

vi.mock("@/hooks/use-form-array", () => ({
  useFormArray: vi.fn(({ items, onAdd, onUpdate, onRemove }: { items: { id: string }[]; onAdd: () => void; onUpdate: (id: string, updates: Record<string, unknown>) => void; onRemove: (id: string) => void }) => ({
    items,
    expandedIds: new Set(items.map((i) => i.id)),
    isExpanded: () => true,
    handleAdd: onAdd,
    handleUpdate: onUpdate,
    handleRemove: onRemove,
    handleToggle: vi.fn(),
    confirmationState: null,
    closeConfirmation: vi.fn(),
    handleConfirm: vi.fn(),
  })),
}));

vi.mock("@/hooks/use-array-field-validation", () => ({
  useArrayFieldValidation: vi.fn(() => ({
    getFieldError: vi.fn(() => undefined),
    markFieldTouched: vi.fn(),
    markErrors: vi.fn(),
  })),
}));

vi.mock("@/components/ui/sortable-list", () => ({
  SortableList: ({
    items,
    renderItem,
  }: {
    items: { id: string }[];
    renderItem: (item: { id: string }, index: number, isDragging: boolean) => React.ReactNode;
  }) => (
    <div>
      {items.map((item, index) => (
        <div key={item.id}>{renderItem(item, index, false)}</div>
      ))}
    </div>
  ),
  DragHandle: () => <div data-testid="drag-handle" />,
}));

describe("EducationForm", () => {
  const mockOnAdd = vi.fn();
  const mockOnUpdate = vi.fn();
  const mockOnRemove = vi.fn();
  const mockOnReorder = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    resetIdCounter();
  });

  const renderForm = (education = [] as ReturnType<typeof createEducation>[]) =>
    render(
      <EducationForm
        education={education}
        onAdd={mockOnAdd}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
        onReorder={mockOnReorder}
      />
    );

  it("renders empty state with Add Education button", () => {
    renderForm();
    expect(screen.getByText("Showcase your academic background")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add education/i })).toBeInTheDocument();
  });

  it("renders education entries when data is provided", () => {
    const edu = createEducation({ institution: "Stanford University", degree: "MSc" });
    renderForm([edu]);
    expect(screen.getByText("Stanford University")).toBeInTheDocument();
  });

  it("calls onAdd when add button is clicked", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: /add education/i }));
    expect(mockOnAdd).toHaveBeenCalledTimes(1);
  });

  it("calls onRemove when remove button is clicked", async () => {
    const user = userEvent.setup();
    const edu = createEducation();
    renderForm([edu]);
    // The remove button has text-destructive class
    const removeButton = screen.getAllByRole("button").find(
      (btn) => btn.className.includes("destructive") && !btn.textContent?.includes("Add")
    );
    expect(removeButton).toBeDefined();
    await user.click(removeButton!);
    expect(mockOnRemove).toHaveBeenCalledWith(edu.id);
  });
});