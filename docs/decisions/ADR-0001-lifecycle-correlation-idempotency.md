# ADR-0001: Lifecycle Correlation and Idempotency Envelope

- **Status:** Accepted
- **Date:** 2026-07-12
- **Decision owners:** Project Runtime Contracts maintainers
- **Applies to:** Protocol 1.3.0 lifecycle records

## Context

The lifecycle roadmap requires records for lifecycle observations, cancellation, termination,
recovery, and heartbeat reporting. The shared package needs sufficient common information for
consumers to identify a runtime instance, correlate distributed activity, deduplicate emitted
records, detect duplicate requested operations, and interpret local ordering without owning a
lifecycle engine.

## Decision

`RuntimeLifecycleEvent`, `RuntimeCancellationRecord`, `RuntimeTerminationRecord`, and
`RuntimeRecoveryRecord` must include `RuntimeLifecycleEnvelope`:

- `eventId`
- `runtimeId`
- `runtimeInstanceId`
- `correlationId`
- `causationId`
- `idempotencyKey`
- `sequence`
- `occurredAt`

These fields have distinct purposes:

- `eventId` identifies and deduplicates one immutable emitted record.
- `idempotencyKey` identifies a requested lifecycle operation within its documented scope.
- `correlationId` groups wider related activity.
- `causationId` identifies the immediate command or event that produced a record.
- `sequence` declares local ordering within one runtime instance.

`RuntimeLifecycleTarget` must contain `runtimeId` and at least one of `runtimeInstanceId`,
`sessionId`, `taskId`, or `executionId`.

Cancellation, termination, and recovery records also require stable operation identifiers:
`cancellationId`, `terminationId`, and `recoveryId` respectively.

`RuntimeHeartbeat` uses a reduced observational envelope: `heartbeatId`, `runtimeId`,
`runtimeInstanceId`, `correlationId`, `heartbeatSequence`, `observedAt`, `lifecycleState`,
and `health`. It may include `probeId` and `causationId`; it does not require a command
`idempotencyKey`.

The default idempotency scope is:

```text
runtimeId + runtimeInstanceId + lifecycle operation type + idempotencyKey
```

For commands that must survive an instance replacement, the lifecycle engine must instead
scope the operation using a stable target identifier such as `sessionId`, `taskId`, or
`executionId`.

## Consequences

- Lifecycle schemas reject records that omit a required envelope field or lack a stable
  target reference.
- The core `RuntimeEventType` vocabulary includes lifecycle event names, but generic
  `RuntimeEvent` payloads remain open. A consumer requiring the lifecycle envelope must
  validate `RuntimeLifecycleEvent` directly.
- Closed lifecycle state, event-name, outcome, and cancellation-mode values reject unknown
  serialized values.
- The contracts do not guarantee globally unique IDs, enforce sequence monotonicity across
  records, deduplicate storage, decide valid state transitions, persist records, retry
  commands, or execute lifecycle operations.

## Evidence

- [`src/lifecycle/RuntimeLifecycle.ts`](../../src/lifecycle/RuntimeLifecycle.ts)
- [`src/lifecycle/RuntimeLifecycle.test.ts`](../../src/lifecycle/RuntimeLifecycle.test.ts)
- [`docs/protocol-specification.md`](../protocol-specification.md)
