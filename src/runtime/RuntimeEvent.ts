import { z } from "zod";

export enum RuntimeEventType {
  ApprovalDenied = "approval.denied",
  ApprovalGranted = "approval.granted",
  AuditCompleted = "audit.completed",
  CapabilityHidden = "capability.hidden",
  CapabilityRegistered = "capability.registered",
  CapabilityExposed = "capability.exposed",
  GatewayUnavailable = "gateway.unavailable",
  MemoryUpdated = "memory.updated",
  PolicyChanged = "policy.changed",
  ProfileActivated = "profile.activated",
  RuntimeHealthChanged = "runtime.health_changed",
  RuntimeRegistered = "runtime.registered",
  SessionEnded = "session.ended",
  SessionStarted = "session.started",
}

export const RuntimeEventTypeSchema = z.nativeEnum(RuntimeEventType);

export const RuntimeEventSchema = z.object({
  id: z.string(),
  type: RuntimeEventTypeSchema.or(z.string()),
  timestamp: z.string(),
  sourceRuntime: z.string(),
  targetRuntime: z.string().optional(),
  sessionId: z.string().optional(),
  correlationId: z.string().optional(),
  payload: z.record(z.unknown()).optional(),
});

export type RuntimeEvent = z.infer<typeof RuntimeEventSchema>;
