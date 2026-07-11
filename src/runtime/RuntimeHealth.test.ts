import { describe, it, expect } from "vitest";
import {
  RuntimeHealthStatus,
  RuntimeHealthStatusSchema,
  RuntimeHealthSchema,
} from "./RuntimeHealth";

describe("RuntimeHealthStatus Schema", () => {
  describe("Valid health statuses", () => {
    it("should accept all defined statuses", () => {
      Object.values(RuntimeHealthStatus).forEach((status) => {
        expect(() => RuntimeHealthStatusSchema.parse(status)).not.toThrow();
      });
    });
  });

  describe("Invalid health statuses", () => {
    it("should reject unknown statuses", () => {
      expect(() => RuntimeHealthStatusSchema.parse("unknown")).toThrow();
      expect(() => RuntimeHealthStatusSchema.parse("HEALTHY")).toThrow();
    });
  });
});

describe("RuntimeHealth Schema", () => {
  describe("Valid health statuses", () => {
    it("should parse complete health status", () => {
      const health = {
        healthy: true,
        status: RuntimeHealthStatus.Healthy,
        uptimeMs: 3600000,
        warnings: [],
        checkedAt: "2024-07-11T14:30:00Z",
        message: "Running smoothly",
        activeSessions: 5,
        metadata: { cpu: 25 },
      };
      const parsed = RuntimeHealthSchema.parse(health);
      expect(parsed).toEqual(health);
    });

    it("should parse minimal health status", () => {
      const health = {
        healthy: true,
        uptimeMs: 1000,
        warnings: [],
      };
      const parsed = RuntimeHealthSchema.parse(health);
      expect(parsed).toEqual(health);
    });

    it("should accept all status values", () => {
      Object.values(RuntimeHealthStatus).forEach((status) => {
        const health = {
          healthy: status === RuntimeHealthStatus.Healthy,
          status,
          uptimeMs: 1000,
          warnings: [],
        };
        expect(() => RuntimeHealthSchema.parse(health)).not.toThrow();
      });
    });

    it("should accept health with warnings", () => {
      const health = {
        healthy: true,
        uptimeMs: 1000,
        warnings: ["High memory usage", "Slow response times"],
      };
      expect(() => RuntimeHealthSchema.parse(health)).not.toThrow();
    });

    it("should accept degraded status with warnings", () => {
      const health = {
        healthy: false,
        status: RuntimeHealthStatus.Degraded,
        uptimeMs: 1000,
        warnings: ["Database connection slow"],
      };
      expect(() => RuntimeHealthSchema.parse(health)).not.toThrow();
    });
  });

  describe("Invalid health statuses", () => {
    it("should reject health without healthy flag", () => {
      expect(() =>
        RuntimeHealthSchema.parse({
          uptimeMs: 1000,
          warnings: [],
        })
      ).toThrow();
    });

    it("should reject health without uptimeMs", () => {
      expect(() =>
        RuntimeHealthSchema.parse({
          healthy: true,
          warnings: [],
        })
      ).toThrow();
    });

    it("should reject health with negative uptime", () => {
      expect(() =>
        RuntimeHealthSchema.parse({
          healthy: true,
          uptimeMs: -1000,
          warnings: [],
        })
      ).toThrow();
    });

    it("should reject health without warnings array", () => {
      expect(() =>
        RuntimeHealthSchema.parse({
          healthy: true,
          uptimeMs: 1000,
        })
      ).toThrow();
    });

    it("should reject health with invalid checkedAt timestamp", () => {
      expect(() =>
        RuntimeHealthSchema.parse({
          healthy: true,
          uptimeMs: 1000,
          warnings: [],
          checkedAt: "2024-07-11",
        })
      ).toThrow();
    });

    it("should reject health with negative activeSessions", () => {
      expect(() =>
        RuntimeHealthSchema.parse({
          healthy: true,
          uptimeMs: 1000,
          warnings: [],
          activeSessions: -5,
        })
      ).toThrow();
    });
  });

  describe("Optional fields", () => {
    it("should allow health without status", () => {
      const health = {
        healthy: true,
        uptimeMs: 1000,
        warnings: [],
      };
      expect(() => RuntimeHealthSchema.parse(health)).not.toThrow();
    });

    it("should allow health without checkedAt", () => {
      const health = {
        healthy: true,
        uptimeMs: 1000,
        warnings: [],
      };
      expect(() => RuntimeHealthSchema.parse(health)).not.toThrow();
    });

    it("should allow health without message", () => {
      const health = {
        healthy: true,
        uptimeMs: 1000,
        warnings: [],
      };
      expect(() => RuntimeHealthSchema.parse(health)).not.toThrow();
    });

    it("should allow health without activeSessions", () => {
      const health = {
        healthy: true,
        uptimeMs: 1000,
        warnings: [],
      };
      expect(() => RuntimeHealthSchema.parse(health)).not.toThrow();
    });
  });

  describe("JSON serialization", () => {
    it("should round-trip through JSON", () => {
      const health = {
        healthy: true,
        status: RuntimeHealthStatus.Healthy,
        uptimeMs: 7200000,
        warnings: ["Memory: 85%"],
        checkedAt: "2024-07-11T14:30:00Z",
        activeSessions: 10,
      };
      const json = JSON.stringify(health);
      const parsed = RuntimeHealthSchema.parse(JSON.parse(json));
      expect(parsed).toEqual(health);
    });
  });

  describe("Unknown properties", () => {
    it("should strip unknown properties", () => {
      const health = {
        healthy: true,
        uptimeMs: 1000,
        warnings: [],
        unknownField: "ignored",
      };
      const parsed = RuntimeHealthSchema.parse(health);
      expect("unknownField" in parsed).toBe(false);
    });
  });
});

