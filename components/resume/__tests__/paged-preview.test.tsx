import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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

  it("does not show page indicators when content fits on one page", () => {
    mockScrollHeight = 1000;

    render(
      <PagedPreview>
        <div>Short content</div>
      </PagedPreview>
    );

    expect(screen.queryByText("2 pages")).not.toBeInTheDocument();
    expect(screen.queryByText("Page 2")).not.toBeInTheDocument();
  });

  it("shows page indicators when content spans multiple A4 pages", () => {
    mockScrollHeight = 2300;

    render(
      <PagedPreview>
        <div>Long content</div>
      </PagedPreview>
    );

    expect(screen.getByText("3 pages")).toBeInTheDocument();
    expect(screen.getAllByText("Page 2")).toHaveLength(2);
    expect(screen.getByText("Page 3")).toBeInTheDocument();
  });
});
