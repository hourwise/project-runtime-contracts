# Design gates and unresolved decisions

Project Adrasteia owns the portable contract surface and structural validation. These gates do
not transfer runtime authority from Ananke or any other semantic owner.

The following items remain deliberately open. They must be decided by the named owner
before a future change turns them into normative protocol behaviour.

- **Package scope and publication:** current package name is `project-runtime-contracts`;
  scoped publication ownership is not assigned.
- **Content preflight:** Ananke `1e38e458` implements local observation, access request,
  decision, approval-binding, and receipt types plus gateway policy. Horae `80bba3a8` and
  Moirae Code `e3a99c09` contain proposals; Mnemosyne `c5d3ed08` exposes no matching shared
  contract. A minimal hash/source/destination/correlation transport envelope may be portable,
  but ownership of decision reasons, admission, provenance, expiry, and receipt semantics
  requires a cross-repository decision before this package exports a schema.
- **Horae session context:** `ExecutionContext` is a portable shape, not a decision that
  Horae creates or owns every session across runtimes.
- **Wildcard scopes:** no wildcard language or safety semantics are accepted.
- **Action outcomes:** Ananke owns domain outcome meaning; this package keeps `Result<T>`
  generic.
- **Negotiation sequencing:** the helpers are symmetric, but deployment ownership of
  host-led negotiation and its ordering relative to discovery is open.
- **Unknown union variants and new enum members:** receiving behaviour is not silently
  defined by this package; each owner must decide whether to reject, preserve, or ignore.
- **Correlation generation and canonicalization:** producers own generation; no shared
  uniqueness, canonical ordering, or serialization-order rule is defined.
- **Idempotency vocabulary:** `none`, `single_use`, and `bounded_replay` are portable
  declaration values for this working tree; Ananke must confirm their final safety and
  replay semantics before treating them as an enforcement contract.

## Closed gate: release classification

Strict semantic versions, identity-range consistency, agent-only delegation, required
delegation correlation, scope invariants, and manifest consistency are accepted as pre-release
corrections within unreleased protocol `1.4.0`. No public tag, npm publication, prior immutable
artifact, or established downstream package dependency was found. See
[ADR-0005](./decisions/ADR-0005-adoption-baseline-release-classification.md).

## Content-preflight review decision

What can be standardized now is limited to already-generic primitives: opaque content hashes
or references, producer/destination identifiers, principal/session/project/tenant context, and
correlation/audit references. No dedicated content-preflight schema is added in this pass.

- Ananke continues to own scan-evidence interpretation, policy decisions, approval binding,
  exposure reason codes, and enforcement.
- Mnemosyne continues to own provenance, reliability, memory admission, and context-pack
  semantics.
- Horae may later own routing/order policy, but its reviewed content-preflight ADR is proposed.
- Moirae Code owns presentation and approval UX, not the portable decision meaning.

Before later content-preflight adoption, the owners must agree on which fields are neutral
transport, whether a receipt is authoritative or referential, expiry/staleness rules, destination
and admission semantics, and how unknown decision values are handled. This gate does not block
adoption of identity, scope, correlation, delegation, registration, readiness, health, or
negotiation. Until the content-specific decision is accepted, copying Ananke's local contract
here would create a competing canonical policy surface.
