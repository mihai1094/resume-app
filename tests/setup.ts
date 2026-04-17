import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

if (typeof window !== "undefined") {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  });

  window.confirm = vi.fn(() => true);

  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  window.ResizeObserver = ResizeObserverMock;

  // jsdom doesn't implement these DOM APIs but ProseMirror (used by TipTap)
  // expects them — polyfill with harmless stubs so editor-backed tests
  // don't throw unhandled exceptions.
  if (typeof document !== "undefined") {
    if (!(document as Document & { elementFromPoint?: unknown }).elementFromPoint) {
      (document as Document & { elementFromPoint: () => null }).elementFromPoint =
        () => null;
    }
    if (!(document as Document & { caretPositionFromPoint?: unknown }).caretPositionFromPoint) {
      (
        document as Document & { caretPositionFromPoint: () => null }
      ).caretPositionFromPoint = () => null;
    }
  }
  if (typeof Range !== "undefined" && !Range.prototype.getClientRects) {
    Range.prototype.getClientRects = () => ({ length: 0, item: () => null } as unknown as DOMRectList);
    Range.prototype.getBoundingClientRect = () =>
      ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) } as DOMRect);
  }
}
