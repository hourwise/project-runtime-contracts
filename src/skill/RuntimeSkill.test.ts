import { describe, expect, it } from "vitest";
import { CapabilityCategory } from "../runtime/Capability";
import {
  RuntimeSkillSchema,
  SkillKind,
  SkillKindSchema,
  SkillSourceSchema,
  SkillTrustState,
  SkillTrustStateSchema,
} from "./RuntimeSkill";

describe("skill value schemas", () => {
  it("accepts every declared skill kind and trust state", () => {
    for (const kind of Object.values(SkillKind)) {
      expect(SkillKindSchema.parse(kind)).toBe(kind);
    }

    for (const trustState of Object.values(SkillTrustState)) {
      expect(SkillTrustStateSchema.parse(trustState)).toBe(trustState);
    }
  });

  it("rejects unsupported serialized values", () => {
    expect(() => SkillKindSchema.parse("prompt")).toThrow();
    expect(() => SkillTrustStateSchema.parse("trusted")).toThrow();
  });
});

describe("SkillSourceSchema", () => {
  it("requires a repository locator or publisher", () => {
    expect(SkillSourceSchema.parse({ repository: "git+https://example.com/skills.git" })).toEqual({
      repository: "git+https://example.com/skills.git",
    });
    expect(SkillSourceSchema.parse({ publisher: "hourwise" })).toEqual({ publisher: "hourwise" });
    expect(() => SkillSourceSchema.parse({})).toThrow();
    expect(() => SkillSourceSchema.parse({ repository: "" })).toThrow();
  });
});

describe("RuntimeSkillSchema", () => {
  const skill = {
    id: "memory.summary",
    version: "1.2.0",
    kind: SkillKind.Workflow,
    source: {
      repository: "git+https://example.com/skills.git",
      revision: "f00dbabe",
      publisher: "hourwise",
      licence: "MIT",
    },
    declaredCapabilities: [
      {
        id: "memory.search",
        name: "Search memory",
        version: "1.0.0",
        category: CapabilityCategory.Memory,
      },
    ],
    requiredSecrets: ["memory-api-key"],
    networkRequirements: ["api.example.com:443"],
    supportedRuntimes: ["mnemosyne"],
    supportedModels: ["provider/model"],
    trustState: SkillTrustState.Verified,
  };

  it("parses a complete portable skill declaration", () => {
    expect(RuntimeSkillSchema.parse(skill)).toEqual(skill);
  });

  it("accepts a blocked skill as observable contract data", () => {
    expect(
      RuntimeSkillSchema.parse({
        ...skill,
        id: "memory.legacy",
        trustState: SkillTrustState.Blocked,
      }).trustState,
    ).toBe(SkillTrustState.Blocked);
  });

  it("rejects an invalid semantic version", () => {
    expect(() => RuntimeSkillSchema.parse({ ...skill, version: "1.2" })).toThrow();
    expect(() => RuntimeSkillSchema.parse({ ...skill, version: "01.2.3" })).toThrow();
  });

  it("rejects missing source provenance and empty string references", () => {
    expect(() => RuntimeSkillSchema.parse({ ...skill, source: {} })).toThrow();
    expect(() => RuntimeSkillSchema.parse({ ...skill, requiredSecrets: [""] })).toThrow();
  });

  it("round-trips through JSON", () => {
    expect(RuntimeSkillSchema.parse(JSON.parse(JSON.stringify(skill)))).toEqual(skill);
  });
});

