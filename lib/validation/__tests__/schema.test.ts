import { describe, it, expect } from "vitest";
import { MinimalPersonalInfoSchema, FullPersonalInfoSchema, FullWorkExperienceSchema } from "../schema";

describe("Resume Validation Schemas", () => {
    describe("MinimalPersonalInfoSchema", () => {
        it("should validate a valid minimal profile", () => {
            const validData = {
                firstName: "John",
                lastName: "Doe",
                email: "john@example.com",
            };
            const result = MinimalPersonalInfoSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it("should fail if first name is missing", () => {
            const invalidData = {
                lastName: "Doe",
                email: "john@example.com",
            };
            const result = MinimalPersonalInfoSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it("should fail if email is malformed", () => {
            const invalidData = {
                firstName: "John",
                lastName: "Doe",
                email: "not-an-email",
            };
            const result = MinimalPersonalInfoSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    describe("FullWorkExperienceSchema", () => {
        it("should validate a complete experience", () => {
            const validData = {
                id: "1",
                company: "Google",
                position: "Engineer",
                startDate: "2020-01-01",
                current: true,
                description: ["Did cool things"],
            };
            const result = FullWorkExperienceSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it("should fail if endDate is before startDate", () => {
            const invalidData = {
                id: "1",
                company: "Google",
                position: "Engineer",
                startDate: "2020-01-01",
                endDate: "2019-01-01",
                current: false,
                description: ["Did cool things"],
            };
            const result = FullWorkExperienceSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });
});
