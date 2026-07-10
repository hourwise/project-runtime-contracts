import { z } from "zod";

export enum RuntimeHealthStatus {
  Healthy = "healthy",
  Busy = "busy",
  ReadOnly = "read_only",
  Updating = "updating",
  Unavailable = "unavailable",
  Degraded = "degraded",
}

export const RuntimeHealthStatusSchema = z.nativeEnum(RuntimeHealthStatus);

export const RuntimeHealthSchema = z.object({
  healthy: z.boolean(),
  status: RuntimeHealthStatusSchema.optional(),
  uptimeMs: z.number(),
  warnings: z.array(z.string()),
  checkedAt: z.string().optional(),
  message: z.string().optional(),
  activeSessions: z.number().int().nonnegative().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type RuntimeHealth = z.infer<typeof RuntimeHealthSchema>;

