import { z } from "zod";
import { RuntimeHealthSchema } from "../runtime/RuntimeHealth";
import { ISO8601TimestampSchema } from "../utils/Timestamp";

const LifecycleIdentifierSchema = z.string().min(1, "Lifecycle identifier is required");

/** Lifecycle states that a producer may report. This package does not define legal transitions. */
export enum RuntimeLifecycleState {
  Created = "CREATED",
  Starting = "STARTING",
  Running = "RUNNING",
  Degraded = "DEGRADED",
  Cancelling = "CANCELLING",
  Terminating = "TERMINATING",
  Terminated = "TERMINATED",
  Recovering = "RECOVERING",
  Failed = "FAILED",
}

/** Zod schema for serialized lifecycle-state values. */
export const RuntimeLifecycleStateSchema = z.enum([
  RuntimeLifecycleState.Created,
  RuntimeLifecycleState.Starting,
  RuntimeLifecycleState.Running,
  RuntimeLifecycleState.Degraded,
  RuntimeLifecycleState.Cancelling,
  RuntimeLifecycleState.Terminating,
  RuntimeLifecycleState.Terminated,
  RuntimeLifecycleState.Recovering,
  RuntimeLifecycleState.Failed,
]);

/** Core lifecycle event names. State carries the resulting lifecycle state. */
export enum RuntimeLifecycleEventName {
  StateChanged = "lifecycle.state_changed",
  CancellationRequested = "lifecycle.cancellation_requested",
  TerminationRequested = "lifecycle.termination_requested",
  TerminationCompleted = "lifecycle.termination_completed",
  RecoveryStarted = "lifecycle.recovery_started",
  RecoveryCompleted = "lifecycle.recovery_completed",
}

/** Zod schema for serialized core lifecycle event names. */
export const RuntimeLifecycleEventNameSchema = z.enum([
  RuntimeLifecycleEventName.StateChanged,
  RuntimeLifecycleEventName.CancellationRequested,
  RuntimeLifecycleEventName.TerminationRequested,
  RuntimeLifecycleEventName.TerminationCompleted,
  RuntimeLifecycleEventName.RecoveryStarted,
  RuntimeLifecycleEventName.RecoveryCompleted,
]);

/**
 * Mandatory identity, correlation, idempotency, and ordering data for lifecycle commands
 * and lifecycle events.
 *
 * `eventId` identifies one immutable emitted record. `idempotencyKey` identifies a requested
 * operation within its documented scope. `sequence` is local to `runtimeInstanceId`; this
 * schema validates its shape but does not enforce monotonicity across records.
 */
export const RuntimeLifecycleEnvelopeSchema = z.object({
  eventId: LifecycleIdentifierSchema,
  runtimeId: LifecycleIdentifierSchema,
  runtimeInstanceId: LifecycleIdentifierSchema,
  correlationId: LifecycleIdentifierSchema,
  causationId: LifecycleIdentifierSchema,
  idempotencyKey: LifecycleIdentifierSchema,
  sequence: z.number().int().nonnegative(),
  occurredAt: ISO8601TimestampSchema,
});

export type RuntimeLifecycleEnvelope = z.infer<typeof RuntimeLifecycleEnvelopeSchema>;

/**
 * Stable target of a lifecycle command or operation.
 *
 * A target always identifies a logical runtime and must also identify an instance, session,
 * task, or execution. The schema does not determine which target form a lifecycle engine
 * should use.
 */
export const RuntimeLifecycleTargetSchema = z
  .object({
    runtimeId: LifecycleIdentifierSchema,
    runtimeInstanceId: LifecycleIdentifierSchema.optional(),
    sessionId: LifecycleIdentifierSchema.optional(),
    taskId: LifecycleIdentifierSchema.optional(),
    executionId: LifecycleIdentifierSchema.optional(),
  })
  .refine(
    (target) =>
      target.runtimeInstanceId !== undefined ||
      target.sessionId !== undefined ||
      target.taskId !== undefined ||
      target.executionId !== undefined,
    { message: "Lifecycle target requires an instance, session, task, or execution identifier" },
  );

export type RuntimeLifecycleTarget = z.infer<typeof RuntimeLifecycleTargetSchema>;

/** Minimal stable reference to the actor that requested a lifecycle command. */
export const RuntimeActorReferenceSchema = z.object({
  id: LifecycleIdentifierSchema,
  name: z.string().optional(),
  kind: z.string().optional(),
});

export type RuntimeActorReference = z.infer<typeof RuntimeActorReferenceSchema>;

/** Immutable lifecycle event record. `previousState` is optional because a producer may not retain it. */
export const RuntimeLifecycleEventSchema = RuntimeLifecycleEnvelopeSchema.extend({
  eventName: RuntimeLifecycleEventNameSchema,
  previousState: RuntimeLifecycleStateSchema.optional(),
  state: RuntimeLifecycleStateSchema,
  reasonCode: z.string().optional(),
  message: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type RuntimeLifecycleEvent = z.infer<typeof RuntimeLifecycleEventSchema>;

/** Cancellation modes describe the requested urgency; they do not prescribe cancellation behaviour. */
export enum RuntimeCancellationMode {
  Graceful = "GRACEFUL",
  Immediate = "IMMEDIATE",
}

export const RuntimeCancellationModeSchema = z.enum([
  RuntimeCancellationMode.Graceful,
  RuntimeCancellationMode.Immediate,
]);

/** Immutable cancellation command record. */
export const RuntimeCancellationRecordSchema = RuntimeLifecycleEnvelopeSchema.extend({
  cancellationId: LifecycleIdentifierSchema,
  target: RuntimeLifecycleTargetSchema,
  requestedAt: ISO8601TimestampSchema,
  requestedBy: RuntimeActorReferenceSchema,
  mode: RuntimeCancellationModeSchema,
  reasonCode: z.string().optional(),
});

export type RuntimeCancellationRecord = z.infer<typeof RuntimeCancellationRecordSchema>;

/** Outcomes reported for a termination operation. */
export enum RuntimeTerminationOutcome {
  Requested = "REQUESTED",
  Completed = "COMPLETED",
  Failed = "FAILED",
  TimedOut = "TIMED_OUT",
}

export const RuntimeTerminationOutcomeSchema = z.enum([
  RuntimeTerminationOutcome.Requested,
  RuntimeTerminationOutcome.Completed,
  RuntimeTerminationOutcome.Failed,
  RuntimeTerminationOutcome.TimedOut,
]);

/** Immutable termination operation record. */
export const RuntimeTerminationRecordSchema = RuntimeLifecycleEnvelopeSchema.extend({
  terminationId: LifecycleIdentifierSchema,
  target: RuntimeLifecycleTargetSchema,
  initiatedAt: ISO8601TimestampSchema,
  completedAt: ISO8601TimestampSchema.optional(),
  outcome: RuntimeTerminationOutcomeSchema,
  reasonCode: z.string().optional(),
});

export type RuntimeTerminationRecord = z.infer<typeof RuntimeTerminationRecordSchema>;

/** Outcomes reported for a recovery operation. */
export enum RuntimeRecoveryOutcome {
  Started = "STARTED",
  Recovered = "RECOVERED",
  Failed = "FAILED",
  Abandoned = "ABANDONED",
}

export const RuntimeRecoveryOutcomeSchema = z.enum([
  RuntimeRecoveryOutcome.Started,
  RuntimeRecoveryOutcome.Recovered,
  RuntimeRecoveryOutcome.Failed,
  RuntimeRecoveryOutcome.Abandoned,
]);

/** Immutable recovery operation record. */
export const RuntimeRecoveryRecordSchema = RuntimeLifecycleEnvelopeSchema.extend({
  recoveryId: LifecycleIdentifierSchema,
  target: RuntimeLifecycleTargetSchema,
  recoveryAttempt: z.number().int().nonnegative(),
  startedAt: ISO8601TimestampSchema,
  completedAt: ISO8601TimestampSchema.optional(),
  outcome: RuntimeRecoveryOutcomeSchema,
  recoveredFromInstanceId: LifecycleIdentifierSchema.optional(),
});

export type RuntimeRecoveryRecord = z.infer<typeof RuntimeRecoveryRecordSchema>;

/**
 * High-frequency lifecycle observation. Heartbeats intentionally do not use the full command
 * envelope: their local identity and ordering are `heartbeatId`, `runtimeInstanceId`, and
 * `heartbeatSequence`.
 */
export const RuntimeHeartbeatSchema = z.object({
  heartbeatId: LifecycleIdentifierSchema,
  runtimeId: LifecycleIdentifierSchema,
  runtimeInstanceId: LifecycleIdentifierSchema,
  correlationId: LifecycleIdentifierSchema,
  heartbeatSequence: z.number().int().nonnegative(),
  observedAt: ISO8601TimestampSchema,
  lifecycleState: RuntimeLifecycleStateSchema,
  health: RuntimeHealthSchema,
  probeId: LifecycleIdentifierSchema.optional(),
  causationId: LifecycleIdentifierSchema.optional(),
});

export type RuntimeHeartbeat = z.infer<typeof RuntimeHeartbeatSchema>;
