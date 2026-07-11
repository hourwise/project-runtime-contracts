import { describe, it, expect } from "vitest";
import { createResultSchema, Result } from "../src/results/Result";
import { RuntimeErrorSchema } from "../src/results/RuntimeError";
import { z } from "zod";

describe("Result Schema - Discriminated Union", () => {
  const resultSchema = createResultSchema(z.string());

  describe("Success result (success: true)", () => {
    it("should parse valid success with data", () => {
      const result = { success: true, data: "hello" };
      const parsed = resultSchema.parse(result);
      expect(parsed).toEqual(result);
      expect(parsed.success).toBe(true);
      expect(parsed.data).toBe("hello");
      expect((parsed as any).error).toBeUndefined();
    });

    it("should reject success without data", () => {
      const result = { success: true };
      expect(() => resultSchema.parse(result)).toThrow();
    });

    it("should reject success with both data and error", () => {
      const result = {
        success: true,
        data: "hello",
        error: { code: "ERR", message: "msg", recoverable: false },
      };
      expect(() => resultSchema.parse(result)).toThrow();
    });

    it("should reject success with error but no data", () => {
      const result = {
        success: true,
        error: { code: "ERR", message: "msg", recoverable: false },
      };
      expect(() => resultSchema.parse(result)).toThrow();
    });
  });

  describe("Failure result (success: false)", () => {
    it("should parse valid failure with error", () => {
      const error = { code: "ERR_001", message: "Operation failed", recoverable: false };
      const result = { success: false, error };
      const parsed = resultSchema.parse(result);
      expect(parsed).toEqual(result);
      expect(parsed.success).toBe(false);
      expect(parsed.error).toEqual(error);
      expect((parsed as any).data).toBeUndefined();
    });

    it("should reject failure without error", () => {
      const result = { success: false };
      expect(() => resultSchema.parse(result)).toThrow();
    });

    it("should reject failure with both data and error", () => {
      const result = {
        success: false,
        data: "hello",
        error: { code: "ERR", message: "msg", recoverable: false },
      };
      expect(() => resultSchema.parse(result)).toThrow();
    });

    it("should reject failure with data but no error", () => {
      const result = { success: false, data: "hello" };
      expect(() => resultSchema.parse(result)).toThrow();
    });
  });

  describe("Unknown properties", () => {
    it("should strip unknown properties", () => {
      const result = { success: true, data: "hello", unknownField: "ignored" };
      const parsed = resultSchema.parse(result);
      expect(parsed).toEqual({ success: true, data: "hello" });
      expect("unknownField" in parsed).toBe(false);
    });
  });

  describe("JSON serialization round-trip", () => {
    it("should serialize and deserialize success result", () => {
      const original: Result<string> = { success: true, data: "test" };
      const json = JSON.stringify(original);
      const parsed = resultSchema.parse(JSON.parse(json));
      expect(parsed).toEqual(original);
    });

    it("should serialize and deserialize failure result", () => {
      const original: Result<string> = {
        success: false,
        error: { code: "ERR", message: "Failed", recoverable: true },
      };
      const json = JSON.stringify(original);
      const parsed = resultSchema.parse(JSON.parse(json));
      expect(parsed).toEqual(original);
    });
  });

  describe("Custom data schemas", () => {
    it("should validate data type according to schema", () => {
      const numberSchema = createResultSchema(z.number());
      expect(() => numberSchema.parse({ success: true, data: 42 })).not.toThrow();
      expect(() => numberSchema.parse({ success: true, data: "string" })).toThrow();
    });

    it("should validate complex data types", () => {
      const complexSchema = createResultSchema(
        z.object({ id: z.number(), name: z.string() })
      );
      const valid = { success: true, data: { id: 1, name: "test" } };
      expect(() => complexSchema.parse(valid)).not.toThrow();

      const invalid = { success: true, data: { id: "not-a-number", name: "test" } };
      expect(() => complexSchema.parse(invalid)).toThrow();
    });

    it("should allow any data when no schema provided", () => {
      const anySchema = createResultSchema();
      expect(() => anySchema.parse({ success: true, data: { any: "thing" } })).not.toThrow();
      expect(() => anySchema.parse({ success: true, data: 42 })).not.toThrow();
    });
  });
});

describe("RuntimeError Schema", () => {
  describe("Valid error", () => {
    it("should parse complete error with details", () => {
      const error = {
        code: "ERR_AUTH_DENIED",
        message: "Access denied",
        recoverable: true,
        details: { capability: "write", reason: "insufficient_privileges" },
      };
      const parsed = RuntimeErrorSchema.parse(error);
      expect(parsed).toEqual(error);
    });

    it("should parse error without optional fields", () => {
      const error = {
        code: "ERR_001",
        message: "Error occurred",
        recoverable: false,
      };
      const parsed = RuntimeErrorSchema.parse(error);
      expect(parsed).toEqual(error);
    });
  });

  describe("Invalid error", () => {
    it("should reject error without code", () => {
      expect(() =>
        RuntimeErrorSchema.parse({ message: "msg", recoverable: false })
      ).toThrow();
    });

    it("should reject error with empty code", () => {
      expect(() =>
        RuntimeErrorSchema.parse({ code: "", message: "msg", recoverable: false })
      ).toThrow();
    });

    it("should reject error without message", () => {
      expect(() =>
        RuntimeErrorSchema.parse({ code: "ERR", recoverable: false })
      ).toThrow();
    });

    it("should reject error with empty message", () => {
      expect(() =>
        RuntimeErrorSchema.parse({
          code: "ERR",
          message: "",
          recoverable: false,
        })
      ).toThrow();
    });

    it("should reject error without recoverable flag", () => {
      expect(() =>
        RuntimeErrorSchema.parse({ code: "ERR", message: "msg" })
      ).toThrow();
    });
  });

  describe("JSON serialization", () => {
    it("should round-trip through JSON", () => {
      const error = {
        code: "ERR_TIMEOUT",
        message: "Operation timed out",
        recoverable: true,
        details: { timeout: 5000 },
      };
      const json = JSON.stringify(error);
      const parsed = RuntimeErrorSchema.parse(JSON.parse(json));
      expect(parsed).toEqual(error);
    });
  });
});

