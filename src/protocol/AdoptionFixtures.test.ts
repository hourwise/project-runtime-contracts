import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  AgentExecutionContextSchema,
  ApprovalReferenceSchema,
  AuditReferenceSchema,
  CompatibilityManifestSchema,
  CorrelationContextSchema,
  DelegationDescriptorSchema,
  DelegationRequestSchema,
  DualPrincipalContextSchema,
  GrantReferenceSchema,
  PrincipalIdentitySchema,
  ProtocolVersionRangeSchema,
  ReferenceIdSchema,
  ResourceScopeSchema,
  RuntimeHealthSchema,
  RuntimeIdentitySchema,
  RuntimeReadinessSchema,
  RuntimeRegistrationSchema,
  negotiateDetailed,
} from "../index";

type ExpectedParse = { parseSuccess: boolean };
type FixtureCase = {
  id: string;
  category: string;
  schema?: string;
  expected: ExpectedParse | Record<string, unknown>;
  payload: unknown;
};
type FixtureFamily = { id: string; schema: string; cases: FixtureCase[] };
type FixtureCatalog = {
  fixtureSchemaVersion: string;
  protocolVersion: string;
  families: FixtureFamily[];
};

const catalog = JSON.parse(
  readFileSync(resolve(process.cwd(), "fixtures/adoption-v1/catalog.json"), "utf8"),
) as FixtureCatalog;

const schemas: Record<string, { safeParse: (value: unknown) => { success: boolean } }> = {
  AgentExecutionContextSchema,
  ApprovalReferenceSchema,
  AuditReferenceSchema,
  CompatibilityManifestSchema,
  CorrelationContextSchema,
  DelegationDescriptorSchema,
  DelegationRequestSchema,
  DualPrincipalContextSchema,
  GrantReferenceSchema,
  PrincipalIdentitySchema,
  ProtocolVersionRangeSchema,
  ReferenceIdSchema,
  ResourceScopeSchema,
  RuntimeHealthSchema,
  RuntimeIdentitySchema,
  RuntimeReadinessSchema,
  RuntimeRegistrationSchema,
};

describe("first-migration conformance fixtures", () => {
  it("identifies the fixture and protocol versions", () => {
    expect(catalog.fixtureSchemaVersion).toBe("1.0.0");
    expect(catalog.protocolVersion).toBe("1.4.0");
  });

  it("covers all 15 requested families and required case categories", () => {
    expect(catalog.families).toHaveLength(15);
    for (const family of catalog.families) {
      const categories = new Set(family.cases.map((entry) => entry.category));
      expect(categories, `${family.id}: minimal valid`).toContain("minimal_valid");
      expect(categories, `${family.id}: complete valid`).toContain("complete_valid");
      expect(categories, `${family.id}: missing required`).toContain("missing_required");
      expect(categories, `${family.id}: invalid type`).toContain("invalid_type");
      expect(categories, `${family.id}: semantic invalid`).toContain("semantic_invalid");
    }
  });

  for (const family of catalog.families) {
    for (const fixture of family.cases) {
      it(`${family.id}/${fixture.id}`, () => {
        if (family.schema === "negotiateDetailed") {
          const payload = fixture.payload as Record<string, unknown>;
          const actual = negotiateDetailed(
            payload.runtime1Version as string,
            payload.runtime1Minimum as string,
            payload.runtime2Version as string,
            payload.runtime2Minimum as string,
          );
          expect(actual).toEqual(fixture.expected);
          return;
        }

        const schemaName = fixture.schema ?? family.schema;
        const schema = schemas[schemaName];
        expect(schema, `Unknown fixture schema ${schemaName}`).toBeDefined();
        const expected = fixture.expected as ExpectedParse;
        expect(schema.safeParse(fixture.payload).success).toBe(expected.parseSuccess);
      });
    }
  }

  it("records the complete fixture case count", () => {
    const count = catalog.families.reduce((total, family) => total + family.cases.length, 0);
    expect(count).toBe(87);
  });
});

