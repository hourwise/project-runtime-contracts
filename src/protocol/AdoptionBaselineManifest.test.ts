import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { AdoptionBaselineManifestSchema } from "./AdoptionBaselineManifest";

const example = JSON.parse(
  readFileSync(resolve(process.cwd(), "examples/adoption-baseline.example.json"), "utf8"),
);

describe("AdoptionBaselineManifest", () => {
  it("validates the explicitly non-final example record", () => {
    const parsed = AdoptionBaselineManifestSchema.parse(example);
    expect(parsed.recordStatus).toBe("example");
    expect(parsed.projectName).toBe("Project Adrasteia");
    expect(parsed.repositoryIdentity).toBe("Project-Adrasteia");
    expect(parsed.protocolIdentity).toBe("Fates Runtime Protocol");
    expect(parsed.packageName).toBe("project-runtime-contracts");
    expect(parsed.contentPreflightIncluded).toBe(false);
  });

  it("rejects protocol range drift", () => {
    expect(() =>
      AdoptionBaselineManifestSchema.parse({
        ...example,
        supportedProtocolRange: { minimum: "1.0.0", maximum: "1.3.0" },
      }),
    ).toThrow();
  });

  it("rejects placeholder commit or digest values in generated records", () => {
    expect(() =>
      AdoptionBaselineManifestSchema.parse({
        ...example,
        recordStatus: "generated",
        validation: example.validation.map((entry: Record<string, unknown>) => ({
          ...entry,
          result: "passed",
        })),
      }),
    ).toThrow();
  });

  it("rejects machine-local documentation paths", () => {
    expect(() =>
      AdoptionBaselineManifestSchema.parse({
        ...example,
        includedDocumentation: ["C:\\workspace\\README.md"],
      }),
    ).toThrow();
  });
});
