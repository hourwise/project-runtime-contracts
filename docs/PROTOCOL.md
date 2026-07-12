# Protocol Overview

This page is a navigation summary, not a second protocol specification. The public surface
is defined by the exports in [`src/index.ts`](../src/index.ts); the detailed, evidence-based
description is in [protocol specification](./protocol-specification.md).

- `RuntimeIdentity`, `RuntimeRegistration`, `Capability`, `RuntimeHealth`, and
  `RuntimeProfile` are implemented shared record shapes. Their use in discovery, policy,
  or execution is not imposed by this package.
- `RuntimeMessage`, `RuntimeEvent`, `Result<T>`, `RuntimeError`, and `AuditEvent` are
  implemented envelope or record shapes. This package does not define transport, message
  ordering, delivery, retry, or domain outcome semantics.
- `RuntimeSession` and `RuntimeComposition` represent session and composition data. They do
  not perform orchestration or determine capability exposure.
- `RuntimeLifecycleEvent`, lifecycle operation records, and `RuntimeHeartbeat` represent
  correlated lifecycle data. They do not implement a state machine, idempotency store, retry
  system, or lifecycle executor.
- Model/speech capability profiles, portable transcript records, and provider/model-change
  events represent declarations and observed changes. They do not select models, recognize
  speech, calculate confidence, route requests, or perform failover.
- `ProtocolVersion` and the compatibility helpers represent and compare supported protocol
  ranges. No standard wire negotiation exchange is implemented.

For the rules that govern changes, see [evolution policy](./evolution-policy.md). For
implemented versus proposed third-party evidence, see [conformance](./conformance.md).
