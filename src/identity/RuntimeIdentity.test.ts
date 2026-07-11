import { describe, it, expect } from "vitest";
import { RuntimeIdentitySchema } from "../src/identity/RuntimeIdentity";
import { RuntimeKind } from "../src/runtime/RuntimeKind";
import { CapabilityCategory } from "../src/runtime/Capability";

describe("RuntimeIdentity Schema", () => {
  describe("Valid runtime identities", () => {
    it("should parse complete identity with all fields", () => {
      const identity = {
        runtime: "mnemosyne",
        version: "1.0.0",
        protocolVersion: "1.1.0",
        minimumProtocolVersion: "1.0.0",
        kind: RuntimeKind.Mnemosyne,
        instanceId: "mnemosyne-prod-001",
        displayName: "Memory Runtime",
        capabilities: [
          {
            id: "mem.store",
            name: "Store Memory",
            version: "1.0",
            category: CapabilityCategory.Memory,
          },
        ],
        metadata: { env: "production" },
      };
      const parsed = RuntimeIdentitySchema.parse(identity);
      expect(parsed).toEqual(identity);
    });

    it("should parse minimal identity", () => {
      const identity = {
        runtime: "ananke",
        version: "1.0.0",
        protocolVersion: "1.1.0",
      };
      const parsed = RuntimeIdentitySchema.parse(identity);
      expect(parsed).toEqual(identity);
    });
  });

  describe("Invalid runtime identities", () => {
    it("should reject identity without runtime", () => {
      expect(() =>
        RuntimeIdentitySchema.parse({
          version: "1.0.0",
          protocolVersion: "1.1.0",
        })
      ).toThrow();
    });

    it("should reject identity with empty runtime", () => {
      expect(() =>
        RuntimeIdentitySchema.parse({
          runtime: "",
          version: "1.0.0",
          protocolVersion: "1.1.0",
        })
      ).toThrow();
    });

    it("should reject identity without version", () => {
      expect(() =>
        RuntimeIdentitySchema.parse({
          runtime: "ananke",
          protocolVersion: "1.1.0",
        })
      ).toThrow();
    });

    it("should reject identity with empty version", () => {
      expect(() =>
        RuntimeIdentitySchema.parse({
          runtime: "ananke",
          version: "",
          protocolVersion: "1.1.0",
        })
      ).toThrow();
    });

    it("should reject identity without protocolVersion", () => {
      expect(() =>
        RuntimeIdentitySchema.parse({
          runtime: "ananke",
          version: "1.0.0",
        })
      ).toThrow();
    });

    it("should reject identity with empty protocolVersion", () => {
      expect(() =>
        RuntimeIdentitySchema.parse({
          runtime: "ananke",
          version: "1.0.0",
          protocolVersion: "",
        })
      ).toThrow();
    });
  });

  describe("Optional fields", () => {
    it("should allow identity without minimumProtocolVersion", () => {
      const identity = {
        runtime: "horae",
        version: "1.0.0",
        protocolVersion: "1.1.0",
      };
      expect(() => RuntimeIdentitySchema.parse(identity)).not.toThrow();
    });

    it("should allow identity without kind", () => {
      const identity = {
        runtime: "custom",
        version: "1.0.0",
        protocolVersion: "1.1.0",
      };
      expect(() => RuntimeIdentitySchema.parse(identity)).not.toThrow();
    });

    it("should allow identity without capabilities", () => {
      const identity = {
        runtime: "ananke",
        version: "1.0.0",
        protocolVersion: "1.1.0",
      };
      expect(() => RuntimeIdentitySchema.parse(identity)).not.toThrow();
    });
  });

  describe("JSON serialization", () => {
    it("should round-trip through JSON", () => {
      const identity = {
        runtime: "horae",
        version: "2.1.0",
        protocolVersion: "1.1.0",
        minimumProtocolVersion: "1.0.0",
        kind: RuntimeKind.Horae,
        displayName: "Orchestration Runtime",
      };
      const json = JSON.stringify(identity);
      const parsed = RuntimeIdentitySchema.parse(JSON.parse(json));
      expect(parsed).toEqual(identity);
    });
  });

  describe("Unknown properties", () => {
    it("should strip unknown properties", () => {
      const identity = {
        runtime: "ananke",
        version: "1.0.0",
        protocolVersion: "1.1.0",
        unknownField: "ignored",
      };
      const parsed = RuntimeIdentitySchema.parse(identity);
      expect("unknownField" in parsed).toBe(false);
    });
  });
});

