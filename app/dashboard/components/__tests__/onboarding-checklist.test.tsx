import { render, screen, fireEvent } from "@testing-library/react";
import { OnboardingChecklist } from "../onboarding-checklist";
import { useRouter } from "next/navigation";
import { vi } from "vitest";

vi.mock("next/navigation", () => ({
    useRouter: vi.fn(),
}));

describe("OnboardingChecklist", () => {
    const mockRouter = {
        push: vi.fn(),
    };
    const mockOnCreateResume = vi.fn();

    beforeEach(() => {
        (useRouter as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
    });

    it("renders all checklist steps", () => {
        render(<OnboardingChecklist onCreateResume={mockOnCreateResume} />);
        expect(screen.getByText("Create your account")).toBeInTheDocument();
        expect(screen.getByText("Complete your profile")).toBeInTheDocument();
        expect(screen.getByText("Create your first resume")).toBeInTheDocument();
    });

    it("calls onCreateResume when 'Start my Resume' button is clicked", () => {
        render(<OnboardingChecklist onCreateResume={mockOnCreateResume} />);
        const button = screen.getByText("Start my Resume");
        fireEvent.click(button);
        expect(mockOnCreateResume).toHaveBeenCalled();
    });

    it("navigates to settings when 'Go to Profile' is clicked", () => {
        render(<OnboardingChecklist onCreateResume={mockOnCreateResume} />);
        const button = screen.getByText("Go to Profile");
        fireEvent.click(button);
        expect(mockRouter.push).toHaveBeenCalledWith("/settings");
    });
});
