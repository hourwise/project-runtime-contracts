import { z } from "zod";
import { RuntimeErrorSchema, RuntimeError } from "./RuntimeError";
import { AuditReferenceSchema, StateHandleReferenceSchema } from "../protocol/References";

/**
 * Discriminated union representing the outcome of a runtime operation.
 *
 * Success (success=true):
 * - MUST have `data` field
 * - MUST NOT have `error` field
 *
 * Failure (success=false):
 * - MUST have `error` field
 * - MUST NOT have `data` field
 *
 * @example
 * ```ts
 * const successResult: Result<string> = { success: true, data: "hello" };
 * const failureResult: Result<string> = {
 *   success: false,
 *   error: { code: "ERR_001", message: "Operation failed", recoverable: false },
 * };
 * ```
 */
export type Result<T> =
  | { success: true; data: T; error?: never; requestId?: string; correlationId?: string; causationId?: string; auditReference?: z.infer<typeof AuditReferenceSchema>; stateHandleReference?: z.infer<typeof StateHandleReferenceSchema> }
  | { success: false; data?: never; error: RuntimeError; requestId?: string; correlationId?: string; causationId?: string; auditReference?: z.infer<typeof AuditReferenceSchema>; stateHandleReference?: z.infer<typeof StateHandleReferenceSchema> };

/**
 * Result schema factory that creates a Zod schema enforcing the discriminated union invariant.
 *
 * @param dataSchema - Zod schema for the success data type. If omitted, any type is allowed.
 * @returns A Zod schema that validates Result<T> objects.
 *
 * @example
 * ```ts
 * const resultSchema = createResultSchema(z.string());
 * const result = resultSchema.parse({ success: true, data: "hello" });
 * ```
 */
export const createResultSchema = <T extends z.ZodTypeAny>(
  dataSchema?: T
) =>
  z.discriminatedUnion("success", [
    z.object({
      success: z.literal(true),
      data: dataSchema || z.any(),
      error: z.never().optional(),
      requestId: z.string().min(1).optional(),
      correlationId: z.string().min(1).optional(),
      causationId: z.string().min(1).optional(),
      auditReference: AuditReferenceSchema.optional(),
      stateHandleReference: StateHandleReferenceSchema.optional(),
    }),
    z.object({
      success: z.literal(false),
      data: z.never().optional(),
      error: RuntimeErrorSchema,
      requestId: z.string().min(1).optional(),
      correlationId: z.string().min(1).optional(),
      causationId: z.string().min(1).optional(),
      auditReference: AuditReferenceSchema.optional(),
      stateHandleReference: StateHandleReferenceSchema.optional(),
    }),
  ]);

export type ResultType<T> = Result<T>;

