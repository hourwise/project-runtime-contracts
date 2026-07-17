# Research Additions Build Plan

This plan records the staged work in [`ROADMAP.md`](./ROADMAP.md). It covers the additions
proposed in [`PROJECT_RUNTIME_CONTRACTS_RESEARCH_ADDITIONS.md`](./PROJECT_RUNTIME_CONTRACTS_RESEARCH_ADDITIONS.md)
without adding runtime behaviour.

## Current Status

### Canonical contract consolidation: implemented in working tree, unreleased

The consolidation pass adds source-tested portable principal/context, resource-scope,
correlation/reference, delegation, idempotency, opaque state-handle, readiness, and
compatibility-manifest shapes. It also adds ownership, distribution, migration, and design
gate documentation, a packed-consumer smoke test, and minimal CI. The package and protocol
version values remain `0.4.0` and `1.4.0`; no published release is claimed until an explicit
version/release decision is recorded.

These additions do not implement authentication, credential brokering, policy enforcement,
workflow orchestration, memory/reliability semantics, transport, persistence, or host
behaviour. Sibling repositories remain local-schema consumers pending explicit migration.

### 1.2.0: implemented and source-tested

The 1.2.0 implementation is present in the current repository and was recorded as
release-validated in commit `6bc49e7`. The following completed slices have direct source and
test evidence:

- Slice A: `RuntimeRiskClass` and `RuntimeRiskClassSchema` in
  [`src/risk/RuntimeRiskClass.ts`](../src/risk/RuntimeRiskClass.ts), with exhaustive-value,
  invalid-value, and JSON round-trip tests.
- Slice B: `RuntimeSkill`, `SkillSource`, `SkillKind`, `SkillTrustState`,
  `ExecutionEnvironment`, `IsolationLevel`, and `ResourceLimits`, exported from
  [`src/index.ts`](../src/index.ts) and covered by colocated tests.
- The package and protocol values are `0.2.0` and `1.2.0` respectively, as recorded in
  [`CHANGELOG.md`](../CHANGELOG.md).

The repository contains targeted valid/invalid `CompatibilityManifest` fixtures under
`fixtures/compatibility-manifest`, but not
protocol-wide consumer-compatibility payload suites or a formal external consumer conformance
record. Those broader items are planned evidence requirements, not completed 1.2.0 artefacts. See
[conformance](./conformance.md) for the implemented-versus-proposed distinction.

### 1.3.0: implemented and source-tested

The lifecycle contract family is implemented in
[`src/lifecycle/RuntimeLifecycle.ts`](../src/lifecycle/RuntimeLifecycle.ts) and covered by
colocated tests. It makes the correlation and idempotency envelope mandatory for lifecycle
events and cancellation, termination, and recovery records, while using the documented
reduced observational envelope for heartbeats. The accepted boundary is recorded in
[ADR-0001](./decisions/ADR-0001-lifecycle-correlation-idempotency.md).

As with 1.2.0, canonical fixtures and external consumer-compatibility payload suites are not
yet present. The 1.3.0 implementation does not provide lifecycle execution or transition
policy.

### 1.4.0: implemented and source-tested

The model and speech contract families are implemented in
[`src/model/ModelCapability.ts`](../src/model/ModelCapability.ts) and
[`src/speech/Speech.ts`](../src/speech/Speech.ts), with focused tests for context capacity,
confidence, portable locales, transcripts, speech capabilities, and provider/model changes.
The accepted portable locale and provider-change boundary is recorded in
[ADR-0002](./decisions/ADR-0002-model-speech-portable-locale.md). The implementation does not
select models, recognize speech, calculate confidence, route requests, or perform failover.

Canonical fixtures and external consumer-compatibility payload suites remain proposed work.

### 1.5.0 through 1.7.0: proposed

The model/speech, browser, memory, and content-surface slices below are planning material. No
public implementation status should be inferred from their presence here.

## 1. Confirm contract decisions

Before implementing each release, record the decisions that affect wire compatibility:

- serialized enum values and naming;
- required identifiers and ISO 8601 timestamps;
- field optionality and defaults (schemas should not silently inject runtime policy defaults);
- extension rules for provider-specific metadata;
- identifier versus URI treatment for evidence and source references;
- event names and payload ownership;
- package and protocol version impact.

Resolve these research ambiguities before coding the relevant future slice:

- A valid `SkillSource` must contain which minimum locator or publisher fields?
- Is a blocked skill valid data that consumers reject by policy, or invalid registration data?
  Preferred answer: valid data; this package validates shape, not policy.
- Are filesystem scopes paths, patterns, or opaque runtime-specific selectors?
- Must browser evidence references be URIs, content hashes, or opaque IDs?
- What is the smallest useful `ProjectRecord` envelope shared by Mnemosyne and other consumers?

### 1.2.0 decisions (2026-07-11)

- A `RuntimeSkill` requires a `source` with at least one non-empty `repository` or `publisher`.
  `revision` and `licence` remain optional. `repository` is a portable locator string, not
  necessarily an HTTP URL.
- `trustState: "blocked"` is valid declared data. This package validates contract shape only;
  consumers and policy runtimes decide whether a skill may be activated.
- `ExecutionEnvironment.filesystemScope` contains non-empty opaque selectors. A selector may
  represent a path or pattern according to the producing runtime, but this protocol does not
  define or interpret a shared filesystem-expression language.

### 1.3.0 decision (2026-07-12)

- Lifecycle events and operation records require the accepted correlation, idempotency, and
  ordering envelope. Heartbeats use the reduced observational envelope. See
  [ADR-0001](./decisions/ADR-0001-lifecycle-correlation-idempotency.md).

### 1.4.0 decision (2026-07-12)

- `contextWindow` is an optional positive integer in native model tokens, confidence is
  optional within `0..1`, locales use the Portable Locale Profile, and provider/model changes
  use the immutable correlated event defined in
  [ADR-0002](./decisions/ADR-0002-model-speech-portable-locale.md).

## 2. Use the repository's schema pattern

For every contract family:

1. Create a focused module under `src/`.
2. Define enums or string-value schemas first.
3. Define the Zod object schema from those primitives.
4. Export the TypeScript type with `z.infer<typeof ...Schema>`.
5. Add TSDoc for wire semantics, optionality, and non-goals.
6. Export the module from `src/index.ts`.
7. Add colocated Vitest coverage.

Do not maintain handwritten interfaces alongside schemas; they can drift. Do not add validators
that make policy decisions, perform I/O, query providers, or execute lifecycle transitions.

## 3. Proposed file layout

```text
src/
  browser/
    BrowserAction.ts
    BrowserAction.test.ts
  isolation/
    ExecutionEnvironment.ts
    ExecutionEnvironment.test.ts
  lifecycle/
    RuntimeLifecycle.ts
    RuntimeLifecycle.test.ts
  memory/
    ProjectRecord.ts
    ProjectRecord.test.ts
  model/
    ModelCapabilityProfile.ts
    ModelCapabilityProfile.test.ts
  risk/
    RuntimeRiskClass.ts
    RuntimeRiskClass.test.ts
  skill/
    RuntimeSkill.ts
    RuntimeSkill.test.ts
  speech/
    Speech.ts
    Speech.test.ts
tests/
  fixtures/
    positive/
    negative/
```

Keep a contract family in one module until its size or independent versioning justifies splitting it.
Only the targeted compatibility-manifest fixture family under `fixtures/` is present; the broader proposed
positive/negative fixture layout remains future work.

## 4. Delivery sequence

### Slice A: shared primitives (implemented in 1.2.0)

- Implement `RuntimeRiskClass` and any reusable bounded-number, URI/reference, or resource-limit
  schemas that remain genuinely generic.
- Avoid a generic helper when its semantics belong to only one contract family.
- Add exhaustive enum tests and JSON round-trip tests.

### Slice B: skills and isolation (implemented in 1.2.0)

- Implement `SkillKind`, `SkillTrustState`, `SkillSource`, and `RuntimeSkill`.
- Import the existing `RuntimeCapabilitySchema` for `declaredCapabilities`.
- Validate semantic version strings consistently with other version contracts; extract a shared
  version schema only if doing so does not change existing acceptance rules.
- Implement `IsolationLevel`, resource limits, and `ExecutionEnvironment`.
- Require positive CPU/memory/timeout values where numeric validation is possible; retain string
  CPU declarations only if consumers need forms such as `500m`.
- Future conformance work: add canonical boundary and partial-declaration fixtures. These
  fixtures are not yet present.

### Slice C: lifecycle and recovery (implemented in 1.3.0)

- `RuntimeLifecycleEvent`, cancellation, termination, recovery, and heartbeat records use
  the decided correlation and idempotency envelopes.
- `ISO8601TimestampSchema` is reused for all lifecycle timestamps.
- Colocated tests cover shape validation, required envelope fields, target validation, value
  enums, and JSON round trips; they do not test legal transitions or lifecycle execution.
- [`protocol-specification.md`](./protocol-specification.md) defines the idempotency scope,
  target scope, and generic-event boundary.

### Slice D: model and speech (implemented in 1.4.0)

- Model capability flags distinguish required common declarations from optional declarations
  that a provider may not expose consistently.
- Transcript and speech schemas enforce finite non-negative timings, `endMs >= startMs`,
  confidence bounds, Portable Locale Profile validation, and explicit
  `requiresConfirmation`.
- Provider/model changes use the specialized immutable correlated event; canonical fixture
  payloads remain proposed work.
- No provider adapters, availability probing, model selection, or failover behaviour is added.

### Slice E: browser evidence (1.5.0)

- Implement proposal and evidence schemas with a proposal ID or correlation ID shared between them.
- Require an origin on every proposal and validate its agreed representation.
- Keep before/after screenshots and hashes optional so partial evidence remains representable.
- Cover destructive and tenant-scope declarations without enforcing approval policy.

### Slice F: memory records (1.6.0)

- Ship `ProjectRecordKind` first if the shared envelope is not yet agreed.
- Prototype `ProjectRecord` against payloads from Mnemosyne and at least one other consumer.
- Represent provenance and conflict explicitly; do not embed retrieval scores or database keys unless
  they are portable protocol concepts.
- Update memory event guidance and fixtures.

### Slice G: content surface preflight (1.7.0)

- Implement `ContentExposureLevel`, `ContentPreflightOutcome`, and `ContentRiskFlag` as stable
  serialized vocabularies.
- Define `ContentSourceIdentity` with a required `contentHash` and `sizeBytes`; keep source
  location fields optional so local paths and URIs remain producer-specific declarations.
- Implement `ContentSurfaceObservation`, `ContentAccessDecision`, and `ContentPreflightReceipt`
  as separate records linked by identifiers rather than a single merged result object.
- Require every decision to reference the exact observation it evaluated and every receipt to bind
  back to the source content hash.
- Represent selected, redacted, transformed, or truncated output with optional emitted-surface
  hashes instead of embedding extraction logic in the contract.
- Preserve `DERIVED_ONLY`, `QUARANTINED`, `UNSUPPORTED`, `RESOURCE_LIMIT_EXCEEDED`, and
  `INSPECTION_FAILED` as first-class outcomes; do not collapse failure into a boolean pass/fail
  field.
- Treat reason codes as portable, non-sensitive declarations; do not encode detector lexicons,
  private rule text, or policy internals in agent-readable payloads.
- Add capability identifiers and fixture payloads for observation, metadata inspection, structural
  inspection, selected extraction, full extraction, and receipt verification.

## 5. Test matrix

Each schema test suite should cover:

- the smallest valid payload;
- a fully populated payload;
- JSON serialization and parsing;
- omitted optional fields;
- unknown-field behaviour (use the repository-wide policy consistently);
- every enum value and an unsupported value;
- empty required strings and invalid timestamps;
- numeric lower/upper boundaries;
- the negative cases named in the research note;
- compatibility parsing for representative existing payloads.
- content preflight failures and timeouts that must not parse as a clean pass once the 1.7.0 slice
  lands.

Blocked skill registration should be tested at two layers: the shared schema accepts the declared
`blocked` state, while consumer integration fixtures demonstrate that policy may refuse activation.

## 6. Documentation and release checklist

For each release:

1. Update `README.md` usage only for stable, public additions.
2. Update [`protocol-specification.md`](./protocol-specification.md) with wire semantics
   and extension behaviour.
3. Add a migration note, even when the release is additive.
4. Update `docs/VERSIONING.md` and `ProtocolVersion` when the shared protocol changes.
5. Run `npm run validate`.
6. Inspect `npm pack --dry-run` to confirm declarations and compiled modules are included.
7. Test the packed artifact from a minimal consumer import.
8. Verify at least one Ananke and one Mnemosyne payload; add Horae/Moirae Code fixtures when
   available.

## Definition of done

For future roadmap items, completion requires schema, inferred type, package-root export,
tests, fixtures, wire documentation, migration note, version decision, and packed-consumer
check. A type snippet alone is not a delivered contract.

This forward-looking definition must not be read as evidence that every criterion has a
historical fixture or external-consumer record for 1.2.0; the status section above records
the evidence that currently exists.
