import { renderHook, act } from "@testing-library/react";
import { useArrayFieldValidation } from "../use-array-field-validation";
import { ValidationError } from "@/lib/validation/resume-validation";

describe("useArrayFieldValidation", () => {
  const mockErrors: ValidationError[] = [
    { field: "experience.0.company", message: "Company is required" },
    { field: "experience.0.position", message: "Position is required" },
    { field: "experience.1.dates", message: "Start date is required" },
  ];

  describe("getFieldError", () => {
    it("should not return error for untouched fields", () => {
      const { result } = renderHook(() =>
        useArrayFieldValidation(mockErrors, "experience")
      );

      // Field is not touched, should return undefined
      expect(result.current.getFieldError(0, "company")).toBeUndefined();
      expect(result.current.getFieldError(0, "position")).toBeUndefined();
    });

    it("should return error for touched fields", () => {
      const { result } = renderHook(() =>
        useArrayFieldValidation(mockErrors, "experience")
      );

      // Mark field as touched
      act(() => {
        result.current.markFieldTouched(0, "company");
      });

      // Now should return the error
      expect(result.current.getFieldError(0, "company")).toBe(
        "Company is required"
      );
      // Other field still untouched
      expect(result.current.getFieldError(0, "position")).toBeUndefined();
    });

    it("should handle date field aliases (startDate/endDate -> dates)", () => {
      const { result } = renderHook(() =>
        useArrayFieldValidation(mockErrors, "experience")
      );

      // Mark dates field as touched
      act(() => {
        result.current.markFieldTouched(1, "dates");
      });

      // Should return the error for dates
      expect(result.current.getFieldError(1, "dates")).toBe(
        "Start date is required"
      );
      // startDate alias should also find the dates error (when startDate is touched)
      act(() => {
        result.current.markFieldTouched(1, "startDate");
      });
      expect(result.current.getFieldError(1, "startDate")).toBe(
        "Start date is required"
      );
    });

    it("should return undefined for fields without errors", () => {
      const { result } = renderHook(() =>
        useArrayFieldValidation(mockErrors, "experience")
      );

      act(() => {
        result.current.markFieldTouched(0, "location");
      });

      // No error for location in mock errors
      expect(result.current.getFieldError(0, "location")).toBeUndefined();
    });

    it("should handle different field prefixes", () => {
      const educationErrors: ValidationError[] = [
        {
          field: "education.0.institution",
          message: "Institution is required",
        },
      ];

      const { result } = renderHook(() =>
        useArrayFieldValidation(educationErrors, "education")
      );

      act(() => {
        result.current.markFieldTouched(0, "institution");
      });

      expect(result.current.getFieldError(0, "institution")).toBe(
        "Institution is required"
      );
    });
  });

  describe("isFieldTouched", () => {
    it("should return false for untouched fields", () => {
      const { result } = renderHook(() =>
        useArrayFieldValidation(mockErrors, "experience")
      );

      expect(result.current.isFieldTouched(0, "company")).toBe(false);
    });

    it("should return true for touched fields", () => {
      const { result } = renderHook(() =>
        useArrayFieldValidation(mockErrors, "experience")
      );

      act(() => {
        result.current.markFieldTouched(0, "company");
      });

      expect(result.current.isFieldTouched(0, "company")).toBe(true);
      expect(result.current.isFieldTouched(0, "position")).toBe(false);
    });
  });

  describe("markAllFieldsTouched", () => {
    it("should mark multiple fields as touched at once", () => {
      const { result } = renderHook(() =>
        useArrayFieldValidation(mockErrors, "experience")
      );

      act(() => {
        result.current.markAllFieldsTouched(0, [
          "company",
          "position",
          "dates",
        ]);
      });

      expect(result.current.isFieldTouched(0, "company")).toBe(true);
      expect(result.current.isFieldTouched(0, "position")).toBe(true);
      expect(result.current.isFieldTouched(0, "dates")).toBe(true);
    });
  });

  describe("reset", () => {
    it("should clear all touched fields", () => {
      const { result } = renderHook(() =>
        useArrayFieldValidation(mockErrors, "experience")
      );

      // Touch some fields
      act(() => {
        result.current.markFieldTouched(0, "company");
        result.current.markFieldTouched(0, "position");
      });

      expect(result.current.isFieldTouched(0, "company")).toBe(true);

      // Reset
      act(() => {
        result.current.reset();
      });

      // All fields should be untouched now
      expect(result.current.isFieldTouched(0, "company")).toBe(false);
      expect(result.current.isFieldTouched(0, "position")).toBe(false);
    });
  });

  describe("validation error updates", () => {
    it("should react to validation error changes", () => {
      const initialErrors: ValidationError[] = [
        { field: "experience.0.company", message: "Company is required" },
      ];

      const { result, rerender } = renderHook(
        ({ errors }) => useArrayFieldValidation(errors, "experience"),
        { initialProps: { errors: initialErrors } }
      );

      act(() => {
        result.current.markFieldTouched(0, "company");
      });

      expect(result.current.getFieldError(0, "company")).toBe(
        "Company is required"
      );

      // Update errors (simulating user filled in the field)
      const updatedErrors: ValidationError[] = [];
      rerender({ errors: updatedErrors });

      // Error should now be gone
      expect(result.current.getFieldError(0, "company")).toBeUndefined();
    });
  });
});
