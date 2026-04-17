import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RichTextEditor } from "../rich-text-editor";

/**
 * These tests cover the public API of the editor (props → DOM attributes,
 * toolbar visibility, placeholder wiring). Behavioral typing tests against
 * the underlying TipTap/ProseMirror instance are covered by e2e + the
 * markdown-html round-trip suite (`lib/utils/__tests__/markdown-html.test.ts`),
 * because jsdom doesn't implement the selection APIs ProseMirror relies on.
 */

function getEditable(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>('[contenteditable="true"]');
  if (!el) throw new Error("No contenteditable element rendered");
  return el;
}

describe("RichTextEditor (TipTap-based)", () => {
  it("renders a contenteditable element", () => {
    const { container } = render(
      <RichTextEditor value="" onChange={vi.fn()} />,
    );
    expect(getEditable(container)).toBeInTheDocument();
  });

  it("shows the initial value in the editor", async () => {
    const { container } = render(
      <RichTextEditor value="hello world" onChange={vi.fn()} />,
    );
    // TipTap renders content asynchronously; give it a tick.
    await new Promise((r) => setTimeout(r, 0));
    expect(getEditable(container).textContent).toContain("hello world");
  });

  it("renders **bold** as <strong> in the DOM", async () => {
    const { container } = render(
      <RichTextEditor value="**bold**" onChange={vi.fn()} />,
    );
    await new Promise((r) => setTimeout(r, 0));
    expect(getEditable(container).querySelector("strong")?.textContent).toBe(
      "bold",
    );
  });

  it("renders *italic* as <em> in the DOM", async () => {
    const { container } = render(
      <RichTextEditor value="*italic*" onChange={vi.fn()} />,
    );
    await new Promise((r) => setTimeout(r, 0));
    expect(getEditable(container).querySelector("em")?.textContent).toBe(
      "italic",
    );
  });

  it("applies whitespace-pre-wrap so multi-space and newlines survive", () => {
    const { container } = render(
      <RichTextEditor value="" onChange={vi.fn()} />,
    );
    expect(getEditable(container).className).toMatch(/whitespace-pre-wrap/);
  });

  it("shows formatting toolbar on focus", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <RichTextEditor value="" onChange={vi.fn()} />,
    );
    await user.click(getEditable(container));
    expect(screen.getByRole("button", { name: /bold/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /italic/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /bullet list/i }),
    ).toBeInTheDocument();
  });

  it("hides formatting toolbar when blurred", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <div>
        <RichTextEditor value="" onChange={vi.fn()} />
        <button>outside</button>
      </div>,
    );
    await user.click(getEditable(container));
    expect(screen.getByRole("button", { name: /bold/i })).toBeInTheDocument();
    await user.click(screen.getByText("outside"));
    expect(screen.queryByRole("button", { name: /bold/i })).toBeNull();
  });

  describe("ARIA attributes", () => {
    it("sets id on the editable when provided", () => {
      const { container } = render(
        <RichTextEditor id="summary-field" value="" onChange={vi.fn()} />,
      );
      expect(getEditable(container)).toHaveAttribute("id", "summary-field");
    });

    it("sets aria-invalid when provided", () => {
      const { container } = render(
        <RichTextEditor value="" onChange={vi.fn()} aria-invalid="true" />,
      );
      expect(getEditable(container)).toHaveAttribute("aria-invalid", "true");
    });

    it("sets aria-required when provided", () => {
      const { container } = render(
        <RichTextEditor value="" onChange={vi.fn()} aria-required={true} />,
      );
      expect(getEditable(container)).toHaveAttribute("aria-required", "true");
    });

    it("sets aria-describedby when provided", () => {
      const { container } = render(
        <RichTextEditor
          value=""
          onChange={vi.fn()}
          aria-describedby="hint-text"
        />,
      );
      expect(getEditable(container)).toHaveAttribute(
        "aria-describedby",
        "hint-text",
      );
    });
  });

  describe("minHeight style", () => {
    it("applies the default minHeight of 60px", () => {
      const { container } = render(
        <RichTextEditor value="" onChange={vi.fn()} />,
      );
      expect(getEditable(container).getAttribute("style")).toContain(
        "min-height: 60px",
      );
    });

    it("applies a custom minHeight", () => {
      const { container } = render(
        <RichTextEditor value="" onChange={vi.fn()} minHeight="120px" />,
      );
      expect(getEditable(container).getAttribute("style")).toContain(
        "min-height: 120px",
      );
    });
  });
});
