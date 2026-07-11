import { describe, it, expect } from "vitest";
import {
  parseVersion,
  compareVersions,
  isCompatible,
  selectBestVersion,
  negotiate,
} from "../src/protocol/ProtocolCompatibility";

describe("Protocol Compatibility Utilities", () => {
  describe("parseVersion", () => {
    it("should parse valid semantic versions", () => {
      expect(parseVersion("1.0.0")).toEqual({ major: 1, minor: 0, patch: 0 });
      expect(parseVersion("1.2.3")).toEqual({ major: 1, minor: 2, patch: 3 });
      expect(parseVersion("10.20.30")).toEqual({ major: 10, minor: 20, patch: 30 });
    });

    it("should return null for invalid formats", () => {
      expect(parseVersion("1.0")).toBeNull();
      expect(parseVersion("1")).toBeNull();
      expect(parseVersion("1.0.0.0")).toBeNull();
      expect(parseVersion("v1.0.0")).toBeNull();
      expect(parseVersion("")).toBeNull();
      expect(parseVersion("invalid")).toBeNull();
    });

    it("should handle leading zeros", () => {
      expect(parseVersion("01.02.03")).toEqual({ major: 1, minor: 2, patch: 3 });
    });
  });

  describe("compareVersions", () => {
    it("should return 0 for equal versions", () => {
      expect(compareVersions("1.0.0", "1.0.0")).toBe(0);
      expect(compareVersions("2.5.10", "2.5.10")).toBe(0);
    });

    it("should return negative when v1 < v2", () => {
      expect(compareVersions("1.0.0", "1.0.1")).toBeLessThan(0);
      expect(compareVersions("1.0.0", "1.1.0")).toBeLessThan(0);
      expect(compareVersions("1.0.0", "2.0.0")).toBeLessThan(0);
    });

    it("should return positive when v1 > v2", () => {
      expect(compareVersions("1.0.1", "1.0.0")).toBeGreaterThan(0);
      expect(compareVersions("1.1.0", "1.0.0")).toBeGreaterThan(0);
      expect(compareVersions("2.0.0", "1.9.9")).toBeGreaterThan(0);
    });

    it("should throw on invalid versions", () => {
      expect(() => compareVersions("invalid", "1.0.0")).toThrow();
      expect(() => compareVersions("1.0.0", "invalid")).toThrow();
    });
  });

  describe("isCompatible", () => {
    describe("Compatible versions", () => {
      it("should accept exact version match", () => {
        expect(isCompatible("1.0.0", "1.0.0", "1.0.0")).toBe(true);
      });

      it("should accept versions within range", () => {
        expect(isCompatible("1.2.0", "1.0.0", "1.0.0")).toBe(true);
        expect(isCompatible("1.2.0", "1.0.0", "1.1.0")).toBe(true);
        expect(isCompatible("1.2.0", "1.0.0", "1.2.0")).toBe(true);
      });

      it("should accept patch variations", () => {
        expect(isCompatible("1.1.0", "1.0.0", "1.0.5")).toBe(true);
        expect(isCompatible("1.1.5", "1.0.0", "1.0.9")).toBe(true);
      });

      it("should accept minor variations", () => {
        expect(isCompatible("1.5.0", "1.0.0", "1.3.0")).toBe(true);
      });
    });

    describe("Incompatible versions", () => {
      it("should reject different major versions", () => {
        expect(isCompatible("1.0.0", "1.0.0", "2.0.0")).toBe(false);
        expect(isCompatible("2.0.0", "2.0.0", "1.0.0")).toBe(false);
      });

      it("should reject versions older than minimum", () => {
        expect(isCompatible("1.2.0", "1.1.0", "1.0.9")).toBe(false);
        expect(isCompatible("1.2.0", "1.1.0", "1.0.0")).toBe(false);
      });

      it("should reject versions newer than runtime version", () => {
        expect(isCompatible("1.0.0", "1.0.0", "1.1.0")).toBe(false);
        expect(isCompatible("1.1.0", "1.0.0", "1.2.0")).toBe(false);
      });
    });

    describe("Invalid input", () => {
      it("should return false for invalid versions", () => {
        expect(isCompatible("invalid", "1.0.0", "1.0.0")).toBe(false);
        expect(isCompatible("1.0.0", "invalid", "1.0.0")).toBe(false);
        expect(isCompatible("1.0.0", "1.0.0", "invalid")).toBe(false);
      });
    });
  });

  describe("selectBestVersion", () => {
    it("should select highest compatible version", () => {
      const result = selectBestVersion("1.2.0", "1.0.0", ["1.0.0", "1.1.0", "1.2.0"]);
      expect(result).toBe("1.2.0");
    });

    it("should skip incompatible versions", () => {
      const result = selectBestVersion("1.1.0", "1.0.0", ["1.0.0", "1.1.0", "2.0.0"]);
      expect(result).toBe("1.1.0");
    });

    it("should return null when no compatible version exists", () => {
      const result = selectBestVersion("1.0.0", "1.0.0", ["2.0.0", "2.1.0"]);
      expect(result).toBeNull();
    });

    it("should handle unordered input", () => {
      const result = selectBestVersion("1.2.0", "1.0.0", ["1.2.0", "1.0.0", "1.1.0"]);
      expect(result).toBe("1.2.0");
    });

    it("should return null for empty list", () => {
      const result = selectBestVersion("1.2.0", "1.0.0", []);
      expect(result).toBeNull();
    });
  });

  describe("negotiate", () => {
    describe("Successful negotiation", () => {
      it("should negotiate same versions", () => {
        expect(negotiate("1.0.0", "1.0.0", "1.0.0", "1.0.0")).toBe("1.0.0");
        expect(negotiate("1.1.0", "1.0.0", "1.1.0", "1.0.0")).toBe("1.1.0");
      });

      it("should select lower version in overlapping range", () => {
        expect(negotiate("1.2.0", "1.0.0", "1.1.0", "1.0.0")).toBe("1.1.0");
      });

      it("should select higher version in overlapping range", () => {
        expect(negotiate("1.1.0", "1.0.0", "1.2.0", "1.0.0")).toBe("1.1.0");
      });

      it("should negotiate with overlapping ranges", () => {
        expect(negotiate("1.3.0", "1.1.0", "1.2.0", "1.0.0")).toBe("1.2.0");
      });
    });

    describe("Failed negotiation", () => {
      it("should return null for different major versions", () => {
        expect(negotiate("1.0.0", "1.0.0", "2.0.0", "2.0.0")).toBeNull();
      });

      it("should return null for non-overlapping ranges", () => {
        expect(negotiate("1.1.0", "1.1.0", "1.0.0", "1.0.0")).toBeNull();
      });

      it("should return null when one version too old", () => {
        expect(negotiate("1.0.0", "1.0.0", "1.2.0", "1.2.0")).toBeNull();
      });
    });

    describe("Invalid input", () => {
      it("should return null for invalid versions", () => {
        expect(negotiate("invalid", "1.0.0", "1.0.0", "1.0.0")).toBeNull();
        expect(negotiate("1.0.0", "invalid", "1.0.0", "1.0.0")).toBeNull();
        expect(negotiate("1.0.0", "1.0.0", "invalid", "1.0.0")).toBeNull();
        expect(negotiate("1.0.0", "1.0.0", "1.0.0", "invalid")).toBeNull();
      });
    });
  });

  describe("Real-world scenarios", () => {
    it("scenario 1: older horae with newer ananke", () => {
      // Horae 1.0.0, Ananke 1.1.0
      const result = negotiate("1.0.0", "1.0.0", "1.1.0", "1.0.0");
      expect(result).toBe("1.0.0");
    });

    it("scenario 2: both at 1.1.0", () => {
      // Both at current version
      const result = negotiate("1.1.0", "1.0.0", "1.1.0", "1.0.0");
      expect(result).toBe("1.1.0");
    });

    it("scenario 3: incompatible major versions", () => {
      // Ananke upgraded to 2.0, but Mnemosyne still at 1.1
      const result = negotiate("2.0.0", "2.0.0", "1.1.0", "1.0.0");
      expect(result).toBeNull();
    });

    it("scenario 4: selecting from multiple candidates", () => {
      const candidates = ["1.0.0", "1.0.5", "1.1.0", "2.0.0"];
      const result = selectBestVersion("1.1.0", "1.0.0", candidates);
      expect(result).toBe("1.1.0");
    });
  });
});

