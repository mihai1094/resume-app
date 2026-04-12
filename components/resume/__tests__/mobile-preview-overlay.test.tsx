import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobilePreviewOverlay } from "../mobile-preview-overlay";
import { createMinimalResume } from "@/tests/fixtures/resume-data";
import { DEFAULT_TEMPLATE_CUSTOMIZATION } from "@/lib/constants/defaults";

vi.mock("../template-renderer", () => ({
  TemplateRenderer: ({ templateId }: { templateId: string }) => (
    <div data-testid="template-renderer">Template: {templateId}</div>
  ),
}));

vi.mock("../template-customizer", () => ({
  TemplateCustomizer: () => (
    <div data-testid="template-customizer">Customizer</div>
  ),
}));

const defaultProps = {
  templateId: "modern" as const,
  resumeData: createMinimalResume(),
  onClose: vi.fn(),
  customization: DEFAULT_TEMPLATE_CUSTOMIZATION,
  onToggleCustomizer: vi.fn(),
};

describe("MobilePreviewOverlay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders as a dialog overlay", () => {
    render(<MobilePreviewOverlay {...defaultProps} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-label", "Mobile resume preview");
  });

  it("renders the template directly without pagination", () => {
    render(<MobilePreviewOverlay {...defaultProps} />);

    expect(screen.getByTestId("template-renderer")).toBeInTheDocument();
    expect(screen.getByText("Template: modern")).toBeInTheDocument();
    // No page navigation
    expect(screen.queryByLabelText("Page navigation")).not.toBeInTheDocument();
  });

  it("shows Live Preview title", () => {
    render(<MobilePreviewOverlay {...defaultProps} />);
    expect(screen.getByText("Live Preview")).toBeInTheDocument();
  });

  it("shows Customize Template title when customizer is open", () => {
    render(
      <MobilePreviewOverlay {...defaultProps} showCustomizer={true} />
    );
    expect(screen.getByText("Customize Template")).toBeInTheDocument();
  });

  it("calls onClose on Escape key", () => {
    const onClose = vi.fn();
    render(<MobilePreviewOverlay {...defaultProps} onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when back button is clicked (not in customizer mode)", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<MobilePreviewOverlay {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByLabelText("Back to editor"));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onToggleCustomizer when back button is clicked in customizer mode", async () => {
    const user = userEvent.setup();
    const onToggleCustomizer = vi.fn();

    render(
      <MobilePreviewOverlay
        {...defaultProps}
        showCustomizer={true}
        onToggleCustomizer={onToggleCustomizer}
        onCustomizationChange={vi.fn()}
        onResetCustomization={vi.fn()}
      />
    );

    await user.click(screen.getByLabelText("Back to preview"));
    expect(onToggleCustomizer).toHaveBeenCalled();
  });

  it("shows zoom controls", () => {
    render(<MobilePreviewOverlay {...defaultProps} />);

    expect(screen.getByLabelText("Zoom in")).toBeInTheDocument();
    expect(screen.getByLabelText("Zoom out")).toBeInTheDocument();
    expect(screen.getByText("45%")).toBeInTheDocument();
  });

  it("updates zoom when zoom buttons are clicked", async () => {
    const user = userEvent.setup();
    render(<MobilePreviewOverlay {...defaultProps} />);

    await user.click(screen.getByLabelText("Zoom in"));
    expect(screen.getByText("50%")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Zoom out"));
    expect(screen.getByText("45%")).toBeInTheDocument();
  });

  it("disables zoom out at minimum zoom", async () => {
    const user = userEvent.setup();
    render(<MobilePreviewOverlay {...defaultProps} />);

    // Click zoom out until at minimum (0.25)
    const zoomOut = screen.getByLabelText("Zoom out");
    // Default is 0.45, min is 0.25, step is 0.05 → click until disabled
    for (let i = 0; i < 10; i++) {
      if ((zoomOut as HTMLButtonElement).disabled) break;
      await user.click(zoomOut);
    }

    expect(zoomOut).toBeDisabled();
  });

  it("disables zoom in at maximum zoom", async () => {
    const user = userEvent.setup();
    render(<MobilePreviewOverlay {...defaultProps} />);

    // Default is 0.45, max is 0.6, step is 0.05 → 3 clicks to reach max
    const zoomIn = screen.getByLabelText("Zoom in");
    for (let i = 0; i < 3; i++) {
      await user.click(zoomIn);
    }

    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(zoomIn).toBeDisabled();
  });

  it("shows the bottom action bar with Customize Template button", () => {
    render(<MobilePreviewOverlay {...defaultProps} />);
    expect(screen.getByLabelText("Customize template")).toBeInTheDocument();
  });

  it("hides zoom controls when customizer is open", () => {
    render(
      <MobilePreviewOverlay
        {...defaultProps}
        showCustomizer={true}
        onCustomizationChange={vi.fn()}
        onResetCustomization={vi.fn()}
      />
    );

    expect(screen.queryByLabelText("Zoom in")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Zoom out")).not.toBeInTheDocument();
  });

  it("shows customizer content when showCustomizer is true", () => {
    render(
      <MobilePreviewOverlay
        {...defaultProps}
        showCustomizer={true}
        onCustomizationChange={vi.fn()}
        onResetCustomization={vi.fn()}
      />
    );

    expect(screen.getByTestId("template-customizer")).toBeInTheDocument();
    // Template should not be visible when customizer is showing
    expect(screen.queryByTestId("template-renderer")).not.toBeInTheDocument();
  });

  it("hides bottom action bar when customizer is open", () => {
    render(
      <MobilePreviewOverlay
        {...defaultProps}
        showCustomizer={true}
        onCustomizationChange={vi.fn()}
        onResetCustomization={vi.fn()}
      />
    );

    expect(screen.queryByLabelText("Customize template")).not.toBeInTheDocument();
  });
});
