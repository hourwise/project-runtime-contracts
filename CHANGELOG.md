# Changelog

This changelog records repository changes only where the repository itself provides evidence.
If a published release tag, date, or external release note is not present in the repository,
it is not fabricated here.

## Unreleased

- Added the Stage-A adoption-baseline manifest schema/example/generator, 87-case first-migration
  conformance catalog, packed public-surface verification, and a pinned read-only Ananke consumer
  test. The proposed tag is documented but not created; no package or release is published.
- Recorded the Ananke adapter boundary, content-preflight deferral, and a separate review of six
  development-tool dependency vulnerabilities without changing dependencies.
- Tightened protocol semantic-version syntax and runtime identity range consistency; added an
  agent-specific dual-principal context, delegation correlation requirements, extended portable
  correlation references, compatibility-manifest fixtures, and packed public documentation.
  [ADR-0005](./docs/decisions/ADR-0005-adoption-baseline-release-classification.md)
  classifies these changes as pre-release corrections within the still-unreleased protocol
  `1.4.0`; legacy draft payloads require migration rather than weakened canonical schemas.
- Added implementation-free principal/context, explicit resource-scope, correlation/reference,
  delegation, idempotency, opaque state-handle, readiness, and compatibility-manifest schemas with source-level negative and
  round-trip coverage. No package or protocol release number is claimed by this entry.
- Added a packed-consumer smoke test, minimal CI validation, ownership/migration/distribution
  guidance, and explicit design gates for unresolved cross-repository decisions.
- Added a documentation set for protocol specification, version negotiation, evolution
  policy, ownership boundaries, conformance, glossary terms, and an ADR index.
- Shortened the README so it links to the protocol documentation instead of duplicating it.
- Clarified source/schema discrepancies around event namespaces, audit correlation fields,
  message-ID generation, and binding defaults.
- Normalized documentation to the requested Moirae Code product name while retaining
  `moira` as the stable serialized runtime identifier and recording the source-comment
  naming conflict.
- Reconciled the build plan and roadmap with the implemented, source-tested 1.2.0 surface
  while retaining fixtures and external-consumer evidence as proposed work.
- Added the protocol 1.3.0 lifecycle contract family: mandatory lifecycle correlation and
  idempotency envelopes, lifecycle targets, operation-specific records, core event names, and
  reduced observational heartbeats. Lifecycle execution policy remains external.
- Added protocol 1.4.0 model/speech capability, portable locale, transcript, and immutable
  provider/model-change contracts. Provider selection, recognition, routing, failover, and
  confidence calculation remain external.

## Evidence-Backed History

### Current package state

- [`package.json`](./package.json) currently declares package version `0.4.0`.
- [`src/protocol/ProtocolVersion.ts`](./src/protocol/ProtocolVersion.ts) currently declares
  protocol `1.4.0` with `minimumSupported` `1.0.0`.

### Protocol milestones recorded in repository docs

- `1.4.0` (unreleased): additive model/speech capabilities, portable transcript and locale
  validation, and immutable provider/model-change records.
- `1.3.0` (unreleased): additive lifecycle state, event, operation, target, and heartbeat
  contracts with mandatory lifecycle correlation/idempotency envelopes.
- `1.2.0`: additive contracts for portable skills, execution isolation, and shared runtime
  risk classes. Existing open-ended capability risk strings remain supported.
- `1.1.0`: additive Horae-readiness contracts for runtime capabilities, health status,
  registration, profiles, sessions, events, and runtime composition.
- `1.0.0`: initial shared runtime identity, result, audit, message, and protocol version
  contracts.

Source: [`docs/VERSIONING.md`](./docs/VERSIONING.md)
