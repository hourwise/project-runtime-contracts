# Downstream migration guide

This is an adoption checklist for Ananke, Mnemosyne, Horae, Moirae Code, or another peer.
It is not a claim that any peer has already migrated.

1. Inventory local runtime-contracts schemas and map each one to the ownership matrix.
2. Add the package as an explicit dependency in the downstream repository; retain local
   domain schemas where this package is intentionally non-owning.
3. Start with additive envelopes: `PrincipalIdentity`/`ExecutionContext`,
   `CorrelationContext`, `ResourceScope`, readiness, and compatibility manifests.
4. Keep domain meanings local: Ananke action outcomes, Mnemosyne context packs and
   reliability, Horae composition policy, and Moirae product behaviour are not replaced by
   generic fields.
5. Run positive, negative, unknown-field, unknown-enum, and JSON round-trip tests against
   the adopted schemas. Verify the negotiated range before sending a payload that uses a
   newer optional field.
6. Record the downstream commit, package version, protocol range, and any unsupported
   capability in `testedPeers` or release documentation.

## Compatibility cautions

- Existing sibling packages currently contain duplicate local schemas; replacing them is
  a breaking downstream change and requires an owner-approved migration.
- `ResourceScope` has explicit `bounded` and `unscoped` modes. Wildcard semantics are not
  defined and wildcard values are rejected by the portable profile.
- Correlation identifiers are required by `CorrelationContext`, but this package does not
  generate, deduplicate, persist, or globally validate them.
- A delegation descriptor is evidence of a grant-shaped record, not a credential or an
  authorization decision.

## Ananke

- Import shared identity, `AgentExecutionContext`, `ResourceScope`, correlation, registration,
  readiness, health, protocol, and delegation/reference schemas from the canonical package.
- Adapt Ananke's current `ExecutionIdentity`, string `resourceScope`, and local content-preflight
  shapes at its boundary; do not copy Ananke policy decisions or reason-code semantics here.
- Keep Ananke's `Outcome`, approvals, canonical action hashing, policy evaluation, credential
  brokering, and execution audit authoritative in Ananke.
- Follow the exact classification and field mappings in the
  [Ananke adapter report](./ananke-adapter-report.md). Content-preflight migration is deferred and
  does not block the listed portable families.

## Mnemosyne

- Import shared principal/context, runtime registration, readiness, protocol, correlation,
  tenant/project/session references, and any future accepted preflight transport envelope.
- Keep reliability, provenance scoring, conflict handling, retrieval, admission, and context-pack
  internals in Mnemosyne. A remembered approval remains evidence, not current authority.
- Its reviewed commit exposes no dependency on this package and reports `protocolVersion:
  "unknown"` in testbench evidence, so adoption begins with an explicit manifest and adapter.

## Horae

- Replace local identity, registration, protocol, health, capability, lifecycle, session, and
  event primitives only after an owner-approved mapping to the canonical exports.
- Replace exact `0.1.0` equality in `RuntimeRegistry.negotiateProtocol` with range negotiation
  and record an incompatibility result; do not import Horae orchestration state or transition
  logic into this package.
- Confirm whether each local session field is portable application context or Horae-owned
  orchestration state before migrating it.

## Moirae Code

- Remove or rename the duplicated private `@moirae/runtime-contracts` workspace package after
  consumers compile against the canonical packed artifact.
- Retain only Moirae Code host, IDE, supervisor, provider-adapter, sandbox, and packaging
  contracts locally.
- Negotiate supported protocol and transport declarations instead of assuming endpoint support;
  preserve host UX and credential custody as Moirae Code responsibilities.
