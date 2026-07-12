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

- Public object contracts are implemented as `z.object(...)` schemas.
- Required fields are the non-optional schema members in the exported source files.
- Optional fields may be omitted; the current schemas do not inject implicit runtime defaults.
- Timestamps use [`ISO8601TimestampSchema`](../src/utils/Timestamp.ts) and must be full
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
- JSON round-trip compatibility is tested for the major object families and value enums.

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
| `ProtocolVersion` | `version`, `minimumSupported` | none | both are semantic-version strings; `minimumSupported <= version` |
| `RuntimeProtocol` | `version`, `minimumSupported` | none | shape only; no runtime logic |
| `Version` | `major`, `minor`, `patch` | none | non-negative integers |
| `RUNTIME_NAMES` | `ananke`, `mnemosyne`, `horae`, `moira` | none | lower-case canonical constants |
| `RuntimeKind` | closed enum values | none | one of `ananke`, `mnemosyne`, `horae`, `gateway`, `tool-runtime`, `other` |

Lifecycle:

- `ProtocolVersion` is package-global metadata.
- `RuntimeProtocol` values are copied into runtime identity and negotiation flows.
- `RUNTIME_NAMES` are compile-time constants rather than negotiated values.

Validation:

- `parseVersion`, `compareVersions`, `isCompatible`, `selectBestVersion`, and `negotiate`
  are implemented in [`src/protocol/ProtocolCompatibility.ts`](../src/protocol/ProtocolCompatibility.ts).
- `parseVersion` accepts `major.minor.patch` numeric strings only.
- `isCompatible` accepts a proposed version only when the major version matches and the
  proposed version falls within `minimumSupported <= proposed <= runtimeVersion`.
- `negotiate` returns the highest overlapping compatible version or `null`.

Unknown-value behaviour:

- Unknown `RuntimeKind` values are rejected by `RuntimeKindSchema`.
- Unknown runtime names in free-string fields are not rejected unless the field is
  explicitly typed to a closed enum elsewhere.

Compatibility implications:

- Package version and protocol version are separate concepts; package `0.2.0` currently
  publishes protocol `1.2.0`.
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
| `RuntimeIdentity` | `runtime`, `version`, `protocolVersion` | `minimumProtocolVersion`, `kind`, `instanceId`, `displayName`, `capabilities`, `metadata` | required strings must be non-empty |
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
  protocolVersion: "1.2.0",
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
| `Capability` / `RuntimeCapability` | `id`, `name`, `version` | `description`, `category`, `exposure`, `tags`, `requiresApproval`, `riskClass`, `metadata` | required strings must be non-empty |
| `RuntimeEndpoint` | `transport` | `id`, `url`, `command`, `args`, `protocol`, `metadata` | `transport` is a closed enum |
| `RuntimeRegistration` | `identity` | `capabilities`, `health`, `endpoints`, `registeredAt`, `expiresAt`, `profileIds`, `metadata` | timestamps must parse if present |
| `RuntimeProfile` | `id`, `name` | `description`, `mode`, `discoveryMode`, `requiredCapabilities`, `exposedCapabilities`, `hiddenCapabilities`, `runtimeNames`, profile references, `budget`, `metadata` | required strings must be non-empty |
| `SessionBudget` | none | `maxDurationMs`, `maxToolCalls`, `maxWriteActions`, `maxApprovalRequests` | non-negative integers only |

Lifecycle:

- Capabilities may be declared on `RuntimeIdentity` and repeated on `RuntimeRegistration`.
- Registrations may expire via `expiresAt`; this package does not enforce expiry logic.
- Profiles describe an intended operating context before or during session creation.

Validation:

- `CapabilityCategory`, `CapabilityExposure`, `RuntimeTransport`,
  `RuntimeProfileMode`, and `CapabilityDiscoveryMode` are all closed enums.
- `RuntimeRegistration` currently has no dedicated schema test file, but it is used in the
  README example and [`tests/sample-import.ts`](../tests/sample-import.ts).
- `RuntimeProfile` currently has no dedicated schema test file.

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
| `RuntimeSession` | `id`, `startedAt` | `profileId`, `project`, `agent`, `task`, `runtimeIds`, `expiresAt`, `metadata` | required strings non-empty; timestamps must parse |
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

## Messaging And Event Family

Purpose: carry imperative messages and declarative events between runtimes.

Producer: any runtime or host participating in cross-runtime communication.

Consumer: any peer runtime, host, registry, or audit sink.

Semantic owner: this repository owns the shared envelope structure. Message semantics and
event payload semantics remain with the producing runtime or extension namespace.

### Public types

| Contract | Required fields | Optional fields | Invariants |
| --- | --- | --- | --- |
| `RuntimeMessage` | `type` | `id`, `payload`, `sender`, `timestamp`, `correlationId` | `type` non-empty; timestamp must parse if present |
| `RuntimeEvent` | `id`, `type`, `timestamp`, `sourceRuntime` | `targetRuntime`, `sessionId`, `correlationId`, `payload` | required strings non-empty |
| `RuntimeEventType` | closed core event names | none | reserved core values only when validating against the enum schema |

Lifecycle:

- `RuntimeMessage` is request/notification/response oriented.
- `RuntimeEvent` records facts that already occurred.
- Correlation across messages or events uses a caller-supplied `correlationId`; this
  repository does not define how such identifiers are generated.

Validation:

- `RuntimeMessage.payload` accepts any JSON-like value, including arrays, scalars, and `null`.
- `RuntimeEvent.type` is validated as a non-empty string in the object schema, so extension
  event types are allowed.
- `RuntimeEventTypeSchema` validates only the built-in core event names.

Unknown-value behaviour:

- Unknown core event names are rejected by `RuntimeEventTypeSchema`.
- Unknown extension event names are accepted by `RuntimeEventSchema`.
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
| `Result<T>` | `success` plus exactly one of `data` or `error` | none | `success: true` requires `data`; `success: false` requires `error` |
| `RuntimeError` | `code`, `message`, `recoverable` | `details` | required strings non-empty |
| `Severity` / `AuditSeverity` | closed enum values | none | one of `info`, `warning`, `error`, `critical` |
| `AuditEvent` | `timestamp`, `runtime`, `event`, `severity` | `details` | timestamp must parse; required strings non-empty |

Lifecycle:

- `Result<T>` is transient operation output.
- `AuditEvent` is an immutable fact that has already occurred.

Validation:

- `createResultSchema(...)` enforces the discriminated-union invariant.
- `RuntimeError.details` and `AuditEvent.details` accept arbitrary structured data.
- `AuditSeverity` is a re-export of the shared `Severity` enum and schema.

Unknown-value behaviour:

- Unknown severity values are rejected.
- Unknown fields are stripped for tested schemas.

Compatibility implications:

- Consumers must branch on `success` rather than assuming a specific payload shape.
- The repository does not define domain-specific outcome enums, approval outcomes, or
  reliability scores.

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

## Implemented Versus Proposed Surface

Implemented and tested in this repository:

- core validation behaviour for `Result`, `RuntimeError`, `Severity`, timestamps,
  protocol compatibility helpers, `RuntimeIdentity`, `Capability`, `RuntimeHealth`,
  `RuntimeMessage`, `RuntimeEvent`, `RuntimeComposition`, `RuntimeSession`,
  `RuntimeSkill`, `ExecutionEnvironment`, and `RuntimeRiskClass`.

Implemented but not covered by a dedicated schema test file:

- `ProjectIdentity`
- `RuntimeMetadata`
- `RuntimeRegistration`
- `RuntimeProfile`
- `RuntimeKind`
- `Version`

Proposed only, not current protocol behaviour:

- the content-surface preflight ADR and the unreleased roadmap families after `1.2.0`.

## Open Questions

- The repository implements symmetric negotiation helpers, but it does not specify whether
  real deployments should negotiate peer-to-peer or through a host-led selection step.
- The repository does not define a policy for correlation-ID generation or global uniqueness.
- The repository does not define canonicalization rules for runtime names beyond the
  exported constants, nor for paths, URLs, labels, or metadata values.
- The safety of future enum widening is not settled; see [evolution-policy.md](./evolution-policy.md).
