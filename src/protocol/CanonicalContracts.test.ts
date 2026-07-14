import { describe, expect, it } from "vitest";
import { PrincipalKind, ExecutionContextSchema } from "../identity/Principal";
import { ResourceScopeSchema } from "../scope/ResourceScope";
import { DelegationDescriptorSchema, DelegationRequestSchema, IdempotencyPolicySchema } from "../delegation/Delegation";
import { CorrelationContextSchema } from "./Correlation";
import { CompatibilityManifestSchema } from "./CompatibilityManifest";
import { ProtocolVersionRangeSchema } from "./ProtocolVersion";

const context = {
  authenticatedPrincipal: { id: "user-1", kind: PrincipalKind.Human },
  actingPrincipal: { id: "agent-1", kind: PrincipalKind.Agent },
  runtimeId: "horae",
  sessionId: "session-1",
};

describe("canonical cross-runtime contracts", () => {
  it("requires both principals and a session in execution context", () => {
    expect(ExecutionContextSchema.parse(context).actingPrincipal.id).toBe("agent-1");
    expect(() => ExecutionContextSchema.parse({ ...context, actingPrincipal: undefined })).toThrow();
  });

  it("rejects implicit and wildcard resource scopes", () => {
    expect(ResourceScopeSchema.parse({ mode: "bounded", projectId: "p-1" }).projectId).toBe("p-1");
    expect(() => ResourceScopeSchema.parse({ mode: "bounded" })).toThrow();
    expect(() => ResourceScopeSchema.parse({ mode: "bounded", resourceIds: ["*"] })).toThrow();
  });

  it("validates delegation references and temporal invariants", () => {
    const base = {
      grantId: "grant-1",
      issuer: "ananke",
      subject: "agent-1",
      delegatingPrincipal: { id: "user-1", kind: PrincipalKind.Human },
      actingPrincipal: { id: "agent-1", kind: PrincipalKind.Agent },
      audience: "provider-x",
      capabilityIds: ["model.invoke"],
      resourceScope: { mode: "bounded", projectId: "p-1" },
      purpose: "answer",
      sessionId: "session-1",
      issuedAt: "2026-01-01T00:00:00Z",
      expiresAt: "2026-01-01T00:01:00Z",
    };
    expect(DelegationDescriptorSchema.parse(base).grantId).toBe("grant-1");
    expect(() => DelegationDescriptorSchema.parse({ ...base, expiresAt: base.issuedAt })).toThrow();
    expect(() => DelegationRequestSchema.parse({ requestId: "r-1", context, audience: "provider-x", resourceScope: { mode: "unscoped" }, purpose: "answer", requestedAt: "2026-01-01T00:00:00Z" })).toThrow();
    expect(IdempotencyPolicySchema.parse({ mode: "bounded_replay", maxUses: 2 }).maxUses).toBe(2);
    expect(() => IdempotencyPolicySchema.parse({ mode: "bounded_replay" })).toThrow();
  });

  it("requires request and correlation identifiers", () => {
    expect(CorrelationContextSchema.parse({ requestId: "r-1", correlationId: "c-1" }).requestId).toBe("r-1");
    expect(() => CorrelationContextSchema.parse({ requestId: "r-1" })).toThrow();
  });

  it("keeps manifest range fields internally consistent", () => {
    expect(ProtocolVersionRangeSchema.parse({ minimum: "1.0.0", maximum: "1.4.0" })).toEqual({ minimum: "1.0.0", maximum: "1.4.0" });
    expect(() => ProtocolVersionRangeSchema.parse({ minimum: "1.4.0", maximum: "1.0.0" })).toThrow();
    const manifest = CompatibilityManifestSchema.parse({
      manifestSchemaVersion: "1.0.0", runtimeName: "ananke", runtimeVersion: "1.0.0", packageVersion: "0.4.0",
      protocolVersion: "1.4.0", minimumSupportedProtocolVersion: "1.0.0",
      preferredProtocolVersion: "1.2.0", supportedProtocolRange: { minimum: "1.0.0", maximum: "1.4.0" },
      requiredRuntimeContractsVersionRange: ">=0.4.0 <1.0.0", standalone: true,
    });
    expect(CompatibilityManifestSchema.parse(JSON.parse(JSON.stringify(manifest)))).toEqual(manifest);
  });
});
