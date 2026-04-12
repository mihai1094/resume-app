import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { advanceFormOnEnter } from "@/lib/utils/form-navigation";

describe("advanceFormOnEnter", () => {
  it("moves focus to the next field when Enter is pressed in a form input", () => {
    render(
      <form onKeyDown={advanceFormOnEnter}>
        <input aria-label="First name" />
        <input aria-label="Email" />
      </form>
    );

    const firstName = screen.getByLabelText("First name");
    const email = screen.getByLabelText("Email");

    firstName.focus();
    fireEvent.keyDown(firstName, { key: "Enter" });

    expect(email).toHaveFocus();
  });

  it("does not hijack Enter inside a textarea", () => {
    const onKeyDown = vi.fn(advanceFormOnEnter);

    render(
      <form onKeyDown={onKeyDown}>
        <textarea aria-label="Summary" />
        <input aria-label="Email" />
      </form>
    );

    const summary = screen.getByLabelText("Summary");
    const email = screen.getByLabelText("Email");

    summary.focus();
    fireEvent.keyDown(summary, { key: "Enter" });

    expect(summary).toHaveFocus();
    expect(email).not.toHaveFocus();
  });
});
