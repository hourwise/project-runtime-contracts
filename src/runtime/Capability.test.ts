import { describe, it, expect } from "vitest";
import {
  CapabilityCategory,
  CapabilityExposure,
  CapabilityCategorySchema,
  CapabilityExposureSchema,
  CapabilitySchema,
} from "./Capability";

describe("CapabilityCategory Schema", () => {
  describe("Valid capability categories", () => {
    it("should accept all defined categories", () => {
      Object.values(CapabilityCategory).forEach((cat) => {
        expect(() => CapabilityCategorySchema.parse(cat)).not.toThrow();
      });
    });
  });

  describe("Invalid capability categories", () => {
    it("should reject unknown categories", () => {
      expect(() => CapabilityCategorySchema.parse("unknown")).toThrow();
    });
  });
});

describe("CapabilityExposure Schema", () => {
  describe("Valid exposures", () => {
    it("should accept all defined exposures", () => {
      Object.values(CapabilityExposure).forEach((exp) => {
        expect(() => CapabilityExposureSchema.parse(exp)).not.toThrow();
      });
    });
  });

  describe("Invalid exposures", () => {
    it("should reject unknown exposures", () => {
      expect(() => CapabilityExposureSchema.parse("unknown")).toThrow();
    });
  });
});

describe("Capability Schema", () => {
  describe("Valid capabilities", () => {
    it("should parse complete capability with all fields", () => {
      const capability = {
        id: "cap-memory-store",
        name: "Store in Memory",
        version: "1.0.0",
        description: "Store data persistently in runtime memory",
        category: CapabilityCategory.Memory,
        exposure: CapabilityExposure.Active,
        tags: ["storage", "persistent"],
        requiresApproval: true,
        riskClass: "medium",
        metadata: { maxSize: 1000 },
      };
      const parsed = CapabilitySchema.parse(capability);
      expect(parsed).toEqual(capability);
    });

    it("should parse minimal capability", () => {
      const capability = {
        id: "cap-1",
        name: "Basic Capability",
        version: "1.0.0",
      };
      const parsed = CapabilitySchema.parse(capability);
      expect(parsed).toEqual(capability);
    });

    it("should accept all category values", () => {
      Object.values(CapabilityCategory).forEach((cat) => {
        const capability = {
          id: "cap-1",
          name: "Test",
          version: "1.0.0",
          category: cat,
        };
        expect(() => CapabilitySchema.parse(capability)).not.toThrow();
      });
    });

    it("should accept all exposure values", () => {
      Object.values(CapabilityExposure).forEach((exp) => {
        const capability = {
          id: "cap-1",
          name: "Test",
          version: "1.0.0",
          exposure: exp,
        };
        expect(() => CapabilitySchema.parse(capability)).not.toThrow();
      });
    });
  });

  describe("Invalid capabilities", () => {
    it("should reject capability without id", () => {
      expect(() =>
        CapabilitySchema.parse({
          name: "Test",
          version: "1.0.0",
        })
      ).toThrow();
    });

    it("should reject capability with empty id", () => {
      expect(() =>
        CapabilitySchema.parse({
          id: "",
          name: "Test",
          version: "1.0.0",
        })
      ).toThrow();
    });

    it("should reject capability without name", () => {
      expect(() =>
        CapabilitySchema.parse({
          id: "cap-1",
          version: "1.0.0",
        })
      ).toThrow();
    });

    it("should reject capability with empty name", () => {
      expect(() =>
        CapabilitySchema.parse({
          id: "cap-1",
          name: "",
          version: "1.0.0",
        })
      ).toThrow();
    });

    it("should reject capability without version", () => {
      expect(() =>
        CapabilitySchema.parse({
          id: "cap-1",
          name: "Test",
        })
      ).toThrow();
    });

    it("should reject capability with empty version", () => {
      expect(() =>
        CapabilitySchema.parse({
          id: "cap-1",
          name: "Test",
          version: "",
        })
      ).toThrow();
    });
  });

  describe("Optional fields", () => {
    it("should allow capability without description", () => {
      const capability = {
        id: "cap-1",
        name: "Test",
        version: "1.0.0",
      };
      expect(() => CapabilitySchema.parse(capability)).not.toThrow();
    });

    it("should allow capability without category", () => {
      const capability = {
        id: "cap-1",
        name: "Test",
        version: "1.0.0",
      };
      expect(() => CapabilitySchema.parse(capability)).not.toThrow();
    });

    it("should allow capability without tags", () => {
      const capability = {
        id: "cap-1",
        name: "Test",
        version: "1.0.0",
      };
      expect(() => CapabilitySchema.parse(capability)).not.toThrow();
    });

    it("should allow capability with empty tags array", () => {
      const capability = {
        id: "cap-1",
        name: "Test",
        version: "1.0.0",
        tags: [],
      };
      expect(() => CapabilitySchema.parse(capability)).not.toThrow();
    });
  });

  describe("JSON serialization", () => {
    it("should round-trip through JSON", () => {
      const capability = {
        id: "cap-test",
        name: "Test Capability",
        version: "1.0.0",
        description: "A test capability",
        category: CapabilityCategory.Execution,
        exposure: CapabilityExposure.Active,
        tags: ["test", "example"],
        requiresApproval: false,
        metadata: { custom: "data" },
      };
      const json = JSON.stringify(capability);
      const parsed = CapabilitySchema.parse(JSON.parse(json));
      expect(parsed).toEqual(capability);
    });
  });

  describe("Unknown properties", () => {
    it("should strip unknown properties", () => {
      const capability = {
        id: "cap-1",
        name: "Test",
        version: "1.0.0",
        unknownField: "ignored",
      };
      const parsed = CapabilitySchema.parse(capability);
      expect("unknownField" in parsed).toBe(false);
    });
  });
});

