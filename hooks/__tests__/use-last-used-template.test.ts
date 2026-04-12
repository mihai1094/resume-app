import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import {
  useLastUsedTemplate,
  LAST_USED_TEMPLATE_KEY,
} from "../use-last-used-template";
import { TEMPLATES } from "@/lib/constants/templates";
import { COLOR_PALETTES, getTemplateDefaultColor } from "@/lib/constants/color-palettes";

// Helper: seed localStorage in useLocalStorage's envelope shape ({ data, timestamp })
function seedStorage(value: unknown) {
  window.localStorage.setItem(
    LAST_USED_TEMPLATE_KEY,
    JSON.stringify({ data: value, timestamp: Date.now() })
  );
}

describe("useLastUsedTemplate", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe("initial state", () => {
    it("returns null when storage is empty", async () => {
      const { result } = renderHook(() => useLastUsedTemplate());
      await waitFor(() => expect(result.current.hasLoaded).toBe(true));
      expect(result.current.lastUsed).toBeNull();
    });
  });

  describe("reading valid stored values", () => {
    it("resolves a valid templateId + colorId into template + color objects", async () => {
      const template = TEMPLATES[0];
      const color = COLOR_PALETTES[0];
      seedStorage({ templateId: template.id, colorId: color.id });

      const { result } = renderHook(() => useLastUsedTemplate());
      await waitFor(() => expect(result.current.hasLoaded).toBe(true));

      expect(result.current.lastUsed).not.toBeNull();
      expect(result.current.lastUsed?.template.id).toBe(template.id);
      expect(result.current.lastUsed?.color.id).toBe(color.id);
    });
  });

  describe("stale value handling", () => {
    it("returns null when stored templateId no longer exists", async () => {
      seedStorage({ templateId: "definitely-not-a-template", colorId: "ocean" });

      const { result } = renderHook(() => useLastUsedTemplate());
      await waitFor(() => expect(result.current.hasLoaded).toBe(true));

      expect(result.current.lastUsed).toBeNull();
    });

    it("falls back to the template default color when colorId is invalid", async () => {
      const template = TEMPLATES.find((t) => t.id !== "technical")!;
      seedStorage({ templateId: template.id, colorId: "no-such-color" });

      const { result } = renderHook(() => useLastUsedTemplate());
      await waitFor(() => expect(result.current.hasLoaded).toBe(true));

      expect(result.current.lastUsed?.template.id).toBe(template.id);
      expect(result.current.lastUsed?.color.id).toBe(
        getTemplateDefaultColor(template.id).id
      );
    });
  });

  describe("setLastUsed", () => {
    it("persists the chosen template + color across remounts", async () => {
      const template = TEMPLATES[1];
      const color = COLOR_PALETTES[2];

      const { result, unmount } = renderHook(() => useLastUsedTemplate());
      await waitFor(() => expect(result.current.hasLoaded).toBe(true));

      act(() => {
        result.current.setLastUsed(template.id, color.id);
      });

      // Wait for useLocalStorage's debounced write (debounceMs=0 → next tick)
      await waitFor(() => {
        const raw = window.localStorage.getItem(LAST_USED_TEMPLATE_KEY);
        expect(raw).not.toBeNull();
        const parsed = JSON.parse(raw!);
        expect(parsed.data.templateId).toBe(template.id);
      });

      unmount();

      const { result: next } = renderHook(() => useLastUsedTemplate());
      await waitFor(() => expect(next.current.hasLoaded).toBe(true));

      expect(next.current.lastUsed?.template.id).toBe(template.id);
      expect(next.current.lastUsed?.color.id).toBe(color.id);
    });
  });

  describe("clear", () => {
    it("removes the stored value", async () => {
      seedStorage({ templateId: TEMPLATES[0].id, colorId: COLOR_PALETTES[0].id });

      const { result } = renderHook(() => useLastUsedTemplate());
      await waitFor(() => expect(result.current.hasLoaded).toBe(true));
      expect(result.current.lastUsed).not.toBeNull();

      act(() => {
        result.current.clear();
      });

      // lastUsed resolves to null regardless of whether useLocalStorage
      // re-persists {data: null} afterwards — both map to "no stored template"
      await waitFor(() => expect(result.current.lastUsed).toBeNull());
    });
  });
});
