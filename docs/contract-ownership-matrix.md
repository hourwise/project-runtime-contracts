# Canonical contract ownership matrix

This matrix assigns the meaning of each consolidated cross-runtime shape without moving
domain policy into this package. A schema here describes portable representation; the
semantic owner decides whether a record is accepted, authorized, retried, or acted upon.

| Contract family | Producer | Consumer | Semantic owner | Current status |
| --- | --- | --- | --- | --- |
| `PrincipalIdentity`, `ExecutionContext` | host/runtime at request creation | runtimes, audit tooling | host/product identity boundary; policy remains external | implemented schema, source-tested |
| `ResourceScope` | delegating runtime or host | policy runtime and receiving runtime | policy owner (Ananke for governed actions) | implemented schema, wildcard semantics intentionally deferred |
| `CorrelationContext`, references | emitting runtime | peers, audit tooling | shared representation here; ID generation remains producer-owned | implemented schema, source-tested |
| idempotency declarations and state-handle references | operation/state owner | peers and audit tooling | Ananke for replay enforcement; Horae for workflow state | portable declarations only; no storage or replay implementation |
| `DelegationRequest`, `DelegationDescriptor` | host/delegating authority | receiving runtime, audit tooling | Ananke for action authority; credential lifecycle remains external | implemented descriptor, no minting or enforcement |
| `Capability`, readiness, registration | runtime | discovery/host/orchestrator | producing runtime for availability; this repository for shape | additive fields implemented |
| `CompatibilityManifest` | runtime/package publisher | host, registry, conformance tooling | this repository for representation; publication authority is open | implemented schema, source-tested |
| `RuntimeComposition` | orchestration layer | participating runtimes | Horae for composition semantics | existing shared shape; Horae adoption pending |
| context packs, memory records, reliability | Mnemosyne | host/orchestrator and consumers | Mnemosyne | not implemented here |
| action outcomes | Ananke | host and audit consumers | Ananke | generic `Result<T>` only here |
| host/product behaviour | Moirae Code | users and product integrations | Moirae Code | not implemented here |

## Non-ownership boundaries

This package does not authenticate principals, issue or verify grants, store credentials,
select a capability, execute an action, choose a provider, persist a session, canonicalize
paths or serialization order, or define MCP transport behaviour.

## Adoption status

The sibling repositories reviewed for this consolidation use local schema packages and do
not yet import this package. Adoption therefore requires an explicit downstream migration
and compatibility review; the matrix is not evidence that those repositories are current
consumers.

## Open questions

- Whether a host or Horae owns cross-runtime `ExecutionContext` creation.
- Whether Ananke's action outcome vocabulary should ever be mirrored here.
- Whether a shared content-preflight receipt belongs to this package or remains split
  between Ananke policy and Mnemosyne provenance.
