import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthGuard } from "../auth-guard";

const mockReplace = vi.fn();
const mockUseUser = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/editor/new",
  useSearchParams: () => ({
    toString: () => "",
  }),
}));

vi.mock("@/hooks/use-user", () => ({
  useUser: () => mockUseUser(),
}));

vi.mock("@/components/shared/loading", () => ({
  LoadingPage: ({ text }: { text?: string }) => (
    <div data-testid="loading-page">{text}</div>
  ),
}));

beforeEach(() => {
  mockReplace.mockClear();
  mockUseUser.mockReset();

  vi.stubGlobal("sessionStorage", {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  });
});

describe("AuthGuard", () => {
  it("renders children when user is authenticated", () => {
    mockUseUser.mockReturnValue({
      user: { uid: "user-123", email: "test@example.com" },
      isLoading: false,
    });

    render(
      <AuthGuard>
        <div>Protected content</div>
      </AuthGuard>
    );

    expect(screen.getByText("Protected content")).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("shows loading state when authentication is in progress", () => {
    mockUseUser.mockReturnValue({
      user: null,
      isLoading: true,
    });

    render(
      <AuthGuard>
        <div>Protected content</div>
      </AuthGuard>
    );

    expect(screen.getByTestId("loading-page")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("redirects to login when user is not authenticated", () => {
    mockUseUser.mockReturnValue({
      user: null,
      isLoading: false,
    });

    render(
      <AuthGuard>
        <div>Protected content</div>
      </AuthGuard>
    );

    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("redirects to custom path when redirectTo is specified", () => {
    mockUseUser.mockReturnValue({
      user: null,
      isLoading: false,
    });

    render(
      <AuthGuard redirectTo="/signup">
        <div>Protected content</div>
      </AuthGuard>
    );

    expect(mockReplace).toHaveBeenCalledWith("/signup");
  });

  it("stores redirect info in sessionStorage", () => {
    mockUseUser.mockReturnValue({
      user: null,
      isLoading: false,
    });

    render(
      <AuthGuard featureName="resume editor">
        <div>Protected content</div>
      </AuthGuard>
    );

    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      "auth_redirect",
      expect.stringContaining("resume editor")
    );
  });

  it("renders nothing when unauthenticated (not loading, not children)", () => {
    mockUseUser.mockReturnValue({
      user: null,
      isLoading: false,
    });

    const { container } = render(
      <AuthGuard>
        <div>Protected content</div>
      </AuthGuard>
    );

    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
    expect(screen.queryByTestId("loading-page")).not.toBeInTheDocument();
    expect(container.innerHTML).toBe("");
  });

  it("does not redirect while still loading", () => {
    mockUseUser.mockReturnValue({
      user: null,
      isLoading: true,
    });

    render(
      <AuthGuard>
        <div>Protected content</div>
      </AuthGuard>
    );

    expect(mockReplace).not.toHaveBeenCalled();
  });
});