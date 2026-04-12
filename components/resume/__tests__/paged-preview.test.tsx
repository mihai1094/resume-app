import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { PagedPreview } from "../paged-preview";

let mockScrollHeight = 0;

class ResizeObserverMock {
  private readonly callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    this.callback(
      [
        {
          target,
          contentRect: target.getBoundingClientRect(),
        } as ResizeObserverEntry,
      ],
      this as unknown as ResizeObserver
    );
  }

  unobserve() {}

  disconnect() {}
}

describe("PagedPreview", () => {
  beforeEach(() => {
    mockScrollHeight = 0;
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
      configurable: true,
      get() {
        return mockScrollHeight;
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports a single page when content fits within the printable area", () => {
    mockScrollHeight = 1000;
    const onPageCountChange = vi.fn();

    render(
      <PagedPreview onPageCountChange={onPageCountChange}>
        <div>Short content</div>
      </PagedPreview>
    );

    expect(onPageCountChange).toHaveBeenLastCalledWith(1);
  });

  it("keeps the bottom margin inside the page frame and counts overflow pages", () => {
    mockScrollHeight = 2300;
    const onPageCountChange = vi.fn();

    const { container } = render(
      <PagedPreview onPageCountChange={onPageCountChange}>
        <div>Long content</div>
      </PagedPreview>
    );

    expect(onPageCountChange).toHaveBeenLastCalledWith(3);

    const pageViewport = container.firstElementChild?.firstElementChild;
    expect(pageViewport).toHaveStyle({
      boxSizing: "border-box",
      height: "297mm",
      paddingTop: "8mm",
      paddingBottom: "12mm",
      overflow: "hidden",
    });
  });
});
