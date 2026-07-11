import { z } from "zod";
import { RuntimeErrorSchema, RuntimeError } from "./RuntimeError";

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
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: RuntimeError };

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
  z.union([
    z.object({
      success: z.literal(true),
      data: dataSchema || z.any(),
      error: z.never().optional(),
    }),
    z.object({
      success: z.literal(false),
      data: z.never().optional(),
      error: RuntimeErrorSchema,
    }),
  ]);

export type ResultType<T> = Result<T>;

