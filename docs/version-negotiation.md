# Version Negotiation

This document defines the currently implemented compatibility model for package versions,
protocol versions, and capability advertisement.

## Package Version Versus Protocol Version

- The npm package version is declared in [`package.json`](../package.json). It is currently
  `0.4.0`.
- The protocol version is declared separately in
  [`src/protocol/ProtocolVersion.ts`](../src/protocol/ProtocolVersion.ts). It is currently:
  - `version: "1.4.0"`
  - `minimumSupported: "1.0.0"`
- Package version changes and protocol version changes are related but not identical:
  one package release may publish additive protocol contracts without changing every
  existing payload shape.

## Implemented Compatibility Algorithm

The authoritative helper implementation is in
[`src/protocol/ProtocolCompatibility.ts`](../src/protocol/ProtocolCompatibility.ts).

### Version parsing

- Only numeric semantic versions in `major.minor.patch` form are accepted.
- `parseVersion("01.02.03")` currently parses successfully to numeric components.
- Pre-release and build metadata are not supported by the negotiation helpers even though
  `RuntimeSkill.version` accepts semantic-version suffixes.

### Acceptance rule

A runtime with protocol version `V` and minimum supported version `M` accepts a proposed
version `P` only when both of these are true:

1. `P.major === V.major`
2. `M <= P <= V`

The implemented `isCompatible(...)` helper returns `false` on invalid input rather than
throwing.

### Selection rule

`selectBestVersion(...)` filters a candidate list through `isCompatible(...)` and returns
the highest compatible version or `null`.

### Two-party negotiation rule

`negotiate(...)` is symmetric. Given two peers:

- if their major versions differ, negotiation fails with `null`;
- otherwise the function computes the overlapping range between the two supported ranges;
- if the ranges overlap, the negotiated version is the highest common version;
- if the ranges do not overlap, negotiation fails with `null`.

This symmetry belongs to the pure `negotiate(...)` helper only. `isCompatible(...)` is
directional: it answers whether one runtime's range accepts a proposed version. Neither
helper chooses a network initiator, host, registry, or discovery sequence.

Example:

```ts
import { negotiate } from "project-runtime-contracts";

negotiate("1.2.0", "1.0.0", "1.1.0", "1.0.0");
// returns "1.1.0"
```

## Supported Ranges

The current repository state declares support for protocol versions from `1.0.0` through
`1.4.0` inclusive.

Implications:

- a peer proposing `1.0.0`, `1.0.5`, `1.1.0`, `1.2.0`, `1.3.0`, or `1.4.0` can be compatible if the local
  runtime also supports those ranges;
- a peer proposing `0.9.9` is too old;
- a peer proposing `2.0.0` is incompatible because the major version differs.

## Downgrade Behaviour

The implemented helper supports downgrade by selecting the highest shared version in the
overlap. It does not provide payload transformation rules.

What is defined:

- a runtime may agree on an older protocol version than its current maximum version;
- the agreed value is a single semantic version string.

What is not defined:

- a standard wire payload for announcing downgrade;
- per-field downgrade transforms;
- a rule for mixed-version capability subsets beyond the single negotiated protocol version.

## Capability And Feature Negotiation

This repository provides capability advertisement surfaces but does not define a full
feature-negotiation algorithm.

Implemented surfaces:

- `RuntimeIdentity.capabilities`
- `RuntimeRegistration.capabilities`
- `RuntimeProfile.requiredCapabilities`
- `RuntimeProfile.exposedCapabilities`
- `RuntimeProfile.hiddenCapabilities`
- `RuntimeBinding.capabilityIds`
- `RuntimeComposition.exposedCapabilityIds`
- `RuntimeComposition.hiddenCapabilityIds`

Current behaviour:

- capability IDs are open non-empty strings;
- categories and exposure states are closed enums where used;
- no shared registry or negotiation handshake decides whether an unknown capability ID
  should be ignored, hidden, mapped, or treated as an error.

Capability advertisement is descriptive representation. It does not prove that a
capability is currently callable, authorized, or available, and it does not select an
execution path.

Practical compatibility implication:

- protocol negotiation can succeed while capability negotiation still requires local policy.

## Unknown Capabilities, Enums, And Event Types

### Capability identifiers

- Capability IDs are open strings.
- Unknown capability IDs are therefore representable.
- The repository does not define whether receivers should ignore or reject unsupported IDs.

### Closed enums

The following contract surfaces reject unknown serialized enum values:

- `CapabilityCategory`
- `CapabilityExposure`
- `RuntimeHealthStatus`
- `RuntimeTransport`
- `RuntimeProfileMode`
- `CapabilityDiscoveryMode`
- `RuntimeBindingRole`
- `RuntimeKind`
- `RuntimeEventType` when validated against the enum schema
- `Severity`
- `SkillKind`
- `SkillTrustState`
- `IsolationLevel`
- `RuntimeRiskClass`

### Event types

- `RuntimeEventTypeSchema` is closed to the built-in core values.
- `RuntimeEventSchema` is intentionally open and accepts any non-empty `type` string,
  including values used as extension namespaces such as `com.example.custom_event`.
- The object schema does not enforce the reverse-DNS-style extension convention described
  in the `RuntimeEvent` source comment. Receivers must therefore not infer namespace
  validity from successful schema validation.

## Optional-Field Evolution And Compatibility

Current repository evidence supports this model:

- new optional fields are the preferred additive mechanism in minor protocol releases;
- schemas accept omitted optional fields; consumers must not treat an omitted optional
  field as present or assume an implied default;
- tested schemas strip unknown top-level fields during parsing rather than preserving them.

Compatibility consequence:

- an older consumer may successfully parse a newer payload while dropping fields it does
  not understand.

Limitation:

- the repository does not yet provide a conformance fixture set proving this behaviour for
  every exported object contract.

## Incompatibility Representation

Implemented forms:

- `isCompatible(...)` returns `false`;
- `selectBestVersion(...)` returns `null` when no compatible candidate exists;
- `negotiate(...)` returns `null` when the supported ranges do not overlap.

Not implemented:

- a standard `RuntimeMessage` negotiation request or failure reply shape;
- a standard `RuntimeEvent` for negotiation failure;
- a standard `RuntimeError.code` reserved for protocol incompatibility.

## Is Negotiation Symmetric Or Host-Led?

Implemented today:

- the helper algorithm is symmetric between two peers.

Not specified today:

- whether real deployments must use direct peer negotiation, host-led selection, or
  registry-driven version choice;
- whether version negotiation happens before runtime discovery, after discovery, or as part
  of registration.

This is an open protocol question rather than established repository behaviour.

## Open Questions

- Safety of adding new members to closed enums is not yet normatively classified as
  additive or breaking.
- Handling of future unknown tagged-union variants beyond the existing `Result<T>` envelope
  is not specified.
- Negotiation precedence relative to discovery is not defined.
- The repository does not define ownership of canonicalization for capability IDs, runtime
  names outside `RUNTIME_NAMES`, or endpoint URLs.
- A source comment says a `RuntimeBinding.required` value defaults to `true`, but the
  implementation does not apply a default. This is documented in the protocol
  specification as a source/schema conflict, not a downgrade rule.
