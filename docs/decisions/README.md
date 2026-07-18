# Decisions Index

This index tracks architecture decision records and their status.

Status rules used in this repository:

- Accepted ADRs are part of the repository's documentation evidence.
- Proposed ADRs describe intended or candidate behaviour only. They are not current protocol
  guarantees unless the source code and tests also implement them.

## Accepted ADRs

- [ADR-0006: Project Adrasteia Identity](./ADR-0006-project-adrasteia-identity.md)
  Status: Accepted
  Date: 2026-07-17
  Scope: canonical project/repository/protocol naming and authority boundary.
- [ADR-0005: Adoption Baseline Release Classification](./ADR-0005-adoption-baseline-release-classification.md)
  Status: Accepted
  Date: 2026-07-17
  Scope: classifies the tightened, unreleased protocol 1.4 validators as pre-release
  corrections and defines the first immutable Stage-A adoption baseline boundary.
- [ADR-0004: Project Adrasteia Ownership of Runtime Contracts for Dual-Principal Delegation and Compatibility](./ADR-0004-runtime-contracts-ownership-dual-principal-delegation-compatibility.md)
  Status: Accepted (partially implemented; downstream adoption and composed tests pending)
  Date: 2026-07-14
  Scope: canonical portable principal, delegation, compatibility, idempotency, and state-handle
  contracts without credential, policy, workflow, or persistence implementation.
- [ADR-0003: Dual-Principal Identity, Scoped MCP Delegation, and Cross-Runtime Compatibility](./ADR-0003-dual-principal-identity-scoped-mcp-delegation.md)
  Status: Accepted (partially implemented; enforcement and downstream adoption pending)
  Date: 2026-07-13
  Scope: dual-principal identity, scoped MCP delegation, credential-broker boundaries, and
  cross-repository compatibility requirements.
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
