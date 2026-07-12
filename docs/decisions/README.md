# Decisions Index

This index tracks architecture decision records and their status.

Status rules used in this repository:

- Accepted ADRs are part of the repository's documentation evidence.
- Proposed ADRs describe intended or candidate behaviour only. They are not current protocol
  guarantees unless the source code and tests also implement them.

## Accepted ADRs

- [ADR-0002: Model, Speech, and Portable Locale Contracts](./ADR-0002-model-speech-portable-locale.md)
  Status: Accepted
  Date: 2026-07-12
  Scope: context-window tokens, transcript confidence, Portable Locale Profile, and immutable
  provider/model-change records.
- [ADR-0001: Lifecycle Correlation and Idempotency Envelope](./ADR-0001-lifecycle-correlation-idempotency.md)
  Status: Accepted
  Date: 2026-07-12
  Scope: mandatory lifecycle event and operation envelopes, reduced heartbeat observations,
  target representation, and idempotency scope.

## Proposed ADRs

- [ADR-XXXX: Content Surface Preflight Contracts](../ADR-XXXX-runtime-contracts-content-surface-preflight.md)
  Status: Proposed
  Date: 2026-07-12
  Scope: shared contracts for observing, deciding, and receipting content exposure before
  untrusted content is surfaced to an LLM, agent, tool, or memory system.

## Notes

- The current ADR file lives in the `docs/` root rather than under `docs/decisions/`.
- This index links existing records without changing their current status.
