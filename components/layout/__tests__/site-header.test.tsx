import { render, screen, fireEvent } from "@testing-library/react";
import { SiteHeader } from "../site-header";
import { useUser } from "@/hooks/use-user";
import { useSavedResumes } from "@/hooks/use-saved-resumes";
import { useSavedCoverLetters } from "@/hooks/use-saved-cover-letters";
import { useRouter } from "next/navigation";
import { vi } from "vitest";

// Mocks
vi.mock("@/hooks/use-user");
vi.mock("@/hooks/use-saved-resumes");
vi.mock("@/hooks/use-saved-cover-letters");
vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
}));

// Mock Sheet components since they use Radix and generic UI that might need complex setup
vi.mock("@/components/ui/sheet", () => ({
    Sheet: ({ children, open, onOpenChange }: any) => (
        <div data-testid="sheet" data-open={open} onClick={() => onOpenChange(false)}>
            {children}
        </div>
    ),
    SheetTrigger: ({ children }: any) => <div data-testid="sheet-trigger">{children}</div>,
    SheetContent: ({ children }: any) => <div data-testid="sheet-content">{children}</div>,
    SheetHeader: ({ children }: any) => <div>{children}</div>,
    SheetTitle: ({ children }: any) => <div>{children}</div>,
}));

describe("SiteHeader Mobile Navigation", () => {
    const mockUser = {
        id: "123",
        name: "Test User",
        email: "test@example.com",
    };

    const mockRouter = {
        push: vi.fn(),
    };

    beforeEach(() => {
        (useRouter as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
        (useUser as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            user: mockUser,
            logout: vi.fn(),
        });
        (useSavedResumes as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ resumes: [], isLoading: false });
        (useSavedCoverLetters as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ coverLetters: [] });
    });

    it("renders the logo and desktop navigation", () => {
        render(<SiteHeader />);
        const brandElements = screen.getAllByText("ResumeForge");
        expect(brandElements.length).toBeGreaterThan(0);
        expect(screen.getByText("Create Resume")).toBeInTheDocument();
    });

    it("renders mobile menu trigger when on mobile (simulated by logic presence)", () => {
        // The SheetTrigger is rendered in the mobile section logic
        render(<SiteHeader />);
        const trigger = screen.getByTestId("sheet-trigger");
        expect(trigger).toBeInTheDocument();
    });

    it("renders user information in mobile menu", () => {
        // Force mobile menu to be "content present" concept (mock renders content)
        render(<SiteHeader />);
        // In our mock, content is always rendered in the DOM structure but logically controlled by Sheet
        // We check if the user name passed to the sheet content is present
        expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    it("renders login button when user is logged out", () => {
        (useUser as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ user: null, logout: vi.fn() });
        render(<SiteHeader />);
        // "Login" exists in desktop and mobile sections
        const loginButtons = screen.getAllByText("Login");
        expect(loginButtons.length).toBeGreaterThan(0);
    });
});
