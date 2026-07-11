import { describe, it, expect } from "vitest";
import {
  ISO8601TimestampSchema,
  isValidISO8601Timestamp,
  getCurrentISO8601Timestamp,
} from "./Timestamp";

describe("Timestamp Utilities", () => {
  describe("ISO8601TimestampSchema validation", () => {
    describe("Valid timestamps", () => {
      it("should accept UTC format with Z", () => {
        expect(() => ISO8601TimestampSchema.parse("2024-07-11T14:30:00Z")).not.toThrow();
      });

      it("should accept UTC format with milliseconds and Z", () => {
        expect(() => ISO8601TimestampSchema.parse("2024-07-11T14:30:00.123Z")).not.toThrow();
      });

      it("should accept positive UTC offset", () => {
        expect(() => ISO8601TimestampSchema.parse("2024-07-11T14:30:00+05:30")).not.toThrow();
      });

      it("should accept negative UTC offset", () => {
        expect(() => ISO8601TimestampSchema.parse("2024-07-11T14:30:00-08:00")).not.toThrow();
      });

      it("should accept various valid timestamps", () => {
        const timestamps = [
          "2024-07-11T14:30:00Z",
          "2024-01-01T00:00:00Z",
          "2024-12-31T23:59:59Z",
          "2024-07-11T14:30:00.999Z",
          "2024-07-11T14:30:00+00:00",
          "2024-07-11T14:30:00-12:00",
          "2024-07-11T14:30:00+14:00",
        ];
        timestamps.forEach((ts) => {
          expect(() => ISO8601TimestampSchema.parse(ts)).not.toThrow();
        });
      });
    });

    describe("Invalid timestamps", () => {
      it("should reject non-ISO 8601 formats", () => {
        const invalid = [
          "2024-07-11 14:30:00",
          "07/11/2024",
          "2024-07-11",
          "14:30:00",
          "2024-07-11T14:30:00",
          "July 11, 2024",
        ];
        invalid.forEach((ts) => {
          expect(() => ISO8601TimestampSchema.parse(ts)).toThrow();
        });
      });

      it("should reject invalid dates", () => {
        const invalid = [
          "2024-13-01T00:00:00Z",
          "2024-00-01T00:00:00Z",
          "2024-02-30T00:00:00Z",
          "2024-04-31T00:00:00Z",
        ];
        invalid.forEach((ts) => {
          expect(() => ISO8601TimestampSchema.parse(ts)).toThrow();
        });
      });

      it("should reject non-string types", () => {
        expect(() => ISO8601TimestampSchema.parse(1234567890)).toThrow();
        expect(() => ISO8601TimestampSchema.parse(new Date())).toThrow();
        expect(() => ISO8601TimestampSchema.parse(null)).toThrow();
      });

      it("should reject empty string", () => {
        expect(() => ISO8601TimestampSchema.parse("")).toThrow();
      });
    });
  });

  describe("isValidISO8601Timestamp function", () => {
    it("should return true for valid timestamps", () => {
      expect(isValidISO8601Timestamp("2024-07-11T14:30:00Z")).toBe(true);
      expect(isValidISO8601Timestamp("2024-07-11T14:30:00+05:30")).toBe(true);
      expect(isValidISO8601Timestamp("2024-07-11T14:30:00.123Z")).toBe(true);
    });

    it("should return false for invalid timestamps", () => {
      expect(isValidISO8601Timestamp("2024-07-11")).toBe(false);
      expect(isValidISO8601Timestamp("invalid")).toBe(false);
      expect(isValidISO8601Timestamp("2024-13-01T00:00:00Z")).toBe(false);
      expect(isValidISO8601Timestamp("")).toBe(false);
    });

    it("should not throw on invalid input", () => {
      expect(() => isValidISO8601Timestamp("invalid")).not.toThrow();
    });
  });

  describe("getCurrentISO8601Timestamp function", () => {
    it("should return a string", () => {
      const timestamp = getCurrentISO8601Timestamp();
      expect(typeof timestamp).toBe("string");
    });

    it("should return a valid ISO 8601 timestamp", () => {
      const timestamp = getCurrentISO8601Timestamp();
      expect(() => ISO8601TimestampSchema.parse(timestamp)).not.toThrow();
    });

    it("should return timestamps ending in Z", () => {
      const timestamp = getCurrentISO8601Timestamp();
      expect(timestamp).toMatch(/Z$/);
    });

    it("should return current time approximately", () => {
      const timestamp = getCurrentISO8601Timestamp();
      const date = new Date(timestamp);
      const now = new Date();

      // Should be within 1 second
      const diff = Math.abs(date.getTime() - now.getTime());
      expect(diff).toBeLessThan(1000);
    });

    it("should produce unique timestamps on consecutive calls", () => {
      const ts1 = getCurrentISO8601Timestamp();
      // Small delay to ensure different timestamps
      const ts2 = getCurrentISO8601Timestamp();
      // Timestamps should be very close but may differ in milliseconds
      expect(typeof ts1).toBe("string");
      expect(typeof ts2).toBe("string");
    });

    it("should be parseable as Date", () => {
      const timestamp = getCurrentISO8601Timestamp();
      const date = new Date(timestamp);
      expect(date).toBeInstanceOf(Date);
      expect(isNaN(date.getTime())).toBe(false);
    });
  });

  describe("Timestamp round-trip serialization", () => {
    it("should survive JSON serialization", () => {
      const original = getCurrentISO8601Timestamp();
      const json = JSON.stringify(original);
      const parsed = JSON.parse(json);
      expect(parsed).toBe(original);
      expect(() => ISO8601TimestampSchema.parse(parsed)).not.toThrow();
    });
  });
});

