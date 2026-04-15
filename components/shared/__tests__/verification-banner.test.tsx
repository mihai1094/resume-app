import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VerificationBanner } from "../verification-banner";

const {
  mockRouterPush,
  mockSendEmailVerification,
  mockUseUser,
} = vi.hoisted(() => ({
  mockRouterPush: vi.fn(),
  mockSendEmailVerification: vi.fn(),
  mockUseUser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

vi.mock("@/lib/services/auth", () => ({
  authService: {
    sendEmailVerificationToCurrentUser: mockSendEmailVerification,
  },
}));

vi.mock("@/hooks/use-user", () => ({
  useUser: () => mockUseUser(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  mockSendEmailVerification.mockResolvedValue({ success: true });
});

describe("VerificationBanner", () => {
  it("renders nothing when there is no user", () => {
    mockUseUser.mockReturnValue({ user: null });
    const { container } = render(<VerificationBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when email is already verified", () => {
    mockUseUser.mockReturnValue({ user: { emailVerified: true } });
    const { container } = render(<VerificationBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders banner for unverified user", async () => {
    mockUseUser.mockReturnValue({ user: { emailVerified: false } });
    render(<VerificationBanner />);
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(screen.getByText(/verify your email/i)).toBeInTheDocument();
  });

  it("shows Resend email and Verify now buttons", async () => {
    mockUseUser.mockReturnValue({ user: { emailVerified: false } });
    render(<VerificationBanner />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /resend email/i })).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /verify now/i })).toBeInTheDocument();
  });

  it("dismisses when X button is clicked", async () => {
    const user = userEvent.setup();
    mockUseUser.mockReturnValue({ user: { emailVerified: false } });
    render(<VerificationBanner />);
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /dismiss/i }));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(sessionStorage.getItem("email_verification_banner_dismissed")).toBe("true");
  });

  it("stays hidden when sessionStorage dismiss flag is set", async () => {
    sessionStorage.setItem("email_verification_banner_dismissed", "true");
    mockUseUser.mockReturnValue({ user: { emailVerified: false } });
    const { container } = render(<VerificationBanner />);
    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });

  it("calls sendEmailVerificationToCurrentUser on Resend click", async () => {
    const user = userEvent.setup();
    mockUseUser.mockReturnValue({ user: { emailVerified: false } });
    render(<VerificationBanner />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /resend email/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /resend email/i }));
    expect(mockSendEmailVerification).toHaveBeenCalledOnce();
  });

  it("navigates to /verify-email on Verify now click", async () => {
    const user = userEvent.setup();
    mockUseUser.mockReturnValue({ user: { emailVerified: false } });
    render(<VerificationBanner />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /verify now/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole("button", { name: /verify now/i }));
    expect(mockRouterPush).toHaveBeenCalledWith("/verify-email");
  });
});
