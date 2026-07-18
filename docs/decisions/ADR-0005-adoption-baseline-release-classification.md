# ADR-0005: Project Adrasteia Adoption Baseline Release Classification

- Status: Accepted
- Date: 2026-07-17
- Package version: `0.4.0`
- Protocol version: `1.4.0` (unreleased)
- Previous repository commit examined: `94df00f43fc90c78aba59763b585614a50f9b695`

## Context

The final consolidation before the first Stage-A downstream adoption tightened several draft
validators. Under the general evolution policy, narrowing accepted inputs would normally be a
breaking change. The repository did not yet have an immutable adoption baseline, however, so
the release status and actual consumer reliance must determine the classification.

The affected behavior is:

- strict `major.minor.patch` syntax without leading zeroes;
- `RuntimeIdentity` consistency between current, minimum, and supported-range versions;
- agent-only `actingPrincipal` values in `AgentExecutionContext` and delegation descriptors;
- required `correlationId` and explicit `resourceScope` in `DelegationRequest`;
- bounded/unscoped scope invariants and wildcard rejection;
- `CompatibilityManifest` consistency between current, minimum, preferred, and range fields.

## Evidence Examined

Evidence was checked on 2026-07-17:

- `git ls-remote --tags` returned no public repository tags.
- The repository contains no release manifest or prior immutable-artifact digest.
- `npm view project-runtime-contracts` returned registry `E404`; no npm publication is claimed.
- [`package.json`](../../package.json) declares package `project-runtime-contracts` version
  `0.4.0` and contains no publication configuration or credentials.
- [`CHANGELOG.md`](../../CHANGELOG.md) records protocol `1.4.0` and the tightened validators
  under Unreleased.
- [`src/protocol/ProtocolVersion.ts`](../../src/protocol/ProtocolVersion.ts) declares protocol
  `1.4.0` with minimum `1.0.0`.
- The reviewed Ananke commit
  `1e38e4580ca0f8db46a35dce67362e0e2467d794` does not declare this package as a dependency.
  Its local identity, execution, scope, approval, outcome, audit, and content-preflight shapes
  require an explicit migration; they do not evidence reliance on the earlier draft validators.
- Prior cross-repository inspection recorded no installed dependency on this package in the
  reviewed Mnemosyne, Horae, or Moirae Code manifests. Those repositories remain contextual
  evidence only and are not declared migrated.
- Before this decision, the only machine-readable compatibility fixtures covered
  `CompatibilityManifest`; no release-versioned consumer fixture bundle existed.

No public evidence was found from which an external consumer could reasonably claim an
immutable compatibility baseline for the earlier draft acceptance behavior. Private or
unpublished consumers cannot be ruled out; they were not part of the available evidence.

## Decision

The tightened validators are **pre-release corrections within the still-unreleased protocol
1.4.0**. They do not require protocol `2.0.0`, and the repository will not add separately named
legacy-compatibility schemas for payloads that were never part of an immutable adoption
baseline.

The first immutable Stage-A adoption baseline will therefore retain:

- package name `project-runtime-contracts`;
- package version `0.4.0`;
- protocol current version `1.4.0`;
- minimum supported protocol version `1.0.0`.

`@fates/runtime-contracts` remains a future authorized scoped identity. It must refer to the
same implementation if adopted; this decision does not authorize publication under either
name.

## Compatibility Classification

The decision deliberately distinguishes these compatibility dimensions:

| Dimension | Consequence |
| --- | --- |
| Protocol compatibility | Protocol `1.4.0` remains unreleased, so the corrections define its first adoption baseline rather than change an already released 1.4 wire contract. |
| Package compatibility | Package `0.4.0` has no located registry publication or immutable artifact baseline. The next Stage-A tarball is the first artifact covered by this decision. |
| TypeScript source compatibility | Code typed against earlier inferred draft shapes may stop compiling, especially delegation requests without correlation or with generic acting principals. Such code must migrate. |
| Schema-validation compatibility | Inputs formerly accepted by the draft validators may now be rejected. This narrowing is intentional and must not be reversed merely to fit a current consumer. |
| Wire compatibility | Field encodings remain JSON-compatible where the same valid fields are supplied, but legacy draft payloads that omit required context or violate invariants are not validation-compatible. |
| Consumer-baseline status | No established consumer baseline was found. Ananke requires documented adapters and additional context before adoption. |

## Legacy Draft Payloads And Migration

Legacy draft payloads receive no implicit compatibility claim. A downstream consumer must:

1. validate at its boundary against the adopted canonical schema;
2. supply missing authenticated-principal, runtime, correlation, and scope context from a
   trusted local source;
3. map local strings and references explicitly without treating capabilities as grants; and
4. retain domain-owned policy, outcome, approval, audit, and content-preflight semantics in the
   owning repository.

Ananke-specific conversions belong in Ananke or an Ananke-owned integration package. They are
not generic Project Adrasteia runtime-contract helpers.

## Rollback

Before downstream pinning, rollback means abandoning the proposed baseline and reverting this
decision together with the affected consolidation changes. Reverting only the classification
would leave source behavior and documentation inconsistent.

After an immutable baseline is tagged or adopted, loosening, renaming, or replacing its
contract behavior requires a new evidence-backed evolution decision. The published baseline
must remain reproducible; a tag or artifact must not be moved or overwritten.

## Consequences

- Release classification is no longer an open design gate.
- The corrected schemas remain strict.
- The first baseline must record its final commit and tarball digest after the final commit is
  created; the pre-pass commit above must not be used as that final source commit.
- Content preflight remains a separate, non-blocking design gate and is not included in this
  baseline.
- Dependency remediation remains separate from this protocol decision.
