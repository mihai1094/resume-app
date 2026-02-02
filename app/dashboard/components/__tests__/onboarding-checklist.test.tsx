import { render, screen, fireEvent } from "@testing-library/react";
import { OnboardingChecklist } from "../onboarding-checklist";
import { vi } from "vitest";

describe("OnboardingChecklist", () => {
  const mockOnCreateResume = vi.fn();

  it("renders all checklist steps", () => {
    render(<OnboardingChecklist onCreateResume={mockOnCreateResume} />);
    expect(screen.getByText("Create your account")).toBeInTheDocument();
    expect(screen.getByText("Create your first resume")).toBeInTheDocument();
  });

  it("calls onCreateResume when 'Start my Resume' button is clicked", () => {
    render(<OnboardingChecklist onCreateResume={mockOnCreateResume} />);
    const button = screen.getByText("Start my Resume");
    fireEvent.click(button);
    expect(mockOnCreateResume).toHaveBeenCalled();
  });
});
