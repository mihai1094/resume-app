import { render, screen, fireEvent } from "@testing-library/react";
import { InlineTip } from "../inline-tip";
import { describe, it, expect, vi } from "vitest";

describe("InlineTip", () => {
    it("renders the tip message", () => {
        render(<InlineTip message="This is a helpful tip" show={true} />);

        expect(screen.getByText("This is a helpful tip")).toBeInTheDocument();
    });

    it("does not render when show is false", () => {
        render(<InlineTip message="This is a helpful tip" show={false} />);

        expect(
            screen.queryByText("This is a helpful tip")
        ).not.toBeInTheDocument();
    });

    it("renders suggestions when provided", () => {
        const suggestions = ["Suggestion 1", "Suggestion 2"];
        render(
            <InlineTip message="Tip" suggestions={suggestions} show={true} />
        );

        expect(screen.getByText("+ Suggestion 1")).toBeInTheDocument();
        expect(screen.getByText("+ Suggestion 2")).toBeInTheDocument();
    });

    it("calls onInsertSuggestion when a suggestion is clicked", () => {
        const onInsertSuggestion = vi.fn();
        const suggestions = ["Suggestion 1"];
        render(
            <InlineTip
                message="Tip"
                suggestions={suggestions}
                onInsertSuggestion={onInsertSuggestion}
                show={true}
            />
        );

        const suggestionButton = screen.getByText("+ Suggestion 1");
        fireEvent.click(suggestionButton);

        expect(onInsertSuggestion).toHaveBeenCalledWith("Suggestion 1");
    });

    it("can be dismissed", () => {
        render(<InlineTip message="This is a helpful tip" show={true} />);

        expect(screen.getByText("This is a helpful tip")).toBeInTheDocument();

        const dismissButton = screen.getByRole("button");
        fireEvent.click(dismissButton);

        expect(
            screen.queryByText("This is a helpful tip")
        ).not.toBeInTheDocument();
    });

    it("stays dismissed after being dismissed", () => {
        const { rerender } = render(
            <InlineTip message="This is a helpful tip" show={true} />
        );

        const dismissButton = screen.getByRole("button");
        fireEvent.click(dismissButton);

        // Rerender with show=true
        rerender(<InlineTip message="This is a helpful tip" show={true} />);

        // Should still be dismissed
        expect(
            screen.queryByText("This is a helpful tip")
        ).not.toBeInTheDocument();
    });
});
