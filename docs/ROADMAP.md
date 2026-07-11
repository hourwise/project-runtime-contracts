# Project Runtime Contracts Roadmap

This roadmap turns the proposals in
[`PROJECT_RUNTIME_CONTRACTS_RESEARCH_ADDITIONS.md`](./PROJECT_RUNTIME_CONTRACTS_RESEARCH_ADDITIONS.md)
into additive, provider-neutral contract releases. The package remains a contracts-only
library: schemas, inferred types, enums, fixtures, and documentation; no policy,
execution, persistence, browser, speech, or orchestration logic belongs here.

## Release principles

- Define each public contract as a Zod schema and infer its TypeScript type from that schema.
- Keep serialized values stable and use lower-case or namespaced string values consistently.
- Make additive fields optional unless every existing producer can supply them.
- Do not narrow an existing schema in a minor release.
- Export every public contract from `src/index.ts`.
- Ship positive and negative fixtures with each contract family.
- Update the package version, protocol version, protocol history, and migration notes as required.

## 1.2.0 - Trust, isolation, and risk vocabulary

Goal: let a runtime declare what may execute, where it may execute, and the risk attached
to the operation without introducing an execution or policy engine.

- Add skill contracts: `SkillKind`, `SkillTrustState`, `SkillSource`, and `RuntimeSkill`.
- Add isolation contracts: `IsolationLevel`, resource limits, and `ExecutionEnvironment`.
- Add the shared `RuntimeRiskClass` vocabulary.
- Reuse `RuntimeCapability` in skill declarations rather than defining a parallel capability shape.
- Preserve the existing open-ended `Capability.riskClass` field for 1.x compatibility; new
  contracts use `RuntimeRiskClass`, with migration of the legacy field deferred to 2.0.
- Document that trust state and risk class are declarations, not enforcement decisions.

Exit criteria:

- Schemas and inferred types are exported from the package root.
- Invalid versions, absent/empty skill sources, blocked-skill fixtures, unsupported isolation
  levels, invalid resource limits, and every risk value are covered by tests.
- Existing consumers and fixtures continue to parse unchanged.

## 1.3.0 - Runtime lifecycle and recovery

Goal: make runtime state transitions, cancellation, termination, and recovery observable
across orchestrators without implementing lifecycle management.

- Add `RuntimeLifecycleState`.
- Define `RuntimeHeartbeat`, `RuntimeCancellationRequest`, `RuntimeTerminationRecord`, and
  `RuntimeRecoveryRecord` with stable identifiers, timestamps, correlation fields, and reasons.
- Add lifecycle event names to `RuntimeEventType` while retaining the open string event envelope.
- Specify valid producer expectations as documentation; do not encode a state machine in this package.

Exit criteria:

- Cancellation, repeated/idempotent cancellation correlation, failure, termination, stale
  heartbeat, and recovery fixtures are represented.
- Lifecycle records can be correlated with `RuntimeSession` and `RuntimeEvent` without requiring
  either record to contain runtime-specific state.

## 1.4.0 - Model and speech capability discovery

Goal: allow orchestration layers to select compatible model and speech providers from declared
features rather than provider names.

- Add `ModelCapabilityProfile`.
- Add `TranscriptAlternative`, `TranscriptSegment`, and `SpeechProviderCapability`.
- Add a provider/model change event and document its payload.
- Validate non-negative transcript times, ordered segments, bounded confidence values, and
  explicit confirmation requirements.
- Treat capability flags as provider declarations, not guarantees of runtime availability.

Exit criteria:

- Local, cloud, tool-capable, multimodal, streaming, full-duplex, and ambiguous-transcript
  fixtures are covered.
- Provider-switch events are backward-compatible with receivers that ignore unknown payload fields.

## 1.5.0 - Browser action evidence

Goal: provide portable intent and evidence records for browser activity while leaving browser
control and approval policy to consumers.

- Add `BrowserActionProposal` and `BrowserActionEvidence`.
- Define URL/origin normalization expectations, evidence references, state-hash format semantics,
  tenant-scope reporting, and correlation identifiers.
- Keep screenshots as references/URIs or opaque identifiers, never embedded image data.
- Document that `destructive` is the proposer's classification and does not replace policy review.

Exit criteria:

- Read-only, write, destructive, missing-origin, cross-tenant, before/after evidence, and partial
  evidence fixtures are covered.
- Proposal and evidence records can be joined without coupling them to a particular browser agent.

## 1.6.0 - Project memory record vocabulary

Goal: make durable project records portable between memory runtimes without defining storage,
retrieval, ranking, or conflict-resolution behavior.

- Add `ProjectRecordKind`.
- Define a minimal `ProjectRecord` envelope only after Ananke and Mnemosyne agree on identity,
  provenance, timestamps, project scope, supersession, and conflict representation.
- Add event payload guidance for memory updates and conflicting records.
- Keep generated output, external references, observations, and conflicts distinguishable.

Exit criteria:

- Every record kind has a positive fixture.
- Conflicting, superseded, partially sourced, and invalid project records have explicit fixtures.
- No persistence or retrieval assumptions appear in the public contract.

## 2.0.0 candidates

Reserve breaking changes until real consumer feedback supports them:

- Replace or formally deprecate the open-ended `Capability.riskClass` field in favour of the
  shared `RuntimeRiskClass` contract.
- Tighten any 1.x optional field that all supported consumers now provide.
- Remove deprecated aliases or serialized values only with migration guidance.

## Cross-cutting completion work

Every release includes:

- protocol and semantic-version review;
- API documentation and package-root exports;
- positive and negative schema tests;
- migration notes and protocol history;
- `npm run validate` and package-content verification;
- a compatibility check against representative Ananke, Mnemosyne, Horae, and Moira Code payloads.
