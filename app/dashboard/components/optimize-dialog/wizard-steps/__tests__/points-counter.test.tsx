import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { PointsCounter, PointsCounterCompact } from "../points-counter";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    span: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <span {...props}>{children}</span>
    ),
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("PointsCounter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe("score display", () => {
    it("displays the current score", () => {
      render(
        <PointsCounter
          currentScore={72}
          estimatedNewScore={72}
        />
      );

      expect(screen.getByText("72%")).toBeInTheDocument();
    });

    it("displays the improved score when there is improvement", () => {
      render(
        <PointsCounter
          currentScore={72}
          estimatedNewScore={85}
        />
      );

      expect(screen.getByText("72%")).toBeInTheDocument();
      expect(screen.getByText("85%")).toBeInTheDocument();
    });

    it("shows trending up icon when score improves", () => {
      const { container } = render(
        <PointsCounter
          currentScore={72}
          estimatedNewScore={85}
        />
      );

      // Check for the TrendingUp icon by looking for the SVG
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("does not show improvement when scores are equal", () => {
      render(
        <PointsCounter
          currentScore={72}
          estimatedNewScore={72}
        />
      );

      // Should only show one score
      const scores = screen.getAllByText(/72%/);
      expect(scores).toHaveLength(1);
    });
  });

  describe("points gain animation", () => {
    it("shows floating points when recentGain is provided", async () => {
      render(
        <PointsCounter
          currentScore={72}
          estimatedNewScore={82}
          recentGain={10}
        />
      );

      expect(screen.getByText("+10")).toBeInTheDocument();
    });

    it("hides floating points after animation timeout", async () => {
      render(
        <PointsCounter
          currentScore={72}
          estimatedNewScore={82}
          recentGain={10}
        />
      );

      expect(screen.getByText("+10")).toBeInTheDocument();

      // Fast-forward past the animation timeout (1500ms)
      await act(async () => {
        vi.advanceTimersByTime(1600);
      });

      // The floating points should now be hidden
      expect(screen.queryByText("+10")).not.toBeInTheDocument();
    });

    it("does not show gain animation when recentGain is null", () => {
      render(
        <PointsCounter
          currentScore={72}
          estimatedNewScore={82}
          recentGain={null}
        />
      );

      expect(screen.queryByText(/\+\d+/)).not.toBeInTheDocument();
    });

    it("does not show gain animation when recentGain is 0", () => {
      render(
        <PointsCounter
          currentScore={72}
          estimatedNewScore={72}
          recentGain={0}
        />
      );

      expect(screen.queryByText("+0")).not.toBeInTheDocument();
    });
  });

  describe("styling", () => {
    it("applies custom className", () => {
      const { container } = render(
        <PointsCounter
          currentScore={72}
          estimatedNewScore={72}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });
});

describe("PointsCounterCompact", () => {
  it("displays current score when no improvement", () => {
    render(
      <PointsCounterCompact
        currentScore={72}
        estimatedNewScore={72}
      />
    );

    expect(screen.getByText("72%")).toBeInTheDocument();
  });

  it("displays improved score with delta when there is improvement", () => {
    render(
      <PointsCounterCompact
        currentScore={72}
        estimatedNewScore={85}
      />
    );

    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("(+13)")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <PointsCounterCompact
        currentScore={72}
        estimatedNewScore={72}
        className="custom-compact"
      />
    );

    expect(container.firstChild).toHaveClass("custom-compact");
  });
});
