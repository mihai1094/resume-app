import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { createElement } from "react";
import { renderFormattedText } from "../format-text";

function Wrapper({ text }: { text: string }) {
  return createElement("span", null, renderFormattedText(text));
}

describe("renderFormattedText", () => {
  it("returns the string unchanged when there are no markers or whitespace edge cases", () => {
    const result = renderFormattedText("plain text");
    // The renderer wraps everything in a whitespace-pre-wrap span so behavior
    // is consistent; the original string is the child of that span.
    const { container } = render(<Wrapper text="plain text" />);
    expect(container.textContent).toBe("plain text");
    expect(result).not.toBe("");
  });

  it("returns empty string unchanged", () => {
    expect(renderFormattedText("")).toBe("");
  });

  it("wraps output in a span with whitespace-pre-wrap so \\n and multi-space survive", () => {
    const text = "a\nb  c";
    const { container } = render(<Wrapper text={text} />);
    const span = container.querySelector("span.whitespace-pre-wrap");
    expect(span).not.toBeNull();
  });

  it("renders **bold** markers as <strong>", () => {
    const { container } = render(<Wrapper text="This is **bold** text" />);
    const strong = container.querySelector("strong");
    expect(strong).not.toBeNull();
    expect(strong?.textContent).toBe("bold");
    expect(container.textContent).toBe("This is bold text");
  });

  it("renders *italic* markers as <em>", () => {
    const { container } = render(<Wrapper text="This is *italic* text" />);
    const em = container.querySelector("em");
    expect(em).not.toBeNull();
    expect(em?.textContent).toBe("italic");
  });

  it("renders multiple bold spans in one line", () => {
    const { container } = render(
      <Wrapper text="**first** and **second**" />
    );
    const strongs = container.querySelectorAll("strong");
    expect(strongs).toHaveLength(2);
    expect(strongs[0].textContent).toBe("first");
    expect(strongs[1].textContent).toBe("second");
  });

  it("renders mixed bold and italic", () => {
    const { container } = render(
      <Wrapper text="**bold** and *italic*" />
    );
    expect(container.querySelector("strong")?.textContent).toBe("bold");
    expect(container.querySelector("em")?.textContent).toBe("italic");
  });

  it("preserves newlines via whitespace-pre-wrap (no <br> injected)", () => {
    const text = "line one\nline two";
    const { container } = render(<Wrapper text={text} />);
    // The renderer no longer inserts <br> elements — it relies on pre-wrap.
    expect(container.querySelector("br")).toBeNull();
    expect(container.textContent).toBe("line one\nline two");
  });

  it("preserves blank lines (\\n\\n) in the text content", () => {
    const text = "para1\n\npara2";
    const { container } = render(<Wrapper text={text} />);
    expect(container.textContent).toBe("para1\n\npara2");
  });

  it("preserves runs of multiple spaces in the text content", () => {
    const text = "word    word";
    const { container } = render(<Wrapper text={text} />);
    // The outer span has whitespace-pre-wrap so CSS will render 4 spaces;
    // the DOM text node preserves them verbatim.
    expect(container.textContent).toBe("word    word");
  });

  it("handles bold text with newlines", () => {
    const text = "**bold**\nnormal";
    const { container } = render(<Wrapper text={text} />);
    expect(container.querySelector("strong")?.textContent).toBe("bold");
    expect(container.textContent).toBe("bold\nnormal");
  });

  it("does not crash on unclosed bold marker — renders as plain text", () => {
    const { container } = render(<Wrapper text="**unclosed" />);
    expect(container.textContent).toBe("**unclosed");
  });

  it("does not crash on unclosed italic marker — renders as plain text", () => {
    const { container } = render(<Wrapper text="*unclosed" />);
    expect(container.textContent).toBe("*unclosed");
  });

  it("renders italic inside bold (**outer *inner* outer**)", () => {
    const { container } = render(
      <Wrapper text="**outer *inner* outer**" />
    );
    const strong = container.querySelector("strong");
    expect(strong).not.toBeNull();
    const em = strong?.querySelector("em");
    expect(em?.textContent).toBe("inner");
  });
});
