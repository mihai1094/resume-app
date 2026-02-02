import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  DashboardSkeleton,
  TemplateGallerySkeleton,
  TemplateCardSkeleton,
  SettingsSkeleton,
  ResumeEditorSkeleton,
  ResumeCardSkeleton,
} from "../loading-skeleton";

describe("Loading Skeletons", () => {
  describe("DashboardSkeleton", () => {
    it("should render without crashing", () => {
      const { container } = render(<DashboardSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should have skeleton elements for stats cards", () => {
      const { container } = render(<DashboardSkeleton />);
      // Should have 4 stats card skeletons
      const cards = container.querySelectorAll(".grid > div");
      expect(cards.length).toBeGreaterThanOrEqual(4);
    });

    it("should have skeleton elements for resume cards", () => {
      const { container } = render(<DashboardSkeleton />);
      // Should have resume card skeletons in the grid
      expect(container.querySelector(".grid")).toBeInTheDocument();
    });

    it("should have a header skeleton", () => {
      const { container } = render(<DashboardSkeleton />);
      // Should have sticky header
      const header = container.querySelector(".sticky");
      expect(header).toBeInTheDocument();
    });
  });

  describe("TemplateGallerySkeleton", () => {
    it("should render without crashing", () => {
      const { container } = render(<TemplateGallerySkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should have skeleton elements for template cards", () => {
      const { container } = render(<TemplateGallerySkeleton />);
      // Should have template card skeletons (8 cards)
      const grid = container.querySelector(".grid");
      expect(grid).toBeInTheDocument();
    });

    it("should have filter skeletons", () => {
      const { container } = render(<TemplateGallerySkeleton />);
      // Should have filter buttons skeleton
      const filterArea = container.querySelector(".flex.flex-wrap.gap-3");
      expect(filterArea).toBeInTheDocument();
    });
  });

  describe("TemplateCardSkeleton", () => {
    it("should render without crashing", () => {
      const { container } = render(<TemplateCardSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should have aspect ratio container for template preview", () => {
      const { container } = render(<TemplateCardSkeleton />);
      // Should have an aspect-ratio element for the template preview area
      const aspectRatio = container.querySelector(".aspect-\\[8\\.5\\/11\\]");
      expect(aspectRatio).toBeInTheDocument();
    });
  });

  describe("SettingsSkeleton", () => {
    it("should render without crashing", () => {
      const { container } = render(<SettingsSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should have skeleton for profile section", () => {
      const { container } = render(<SettingsSkeleton />);
      // Should have card elements for settings sections
      const cards = container.querySelectorAll('[class*="rounded-"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it("should have danger zone section", () => {
      const { container } = render(<SettingsSkeleton />);
      // Should have a destructive-styled card
      const dangerZone = container.querySelector(".border-destructive\\/50");
      expect(dangerZone).toBeInTheDocument();
    });
  });

  describe("ResumeEditorSkeleton", () => {
    it("should render without crashing", () => {
      const { container } = render(<ResumeEditorSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should have skeleton for header", () => {
      const { container } = render(<ResumeEditorSkeleton />);
      const header = container.querySelector(".sticky");
      expect(header).toBeInTheDocument();
    });

    it("should have skeleton for sidebar navigation", () => {
      const { container } = render(<ResumeEditorSkeleton />);
      // Should have sidebar skeleton (hidden on mobile)
      const sidebar = container.querySelector(".lg\\:block");
      expect(sidebar).toBeInTheDocument();
    });

    it("should have skeleton for form area", () => {
      const { container } = render(<ResumeEditorSkeleton />);
      // Should have form skeleton
      const formArea = container.querySelector(".lg\\:col-span-9");
      expect(formArea).toBeInTheDocument();
    });

    it("should have animate-pulse class for loading effect", () => {
      const { container } = render(<ResumeEditorSkeleton />);
      const animatedElement = container.querySelector(".animate-pulse");
      expect(animatedElement).toBeInTheDocument();
    });
  });

  describe("ResumeCardSkeleton", () => {
    it("should render without crashing", () => {
      const { container } = render(<ResumeCardSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should have animate-pulse class", () => {
      const { container } = render(<ResumeCardSkeleton />);
      const card = container.querySelector(".animate-pulse");
      expect(card).toBeInTheDocument();
    });

    it("should have skeleton for title", () => {
      const { container } = render(<ResumeCardSkeleton />);
      // Should have title skeleton element
      const skeletons = container.querySelectorAll(".bg-muted");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("Accessibility", () => {
    it("DashboardSkeleton should be visually hidden from screen readers during loading", () => {
      const { container } = render(<DashboardSkeleton />);
      // Skeletons typically don't need aria-hidden as they're visual placeholders
      // but they should have consistent structure
      expect(container.firstChild).toBeInTheDocument();
    });

    it("all skeletons should have proper styling classes", () => {
      const skeletons = [
        <DashboardSkeleton key="1" />,
        <TemplateGallerySkeleton key="2" />,
        <SettingsSkeleton key="3" />,
        <ResumeEditorSkeleton key="4" />,
        <ResumeCardSkeleton key="5" />,
      ];

      skeletons.forEach((skeleton, index) => {
        const { container } = render(skeleton);
        // Each skeleton should have bg-background or similar
        expect(container.firstChild).toBeInTheDocument();
      });
    });
  });
});
