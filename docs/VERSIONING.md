# Versioning Notes

Project Adrasteia is the project identity for the Fates Runtime Protocol. This page describes
the versioning of its current `project-runtime-contracts` package and protocol contracts.

This is a concise history and navigation page. The detailed compatibility algorithm is in
[version negotiation](./version-negotiation.md), and the change-classification policy is in
[evolution policy](./evolution-policy.md).

The npm package version and `ProtocolVersion` are separate. The negotiation helpers accept
numeric `major.minor.patch` values. In the established policy, breaking protocol changes
need a major protocol-version bump, minor changes are intended to be additive, and patches
are documentation or other non-behavioural changes. Widening an existing closed enum is not
automatically additive; it requires the explicit compatibility review described in the
evolution policy.

When a protocol version changes, update `src/protocol/ProtocolVersion.ts` and add an
evidence-backed entry to this history and [`CHANGELOG.md`](../CHANGELOG.md).

## Protocol History

- `1.4.0` (unreleased): additive model/speech capabilities, portable transcript and locale
  validation, and immutable provider/model-change records.
- `1.3.0` (unreleased): additive lifecycle state, event, operation, target, and heartbeat
  contracts. Lifecycle events and operations use a mandatory correlation/idempotency envelope;
  heartbeats use a reduced observational envelope.
- `1.2.0`: Additive contracts for portable skills, execution isolation, and shared runtime
  risk classes. Existing open-ended capability risk strings remain supported.
- `1.1.0`: Additive Horae-readiness contracts for runtime capabilities, health status,
  registration, profiles, sessions, events, and runtime composition.
- `1.0.0`: Initial shared runtime identity, result, audit, message, and protocol version
  contracts.

## Migration Notes

### 1.2.0

- No existing payload changes are required.
- Consumers may adopt `RuntimeSkill`, `ExecutionEnvironment`, and `RuntimeRiskClass`
  incrementally.
- `Capability.riskClass` remains an open-ended legacy field in 1.x. New contracts use the
  shared `RuntimeRiskClass` vocabulary; no consumer must migrate until a future major
  release.
