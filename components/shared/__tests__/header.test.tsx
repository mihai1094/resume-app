import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "../header";
import { useUser } from "@/hooks/use-user";

vi.mock("@/hooks/use-user");

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the guest CTA for signed-out users", () => {
    (useUser as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      isLoading: false,
    });

    render(<Header />);

    expect(screen.getByRole("link", { name: "Create free account" })).toHaveAttribute(
      "href",
      "/register"
    );
  });

  it("shows a dashboard CTA for signed-in users", () => {
    (useUser as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: {
        id: "user-1",
        name: "Test User",
        email: "test@example.com",
      },
      isLoading: false,
    });

    render(<Header />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "href",
      "/dashboard"
    );
    expect(screen.queryByRole("link", { name: "Create free account" })).not.toBeInTheDocument();
  });

  it("suppresses the account CTA while auth state is resolving", () => {
    (useUser as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      isLoading: true,
    });

    render(<Header />);

    expect(screen.queryByRole("link", { name: "Create free account" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Dashboard" })).not.toBeInTheDocument();
  });
});
