# Evolution Policy

This document describes how the shared contract surface should evolve without adding runtime
logic. It reflects current repository rules and calls out unresolved questions explicitly.

## Baseline Rules

- Package versioning uses semantic versioning.
- `ProtocolVersion` is tracked separately from the npm package version.
- Breaking shared-protocol changes require a major protocol-version change.
- Minor protocol releases are intended for additive, backward-compatible changes except
  where the change needs the explicit enum or union compatibility review below.
- Patch releases are for documentation or other non-behavioural adjustments.

These baseline rules are stated in [`docs/VERSIONING.md`](./VERSIONING.md),
[`README.md`](../README.md), and [`src/protocol/ProtocolVersion.ts`](../src/protocol/ProtocolVersion.ts).

## Additive Changes

The following changes are additive under the current repository model:

- adding a new exported schema, type, enum, or helper without narrowing existing inputs;
- adding a new optional object field;
- adding new documentation, examples, or migration notes without changing code semantics;
- adding new open-string event names when they are carried through `RuntimeEvent.type`
  rather than forced into a closed enum field.

Required discipline for additive changes:

- new fields should be optional unless every supported producer can already provide them;
- new shared contracts must be exported from [`src/index.ts`](../src/index.ts);
- tests and migration notes should accompany the change.

Adding a new exported enum type is different from adding a new member to an existing enum:
the former does not widen an existing serialized value set, while the latter remains an
open compatibility decision.

## Breaking Changes

The following changes are breaking under the current repository model:

- changing the meaning of an existing serialized field or enum value;
- renaming or removing a public export;
- renaming or removing a serialized field;
- making an optional field required;
- narrowing an open string field into a closed enum or tighter validator;
- changing the protocol compatibility algorithm or supported-range interpretation;
- changing unknown-field handling from strip to reject or preserve;
- removing support for an existing `ProtocolVersion.minimumSupported` range in a way that
  requires peers to upgrade before communication continues.

Protocol impact:

- breaking shared-protocol changes require a major protocol-version bump.

## Enum And Union Widening

This repository does not currently treat enum widening as automatically safe.

Why this is unresolved:

- many public values are implemented as closed Zod enums;
- consumers may validate against those enums or exhaustively switch over the unions;
- the repository has not yet published a rule that adding a new enum member is always
  minor-safe or always major-breaking.

Current policy:

- adding a new member to a closed enum requires explicit compatibility review;
- the changelog and migration notes must state whether existing consumers are expected to
  ignore, surface, or fail on the new value;
- do not silently classify enum widening as additive.

Union status:

- `Result<T>` is a closed discriminated union over `success: true | false`;
- future open tagged unions have no published widening policy yet.

## Optional Versus Required Fields

Current rule:

- prefer optional fields for additive evolution.

Implications:

- old producers can continue emitting smaller payloads;
- old consumers can often parse newer payloads and strip unknown optional fields;
- fields should not acquire implied runtime defaults in the shared schema unless that
  default is itself a stable protocol rule.

Breaking transition:

- changing a field from optional to required is a breaking change unless introduced under a
  new contract name or major version boundary.

## Renames, Removals, And Deprecation

Renames:

- renaming a serialized field, enum value, or public export is breaking.
- if a rename is necessary, preserve the old shape through a documented migration period or
  ship the new name under a new contract surface.

Removals:

- removal of a public contract, enum value, or field is breaking.

Deprecation:

- the repository does not currently define a fixed support window in releases or months;
- deprecations should be documented in `CHANGELOG.md`, migration notes, and versioning docs;
- removal should not happen without a clearly documented upgrade path.

## Experimental Namespaces

Implemented today:

- `RuntimeEvent.type` supports extension namespaces as open strings.
- The `RuntimeEventType` enum reserves only the built-in core values.

Not implemented today:

- a repository-wide experimental namespace convention for every contract family;
- an experimental escape hatch for closed enums such as `RuntimeHealthStatus` or
  `RuntimeRiskClass`.

Policy consequence:

- do not invent experimental namespaces for closed enum fields without first adding an
  explicit contract mechanism.

## Schema Migration

The repository currently relies on additive evolution, migration notes, and compatibility
helpers rather than automated schema migration.

Required migration artefacts for protocol changes:

- an update to [`docs/VERSIONING.md`](./VERSIONING.md);
- a changelog entry in [`CHANGELOG.md`](../CHANGELOG.md);
- migration guidance describing old and new payload expectations;
- representative tests or examples showing the new accepted shapes.

These are documentation-maintenance requirements. They are not automated by the package
or its compatibility helpers.

Not currently defined:

- automatic payload up-conversion or down-conversion helpers;
- a canonical migration DSL;
- a conformance fixture directory for every release.

## Changelog Requirements

Each protocol-relevant change should record:

- whether the package version changed;
- whether `ProtocolVersion` changed;
- whether the change is additive, breaking, or documentation-only;
- any migration note required for consumers;
- any unresolved compatibility caveat, especially around enum widening or open-string
  extension points.

The changelog must remain evidence-backed. If the repository does not record a release tag
or date, the changelog should say so rather than inventing one.

## Open Questions

- No support period or release-window policy is currently decided.
- The safety classification of new closed-enum members is still unresolved.
- The repository does not define whether unknown future union variants should be ignored,
  rejected, or surfaced as opaque data.

## Consolidation additions

The identity, scope, correlation, delegation, readiness, and manifest schemas in the
current working tree are additive fields and new exports. They do not change the required
fields of existing contracts. A release that includes them must record the package/protocol
version decision in the changelog; this working tree does not claim a published release or
invent a support window.

The closed `PrincipalKind`, readiness, dependency-state, and delegation-failure enums still
require explicit review before widening. `ResourceScope` rejects wildcard syntax because no
shared wildcard semantics have been accepted. Unknown union variants remain a design gate
rather than an implicit ignore-or-reject rule.
