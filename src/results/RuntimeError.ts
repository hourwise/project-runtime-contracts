import { z } from "zod";

/**
 * Error information in a failed runtime operation result.
 *
 * @property code - Machine-readable error code (e.g., "ERR_AUTH_DENIED", "ERR_TIMEOUT").
 * @property message - Human-readable error description.
 * @property recoverable - Whether the error is transient and the operation may be retried.
 * @property details - Optional structured error context (e.g., field validation errors).
 *
 * @example
 * ```ts
 * const error: RuntimeError = {
 *   code: "ERR_PERMISSION_DENIED",
 *   message: "Access denied for capability 'write_file'",
 *   recoverable: false,
 *   details: { capability: "write_file", runtime: "sandbox" },
 * };
 * ```
 */
export const RuntimeErrorSchema = z.object({
  code: z.string().min(1, "Error code is required"),
  message: z.string().min(1, "Error message is required"),
  recoverable: z.boolean(),
  details: z.record(z.unknown()).optional(),
});

export type RuntimeError = z.infer<typeof RuntimeErrorSchema>;

