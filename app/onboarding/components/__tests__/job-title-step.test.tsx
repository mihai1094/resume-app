import { render, screen, fireEvent } from "@testing-library/react";
import { JobTitleStep } from "../job-title-step";
import { describe, it, expect, vi } from "vitest";

describe("JobTitleStep", () => {
    it("renders the component with title and description", () => {
        const onSelectJobTitle = vi.fn();
        render(
            <JobTitleStep selectedJobTitle="" onSelectJobTitle={onSelectJobTitle} />
        );

        expect(
            screen.getByText("What role are you targeting?")
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText(/Search for a job title/i)
        ).toBeInTheDocument();
    });

    it("displays common job titles", () => {
        const onSelectJobTitle = vi.fn();
        render(
            <JobTitleStep selectedJobTitle="" onSelectJobTitle={onSelectJobTitle} />
        );

        expect(screen.getByText("Software Engineer")).toBeInTheDocument();
        expect(screen.getByText("Product Manager")).toBeInTheDocument();
        expect(screen.getByText("Data Scientist")).toBeInTheDocument();
    });

    it("calls onSelectJobTitle when a job title is clicked", () => {
        const onSelectJobTitle = vi.fn();
        render(
            <JobTitleStep selectedJobTitle="" onSelectJobTitle={onSelectJobTitle} />
        );

        const softwareEngineerCard = screen.getByText("Software Engineer");
        fireEvent.click(softwareEngineerCard);

        expect(onSelectJobTitle).toHaveBeenCalledWith("Software Engineer");
    });

    it("filters job titles based on search query", () => {
        const onSelectJobTitle = vi.fn();
        render(
            <JobTitleStep selectedJobTitle="" onSelectJobTitle={onSelectJobTitle} />
        );

        const searchInput = screen.getByPlaceholderText(/Search for a job title/i);
        fireEvent.change(searchInput, { target: { value: "engineer" } });

        expect(screen.getByText("Software Engineer")).toBeInTheDocument();
        expect(screen.queryByText("Product Manager")).not.toBeInTheDocument();
    });

    it("allows custom job title entry", () => {
        const onSelectJobTitle = vi.fn();
        render(
            <JobTitleStep selectedJobTitle="" onSelectJobTitle={onSelectJobTitle} />
        );

        const searchInput = screen.getByPlaceholderText(/Search for a job title/i);
        fireEvent.change(searchInput, { target: { value: "Custom Role" } });
        fireEvent.keyDown(searchInput, { key: "Enter", code: "Enter" });

        expect(onSelectJobTitle).toHaveBeenCalledWith("Custom Role");
    });

    it("displays selected job title", () => {
        const onSelectJobTitle = vi.fn();
        render(
            <JobTitleStep
                selectedJobTitle="Software Engineer"
                onSelectJobTitle={onSelectJobTitle}
            />
        );

        expect(screen.getByText("Target Position")).toBeInTheDocument();
        expect(screen.getByText("Software Engineer")).toBeInTheDocument();
        expect(screen.getByText("Change")).toBeInTheDocument();
    });

    it("clears selected job title when Change is clicked", () => {
        const onSelectJobTitle = vi.fn();
        render(
            <JobTitleStep
                selectedJobTitle="Software Engineer"
                onSelectJobTitle={onSelectJobTitle}
            />
        );

        const changeButton = screen.getByText("Change");
        fireEvent.click(changeButton);

        expect(onSelectJobTitle).toHaveBeenCalledWith("");
    });

    it("shows no results message when search has no matches", () => {
        const onSelectJobTitle = vi.fn();
        render(
            <JobTitleStep selectedJobTitle="" onSelectJobTitle={onSelectJobTitle} />
        );

        const searchInput = screen.getByPlaceholderText(/Search for a job title/i);
        fireEvent.change(searchInput, { target: { value: "xyz123" } });

        expect(
            screen.getByText("No matching job titles found")
        ).toBeInTheDocument();
    });

    it("highlights selected job title in the list", () => {
        const onSelectJobTitle = vi.fn();
        const { container } = render(
            <JobTitleStep
                selectedJobTitle="Software Engineer"
                onSelectJobTitle={onSelectJobTitle}
            />
        );

        const cards = container.querySelectorAll('[class*="border-primary"]');
        expect(cards.length).toBeGreaterThan(0);
    });
});
