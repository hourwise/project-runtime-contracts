import { describe, it, expect } from "vitest";
import {
  RuntimeBindingRole,
  RuntimeBindingRoleSchema,
  RuntimeBindingSchema,
  RuntimeCompositionSchema,
} from "./RuntimeComposition";
import { RuntimeTransport } from "./RuntimeRegistration";

describe("RuntimeBindingRole Schema", () => {
  describe("Valid binding roles", () => {
    it("should accept all defined roles", () => {
      Object.values(RuntimeBindingRole).forEach((role) => {
        expect(() => RuntimeBindingRoleSchema.parse(role)).not.toThrow();
      });
    });
  });

  describe("Invalid binding roles", () => {
    it("should reject unknown roles", () => {
      expect(() => RuntimeBindingRoleSchema.parse("unknown")).toThrow();
      expect(() => RuntimeBindingRoleSchema.parse("APPROVAL")).toThrow();
    });
  });
});

describe("RuntimeBinding Schema", () => {
  describe("Valid bindings", () => {
    it("should parse complete binding", () => {
      const binding = {
        role: RuntimeBindingRole.Memory,
        runtime: "mnemosyne",
        capabilityIds: ["memory.store", "memory.retrieve"],
        required: true,
        metadata: { version: "1.0" },
      };
      const parsed = RuntimeBindingSchema.parse(binding);
      expect(parsed).toEqual(binding);
    });

    it("should parse minimal binding", () => {
      const binding = {
        role: RuntimeBindingRole.Approval,
        runtime: "ananke",
      };
      const parsed = RuntimeBindingSchema.parse(binding);
      expect(parsed).toEqual(binding);
    });

    it("should accept all role values", () => {
      Object.values(RuntimeBindingRole).forEach((role) => {
        const binding = {
          role,
          runtime: "test-runtime",
        };
        expect(() => RuntimeBindingSchema.parse(binding)).not.toThrow();
      });
    });
  });

  describe("Invalid bindings", () => {
    it("should reject binding without role", () => {
      expect(() =>
        RuntimeBindingSchema.parse({
          runtime: "test",
        })
      ).toThrow();
    });

    it("should reject binding without runtime", () => {
      expect(() =>
        RuntimeBindingSchema.parse({
          role: RuntimeBindingRole.Memory,
        })
      ).toThrow();
    });

    it("should reject binding with empty runtime", () => {
      expect(() =>
        RuntimeBindingSchema.parse({
          role: RuntimeBindingRole.Memory,
          runtime: "",
        })
      ).toThrow();
    });
  });

  describe("JSON serialization", () => {
    it("should round-trip through JSON", () => {
      const binding = {
        role: RuntimeBindingRole.Orchestrator,
        runtime: "horae",
        capabilityIds: ["compose", "execute"],
        required: true,
      };
      const json = JSON.stringify(binding);
      const parsed = RuntimeBindingSchema.parse(JSON.parse(json));
      expect(parsed).toEqual(binding);
    });
  });
});

describe("RuntimeComposition Schema", () => {
  describe("Valid compositions", () => {
    it("should parse complete composition", () => {
      const composition = {
        id: "comp-123",
        name: "Production Composition",
        projectId: "proj-001",
        sessionId: "sess-456",
        profileId: "prof-prod",
        protocolVersion: "1.1.0",
        bindings: [
          { role: RuntimeBindingRole.Orchestrator, runtime: "horae" },
          { role: RuntimeBindingRole.Memory, runtime: "mnemosyne" },
          { role: RuntimeBindingRole.Approval, runtime: "ananke" },
        ],
        exposedCapabilityIds: ["query", "execute"],
        hiddenCapabilityIds: ["admin"],
        createdAt: "2024-07-11T14:30:00Z",
        metadata: { labels: { env: "production" } },
      };
      const parsed = RuntimeCompositionSchema.parse(composition);
      expect(parsed).toEqual(composition);
    });

    it("should parse minimal composition", () => {
      const composition = {
        id: "comp-001",
        protocolVersion: "1.1.0",
        bindings: [
          { role: RuntimeBindingRole.Orchestrator, runtime: "horae" },
        ],
      };
      const parsed = RuntimeCompositionSchema.parse(composition);
      expect(parsed).toEqual(composition);
    });
  });

  describe("Invalid compositions", () => {
    it("should reject composition without id", () => {
      expect(() =>
        RuntimeCompositionSchema.parse({
          protocolVersion: "1.1.0",
          bindings: [{ role: RuntimeBindingRole.Memory, runtime: "mem" }],
        })
      ).toThrow();
    });

    it("should reject composition with empty id", () => {
      expect(() =>
        RuntimeCompositionSchema.parse({
          id: "",
          protocolVersion: "1.1.0",
          bindings: [{ role: RuntimeBindingRole.Memory, runtime: "mem" }],
        })
      ).toThrow();
    });

    it("should reject composition without protocolVersion", () => {
      expect(() =>
        RuntimeCompositionSchema.parse({
          id: "comp-001",
          bindings: [{ role: RuntimeBindingRole.Memory, runtime: "mem" }],
        })
      ).toThrow();
    });

    it("should reject composition with empty protocolVersion", () => {
      expect(() =>
        RuntimeCompositionSchema.parse({
          id: "comp-001",
          protocolVersion: "",
          bindings: [{ role: RuntimeBindingRole.Memory, runtime: "mem" }],
        })
      ).toThrow();
    });

    it("should reject composition without bindings", () => {
      expect(() =>
        RuntimeCompositionSchema.parse({
          id: "comp-001",
          protocolVersion: "1.1.0",
        })
      ).toThrow();
    });

    it("should reject composition with empty bindings array", () => {
      expect(() =>
        RuntimeCompositionSchema.parse({
          id: "comp-001",
          protocolVersion: "1.1.0",
          bindings: [],
        })
      ).toThrow();
    });

    it("should reject composition with invalid createdAt timestamp", () => {
      expect(() =>
        RuntimeCompositionSchema.parse({
          id: "comp-001",
          protocolVersion: "1.1.0",
          bindings: [{ role: RuntimeBindingRole.Memory, runtime: "mem" }],
          createdAt: "2024-07-11",
        })
      ).toThrow();
    });
  });

  describe("Optional fields", () => {
    it("should allow composition without name", () => {
      const composition = {
        id: "comp-001",
        protocolVersion: "1.1.0",
        bindings: [{ role: RuntimeBindingRole.Memory, runtime: "mem" }],
      };
      expect(() => RuntimeCompositionSchema.parse(composition)).not.toThrow();
    });

    it("should allow composition without projectId", () => {
      const composition = {
        id: "comp-001",
        protocolVersion: "1.1.0",
        bindings: [{ role: RuntimeBindingRole.Memory, runtime: "mem" }],
      };
      expect(() => RuntimeCompositionSchema.parse(composition)).not.toThrow();
    });

    it("should allow composition without exposedCapabilityIds", () => {
      const composition = {
        id: "comp-001",
        protocolVersion: "1.1.0",
        bindings: [{ role: RuntimeBindingRole.Memory, runtime: "mem" }],
      };
      expect(() => RuntimeCompositionSchema.parse(composition)).not.toThrow();
    });
  });

  describe("JSON serialization", () => {
    it("should round-trip through JSON", () => {
      const composition = {
        id: "comp-456",
        name: "Test Composition",
        protocolVersion: "1.1.0",
        bindings: [
          { role: RuntimeBindingRole.Orchestrator, runtime: "horae" },
          { role: RuntimeBindingRole.Memory, runtime: "mnemosyne" },
        ],
        createdAt: "2024-07-11T14:30:00Z",
      };
      const json = JSON.stringify(composition);
      const parsed = RuntimeCompositionSchema.parse(JSON.parse(json));
      expect(parsed).toEqual(composition);
    });
  });

  describe("Unknown properties", () => {
    it("should strip unknown properties", () => {
      const composition = {
        id: "comp-001",
        protocolVersion: "1.1.0",
        bindings: [{ role: RuntimeBindingRole.Memory, runtime: "mem" }],
        unknownField: "ignored",
      };
      const parsed = RuntimeCompositionSchema.parse(composition);
      expect("unknownField" in parsed).toBe(false);
    });
  });
});

