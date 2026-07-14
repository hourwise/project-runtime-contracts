import { z } from "zod";
import { ISO8601TimestampSchema } from "../utils/Timestamp";

/** Opaque non-empty reference identifier shared across portable envelopes. */
export const ReferenceIdSchema = z.string().min(1, "Reference identifier is required");
export type ReferenceId = z.infer<typeof ReferenceIdSchema>;

/** A pointer to an authoritative audit record owned by another runtime. */
export const AuditReferenceSchema = z.object({
  auditId: ReferenceIdSchema,
  sourceRuntime: ReferenceIdSchema.optional(),
});

export type AuditReference = z.infer<typeof AuditReferenceSchema>;

/** Opaque handle to state owned by another runtime; it is not the state itself or authority. */
export const StateHandleReferenceSchema = z.object({
  handleId: ReferenceIdSchema,
  kind: ReferenceIdSchema.optional(),
  ownerRuntime: ReferenceIdSchema.optional(),
  expiresAt: ISO8601TimestampSchema.optional(),
});

export type StateHandleReference = z.infer<typeof StateHandleReferenceSchema>;
