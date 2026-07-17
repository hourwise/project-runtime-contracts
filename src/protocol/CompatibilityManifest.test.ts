import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CompatibilityManifestSchema,
  isCompatibilityManifest,
  parseCompatibilityManifest,
} from "./CompatibilityManifest";

const fixture = (name: string): unknown =>
  JSON.parse(readFileSync(resolve("fixtures", "compatibility-manifest", name), "utf8"));

describe("CompatibilityManifest", () => {
  it("parses and round-trips the canonical valid fixture", () => {
    const parsed = parseCompatibilityManifest(fixture("valid.json"));
    expect(parsed.buildVersion).toBe("fixture-build");
    expect(isCompatibilityManifest(JSON.parse(JSON.stringify(parsed)))).toBe(true);
  });

  it("rejects a manifest whose range maximum drifts from protocolVersion", () => {
    expect(CompatibilityManifestSchema.safeParse(fixture("invalid-range.json")).success).toBe(false);
  });
});
