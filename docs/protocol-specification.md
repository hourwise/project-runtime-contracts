# Protocol Specification

This document describes the public contract surface exported from
[`src/index.ts`](../src/index.ts). It is limited to implemented repository evidence:
source code, tests, current README, and repository docs. Proposed contracts such as
[`ADR-XXXX-runtime-contracts-content-surface-preflight.md`](./ADR-XXXX-runtime-contracts-content-surface-preflight.md)
are not current protocol behaviour.

## Scope

This repository owns shared representation, validation, vocabulary, version metadata,
and compatibility helpers. It does not own runtime policy semantics, orchestration
policy, memory retrieval semantics, host UX, or transport implementation behaviour.

## General Conventions

- Most public object contracts are implemented as `z.object(...)` schemas. The exported
  `Result<T>` factory is a discriminated union of object schemas; `RuntimeProtocol` is a TypeScript
  interface; and `ProtocolVersion` and `RUNTIME_NAMES` are exported values.
- Required fields are the non-optional schema members in the exported source files.
- Optional fields may be omitted; the current schemas do not inject implicit runtime defaults.
- Fields that use [`ISO8601TimestampSchema`](../src/utils/Timestamp.ts) must be full
  ISO 8601 date-time strings with `Z` or an explicit offset.
- For tested object schemas, unknown top-level fields are stripped during parsing rather
  than preserved. This is explicitly tested for `RuntimeIdentity`, `Capability`,
  `RuntimeHealth`, `RuntimeMessage`, `RuntimeEvent`, `RuntimeComposition`,
  `RuntimeSession`, `AuditEvent`, and `Result`. The same stripping behaviour is inferred
  for the remaining object schemas because they use plain `z.object(...)` without
  `.strict()` or `.passthrough()`.
- Closed enum schemas reject unknown serialized values.
- Open string fields such as capability IDs, runtime names in many contexts, message
  types, and `RuntimeEvent.type` do not perform registry lookups in this package.
- JSON round trips are tested for selected JSON-compatible examples. Schemas that use
  `z.unknown()` or `z.any()` do not, by themselves, make every JavaScript value JSON
  serializable.

## Version And Naming Family

Purpose: identify protocol versions, compare compatibility ranges, and provide canonical
well-known runtime-name constants.

Producer: any runtime or host that needs to advertise or negotiate protocol support.

Consumer: any peer performing compatibility checks or matching well-known runtime names.

Semantic owner: this repository for representation and compatibility helpers; concrete
runtime versioning policy remains ecosystem policy, not transport logic.

### Public types and values

| Contract | Required fields or values | Optional fields | Invariants |
| --- | --- | --- | --- |
| `ProtocolVersion` | `version`, `minimumSupported` | none | the current exported value is numeric `major.minor.patch`, and its range is tested against the default constants |
| `RuntimeProtocol` | `version`, `minimumSupported` | none | TypeScript shape only; each field is an unvalidated `string` |
| `Version` | `major`, `minor`, `patch` | none | non-negative integers |
| `RUNTIME_NAMES` | `ananke`, `mnemosyne`, `horae`, `moira` | none | lower-case canonical constants |
| `RuntimeKind` | closed enum values | none | one of `ananke`, `mnemosyne`, `horae`, `gateway`, `tool-runtime`, `other` |

Lifecycle:

- `ProtocolVersion` is package-global metadata.
- `RuntimeProtocol` supplies the shape used by the fixed `ProtocolVersion` value. The
  schemas do not automatically copy or validate it in identities or negotiations.
- `RUNTIME_NAMES` are compile-time constants rather than negotiated values.

Validation:

- `parseVersion`, `compareVersions`, `isCompatible`, `selectBestVersion`, and `negotiate`
  are implemented in [`src/protocol/ProtocolCompatibility.ts`](../src/protocol/ProtocolCompatibility.ts).
- `parseVersion` accepts `major.minor.patch` numeric strings only.
- Tests confirm that the current `ProtocolVersion` values use that form and that
  `minimumSupported` is not greater than `version`; `RuntimeProtocol` itself has no
  runtime validator.
- `isCompatible` accepts a proposed version only when the major version matches and the
  proposed version falls within `minimumSupported <= proposed <= runtimeVersion`.
- `negotiate` returns the highest overlapping compatible version or `null`.

Unknown-value behaviour:

- Unknown `RuntimeKind` values are rejected by `RuntimeKindSchema`.
- Unknown runtime names in free-string fields are not rejected unless the field is
  explicitly typed to a closed enum elsewhere.

Compatibility implications:

- Package version and protocol version are separate concepts; the working tree at package
  `0.4.0` currently exposes protocol `1.4.0` without claiming registry publication.
- Protocol compatibility is range-based and symmetric in the implemented helper functions.
- The repository does not define a standard wire payload for reporting negotiation failure.

Example:

```ts
import { ProtocolVersion, negotiate } from "project-runtime-contracts";

const agreed = negotiate("1.2.0", "1.0.0", "1.1.0", "1.0.0");
// agreed === "1.1.0"
```

## Identity And Metadata Family

Purpose: identify runtimes and projects, and attach portable descriptive metadata.

Producer: runtimes registering themselves; hosts or orchestrators creating session context.

Consumer: registries, orchestrators, peer runtimes, and audit/conformance tooling.

Semantic owner: this repository for shape; runtime-specific identity meaning remains with
 the producing runtime or host.

### Public types

| Contract | Required fields | Optional fields | Invariants |
| --- | --- | --- | --- |
| `RuntimeIdentity` | `runtime`, `version`, `protocolVersion` | `minimumProtocolVersion`, `packageVersion`, `buildVersion`, `supportedProtocolRange`, `optionalIntegrations`, `requiredIntegrations`, `standalone`, `kind`, `instanceId`, `displayName`, `capabilities`, `metadata` | protocol fields use strict semantic versions; minimum/current use one major and ordered ranges must agree with repeated fields |
| `ProjectIdentity` | `id`, `name`, `rootPath` | none | required strings must be non-empty |
| `RuntimeMetadata` | none | `displayName`, `description`, `homepageUrl`, `repositoryUrl`, `documentationUrl`, `labels`, `annotations` | no URL normalization is performed |

Lifecycle:

- `RuntimeIdentity` is typically produced at runtime startup and reused in registration.
- `ProjectIdentity` is attached when a session has explicit project scope.
- `RuntimeMetadata` is descriptive and may appear on identities, registrations, profiles,
  compositions, and capabilities.

Validation:

- `RuntimeIdentity` can be minimal; `minimumProtocolVersion`, `capabilities`, and `kind`
  are optional.
- `ProjectIdentity` is stricter than many other families because all three fields are required.
- `RuntimeMetadata` is fully optional and primarily descriptive.

Unknown-value behaviour:

- Unknown fields are stripped on parse.
- `RuntimeIdentity.kind` rejects unknown serialized `RuntimeKind` values.
- Metadata annotations intentionally accept arbitrary nested values.

Compatibility implications:

- Consumers must not assume `minimumProtocolVersion`, `instanceId`, or `capabilities`
  are present.
- No repository-wide canonicalization is defined for `rootPath` or metadata URLs.

Example:

```ts
const identity = {
  runtime: "ananke",
  version: "0.1.0",
  protocolVersion: "1.4.0",
};
```

## Capability, Registration, And Profile Family

Purpose: advertise what a runtime can do, how it can be reached, and which operating
context should expose or hide which capabilities.

Producer: runtimes, registries, hosts, or orchestrators assembling a view of available
capabilities.

Consumer: discovery layers, orchestrators, policy layers, and hosts selecting capabilities.

Semantic owner: this repository for representation; capability semantics remain with the
producing runtime, and profile policy remains outside this package.

### Public types

| Contract | Required fields | Optional fields | Invariants |
| --- | --- | --- | --- |
| `Capability` / `RuntimeCapability` | `id`, `name`, `version` | `description`, `category`, `exposure`, `tags`, `requiresApproval`, `riskClass`, `endpointId`, `requiredProtocolFeatures`, `dependencyState`, `metadata` | required strings must be non-empty |
| `RuntimeEndpoint` | `transport` | `id`, `url`, `command`, `args`, `protocol`, `metadata` | `transport` is a closed enum |
| `RuntimeRegistration` | `identity` | `capabilities`, `health`, `readiness`, `endpoints`, `registeredAt`, `expiresAt`, `profileIds`, `healthEndpoint`, `readinessEndpoint`, `inspectionMechanism`, `optionalIntegrations`, `requiredIntegrations`, `standalone`, `degradedModes`, `metadata` | timestamps must parse if present |
| `RuntimeProfile` | `id`, `name` | `description`, `mode`, `discoveryMode`, `requiredCapabilities`, `exposedCapabilities`, `hiddenCapabilities`, `runtimeNames`, `gatewayProfileId`, `policyProfileId`, `memoryProfileId`, `approvalProfileId`, `auditProfileId`, `budget`, `metadata` | required strings must be non-empty |
| `SessionBudget` | none | `maxDurationMs`, `maxToolCalls`, `maxWriteActions`, `maxApprovalRequests` | non-negative integers only |

Lifecycle:

- Capabilities may be declared on `RuntimeIdentity` and repeated on `RuntimeRegistration`.
- Registrations may expire via `expiresAt`; this package does not enforce expiry logic.
- Profiles describe an intended operating context before or during session creation.

Validation:

- `CapabilityCategory`, `CapabilityExposure`, `RuntimeTransport`,
  `RuntimeProfileMode`, and `CapabilityDiscoveryMode` are all closed enums.
- `RuntimeRegistration` has dedicated tests for identity-range consistency and a standalone
  runtime degraded only by an unavailable optional integration.
- `RuntimeProfile` currently has no dedicated schema test file.
- `RuntimeEndpoint` does not require a `url`, `command`, or `args` for any particular
  `transport`; transport-specific endpoint completeness is outside this schema.

Unknown-value behaviour:

- Unknown capability IDs and profile capability references parse as ordinary strings.
- Unknown enum values are rejected.
- Unknown object fields are stripped where parse tests exist and inferred stripped elsewhere.

Compatibility implications:

- `Capability.riskClass` remains an open string in 1.x; `RuntimeRiskClass` is the newer
  closed vocabulary and the two are not yet unified.
- The package does not define whether advertised capabilities are descriptive,
  mandatory, or currently available at execution time.
- No standard registration-discovery protocol is defined here; only the record shapes are.

Example:

```ts
const registration = {
  identity,
  endpoints: [{ transport: "http", url: "http://localhost:3000" }],
};
```

## Session And Composition Family

Purpose: represent execution context and the selected set of runtimes bound to roles for
that context.

Producer: typically an orchestrator or host; in Horae-oriented prose this is the future
orchestration plane.

Consumer: runtimes, hosts, audit systems, and compatibility tooling.

Semantic owner: `RuntimeSession` is shared representation in this repository; the choice
of which bindings to create is external policy. `RuntimeComposition` is a shared shape for
an orchestration decision, not the decision logic itself.

### Public types

| Contract | Required fields | Optional fields | Invariants |
| --- | --- | --- | --- |
| `RuntimeSession` | `id`, `startedAt` | `profileId`, `project`, `agent`, `task`, `runtimeIds`, `expiresAt`, `executionContext`, `tenantId`, `workspaceId`, `metadata` | required strings non-empty; timestamps must parse |
| `RuntimeActor` | none | `id`, `name`, `kind` | descriptive only |
| `RuntimeTask` | none | `id`, `summary`, `riskClass`, `requiredCapabilities` | descriptive only |
| `RuntimeBinding` | `role`, `runtime` | `capabilityIds`, `required`, `metadata` | `runtime` non-empty; `role` closed enum |
| `RuntimeComposition` | `id`, `protocolVersion`, `bindings` | `name`, `projectId`, `sessionId`, `profileId`, `exposedCapabilityIds`, `hiddenCapabilityIds`, `createdAt`, `metadata` | at least one binding required |

Lifecycle:

- A `RuntimeSession` begins at `startedAt`; optional `expiresAt` is descriptive only.
- A `RuntimeComposition` may be session-scoped, profile-scoped, or project-scoped.
- Neither schema encodes state transitions or replacement rules.

Validation:

- `RuntimeComposition.bindings` must contain at least one binding.
- `RuntimeSession.project` must satisfy `ProjectIdentity` if present.
- Binding roles are closed to the exported `RuntimeBindingRole` enum.

Unknown-value behaviour:

- Unknown `RuntimeBindingRole` values are rejected.
- Unknown `runtime` names and capability IDs remain open strings.

Compatibility implications:

- Consumers must not infer that all sessions have explicit project, agent, or task data.
- `required` on a binding is descriptive; no execution fallback algorithm is defined.
- `protocolVersion` on a composition is a string and is not auto-checked against
  `ProtocolVersion` by the schema itself.

Example:

```ts
const composition = {
  id: "comp-123",
  protocolVersion: "1.4.0",
  bindings: [{ role: "memory", runtime: "mnemosyne" }],
};
```

## Lifecycle And Recovery Family

Purpose: represent lifecycle observations and immutable lifecycle operations with the
identity, correlation, idempotency, and local ordering information required to exchange
them between runtimes.

Producer: a lifecycle engine, runtime, or host emitting lifecycle observations or recording
cancellation, termination, or recovery operations.

Consumer: runtimes, hosts, orchestrators, audit systems, and conformance tooling that need
to identify, correlate, deduplicate, or order lifecycle records.

Semantic owner: this repository owns the shared record shapes and validation. Horae or
another lifecycle engine owns transition legality, persistence, retry behaviour, scheduling,
and execution policy.

### Public types

| Contract | Required fields | Optional fields | Invariants |
| --- | --- | --- | --- |
| `RuntimeLifecycleEnvelope` | `eventId`, `runtimeId`, `runtimeInstanceId`, `correlationId`, `causationId`, `idempotencyKey`, `sequence`, `occurredAt` | none | identifiers are non-empty; `sequence` is a non-negative integer; timestamp must parse |
| `RuntimeLifecycleTarget` | `runtimeId` and one of `runtimeInstanceId`, `sessionId`, `taskId`, or `executionId` | the remaining target references | target is rejected without an identifier beyond `runtimeId` |
| `RuntimeLifecycleEvent` | full lifecycle envelope, `eventName`, `state` | `previousState`, `reasonCode`, `message`, `metadata` | state and event name are closed enums; prior state is deliberately optional |
| `RuntimeCancellationRecord` | full lifecycle envelope, `cancellationId`, `target`, `requestedAt`, `requestedBy`, `mode` | `reasonCode` | cancellation mode is a closed enum |
| `RuntimeTerminationRecord` | full lifecycle envelope, `terminationId`, `target`, `initiatedAt`, `outcome` | `completedAt`, `reasonCode` | termination outcome is a closed enum |
| `RuntimeRecoveryRecord` | full lifecycle envelope, `recoveryId`, `target`, `recoveryAttempt`, `startedAt`, `outcome` | `completedAt`, `recoveredFromInstanceId` | recovery attempt is a non-negative integer; outcome is a closed enum |
| `RuntimeHeartbeat` | `heartbeatId`, `runtimeId`, `runtimeInstanceId`, `correlationId`, `heartbeatSequence`, `observedAt`, `lifecycleState`, `health` | `probeId`, `causationId` | heartbeat sequence is a non-negative integer; it intentionally has no command `idempotencyKey` |

Lifecycle:

- A `RuntimeLifecycleEvent` is an immutable record of a reported lifecycle state or core
  lifecycle event name. `previousState` may be absent when a producer has not retained it.
- Cancellation, termination, and recovery records identify durable operations with their own
  `cancellationId`, `terminationId`, or `recoveryId`; multiple records may refer to the same
  operation.
- A heartbeat is a high-frequency observation with a reduced envelope. Its natural local
  identity and ordering use `heartbeatId`, `runtimeInstanceId`, and `heartbeatSequence`.
- The schemas do not define valid state transitions, whether a command succeeds, or how a
  lifecycle engine persists, retries, or applies an operation.

Validation:

- The full lifecycle envelope is required on lifecycle events and the three operation-record
  types. `eventId`, `idempotencyKey`, `correlationId`, `causationId`, and `sequence` are not
  interchangeable fields.
- The schemas validate identifier presence, timestamp format, closed enum values, and numeric
  integrality. They cannot validate cross-record uniqueness, monotonic sequence progression,
  deduplication, or causal truth.
- `RuntimeLifecycleTarget` requires a logical `runtimeId` plus one stable target reference.
  It does not require the target's `runtimeId` to equal the envelope's `runtimeId`.

Unknown-value behaviour:

- Unknown lifecycle states, event names, operation outcomes, and cancellation modes are
  rejected by their closed schemas.
- `reasonCode`, `message`, and metadata values remain producer-defined; metadata object fields
  use the repository's ordinary unknown-field stripping behaviour.

Compatibility implications:

- The full envelope is mandatory for every lifecycle event and command record. A producer
  omitting one of those fields is not compatible with the 1.3.0 lifecycle schemas.
- Default idempotency scope is `runtimeId + runtimeInstanceId + lifecycle operation type +
  idempotencyKey`. `eventId` deduplicates an emitted record, while `idempotencyKey`
  deduplicates the requested operation; neither replaces `correlationId`, `causationId`, or
  `sequence`.
- When a command must survive replacement of a runtime instance, the lifecycle engine must
  scope it using a stable `RuntimeLifecycleTarget` identifier such as `sessionId`, `taskId`,
  or `executionId` rather than the replaced instance. The shared schema represents that target
  but does not implement the scope calculation.
- `RuntimeEventType` includes the core lifecycle event names. The generic `RuntimeEvent`
  schema remains an open envelope and does not validate a lifecycle payload; use
  `RuntimeLifecycleEventSchema` for the mandatory lifecycle envelope.
- `occurredAt` supports temporal interpretation but must not be used as the sole ordering
  mechanism; `sequence` is the local ordering declaration.

Example:

```ts
const cancellation = {
  eventId: "evt-001",
  runtimeId: "worker",
  runtimeInstanceId: "worker-instance-001",
  correlationId: "corr-001",
  causationId: "cmd-001",
  idempotencyKey: "cancel-retry-001",
  sequence: 7,
  occurredAt: "2026-07-12T12:00:00Z",
  cancellationId: "cancel-001",
  target: { runtimeId: "worker", executionId: "exec-001" },
  requestedAt: "2026-07-12T12:00:00Z",
  requestedBy: { id: "operator-001" },
  mode: "GRACEFUL",
};
```

## Messaging And Event Family

Purpose: carry imperative messages and declarative events between runtimes.

Producer: any runtime or host participating in cross-runtime communication.

Consumer: any peer runtime, host, registry, or audit sink.

Semantic owner: this repository owns the shared envelope structure. Message semantics and
event payload semantics remain with the producing runtime or extension namespace.

### Public types

| Contract | Required fields | Optional fields | Invariants |
| --- | --- | --- | --- |
| `RuntimeMessage` | `type` | `id`, `payload`, `sender`, `timestamp`, `correlationId`, `requestId`, `causationId`, `actionId`, `approvalReference`, `delegationReference`, `auditReference` | `type` non-empty; timestamp must parse if present |
| `RuntimeEvent` | `id`, `type`, `timestamp`, `sourceRuntime` | `targetRuntime`, `sessionId`, `correlationId`, `requestId`, `causationId`, `actionId`, `approvalReference`, `delegationReference`, `auditReference`, `payload` | required strings non-empty |
| `RuntimeEventType` | closed core event names | none | reserved core values only when validating against the enum schema |

Lifecycle:

- `RuntimeMessage` is an imperative envelope. The schema does not distinguish requests,
  notifications, responses, or streams.
- `RuntimeEvent` records facts that already occurred.
- Correlation across messages or events uses a caller-supplied `correlationId`; this
  repository does not define how such identifiers are generated.

Validation:

- `RuntimeMessage.payload` uses `z.unknown()` and accepts any JavaScript value at schema
  validation time. The supplied tests cover object, array, string, and `null` examples;
  JSON serializability is a separate responsibility of a transport or producer.
- `RuntimeEvent.type` is validated as a non-empty string in the object schema, so extension
  event types are allowed.
- `RuntimeEvent.payload`, when present, must be an object record with string keys; its
  values use `z.unknown()`.
- `RuntimeEventTypeSchema` validates only the built-in core event names.

Unknown-value behaviour:

- Unknown core event names are rejected by `RuntimeEventTypeSchema`.
- Unknown extension event names are accepted by `RuntimeEventSchema`.
- `RuntimeEventSchema` does not validate an extension namespace format; any non-empty
  string is accepted.
- Unknown object fields are stripped in tested cases.

Compatibility implications:

- Receivers must not assume that a valid `RuntimeEvent.type` belongs to the core enum.
- The repository does not define message ordering, delivery guarantees, deduplication, or
  replay semantics.
- Serialization order is not specified; only field presence and value shape are shared.

Example:

```ts
const event = {
  id: "evt-123",
  type: "approval.granted",
  timestamp: "2024-07-11T14:30:00Z",
  sourceRuntime: "ananke",
};
```

## Result, Error, Severity, And Audit Family

Purpose: represent generic operation outcomes and immutable audit facts.

Producer: any runtime returning an operation result or recording an audit fact.

Consumer: callers, orchestrators, hosts, and audit sinks.

Semantic owner: the success/error envelope is shared here. The semantic meaning of a
domain-specific outcome remains with the producing runtime.

### Public types

| Contract | Required fields | Optional fields | Invariants |
| --- | --- | --- | --- |
| `Result<T>` | `success` plus exactly one of `data` or `error` | `requestId`, `correlationId`, `causationId`, `auditReference`, `stateHandleReference` | `success: true` requires `data`; `success: false` requires `error` |
| `RuntimeError` | `code`, `message`, `recoverable` | `details` | required strings non-empty |
| `Severity` / `AuditSeverity` | closed enum values | none | one of `info`, `warning`, `error`, `critical` |
| `AuditEvent` | `timestamp`, `runtime`, `event`, `severity` | `id`, `details`, `correlationId`, `causationId`, `sessionId`, `projectId`, `tenantId`, `actor`, `auditReference`, `metadata` | timestamp must parse; required strings non-empty |

Lifecycle:

- `Result<T>` is transient operation output.
- `AuditEvent` is an immutable fact that has already occurred.

Validation:

- `createResultSchema(...)` enforces the discriminated-union invariant.
- `RuntimeError.details` and `AuditEvent.details` accept arbitrary structured data.
- `AuditSeverity` is a re-export of the shared `Severity` enum and schema.
- When `createResultSchema()` is called without a data schema, success `data` uses
  `z.any()` and is not restricted to JSON-serializable values.

Unknown-value behaviour:

- Unknown severity values are rejected.
- Unknown fields are stripped for tested schemas.

Compatibility implications:

- Consumers must branch on `success` rather than assuming a specific payload shape.
- The repository does not define domain-specific outcome enums, approval outcomes, or
  reliability scores.

Example:

```ts
import { createResultSchema } from "project-runtime-contracts";
import { z } from "zod";

const result = createResultSchema(z.string()).parse({ success: true, data: "done" });
```

## Skill, Isolation, And Risk Family

Purpose: declare portable skills, the environments they may run in, and a shared risk
classification vocabulary.

Producer: runtimes, hosts, registries, or packaging systems declaring portable skills.

Consumer: discovery layers, hosts, orchestrators, policy systems, and audit tooling.

Semantic owner: this repository owns representation. Review, activation, and enforcement
remain external decisions.

### Public types

| Contract | Required fields | Optional fields | Invariants |
| --- | --- | --- | --- |
| `RuntimeSkill` | `id`, `version`, `kind`, `source`, `declaredCapabilities`, `trustState` | `requiredSecrets`, `networkRequirements`, `supportedRuntimes`, `supportedModels` | `version` must be semantic version; source requires `repository` or `publisher` |
| `SkillSource` | `repository` or `publisher` | `revision`, `publisher`, `licence` | at least one of `repository` or `publisher` required |
| `ExecutionEnvironment` | `isolationLevel` | `provider`, `operatingSystem`, `architecture`, `networkPolicyId`, `filesystemScope`, `resourceLimits` | `filesystemScope` entries non-empty if present |
| `ResourceLimits` | none | `cpu`, `memoryMb`, `timeoutMs` | `cpu` non-empty if present; numeric fields must be positive integers |
| `RuntimeRiskClass` | closed enum values | none | one of the defined upper-case portable risk classes |

Lifecycle:

- `RuntimeSkill` is a portable declaration that may exist before installation or activation.
- `ExecutionEnvironment` describes where execution happens; it does not launch anything.
- `RuntimeRiskClass` values classify declarations and operations; they do not enforce policy.

Validation:

- `SkillTrustState.Blocked` is valid observable data and is explicitly tested as such.
- `IsolationLevel`, `SkillKind`, `SkillTrustState`, and `RuntimeRiskClass` are closed enums.
- `filesystemScope` selectors are opaque strings; the schema intentionally does not
  interpret them as paths or glob syntax.

Unknown-value behaviour:

- Unknown enum members are rejected.
- `Capability.riskClass` remains an open string and therefore can carry values outside
  `RuntimeRiskClass`.

Compatibility implications:

- Consumers must not treat `trustState` or `riskClass` as enforcement outcomes.
- Because `Capability.riskClass` and `RuntimeRiskClass` are not yet unified, consumers
  supporting both surfaces need an explicit local mapping policy.

Example:

```ts
const skill = {
  id: "memory.summary",
  version: "1.2.0",
  kind: "workflow",
  source: { publisher: "example" },
  declaredCapabilities: [],
  trustState: "unreviewed",
};
```

## Time Utility Family

Purpose: share timestamp validation and generation helpers.

Producer: any runtime or host serializing timestamps into public contracts.

Consumer: every contract family using timestamps.

Semantic owner: this repository for format validation only.

### Public values

| Contract | Required fields or values | Optional fields | Invariants |
| --- | --- | --- | --- |
| `ISO8601TimestampSchema` | string input | none | full ISO 8601 date-time; valid calendar date; `Z` or explicit offset |
| `isValidISO8601Timestamp` | string input | none | returns `boolean`, never throws on invalid input |
| `getCurrentISO8601Timestamp` | none | none | returns current UTC time in ISO 8601 format |

Compatibility implications:

- Timestamp formatting is shared, but no ordering or monotonicity guarantee is defined.
- The repository does not define clock synchronization, trust, or time-source policy.

Example:

```ts
ISO8601TimestampSchema.parse("2024-07-11T14:30:00Z");
```

## Model, Speech, And Provider-Change Family

Purpose: represent declared model and speech capabilities, portable transcript data, and an
effective provider/model selection change without selecting a provider, routing a request,
or implementing recognition or failover behaviour.

Producer: model or speech providers, model brokers, hosts, or runtimes reporting their own
declared capabilities or an observed effective provider/model change.

Consumer: hosts, orchestrators, UIs, audit systems, and compatibility tooling that need to
display or compare declared capabilities, transcript data, or effective selections.

Semantic owner: this repository owns portable representation and validation. Provider
selection, context management, confidence calculation, recognition, routing, failover, and
availability remain with the producing runtime, host, or model broker.

### Public types

| Contract | Required fields | Optional fields | Invariants |
| --- | --- | --- | --- |
| `ModelCapabilityProfile` | `providerId`, `modelId`, `supportsTools`, `supportsVision`, `supportsStructuredOutput` | `contextWindow`, `supportsReasoningControls`, `supportsLocalExecution`, `supportsStreamingAudio`, `supportsFullDuplexAudio` | identifiers are non-empty; `contextWindow` is a finite positive integer in tokens when present |
| `ProviderModelSelection` | `providerId`, `modelId` | `contextWindow` | identifiers are opaque non-empty strings and are preserved as supplied |
| `RuntimeProviderModelChangedEvent` | `eventId`, `eventName`, `schemaVersion`, `runtimeId`, `runtimeInstanceId`, `correlationId`, `causationId`, `sequence`, `occurredAt`, `previous`, `current`, `reason` | `metadata` | `current` is non-null; initial selection requires `previous: null`; non-initial effective selection must change provider or model |
| `TranscriptAlternative` | `text` | `confidence` | confidence is finite and within `0..1` when present |
| `TranscriptSegment` | `text`, `startMs`, `endMs`, `requiresConfirmation` | `confidence`, `locale`, `producerLocaleLabel`, `alternatives` | finite timings are non-negative and `endMs >= startMs` |
| `SpeechProviderCapability` | `mode`, `streaming`, `fullDuplex`, `supportedLocales`, `returnsConfidence`, `interruptionSupport` | none | mode is closed; supported locales use the Portable Locale Profile |

Lifecycle:

- Capability profiles and speech capabilities are declarations. They may exist before a
  provider is selected or becomes available.
- A provider/model change event records the effective selection after it changes. It does
  not initiate a selection, failover, or recovery.
- A transcript segment is portable data. It does not represent a live recognition stream or
  define whether a user must confirm a segment.

Validation:

- `contextWindow` is the active model's maximum total per-invocation context capacity in
  native tokens. It is a finite positive integer; omission means unknown, unavailable, or
  undeclared—not zero or unlimited.
- Confidence is optional, finite, and inclusive from `0` to `1`. Omission means no confidence
  was supplied or calculated; it is not equivalent to zero.
- `PortableLocaleSchema` uses the platform BCP 47 structural validator without a live registry
  lookup, then accepts only a two-letter, three-letter, or `und` primary subtag. This is the
  Mnemosyne/Runtime Contracts Portable Locale Profile. It preserves the supplied serialization
  rather than canonicalizing it.
- `producerLocaleLabel` is an opaque producer string. It is not a locale, is not used for
  language matching, and is not passed to APIs expecting BCP 47 values.
- `INITIAL_SELECTION` requires `previous: null`. When `previous` is non-null, a changed event
  must differ in `providerId` or `modelId`; a corrected `contextWindow` alone is not a change.
- Sequence shape is validated but progression, duplicate suppression, and cross-record causal
  truth are external responsibilities.

Unknown-value behaviour:

- Unknown provider and model identifiers remain valid opaque strings.
- Model-change reasons, provider modes, and the specialized event name are closed values and
  reject unknown serialized values.
- Metadata accepts producer-defined structured values. Unknown top-level fields are stripped
  by the object schemas.

Compatibility implications:

- Consumers must not infer a provider is available, selected, or authorized from a capability
  profile alone.
- A valid `RuntimeProviderModelChangedEvent` uses its specialized immutable envelope. The
  generic `RuntimeEvent` schema remains open and does not validate this event's payload.
- An implementation must preserve provider and model identifiers exactly; it must not rewrite,
  infer, or normalize them.
- The Portable Locale Profile deliberately rejects wider BCP 47 tags with five-to-eight-letter
  primary subtags, such as `provider-default`, to avoid treating producer labels as portable
  locales without registry validation.

Example:

```ts
const changed = {
  eventId: "evt-provider-001",
  eventName: "PROVIDER_MODEL_CHANGED",
  schemaVersion: "1.4.0",
  runtimeId: "model-runtime",
  runtimeInstanceId: "model-runtime-001",
  correlationId: "corr-001",
  causationId: "cmd-001",
  sequence: 4,
  occurredAt: "2026-07-12T12:00:00Z",
  previous: { providerId: "provider-a", modelId: "model-a" },
  current: { providerId: "provider-b", modelId: "model-a", contextWindow: 128000 },
  reason: "PROVIDER_FAILOVER",
};
```

## Implemented Versus Proposed Surface

Implemented and tested in this repository:

- core validation behaviour for `Result`, `RuntimeError`, `Severity`, timestamps,
  protocol compatibility helpers, `RuntimeIdentity`, `Capability`, `RuntimeHealth`,
  `RuntimeMessage`, `RuntimeEvent`, `RuntimeComposition`, `RuntimeSession`,
  `RuntimeSkill`, `ExecutionEnvironment`, `RuntimeRiskClass`, and the lifecycle/recovery
  record family, model capabilities, speech capabilities, portable locales, transcript data,
  and provider/model-change events.

Implemented but not covered by a dedicated schema test file:

- `ProjectIdentity`
- `RuntimeMetadata`
- `RuntimeProfile`
- `RuntimeKind`
- `Version`

Proposed only, not current protocol behaviour:

- the content-surface preflight ADR and the unreleased roadmap families after `1.4.0`.

## Documentation Conflicts

The source comments and the schema implementations do not fully agree in these places.
The schema and tests describe the implemented contract:

- [`RuntimeBindingSchema`](../src/runtime/RuntimeComposition.ts) makes `required` optional
  and does not apply a default, although its source comment says "default true".
- `AuditEventSchema` now includes additive `id`, correlation, session, actor, and audit
  reference fields, resolving the earlier source-comment/schema mismatch. Generation and
  cross-record uniqueness remain outside this package.
- [`RuntimeEventSchema`](../src/runtime/RuntimeEvent.ts) accepts every non-empty event type.
  Its source comment recommends a reverse-DNS-style extension namespace, but the schema
  and tests do not enforce that convention.
- [`RuntimeMessageSchema`](../src/runtime/RuntimeMessage.ts) leaves `id` optional and does
  not generate it. Its source comment assigns generation to the sender; generation and
  uniqueness are therefore not an implemented responsibility of this package.

## Open Questions

- The repository implements symmetric negotiation helpers, but it does not specify whether
  real deployments should negotiate peer-to-peer or through a host-led selection step.
- The repository does not define a policy for correlation-ID generation or global uniqueness.
- The repository does not define canonicalization rules for runtime names beyond the
  exported constants, nor for paths, URLs, labels, or metadata values.
- The safety of future enum widening is not settled; see [evolution-policy.md](./evolution-policy.md).

## Canonical identity, scope, correlation, and delegation families

These additive families are implemented in the consolidation pass and are intentionally
implementation-free.

| Contract | Producer | Consumer | Required fields | Semantic owner and invariants |
| --- | --- | --- | --- | --- |
| `PrincipalIdentity`, `DualPrincipalContext`, `AgentExecutionContext` | host/runtime | peers and audit tooling | principal IDs/kinds; agent context also requires runtime and session | generic identity is descriptive; agent-executed requests keep authenticated human/service and acting agent identities separate |
| `ExecutionContext` | host/runtime | participating runtimes | authenticated and acting principals, `runtimeId`, `sessionId` | both principals are explicit; authentication and representation policy remain external |
| `ResourceScope` | delegating runtime/host | policy and receiving runtime | `mode` | bounded mode needs a boundary; unscoped mode has none; wildcard syntax is rejected |
| `CorrelationContext` | emitting runtime | peers/audit tooling | `requestId`, `correlationId` | optional causation/session/action/workflow/execution/step/attempt and authority/audit references are opaque; generation and uniqueness are producer-owned |
| `DelegationRequest` | requester | authority owner | request/correlation IDs, agent context, audience, scope, purpose, time, plus one capability/tool/operation reference | shape only; no grant issuance or enforcement |
| `DelegationDescriptor` | authority owner | receiving runtime/audit tooling | grant, principals, audience, scope, purpose, session, validity interval plus one capability/tool/operation reference | expiry follows `expiresAt > issuedAt`; meaning of failure reasons belongs to authority owner |
| `RuntimeReadiness` | runtime | host/discovery | `ready`, `status` | ready and `not_ready` cannot contradict; readiness is distinct from process health |
| `CompatibilityManifest` | runtime/package | host, registry, conformance tooling | runtime/package identity, optional client/build identity, version/range identity, package range, `standalone` | protocol fields must agree with the advertised range; manifest does not negotiate or discover |
| `AdoptionBaselineManifest` | release maintainer after final validation | downstream maintainers and artifact-verification tooling | package/protocol/source identity, proposed tag, tarball filename/digest/size, tool versions, documentation, fixtures, consumer tests, deferrals, gates, classification, validation | describes one immutable package artifact; generated records require a real commit/digest and only passed validation; it is not runtime registration or compatibility negotiation |
| `StateHandleReference` | state-owning runtime | peers and audit tooling | `handleId` | opaque pointer only; it is not state, authority, or a persistence API |

Unknown object fields continue to be stripped by the plain Zod objects. Closed enum values
are rejected. Open identifiers and metadata remain syntactically representable without a
registry lookup. Unknown tagged-union variants and future enum safety remain design gates.

`IdempotencyPolicy` is a declaration with `none`, `single_use`, and `bounded_replay` modes.
The latter requires a positive `maxUses`; enforcement, replay storage, and retry decisions
remain with Ananke or the runtime that owns the operation.

### Adoption-baseline lifecycle and compatibility

`AdoptionBaselineManifest` is created after the final source tree is committed and validation
has passed. It is immutable evidence for exactly one tarball. The producer records the final Git
SHA, measured artifact SHA-256 and size, environment versions, included public documentation,
fixture counts, consumer-test outcomes, deferrals, design gates, and commands. The consumer
verifies those facts before pinning the artifact.

`recordStatus: "example"` permits the committed illustrative record; `recordStatus:
"generated"` rejects zero commit/digest placeholders and any non-passing validation result.
Protocol current/minimum values must equal the supported range endpoints. Documentation paths
must be repository-relative. Plain-object unknown fields are stripped under the repository's
general Zod behavior; consumers must not depend on unrecognized fields surviving a parse.

The [example](../examples/adoption-baseline.example.json) is explicitly non-final. The generated
sidecar is not embedded in its own tarball because that would make the digest self-referential.
Changing any source or packaged content requires a new commit, artifact digest, and baseline
record. This metadata does not change peer wire compatibility by itself.

## Generic outcome and audit references

`Result<T>` remains the shared success/error envelope. Its optional request, correlation,
causation, and audit references do not assign action-outcome semantics. `AuditEvent` now
has additive identity and reference fields; the emitting runtime remains authoritative for
the audit fact. Ananke owns governed action outcomes, Mnemosyne owns context-pack and
reliability meaning, Horae owns composition semantics, and Moirae Code owns host/product
behaviour. See the [ownership matrix](./contract-ownership-matrix.md).
