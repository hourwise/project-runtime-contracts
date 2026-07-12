import { describe, expect, it } from "vitest";
import {
  RuntimeCancellationMode,
  RuntimeCancellationRecordSchema,
  RuntimeHeartbeatSchema,
  RuntimeLifecycleEventName,
  RuntimeLifecycleEventNameSchema,
  RuntimeLifecycleEventSchema,
  RuntimeLifecycleState,
  RuntimeLifecycleStateSchema,
  RuntimeLifecycleTargetSchema,
  RuntimeRecoveryOutcome,
  RuntimeRecoveryRecordSchema,
  RuntimeTerminationOutcome,
  RuntimeTerminationRecordSchema,
} from "./RuntimeLifecycle";

const envelope = {
  eventId: "evt-001",
  runtimeId: "worker",
  runtimeInstanceId: "worker-instance-001",
  correlationId: "corr-001",
  causationId: "cmd-001",
  idempotencyKey: "retry-001",
  sequence: 7,
  occurredAt: "2026-07-12T12:00:00Z",
};

const target = {
  runtimeId: "worker",
  runtimeInstanceId: "worker-instance-001",
};

describe("lifecycle value schemas", () => {
  it("accepts every declared state and core event name", () => {
    for (const state of Object.values(RuntimeLifecycleState)) {
      expect(RuntimeLifecycleStateSchema.parse(state)).toBe(state);
    }

    for (const eventName of Object.values(RuntimeLifecycleEventName)) {
      expect(RuntimeLifecycleEventNameSchema.parse(eventName)).toBe(eventName);
    }
  });

  it("rejects unsupported states and event names", () => {
    expect(() => RuntimeLifecycleStateSchema.parse("STOPPED")).toThrow();
    expect(() => RuntimeLifecycleEventNameSchema.parse("lifecycle.retrying")).toThrow();
  });
});

describe("RuntimeLifecycleEventSchema", () => {
  const event = {
    ...envelope,
    eventName: RuntimeLifecycleEventName.StateChanged,
    previousState: RuntimeLifecycleState.Starting,
    state: RuntimeLifecycleState.Running,
  };

  it("requires the full correlation and idempotency envelope", () => {
    expect(RuntimeLifecycleEventSchema.parse(event)).toEqual(event);

    for (const field of Object.keys(envelope)) {
      const incomplete = { ...event } as Record<string, unknown>;
      delete incomplete[field];
      expect(() => RuntimeLifecycleEventSchema.parse(incomplete)).toThrow();
    }
  });

  it("allows an event without a retained previous state", () => {
    const { previousState: _previousState, ...withoutPreviousState } = event;
    expect(RuntimeLifecycleEventSchema.parse(withoutPreviousState)).toEqual(withoutPreviousState);
  });

  it("round-trips JSON-compatible lifecycle data", () => {
    expect(RuntimeLifecycleEventSchema.parse(JSON.parse(JSON.stringify(event)))).toEqual(event);
  });
});

describe("RuntimeLifecycleTargetSchema", () => {
  it("requires a stable target identifier beyond runtimeId", () => {
    expect(RuntimeLifecycleTargetSchema.parse(target)).toEqual(target);
    expect(RuntimeLifecycleTargetSchema.parse({ runtimeId: "worker", sessionId: "sess-001" })).toEqual({
      runtimeId: "worker",
      sessionId: "sess-001",
    });
    expect(() => RuntimeLifecycleTargetSchema.parse({ runtimeId: "worker" })).toThrow();
  });
});

describe("lifecycle operation records", () => {
  it("requires envelope, operation, and target data for cancellation", () => {
    const cancellation = {
      ...envelope,
      cancellationId: "cancel-001",
      target,
      requestedAt: "2026-07-12T12:00:01Z",
      requestedBy: { id: "operator-001", kind: "user" },
      mode: RuntimeCancellationMode.Graceful,
    };
    expect(RuntimeCancellationRecordSchema.parse(cancellation)).toEqual(cancellation);
    expect(() => RuntimeCancellationRecordSchema.parse({ ...cancellation, idempotencyKey: "" })).toThrow();
    expect(() => RuntimeCancellationRecordSchema.parse({ ...cancellation, cancellationId: undefined })).toThrow();
    expect(() => RuntimeCancellationRecordSchema.parse({ ...cancellation, target: { runtimeId: "worker" } })).toThrow();
  });

  it("represents requested and completed termination records without a transition engine", () => {
    const requested = {
      ...envelope,
      terminationId: "term-001",
      target,
      initiatedAt: "2026-07-12T12:00:01Z",
      outcome: RuntimeTerminationOutcome.Requested,
    };
    const completed = {
      ...requested,
      eventId: "evt-002",
      sequence: 8,
      completedAt: "2026-07-12T12:00:03Z",
      outcome: RuntimeTerminationOutcome.Completed,
    };
    expect(RuntimeTerminationRecordSchema.parse(requested)).toEqual(requested);
    expect(RuntimeTerminationRecordSchema.parse(completed)).toEqual(completed);
    expect(() => RuntimeTerminationRecordSchema.parse({ ...requested, terminationId: undefined })).toThrow();
  });

  it("represents recovery attempts and rejects non-integer attempts", () => {
    const recovery = {
      ...envelope,
      recoveryId: "recovery-001",
      target,
      recoveryAttempt: 0,
      startedAt: "2026-07-12T12:00:01Z",
      outcome: RuntimeRecoveryOutcome.Started,
      recoveredFromInstanceId: "worker-instance-000",
    };
    expect(RuntimeRecoveryRecordSchema.parse(recovery)).toEqual(recovery);
    expect(() => RuntimeRecoveryRecordSchema.parse({ ...recovery, recoveryAttempt: 0.5 })).toThrow();
    expect(() => RuntimeRecoveryRecordSchema.parse({ ...recovery, recoveryId: undefined })).toThrow();
  });
});

describe("RuntimeHeartbeatSchema", () => {
  const heartbeat = {
    heartbeatId: "heartbeat-001",
    runtimeId: "worker",
    runtimeInstanceId: "worker-instance-001",
    correlationId: "corr-001",
    heartbeatSequence: 12,
    observedAt: "2026-07-12T12:00:05Z",
    lifecycleState: RuntimeLifecycleState.Running,
    health: { healthy: true, uptimeMs: 5000, warnings: [] },
  };

  it("uses the reduced observational envelope", () => {
    expect(RuntimeHeartbeatSchema.parse(heartbeat)).toEqual(heartbeat);
    expect(() => RuntimeHeartbeatSchema.parse({ ...heartbeat, heartbeatSequence: -1 })).toThrow();
    expect(() => RuntimeHeartbeatSchema.parse({ ...heartbeat, correlationId: "" })).toThrow();
  });

  it("allows optional probe causation without requiring a command idempotency key", () => {
    const probed = { ...heartbeat, probeId: "probe-001", causationId: "probe-command-001" };
    expect(RuntimeHeartbeatSchema.parse(probed)).toEqual(probed);
    expect("idempotencyKey" in RuntimeHeartbeatSchema.parse(heartbeat)).toBe(false);
  });
});
