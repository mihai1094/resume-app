import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNavigationGuard, getBackDestination } from "../use-navigation-guard";

const mockPush = vi.fn();
const mockBack = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    replace: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("useNavigationGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(document, "referrer", {
      value: "",
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("canNavigate returns true when not dirty", () => {
    const { result } = renderHook(() =>
      useNavigationGuard({ isDirty: false })
    );

    expect(result.current.canNavigate()).toBe(true);
  });

  it("canNavigate prompts confirm when dirty", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);

    const { result } = renderHook(() =>
      useNavigationGuard({ isDirty: true })
    );

    expect(result.current.canNavigate()).toBe(true);
    expect(window.confirm).toHaveBeenCalledWith(
      "You have unsaved changes. Are you sure you want to leave?"
    );
  });

  it("canNavigate uses custom message", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);

    const { result } = renderHook(() =>
      useNavigationGuard({ isDirty: true, message: "Custom warning" })
    );

    result.current.canNavigate();
    expect(window.confirm).toHaveBeenCalledWith("Custom warning");
  });

  it("canNavigate uses onNavigateAway callback when provided", () => {
    const onNavigateAway = vi.fn().mockReturnValue(false);

    const { result } = renderHook(() =>
      useNavigationGuard({ isDirty: true, onNavigateAway })
    );

    expect(result.current.canNavigate()).toBe(false);
    expect(onNavigateAway).toHaveBeenCalled();
  });

  it("safeNavigate calls router.push when not dirty", () => {
    const { result } = renderHook(() =>
      useNavigationGuard({ isDirty: false })
    );

    act(() => {
      result.current.safeNavigate("/dashboard");
    });

    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("safeNavigate blocks when dirty and user cancels", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);

    const { result } = renderHook(() =>
      useNavigationGuard({ isDirty: true })
    );

    act(() => {
      result.current.safeNavigate("/dashboard");
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("safeNavigate allows when dirty and user confirms", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);

    const { result } = renderHook(() =>
      useNavigationGuard({ isDirty: true })
    );

    act(() => {
      result.current.safeNavigate("/dashboard");
    });

    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("forceNavigate always calls router.push regardless of dirty state", () => {
    const { result } = renderHook(() =>
      useNavigationGuard({ isDirty: true })
    );

    act(() => {
      result.current.forceNavigate("/some-path");
    });

    expect(mockPush).toHaveBeenCalledWith("/some-path");
  });
});

describe("getBackDestination", () => {
  it("returns /dashboard for /editor paths", () => {
    expect(getBackDestination("/editor")).toBe("/dashboard");
    expect(getBackDestination("/editor/new")).toBe("/dashboard");
    expect(getBackDestination("/editor/abc-123")).toBe("/dashboard");
  });

  it("returns /dashboard for /settings paths", () => {
    expect(getBackDestination("/settings")).toBe("/dashboard");
    expect(getBackDestination("/settings/profile")).toBe("/dashboard");
  });

  it("returns /blog for /blog/ subpaths", () => {
    expect(getBackDestination("/blog/post-slug")).toBe("/blog");
    expect(getBackDestination("/blog/another-post")).toBe("/blog");
  });

  it("returns /dashboard for /onboarding", () => {
    expect(getBackDestination("/onboarding")).toBe("/dashboard");
  });

  it("returns /dashboard for /cover-letter", () => {
    expect(getBackDestination("/cover-letter")).toBe("/dashboard");
  });

  it("returns /dashboard for /preview", () => {
    expect(getBackDestination("/preview")).toBe("/dashboard");
  });

  it("returns / for unknown paths", () => {
    expect(getBackDestination("/")).toBe("/");
    expect(getBackDestination("/about")).toBe("/");
    expect(getBackDestination("/pricing")).toBe("/");
  });
});