import { z } from "zod";
import { ISO8601TimestampSchema } from "../utils/Timestamp";

/**
 * Core runtime event types defined by the protocol.
 *
 * Core events are namespaced with a "." separator (e.g., "approval.granted").
 * Runtimes may emit extension events using a custom namespace prefix (e.g., "custom.my_event").
 *
 * Extension policy:
 * - Third-party runtimes may define custom event types by prefixing with a unique namespace.
 * - Core protocol events are reserved and must not be overridden.
 * - Extensions must use reverse-DNS or similar namespacing to avoid collisions
 *   (e.g., "com.example.event" for events from example.com).
 * - Unknown event types should be treated as valid but may be ignored by receivers.
 *
 * @see {@link RuntimeEvent} for the full event schema including custom event support.
 */
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
  LifecycleStateChanged = "lifecycle.state_changed",
  LifecycleCancellationRequested = "lifecycle.cancellation_requested",
  LifecycleTerminationRequested = "lifecycle.termination_requested",
  LifecycleTerminationCompleted = "lifecycle.termination_completed",
  LifecycleRecoveryStarted = "lifecycle.recovery_started",
  LifecycleRecoveryCompleted = "lifecycle.recovery_completed",
  ProviderModelChanged = "provider.model_changed",
}

/** Zod schema for core runtime event types. */
export const RuntimeEventTypeSchema = z.enum([
  RuntimeEventType.ApprovalDenied,
  RuntimeEventType.ApprovalGranted,
  RuntimeEventType.AuditCompleted,
  RuntimeEventType.CapabilityHidden,
  RuntimeEventType.CapabilityRegistered,
  RuntimeEventType.CapabilityExposed,
  RuntimeEventType.GatewayUnavailable,
  RuntimeEventType.MemoryUpdated,
  RuntimeEventType.PolicyChanged,
  RuntimeEventType.ProfileActivated,
  RuntimeEventType.RuntimeHealthChanged,
  RuntimeEventType.RuntimeRegistered,
  RuntimeEventType.SessionEnded,
  RuntimeEventType.SessionStarted,
  RuntimeEventType.LifecycleStateChanged,
  RuntimeEventType.LifecycleCancellationRequested,
  RuntimeEventType.LifecycleTerminationRequested,
  RuntimeEventType.LifecycleTerminationCompleted,
  RuntimeEventType.LifecycleRecoveryStarted,
  RuntimeEventType.LifecycleRecoveryCompleted,
  RuntimeEventType.ProviderModelChanged,
]);

/**
 * Event reporting a fact that has already occurred in a runtime.
 *
 * Events are immutable, declarative records (unlike messages which are imperative).
 * Events may be correlated across runtimes using `correlationId` and grouped within
 * a `sessionId`.
 *
 * Event types:
 * - Core event types are defined in {@link RuntimeEventType}.
 * - Extension events use custom namespace prefixes (e.g., "com.example.event").
 * - Unknown event types are valid and must not cause validation failures.
 *
 * @property id - Unique event identifier (required).
 * @property type - Event type: core type or extension namespace (required).
 * @property timestamp - ISO 8601 UTC/offset timestamp of when the event occurred.
 * @property sourceRuntime - Runtime identifier that emitted this event (required).
 * @property targetRuntime - Runtime that this event was addressed to (optional).
 * @property sessionId - Session identifier for correlation within a session.
 * @property correlationId - Correlation identifier for linking related events.
 * @property payload - Event-specific data; structure depends on event type.
 *
 * @example
 * ```ts
 * const event: RuntimeEvent = {
 *   id: "evt-123",
 *   type: "approval.granted",
 *   timestamp: new Date().toISOString(),
 *   sourceRuntime: "ananke",
 *   targetRuntime: "horae",
 *   sessionId: "session-456",
 *   correlationId: "corr-789",
 *   payload: { approvalId: "appr-001", reason: "auto_approved" },
 * };
 * ```
 */
export const RuntimeEventSchema = z.object({
  id: z.string().min(1, "Event id is required"),
  type: z.string().min(1, "Event type is required"),
  timestamp: ISO8601TimestampSchema,
  sourceRuntime: z.string().min(1, "Source runtime is required"),
  targetRuntime: z.string().optional(),
  sessionId: z.string().optional(),
  correlationId: z.string().optional(),
  requestId: z.string().min(1).optional(),
  causationId: z.string().min(1).optional(),
  actionId: z.string().min(1).optional(),
  approvalReference: z.string().min(1).optional(),
  delegationReference: z.string().min(1).optional(),
  auditReference: z.string().min(1).optional(),
  payload: z.record(z.unknown()).optional(),
});

export type RuntimeEvent = z.infer<typeof RuntimeEventSchema>;
