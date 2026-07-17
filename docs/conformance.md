# Conformance

This document separates what the repository already tests from additional evidence a
third-party implementation should provide when claiming compatibility.

## Conformance Goal

A compatible implementation should be able to:

- parse and emit the shared contract shapes it claims to support;
- negotiate protocol versions using the same compatibility rules;
- preserve required identifiers and timestamps;
- respect the closed-versus-open value boundaries defined by the public schemas;
- serialize and deserialize payloads without changing meaning;
- handle generic success and error outcomes consistently.

## Evidence Required For A Compatibility Claim

Minimum evidence a third party should provide:

1. Schema validation against every adopted public contract.
2. Version-negotiation tests proving the same compatibility outcomes as the repository
   helpers in [`src/protocol/ProtocolCompatibility.ts`](../src/protocol/ProtocolCompatibility.ts).
3. Identifier tests proving required IDs are present where the shared schema requires them.
4. Timestamp tests proving full ISO 8601 date-time handling where timestamp fields exist.
5. Closed-enum tests proving unsupported serialized enum values are rejected.
6. Open-string tests proving extension event names can still flow through `RuntimeEvent`.
7. `Result<T>` tests proving success and failure branches cannot both be present.
8. JSON round-trip tests for every public contract the implementation emits.

For the last item, a compatibility claimant must limit JSON round-trip claims to
JSON-serializable payload values. `RuntimeMessage.payload`, `Result<T>` without a data
schema, and record fields that use `z.unknown()` are not constrained to JSON by this
package.

## Unknown Fields And Unknown Values

Current repository evidence:

- tested object schemas strip unknown top-level fields during parsing;
- closed enums reject unknown serialized values;
- `RuntimeEvent.type` remains open for extension event namespaces;
- capability IDs and many other identifiers remain open strings.

Third-party implication:

- do not rely on unknown top-level fields surviving a parse through the shared schemas;
- do not assume every open string is semantically known just because it is syntactically valid.
- do not treat a valid non-empty `RuntimeEvent.type` as proof that it follows an extension
  namespace convention; the schema does not validate that convention.

## Outcome Handling

Implemented shared outcome behaviour:

- `Result<T>` is the shared success/error envelope;
- `RuntimeError` is the shared machine-readable error shape;
- `AuditEvent` is the shared immutable audit-fact record.

Not defined here:

- domain-specific action outcome enums;
- approval semantics;
- memory reliability semantics;
- runtime-specific retry policy beyond the `recoverable` boolean on `RuntimeError`.

Compatibility claim guidance:

- claim support for the generic envelope only if both `success` branches are handled;
- do not claim support for another runtime's domain semantics unless that runtime's own
  repository or ADRs define them.

## Canonical Examples

Current evidence-backed examples in the repository:

- [`README.md`](../README.md) usage snippet
- [`tests/sample-import.ts`](../tests/sample-import.ts)
- inline examples in the exported source files under [`src/`](../src/)
- schema tests under [`src/**/*.test.ts`](../src/)
- [example compatibility manifest](../examples/compatibility-manifest.json)

These are examples, not a formal fixture registry.

## Implemented Test Coverage

The repository currently has dedicated tests for:

- `Timestamp` utilities and schema
- `Result<T>` and `RuntimeError`
- `Severity`
- `RuntimeIdentity`
- `Capability`
- `RuntimeHealth`
- `RuntimeMessage`
- `RuntimeEvent`
- `RuntimeComposition`
- `RuntimeSession`
- `RuntimeSkill`
- `ExecutionEnvironment`
- `RuntimeRiskClass`
- lifecycle/recovery schemas: envelope, target, lifecycle event, cancellation, termination,
  recovery, and heartbeat
- model/speech schemas: context window, model capability profile, provider/model selection
  change event, portable locale, transcript, and speech-provider capability
- `ProtocolCompatibility`
- constants including `ProtocolVersion` value alignment

Implemented but without a dedicated schema test file today:

- `ProjectIdentity`
- `RuntimeMetadata`
- `RuntimeProfile`
- `RuntimeKind`
- `Version`

Implication:

- these contracts are implemented and exported, but their conformance evidence is weaker
  than the families with explicit parse/negative/round-trip tests.

## Fixture Status

Implemented and tested:

- the first-migration catalog at
  [`fixtures/adoption-v1/catalog.json`](../fixtures/adoption-v1/catalog.json) covers 15 portable
  families with 87 positive and negative cases;
- each family has minimal, complete, missing-required, invalid-type, and semantic-negative
  coverage;
- `npm run fixtures:validate` executes the expected result for every case;
- the packed-consumer smoke test validates a representative installed fixture from every family;
- a separate pinned Ananke consumer fixture proves the current downstream shapes require
  adapters without making those shapes portable conformance fixtures.

Not implemented:

- fixtures for every export outside the first-migration families;
- adopted-consumer suites for Mnemosyne, Horae, or Moirae Code;
- a second immutable release-to-release fixture baseline.

The adoption catalog supports claims only for its named schemas and tested behavior. It is not
evidence for authentication, authorization, transport operation, persistence, or domain policy.

## Suggested Third-Party Test Matrix

A third-party implementation should add, at minimum:

- smallest valid payload for each adopted contract;
- fully populated payload for each adopted contract;
- missing-required-field failures;
- invalid-timestamp failures;
- invalid-enum failures;
- unknown-field parse behaviour checks;
- JSON round-trip checks;
- protocol downgrade and incompatibility cases;
- required lifecycle-envelope failures, target-reference failures, lifecycle enum failures,
  heartbeat ordering-field failures, and lifecycle JSON round trips;
- finite positive context-window failures; confidence boundary failures; portable-locale
  acceptance/rejection cases; transcript timing failures; provider/model initial, provider-only,
  model-only, unchanged-selection, and envelope failures; and JSON identifier preservation;
- extension-event acceptance checks for `RuntimeEvent`;
- negative `Result<T>` cases where both `data` and `error` appear.

## Documentation Conflict

The repository has stronger tests for some public families than others. A third-party
implementation that claims "full protocol conformance" should either:

- limit the claim to the actually tested families; or
- add independent evidence for the currently under-tested exports.

## Open Questions

- No all-export protocol-wide canonical fixture bundle exists yet; the implemented catalog is
  deliberately limited to the first Ananke migration families.
- No standardized wire payload exists for negotiation failure.
- No repository-wide rule defines how unknown capability IDs should be surfaced to users or
  policy systems after schema validation succeeds.

## Consolidated contract evidence

The current source tests additionally cover principal/context requirements, bounded versus
unscoped scopes, wildcard rejection, delegation references and temporal invariants,
correlation identifiers, protocol-range consistency, compatibility-manifest parsing, and
machine-readable negotiation failure reasons. These tests demonstrate schema behaviour;
they do not demonstrate authentication, authorization, grant issuance, host orchestration,
transport negotiation, storage, or sibling-repository adoption.

For a third-party claim covering these families, add fixtures for both principal roles,
scope boundaries, expired grants, unknown open identifiers, closed enum failures, manifest
range drift, idempotency-mode invariants, opaque state handles, and the four negotiation failure reasons. Preserve JSON round trips for every
record actually emitted.
