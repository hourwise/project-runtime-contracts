import { z } from "zod";
import { ISO8601TimestampSchema } from "../utils/Timestamp";

/**
 * Runtime health status.
 *
 * - `healthy`: Fully operational.
 * - `busy`: Temporarily loaded but operational.
 * - `read_only`: Only read operations allowed.
 * - `updating`: Undergoing maintenance or updates.
 * - `unavailable`: Not reachable or not operational.
 * - `degraded`: Partially operational or slow.
 */
export enum RuntimeHealthStatus {
  Healthy = "healthy",
  Busy = "busy",
  ReadOnly = "read_only",
  Updating = "updating",
  Unavailable = "unavailable",
  Degraded = "degraded",
}

/** Zod schema for RuntimeHealthStatus enum values. */
export const RuntimeHealthStatusSchema = z.enum([
  RuntimeHealthStatus.Healthy,
  RuntimeHealthStatus.Busy,
  RuntimeHealthStatus.ReadOnly,
  RuntimeHealthStatus.Updating,
  RuntimeHealthStatus.Unavailable,
  RuntimeHealthStatus.Degraded,
]);

/**
 * Runtime health status snapshot.
 *
 * @property healthy - Boolean indicating if the runtime is operational.
 * @property status - Detailed health status (optional).
 * @property uptimeMs - Runtime uptime in milliseconds (required).
 * @property warnings - List of warning messages (empty if no warnings).
 * @property checkedAt - ISO 8601 timestamp when health was last checked.
 * @property message - Optional status message.
 * @property activeSessions - Number of active sessions (optional).
 * @property metadata - Custom health metadata.
 *
 * @example
 * ```ts
 * const health: RuntimeHealth = {
 *   healthy: true,
 *   status: RuntimeHealthStatus.Healthy,
 *   uptimeMs: 3600000,
 *   warnings: [],
 *   checkedAt: new Date().toISOString(),
 *   activeSessions: 5,
 * };
 * ```
 */
export const RuntimeHealthSchema = z.object({
  healthy: z.boolean(),
  status: RuntimeHealthStatusSchema.optional(),
  uptimeMs: z.number().int().nonnegative(),
  warnings: z.array(z.string()),
  checkedAt: ISO8601TimestampSchema.optional(),
  message: z.string().optional(),
  activeSessions: z.number().int().nonnegative().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type RuntimeHealth = z.infer<typeof RuntimeHealthSchema>;

