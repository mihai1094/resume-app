import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PreviewPanel } from "../preview-panel";
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
  customization: DEFAULT_TEMPLATE_CUSTOMIZATION,
  isFullscreen: false,
  setIsFullscreen: vi.fn(),
};

describe("PreviewPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders the template directly without pagination", () => {
    render(<PreviewPanel {...defaultProps} />);

    expect(screen.getByTestId("template-renderer")).toBeInTheDocument();
    expect(screen.getByText("Template: modern")).toBeInTheDocument();
    // No page navigation should exist
    expect(screen.queryByLabelText("Page navigation")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Previous page")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Next page")).not.toBeInTheDocument();
  });

  it("renders in a scrollable container", () => {
    const { container } = render(<PreviewPanel {...defaultProps} />);

    const scrollContainer = container.querySelector(".overflow-y-auto");
    expect(scrollContainer).toBeInTheDocument();
  });

  it("shows the Complete badge when isValid is true", () => {
    render(<PreviewPanel {...defaultProps} isValid={true} />);
    expect(screen.getByText("Complete")).toBeInTheDocument();
  });

  it("hides the Complete badge when isValid is false", () => {
    render(<PreviewPanel {...defaultProps} isValid={false} />);
    expect(screen.queryByText("Complete")).not.toBeInTheDocument();
  });

  it("shows fullscreen overlay when isFullscreen is true", () => {
    render(<PreviewPanel {...defaultProps} isFullscreen={true} />);
    expect(screen.getByText("Back to Editor")).toBeInTheDocument();
  });

  it("does not show fullscreen overlay when isFullscreen is false", () => {
    render(<PreviewPanel {...defaultProps} isFullscreen={false} />);
    expect(screen.queryByText("Back to Editor")).not.toBeInTheDocument();
  });

  it("calls setIsFullscreen(false) when Back to Editor is clicked", async () => {
    const user = userEvent.setup();
    const setIsFullscreen = vi.fn();

    render(
      <PreviewPanel
        {...defaultProps}
        isFullscreen={true}
        setIsFullscreen={setIsFullscreen}
      />
    );

    await user.click(screen.getByText("Back to Editor"));
    expect(setIsFullscreen).toHaveBeenCalledWith(false);
  });

  it("exits fullscreen on Escape key", () => {
    const setIsFullscreen = vi.fn();

    render(
      <PreviewPanel
        {...defaultProps}
        isFullscreen={true}
        setIsFullscreen={setIsFullscreen}
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(setIsFullscreen).toHaveBeenCalledWith(false);
  });

  it("toggles fullscreen on F key press", () => {
    const setIsFullscreen = vi.fn();

    render(
      <PreviewPanel
        {...defaultProps}
        isFullscreen={false}
        setIsFullscreen={setIsFullscreen}
      />
    );

    fireEvent.keyDown(window, { key: "f" });
    expect(setIsFullscreen).toHaveBeenCalled();
  });

  it("does not toggle fullscreen on F key when inside an input", () => {
    const setIsFullscreen = vi.fn();

    render(
      <PreviewPanel
        {...defaultProps}
        setIsFullscreen={setIsFullscreen}
      />
    );

    const input = document.createElement("input");
    document.body.appendChild(input);
    fireEvent.keyDown(input, { key: "f" });

    expect(setIsFullscreen).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it("shows fullscreen preview button", () => {
    render(<PreviewPanel {...defaultProps} />);
    expect(screen.getByTitle("Fullscreen preview")).toBeInTheDocument();
  });

  it("locks body scroll when fullscreen", () => {
    const { unmount } = render(
      <PreviewPanel {...defaultProps} isFullscreen={true} />
    );

    expect(document.body.style.overflow).toBe("hidden");
    unmount();
  });

  it("renders template in fullscreen without pagination", () => {
    render(<PreviewPanel {...defaultProps} isFullscreen={true} />);

    // Two instances: side panel + fullscreen
    const renderers = screen.getAllByTestId("template-renderer");
    expect(renderers.length).toBe(2);

    // No pagination in either view
    expect(screen.queryByLabelText("Page navigation")).not.toBeInTheDocument();
  });
});
