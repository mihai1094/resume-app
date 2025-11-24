import { renderHook, act } from "@testing-library/react";
import { useBulletSelector } from "../use-bullet-selector";
import { describe, it, expect } from "vitest";

describe("useBulletSelector", () => {
    it("initializes with isOpen as false", () => {
        const { result } = renderHook(() => useBulletSelector());
        expect(result.current.isOpen).toBe(false);
    });

    it("opens the selector", () => {
        const { result } = renderHook(() => useBulletSelector());

        act(() => {
            result.current.openSelector();
        });

        expect(result.current.isOpen).toBe(true);
    });

    it("closes the selector", () => {
        const { result } = renderHook(() => useBulletSelector());

        act(() => {
            result.current.openSelector();
        });
        expect(result.current.isOpen).toBe(true);

        act(() => {
            result.current.closeSelector();
        });
        expect(result.current.isOpen).toBe(false);
    });

    it("toggles the selector", () => {
        const { result } = renderHook(() => useBulletSelector());

        expect(result.current.isOpen).toBe(false);

        act(() => {
            result.current.toggleSelector();
        });
        expect(result.current.isOpen).toBe(true);

        act(() => {
            result.current.toggleSelector();
        });
        expect(result.current.isOpen).toBe(false);
    });

    it("sets isOpen directly", () => {
        const { result } = renderHook(() => useBulletSelector());

        act(() => {
            result.current.setIsOpen(true);
        });
        expect(result.current.isOpen).toBe(true);

        act(() => {
            result.current.setIsOpen(false);
        });
        expect(result.current.isOpen).toBe(false);
    });
});
