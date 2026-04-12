import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CertificationsForm } from "../certifications-form";
import { createCertification, resetIdCounter } from "@/tests/fixtures/resume-data";

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

describe("CertificationsForm", () => {
  const mockOnAddCertification = vi.fn();
  const mockOnAddCourse = vi.fn();
  const mockOnUpdate = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    resetIdCounter();
  });

  const renderForm = (certifications = [] as ReturnType<typeof createCertification>[]) =>
    render(
      <CertificationsForm
        certifications={certifications}
        onAddCertification={mockOnAddCertification}
        onAddCourse={mockOnAddCourse}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

  it("renders empty state with Add Certification button", () => {
    renderForm();
    expect(screen.getByText(/add your certifications/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add certification/i })).toBeInTheDocument();
  });

  it("renders certification entries when data is provided", () => {
    const cert = createCertification({ name: "AWS Solutions Architect" });
    renderForm([cert]);
    expect(screen.getByDisplayValue("AWS Solutions Architect")).toBeInTheDocument();
  });

  it("calls onAddCertification when clicking add button on all tab", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: /add certification/i }));
    expect(mockOnAddCertification).toHaveBeenCalledTimes(1);
  });

  it("calls onRemove when clicking remove button", async () => {
    const user = userEvent.setup();
    const cert = createCertification();
    renderForm([cert]);
    await user.click(screen.getByRole("button", { name: /remove certification/i }));
    expect(mockOnRemove).toHaveBeenCalledWith(cert.id);
  });
});