import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { createElement } from "react";
import { renderFormattedText } from "../format-text";

function Wrapper({ text }: { text: string }) {
  return createElement("span", null, renderFormattedText(text));
}

describe("renderFormattedText", () => {
  it("returns the string unchanged when there are no markers or newlines", () => {
    const result = renderFormattedText("plain text");
    expect(result).toBe("plain text");
  });

  it("returns empty string unchanged", () => {
    expect(renderFormattedText("")).toBe("");
  });

  it("preserves text without markers as a plain string (no React wrapper)", () => {
    expect(typeof renderFormattedText("no markers here")).toBe("string");
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

  it("converts newlines to <br> elements", () => {
    const text = "line one\nline two";
    const { container } = render(<Wrapper text={text} />);
    expect(container.querySelector("br")).not.toBeNull();
    expect(container.textContent).toBe("line oneline two");
  });

  it("handles multiple newlines", () => {
    const text = "a\nb\nc";
    const { container } = render(<Wrapper text={text} />);
    const brs = container.querySelectorAll("br");
    expect(brs).toHaveLength(2);
  });

  it("handles bold text with newlines", () => {
    const text = "**bold**\nnormal";
    const { container } = render(<Wrapper text={text} />);
    expect(container.querySelector("strong")?.textContent).toBe("bold");
    expect(container.querySelector("br")).not.toBeNull();
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
