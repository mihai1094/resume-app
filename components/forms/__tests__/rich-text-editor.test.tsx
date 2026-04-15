import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RichTextEditor } from "../rich-text-editor";

// jsdom does not implement execCommand; stub it so applyFormat doesn't throw
beforeEach(() => {
  Object.defineProperty(document, "execCommand", {
    value: vi.fn(() => false),
    writable: true,
    configurable: true,
  });
});

describe("RichTextEditor", () => {
  it("renders an editable region with the correct role", () => {
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("shows placeholder when value is empty", () => {
    render(
      <RichTextEditor value="" onChange={vi.fn()} placeholder="Write something..." />
    );
    expect(screen.getByText("Write something...")).toBeInTheDocument();
  });

  it("hides placeholder when value is non-empty", () => {
    render(
      <RichTextEditor value="hello" onChange={vi.fn()} placeholder="Write something..." />
    );
    expect(screen.queryByText("Write something...")).toBeNull();
  });

  it("shows formatting toolbar on focus", async () => {
    const user = userEvent.setup();
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    const editor = screen.getByRole("textbox");
    await user.click(editor);
    expect(screen.getByRole("button", { name: /bold/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /italic/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /bullet list/i })).toBeInTheDocument();
  });

  it("hides formatting toolbar when blurred", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <RichTextEditor value="" onChange={vi.fn()} />
        <button>outside</button>
      </div>
    );
    const editor = screen.getByRole("textbox");
    await user.click(editor);
    expect(screen.getByRole("button", { name: /bold/i })).toBeInTheDocument();
    await user.click(screen.getByText("outside"));
    expect(screen.queryByRole("button", { name: /bold/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /bullet list/i })).toBeNull();
  });

  it("calls onChange when content is edited", () => {
    const onChange = vi.fn();
    render(<RichTextEditor value="" onChange={onChange} />);
    const editor = screen.getByRole("textbox");
    fireEvent.input(editor);
    expect(onChange).toHaveBeenCalled();
  });

  it("calls onFocus and onBlur callbacks", async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(
      <div>
        <RichTextEditor value="" onChange={vi.fn()} onFocus={onFocus} onBlur={onBlur} />
        <button>outside</button>
      </div>
    );
    const editor = screen.getByRole("textbox");
    await user.click(editor);
    expect(onFocus).toHaveBeenCalledOnce();
    await user.click(screen.getByText("outside"));
    expect(onBlur).toHaveBeenCalledOnce();
  });

  describe("ARIA attributes", () => {
    it("sets id on the editable div when provided", () => {
      render(<RichTextEditor id="summary-field" value="" onChange={vi.fn()} />);
      const editor = screen.getByRole("textbox");
      expect(editor).toHaveAttribute("id", "summary-field");
    });

    it("label htmlFor matches the editor id (structural label association)", () => {
      render(
        <div>
          <label htmlFor="editor">Summary</label>
          <RichTextEditor id="editor" value="" onChange={vi.fn()} />
        </div>
      );
      const editor = screen.getByRole("textbox");
      const label = document.querySelector(`label[for="${editor.id}"]`);
      expect(label).not.toBeNull();
      expect(label?.textContent).toBe("Summary");
    });

    it("sets aria-invalid when provided", () => {
      render(
        <RichTextEditor value="" onChange={vi.fn()} aria-invalid="true" />
      );
      expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    });

    it("sets aria-required when provided", () => {
      render(
        <RichTextEditor value="" onChange={vi.fn()} aria-required={true} />
      );
      expect(screen.getByRole("textbox")).toHaveAttribute("aria-required", "true");
    });

    it("sets aria-describedby when provided", () => {
      render(
        <RichTextEditor value="" onChange={vi.fn()} aria-describedby="hint-text" />
      );
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-describedby",
        "hint-text"
      );
    });

    it("has aria-multiline set to true", () => {
      render(<RichTextEditor value="" onChange={vi.fn()} />);
      expect(screen.getByRole("textbox")).toHaveAttribute("aria-multiline", "true");
    });
  });

  describe("keyboard shortcuts", () => {
    it("calls execCommand bold on Ctrl+B", async () => {
      const user = userEvent.setup();
      render(<RichTextEditor value="" onChange={vi.fn()} />);
      const editor = screen.getByRole("textbox");
      await user.click(editor);
      await user.keyboard("{Control>}b{/Control}");
      expect(document.execCommand).toHaveBeenCalledWith("bold", false);
    });

    it("calls execCommand italic on Ctrl+I", async () => {
      const user = userEvent.setup();
      render(<RichTextEditor value="" onChange={vi.fn()} />);
      const editor = screen.getByRole("textbox");
      await user.click(editor);
      await user.keyboard("{Control>}i{/Control}");
      expect(document.execCommand).toHaveBeenCalledWith("italic", false);
    });
  });

  describe("bullet list", () => {
    it("inserts bullet marker via execCommand on click", async () => {
      const user = userEvent.setup();
      render(<RichTextEditor value="Some text" onChange={vi.fn()} />);
      const editor = screen.getByRole("textbox");
      await user.click(editor);
      const bulletBtn = screen.getByRole("button", { name: /bullet list/i });
      await user.click(bulletBtn);
      expect(document.execCommand).toHaveBeenCalledWith("insertText", false, expect.stringContaining("• "));
    });

    it("inserts bullet without leading newline when editor is empty", async () => {
      const user = userEvent.setup();
      render(<RichTextEditor value="" onChange={vi.fn()} />);
      const editor = screen.getByRole("textbox");
      await user.click(editor);
      const bulletBtn = screen.getByRole("button", { name: /bullet list/i });
      await user.click(bulletBtn);
      expect(document.execCommand).toHaveBeenCalledWith("insertText", false, "• ");
    });
  });

  describe("minHeight style", () => {
    it("applies the default minHeight of 60px", () => {
      render(<RichTextEditor value="" onChange={vi.fn()} />);
      const editor = screen.getByRole("textbox");
      expect(editor).toHaveStyle({ minHeight: "60px" });
    });

    it("applies a custom minHeight", () => {
      render(<RichTextEditor value="" onChange={vi.fn()} minHeight="120px" />);
      const editor = screen.getByRole("textbox");
      expect(editor).toHaveStyle({ minHeight: "120px" });
    });
  });
});
