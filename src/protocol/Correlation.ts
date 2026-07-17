import { z } from "zod";
import { AuditReferenceSchema, StateHandleReferenceSchema } from "./References";

const IdentifierSchema = z.string().min(1, "Identifier is required");

/** References used to relate independently emitted cross-runtime records. */
export const CorrelationContextSchema = z.object({
  requestId: IdentifierSchema,
  correlationId: IdentifierSchema,
  causationId: IdentifierSchema.optional(),
  sessionId: IdentifierSchema.optional(),
  actionId: IdentifierSchema.optional(),
  workflowId: IdentifierSchema.optional(),
  executionId: IdentifierSchema.optional(),
  stepId: IdentifierSchema.optional(),
  attemptId: IdentifierSchema.optional(),
  approvalReference: IdentifierSchema.optional(),
  delegationReference: IdentifierSchema.optional(),
  auditReference: AuditReferenceSchema.optional(),
  stateHandleReference: StateHandleReferenceSchema.optional(),
});

export type CorrelationContext = z.infer<typeof CorrelationContextSchema>;

/** Runtime and instance identity paired with the required request/correlation identifiers. */
export const RuntimeCorrelationEnvelopeSchema = CorrelationContextSchema.extend({
  runtimeId: IdentifierSchema,
  runtimeInstanceId: IdentifierSchema.optional(),
});

export type RuntimeCorrelationEnvelope = z.infer<typeof RuntimeCorrelationEnvelopeSchema>;

export const isCorrelationContext = (value: unknown): value is CorrelationContext =>
  CorrelationContextSchema.safeParse(value).success;
