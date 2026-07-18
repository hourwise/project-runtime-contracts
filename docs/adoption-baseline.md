# Stage-A Adoption Baseline

## Adoption Verdict

The Stage-A source changes are prepared for a first Ananke migration with documented adapters.
The immutable baseline does not exist until a maintainer commits the final tree and runs the
baseline generator against that clean commit.

The release classification is accepted in
[ADR-0005](./decisions/ADR-0005-adoption-baseline-release-classification.md): the tightened
validators are pre-release corrections within unreleased protocol `1.4.0`, not a protocol
`2.0.0` change.

## Identity And Version

| Field | Baseline value |
| --- | --- |
| Project identity | `Project Adrasteia` |
| Repository identity | `Project-Adrasteia` |
| Source repository | `https://github.com/hourwise/Project-Adrasteia` |
| Serialized protocol identity | `Fates Runtime Protocol` |
| Previous commit reviewed before this pass | `94df00f43fc90c78aba59763b585614a50f9b695` |
| Final baseline commit | Generated from the final clean commit; not the pre-pass commit |
| Package name | `project-runtime-contracts` |
| Package version | `0.4.0` |
| Future authorized name | `@fates/runtime-contracts` (not published; scope authority pending) |
| Protocol current | `1.4.0` |
| Protocol minimum | `1.0.0` |
| Supported protocol range | `1.0.0` through `1.4.0` |
| Proposed tag | `adrasteia-adoption-v0.4.0-protocol-1.4.0` |

Stage A retains one implementation. It does not publish two diverging package identities and
does not claim that either package name is available from npm. The repository identity is a
project naming decision; the source repository is now `https://github.com/hourwise/Project-Adrasteia`.

Adrasteia owns portable contract representation and structural validation. It does not enforce
runtime authority. A schema-valid request is not necessarily an authorised request; Ananke remains
the owner of policy, approval, and governed execution.

## Baseline Record

`AdoptionBaselineManifestSchema` describes the package artifact and its evidence. It is separate
from `CompatibilityManifestSchema`, which describes an operating runtime, and from
`RuntimeRegistrationSchema`, which describes a runtime registration.

The committed [example](../examples/adoption-baseline.example.json) uses `recordStatus:
"example"` plus zero-valued commit and digest placeholders. It is not release evidence. Generated
records reject those placeholders, failed or unexecuted validation, and machine-local paths.

The generated sidecar is deliberately outside the tarball. This avoids a self-referential digest:
the sidecar records the SHA-256 of the completed `.tgz`, while the `.tgz` contains the schema,
example, fixtures, and public documentation needed to interpret the sidecar.

## Public Documentation In The Artifact

The package-content check requires:

- README and changelog;
- protocol specification, negotiation, evolution, ownership, conformance, glossary, distribution,
  migration, and design-gate documentation;
- this baseline record, the Ananke adapter report, and dependency advisory review;
- accepted decision records, including ADR-0005;
- compatibility and adoption-baseline examples;
- the first-migration fixture catalog.

Missing required content fails `npm run package:verify` and `npm run pack:smoke`.

## Fixture Coverage

The machine-readable catalog at
[`fixtures/adoption-v1/catalog.json`](../fixtures/adoption-v1/catalog.json) contains 87 cases:

| Family | Cases |
| --- | ---: |
| Principal identity | 5 |
| Dual-principal context | 5 |
| Agent execution context | 5 |
| Resource scope | 6 |
| Correlation and causation | 5 |
| Portable action, approval, delegation, and audit references | 7 |
| Delegation request | 8 |
| Delegation descriptor | 7 |
| Runtime identity | 6 |
| Runtime registration | 5 |
| Runtime readiness | 5 |
| Runtime health | 5 |
| Protocol version range | 6 |
| Protocol negotiation | 6 |
| Compatibility manifest | 6 |

Each family includes minimal valid, complete valid, missing-required, invalid-type, and semantic
negative evidence. Fixtures contain portable contract data only; Ananke consumer evidence is
kept separately under `tests/consumer`.

## Ananke Result

The reviewed Ananke commit is
`1e38e4580ca0f8db46a35dce67362e0e2467d794`. It has no declared Project Adrasteia runtime-contract dependency.
Its current shapes do not directly satisfy the canonical execution, scope, correlation,
registration, or protocol envelopes. A packed external-consumer test therefore reports
`adapter_required`; see the [adapter report](./ananke-adapter-report.md).

The adapters must remain Ananke-owned. Adrasteia runtime contracts do not absorb Ananke policy,
approval, outcome, audit, canonical-hash, or content-preflight semantics.

## Content Preflight

Content preflight is not included. Ananke's local preflight types remain authoritative within
Ananke, and this baseline makes no compatibility claim for them. Identity, scope, correlation,
delegation, registration, readiness, health, and negotiation adoption may proceed independently.
A portable preflight contract requires a later cross-owner decision.

## Status Distinctions

| Status | Current claim |
| --- | --- |
| Code complete | Prepared in this pass; subject to the validation results reported at handoff |
| Locally validated | Claimed only for commands actually reported at handoff or in a generated manifest |
| Immutable artifact generated | No; generation requires the final committed clean tree |
| Tag proposed | Yes |
| Tag created | No |
| Release published | No |
| Downstream adopted | No |

## Finalization And Verification

After committing the intended final tree, run:

```text
npm run baseline:create
```

The command refuses a dirty tree, runs the full validation matrix, packs the exact commit, and
writes the tarball plus `<tarball>.baseline.json` under ignored `artifacts/`. The generated record
contains the exact source commit, Node/npm versions, filename, size, SHA-256, documentation,
fixture counts, validation commands, design gates, content-preflight status, and Ananke result.

Before tagging, verify that the generated `sourceCommit` equals `git rev-parse HEAD`, that the
digest matches the tarball, and that the working tree is still clean. Then create the annotated
tag without implying npm publication:

```text
git tag -a adrasteia-adoption-v0.4.0-protocol-1.4.0 -m "Project Adrasteia adoption baseline: package 0.4.0, protocol 1.4.0"
```

This repository does not create or push that tag automatically. Tags and artifacts are immutable;
if verification fails, correct the source and create a new final commit rather than moving a
published tag.

## Downstream Order

1. Commit and generate the clean Project Adrasteia baseline.
2. Verify and, with explicit authorization, create the proposed annotated tag.
3. Pin Ananke to the measured tarball/tag and implement its boundary adapters.
4. Migrate identity, scope, correlation/reference, registration/readiness/health, and protocol
   families before broader delegation adoption.
5. Keep content preflight and other owner-specific domains outside this migration.
6. Use the same evidence-led process for Mnemosyne, Horae, and Moirae Code after Ananke.
