/* eslint-disable jsx-a11y/alt-text, @next/next/no-img-element */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ProfilePhoto } from "../profile-photo";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, priority, unoptimized, sizes, ...rest } = props;
    return (
      <img
        {...rest}
        data-fill={fill ? "true" : undefined}
        data-priority={priority ? "true" : undefined}
        data-unoptimized={unoptimized ? "true" : undefined}
        data-sizes={typeof sizes === "string" ? sizes : undefined}
      />
    );
  },
}));

vi.mock("@/lib/utils/image", () => ({
  getProfilePhotoImageProps: vi.fn(() => ({
    sizes: "100px",
    unoptimized: false,
  })),
}));

const DATA_URL = "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=";

describe("ProfilePhoto", () => {
  describe("with photo", () => {
    it("renders an img with the photo src and correct alt", () => {
      render(
        <ProfilePhoto
          photo={DATA_URL}
          firstName="James"
          lastName="Mitchell"
          size={96}
          shape="circular"
        />
      );

      const el = screen.getByTestId("profile-photo");
      expect(el.tagName.toLowerCase()).toBe("img");
      expect(el).toHaveAttribute("src", DATA_URL);
      expect(el).toHaveAttribute("alt", "James Mitchell");
    });

    it("falls back to 'Profile photo' alt when name is empty", () => {
      render(<ProfilePhoto photo={DATA_URL} size={96} shape="circular" />);
      expect(screen.getByTestId("profile-photo")).toHaveAttribute(
        "alt",
        "Profile photo"
      );
    });

    it("falls back to 'Profile photo' alt when name is only whitespace", () => {
      render(
        <ProfilePhoto
          photo={DATA_URL}
          firstName="  "
          lastName=""
          size={96}
          shape="circular"
        />
      );
      expect(screen.getByTestId("profile-photo")).toHaveAttribute(
        "alt",
        "Profile photo"
      );
    });

    it("maps shape='circular' to rounded-full", () => {
      render(<ProfilePhoto photo={DATA_URL} size={96} shape="circular" />);
      expect(screen.getByTestId("profile-photo").className).toContain(
        "rounded-full"
      );
    });

    it("maps shape='rounded' to rounded-lg", () => {
      render(<ProfilePhoto photo={DATA_URL} size={96} shape="rounded" />);
      expect(screen.getByTestId("profile-photo").className).toContain(
        "rounded-lg"
      );
    });

    it("maps shape='square' to rounded-none", () => {
      render(<ProfilePhoto photo={DATA_URL} size={96} shape="square" />);
      expect(screen.getByTestId("profile-photo").className).toContain(
        "rounded-none"
      );
    });

    it("appends className prop after shape default so overrides win by specificity order", () => {
      render(
        <ProfilePhoto
          photo={DATA_URL}
          size={280}
          shape="rounded"
          className="w-full aspect-square rounded-sm"
        />
      );
      const className = screen.getByTestId("profile-photo").className;
      // Shape default AND override both present; Tailwind's tailwind-merge (via cn)
      // will deduplicate conflicting radius utilities and keep the later one.
      expect(className).toContain("rounded-sm");
    });

    it("sets data-shape attribute for contract tests", () => {
      render(<ProfilePhoto photo={DATA_URL} size={96} shape="square" />);
      expect(screen.getByTestId("profile-photo")).toHaveAttribute(
        "data-shape",
        "square"
      );
    });
  });

  describe("without photo", () => {
    it("renders null when showFallback is false (default)", () => {
      const { container } = render(
        <ProfilePhoto firstName="James" lastName="Mitchell" size={96} shape="circular" />
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders a monogram div when showFallback is true", () => {
      render(
        <ProfilePhoto
          firstName="James"
          lastName="Mitchell"
          size={96}
          shape="square"
          showFallback
        />
      );

      const el = screen.getByTestId("profile-photo");
      expect(el.tagName.toLowerCase()).toBe("div");
      expect(el.textContent).toBe("JM");
      expect(el).toHaveAttribute("aria-label", "James Mitchell");
    });

    it("monogram falls back to 'CV' when name is empty", () => {
      render(<ProfilePhoto size={96} shape="circular" showFallback />);
      expect(screen.getByTestId("profile-photo").textContent).toBe("CV");
    });

    it("monogram uses fallbackBg and fallbackFg when provided", () => {
      render(
        <ProfilePhoto
          firstName="A"
          lastName="B"
          size={96}
          shape="square"
          showFallback
          fallbackBg="#ff00aa"
          fallbackFg="#111111"
        />
      );
      const el = screen.getByTestId("profile-photo");
      expect(el).toHaveStyle({
        backgroundColor: "#ff00aa",
        color: "#111111",
      });
    });

    it("monogram respects shape in className", () => {
      render(
        <ProfilePhoto size={96} shape="rounded" showFallback firstName="A" />
      );
      expect(screen.getByTestId("profile-photo").className).toContain(
        "rounded-lg"
      );
    });
  });
});
