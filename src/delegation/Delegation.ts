import { z } from "zod";
import {
  AgentExecutionContextSchema,
  AgentPrincipalSchema,
  HumanPrincipalSchema,
  ServicePrincipalSchema,
} from "../identity/Principal";
import { ResourceScopeSchema } from "../scope/ResourceScope";
import { ISO8601TimestampSchema } from "../utils/Timestamp";
import { ReferenceIdSchema } from "../protocol/References";
import { StateHandleReferenceSchema } from "../protocol/References";

const IdentifierSchema = ReferenceIdSchema;

export const ApprovalReferenceSchema = z.object({
  approvalId: IdentifierSchema,
  sourceRuntime: IdentifierSchema.optional(),
  policyVersion: z.string().min(1).optional(),
  requestHash: z.string().min(1).optional(),
});

export type ApprovalReference = z.infer<typeof ApprovalReferenceSchema>;

export enum IdempotencyMode {
  None = "none",
  SingleUse = "single_use",
  BoundedReplay = "bounded_replay",
}

export const IdempotencyModeSchema = z.enum([
  IdempotencyMode.None,
  IdempotencyMode.SingleUse,
  IdempotencyMode.BoundedReplay,
]);

export const IdempotencyPolicySchema = z.object({
  mode: IdempotencyModeSchema,
  maxUses: z.number().int().positive().optional(),
}).superRefine((policy, context) => {
  if (policy.mode === IdempotencyMode.None && policy.maxUses !== undefined) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["maxUses"], message: "none mode must not declare maxUses" });
  }
  if (policy.mode === IdempotencyMode.SingleUse && policy.maxUses !== undefined && policy.maxUses !== 1) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["maxUses"], message: "single_use mode permits at most one use" });
  }
  if (policy.mode === IdempotencyMode.BoundedReplay && policy.maxUses === undefined) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["maxUses"], message: "bounded_replay mode requires maxUses" });
  }
});

export type IdempotencyPolicy = z.infer<typeof IdempotencyPolicySchema>;

export const GrantReferenceSchema = z.object({
  grantId: IdentifierSchema,
  issuer: IdentifierSchema.optional(),
  revocationReference: IdentifierSchema.optional(),
});

export type GrantReference = z.infer<typeof GrantReferenceSchema>;

/** Shared failure vocabulary; interpretation and enforcement remain with the owning runtime. */
export enum DelegationFailureReason {
  UnauthenticatedPrincipal = "UNAUTHENTICATED_PRINCIPAL",
  UnknownAgent = "UNKNOWN_AGENT",
  InvalidDelegation = "INVALID_DELEGATION",
  InsufficientCapability = "INSUFFICIENT_CAPABILITY",
  ScopeMismatch = "TENANT_OR_RESOURCE_MISMATCH",
  ApprovalRequired = "APPROVAL_REQUIRED",
  ApprovalInvalidated = "APPROVAL_INVALIDATED",
  GrantExpired = "EXPIRED_GRANT",
  GrantRevoked = "REVOKED_GRANT",
  UnsupportedProviderScoping = "UNSUPPORTED_PROVIDER_SCOPING",
  BrokerUnavailable = "BROKER_UNAVAILABLE",
  UpstreamCredentialFailure = "UPSTREAM_CREDENTIAL_FAILURE",
  DirectBypassAttempt = "DIRECT_BYPASS_ATTEMPT",
  Unknown = "UNKNOWN",
}

export const DelegationFailureReasonSchema = z.enum([
  DelegationFailureReason.UnauthenticatedPrincipal,
  DelegationFailureReason.UnknownAgent,
  DelegationFailureReason.InvalidDelegation,
  DelegationFailureReason.InsufficientCapability,
  DelegationFailureReason.ScopeMismatch,
  DelegationFailureReason.ApprovalRequired,
  DelegationFailureReason.ApprovalInvalidated,
  DelegationFailureReason.GrantExpired,
  DelegationFailureReason.GrantRevoked,
  DelegationFailureReason.UnsupportedProviderScoping,
  DelegationFailureReason.BrokerUnavailable,
  DelegationFailureReason.UpstreamCredentialFailure,
  DelegationFailureReason.DirectBypassAttempt,
  DelegationFailureReason.Unknown,
]);

const DelegatingPrincipalSchema = z.union([HumanPrincipalSchema, ServicePrincipalSchema]);
const CapabilityReferenceListSchema = z.array(IdentifierSchema).min(1);

/** A request for a scoped grant; it does not issue credentials or authority. */
export const DelegationRequestSchema = z
  .object({
    requestId: IdentifierSchema,
    context: AgentExecutionContextSchema,
    correlationId: IdentifierSchema,
    causationId: IdentifierSchema.optional(),
    actionId: IdentifierSchema.optional(),
    audience: IdentifierSchema,
    capabilityIds: CapabilityReferenceListSchema.optional(),
    toolIds: CapabilityReferenceListSchema.optional(),
    operationIds: CapabilityReferenceListSchema.optional(),
    resourceScope: ResourceScopeSchema,
    purpose: IdentifierSchema,
    approvalReference: ApprovalReferenceSchema.optional(),
    requestedAt: ISO8601TimestampSchema,
    metadata: z.record(z.unknown()).optional(),
  })
  .superRefine((request, context) => {
    if (!request.capabilityIds && !request.toolIds && !request.operationIds) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["capabilityIds"],
        message: "Delegation request requires a capability, tool, or operation reference",
      });
    }
  });

export type DelegationRequest = z.infer<typeof DelegationRequestSchema>;

/**
 * Portable descriptor for an already-issued grant. Adrasteia runtime contracts describe the grant;
 * it does not mint, sign, store, validate, revoke, or exchange credentials.
 */
export const DelegationDescriptorSchema = z
  .object({
    grantId: IdentifierSchema,
    issuer: IdentifierSchema,
    subject: IdentifierSchema,
    delegatingPrincipal: DelegatingPrincipalSchema,
    actingPrincipal: AgentPrincipalSchema,
    audience: IdentifierSchema,
    capabilityIds: CapabilityReferenceListSchema.optional(),
    toolIds: CapabilityReferenceListSchema.optional(),
    operationIds: CapabilityReferenceListSchema.optional(),
    resourceScope: ResourceScopeSchema,
    purpose: IdentifierSchema,
    sessionId: IdentifierSchema,
    projectId: IdentifierSchema.optional(),
    approvalReference: ApprovalReferenceSchema.optional(),
    issuedAt: ISO8601TimestampSchema,
    notBefore: ISO8601TimestampSchema.optional(),
    expiresAt: ISO8601TimestampSchema,
    nonce: IdentifierSchema.optional(),
    requestHash: IdentifierSchema.optional(),
    revocationReference: IdentifierSchema.optional(),
    idempotencyPolicy: IdempotencyPolicySchema.optional(),
    signatureMetadata: z.record(z.unknown()).optional(),
    stateHandleReference: StateHandleReferenceSchema.optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .superRefine((grant, context) => {
    if (!grant.capabilityIds && !grant.toolIds && !grant.operationIds) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["capabilityIds"],
        message: "Delegation descriptor requires a capability, tool, or operation reference",
      });
    }

    const issuedAt = Date.parse(grant.issuedAt);
    const expiresAt = Date.parse(grant.expiresAt);
    const notBefore = grant.notBefore ? Date.parse(grant.notBefore) : undefined;
    if (!Number.isNaN(issuedAt) && !Number.isNaN(expiresAt) && expiresAt <= issuedAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expiresAt"],
        message: "Grant expiry must be later than issuedAt",
      });
    }
    if (!Number.isNaN(issuedAt) && notBefore !== undefined && !Number.isNaN(notBefore) && notBefore < issuedAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["notBefore"],
        message: "notBefore must not be earlier than issuedAt",
      });
    }
  });

export type DelegationDescriptor = z.infer<typeof DelegationDescriptorSchema>;
export const CapabilityGrantDescriptorSchema = DelegationDescriptorSchema;
export type CapabilityGrantDescriptor = DelegationDescriptor;

export const isDelegationDescriptor = (value: unknown): value is DelegationDescriptor =>
  DelegationDescriptorSchema.safeParse(value).success;
