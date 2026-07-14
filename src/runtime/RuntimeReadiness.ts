import { z } from "zod";
import { ISO8601TimestampSchema } from "../utils/Timestamp";

export enum RuntimeReadinessStatus {
  Ready = "ready",
  NotReady = "not_ready",
  Degraded = "degraded",
  Unknown = "unknown",
}

export const RuntimeReadinessStatusSchema = z.enum([
  RuntimeReadinessStatus.Ready,
  RuntimeReadinessStatus.NotReady,
  RuntimeReadinessStatus.Degraded,
  RuntimeReadinessStatus.Unknown,
]);

export const RuntimeDependencyHealthSchema = z.object({
  dependencyId: z.string().min(1),
  status: RuntimeReadinessStatusSchema,
  required: z.boolean().optional(),
  message: z.string().optional(),
});

export type RuntimeDependencyHealth = z.infer<typeof RuntimeDependencyHealthSchema>;

/** Readiness is separate from process health and may report unavailable optional integrations. */
export const RuntimeReadinessSchema = z
  .object({
    ready: z.boolean(),
    status: RuntimeReadinessStatusSchema,
    checkedAt: ISO8601TimestampSchema.optional(),
    reasonCode: z.string().min(1).optional(),
    unavailableIntegrations: z.array(z.string().min(1)).optional(),
    dependencies: z.array(RuntimeDependencyHealthSchema).optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .superRefine((readiness, context) => {
    if (readiness.ready && readiness.status === RuntimeReadinessStatus.NotReady) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["status"], message: "Ready reports cannot use not_ready status" });
    }
    if (!readiness.ready && readiness.status === RuntimeReadinessStatus.Ready) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["status"], message: "Not-ready reports cannot use ready status" });
    }
  });

export type RuntimeReadiness = z.infer<typeof RuntimeReadinessSchema>;
