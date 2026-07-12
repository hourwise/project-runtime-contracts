# Contract Ownership

This document maps semantic ownership across the runtime ecosystem. It distinguishes between
what this repository owns as shared representation and what other runtimes or products own
as domain meaning.

## Ownership Table

| Semantic area | Owner | Evidence | Notes |
| --- | --- | --- | --- |
| Shared interoperability shapes, schemas, enums, protocol vocabulary, version metadata, compatibility helpers | Project Runtime Contracts | [`README.md`](../README.md), [`package.json`](../package.json), [`src/index.ts`](../src/index.ts) | This repository owns representation, not runtime logic. |
| Policy, approval, and execution-governance semantics | Project Ananke | [`docs/HORAE_READINESS.md`](./HORAE_READINESS.md), `RuntimeKind.Ananke`, `CapabilityCategory.Approval` / `Policy` | This repository provides shared envelopes such as `Result<T>`, `RuntimeEvent`, and `AuditEvent`, but not Ananke policy behaviour. |
| Action-outcome meaning | Project Ananke for Ananke-governed actions; producing runtime for its own actions | [`docs/HORAE_READINESS.md`](./HORAE_READINESS.md), [`src/results/Result.ts`](../src/results/Result.ts) | The repository owns the generic success/error envelope, not the business meaning of each action outcome. |
| Memory, source-reference, retrieval, citation, and reliability semantics | Project Mnemosyne | [`docs/HORAE_READINESS.md`](./HORAE_READINESS.md), `CapabilityCategory.Memory`, `CapabilityCategory.Citation` | Shared capability/category names live here; Mnemosyne behaviour does not. |
| Context-pack semantics | Likely Project Mnemosyne, but terminology is under-specified in current evidence | [`README.md`](../README.md) excludes "Context packs or memory stores" from this repository; [`docs/HORAE_READINESS.md`](./HORAE_READINESS.md) assigns memory concerns to Mnemosyne | This is an evidence-backed ownership inference, not a first-class implemented contract term. |
| Composition selection and orchestration context | Project Horae | [`docs/HORAE_READINESS.md`](./HORAE_READINESS.md), [`src/runtime/RuntimeComposition.ts`](../src/runtime/RuntimeComposition.ts), `RuntimeBindingRole.Orchestrator` | This repository owns the `RuntimeComposition` shape; Horae-owned policy decides which composition to create. |
| Host or product behaviour for the `moira` runtime constant | Moira Code in current source terminology | [`src/constants/RuntimeNames.ts`](../src/constants/RuntimeNames.ts) | The constant comment says "Moira Code". The repository does not define product UX or host policy. |
| Transport implementation behaviour | Producing runtime, host, or gateway | [`src/runtime/RuntimeRegistration.ts`](../src/runtime/RuntimeRegistration.ts) | The repository defines `RuntimeTransport` values and endpoint records only. |
| Correlation-ID generation | Unassigned in current repository evidence | [`src/runtime/RuntimeMessage.ts`](../src/runtime/RuntimeMessage.ts), [`src/runtime/RuntimeEvent.ts`](../src/runtime/RuntimeEvent.ts) | The fields exist, but generation and uniqueness policy are not owned here. |
| Canonicalization of paths, URLs, capability IDs, and metadata | Unassigned in current repository evidence | [`src/identity/ProjectIdentity.ts`](../src/identity/ProjectIdentity.ts), [`src/runtime/RuntimeMetadata.ts`](../src/runtime/RuntimeMetadata.ts), [`src/isolation/ExecutionEnvironment.ts`](../src/isolation/ExecutionEnvironment.ts) | The repository validates shape but does not define canonical forms. |

## What This Repository Explicitly Does Not Own

The current README explicitly keeps these concerns out of the shared contracts package:

- policy engines;
- memory engines;
- persistence stores;
- database adapters;
- retrieval and reliability scoring;
- context packs or memory stores;
- gateway implementations;
- Horae orchestration logic.

Source: [`README.md`](../README.md)

## Shared Representation Versus Domain Meaning

The key boundary is:

- this repository owns shared shape and validation;
- the producing runtime or product owns behavioural meaning.

Examples:

- `RuntimeEvent` owns the shared event envelope, but the meaning of
  `payload.reason === "auto_approved"` belongs to the emitter.
- `RuntimeComposition` owns the shape of an orchestration decision, but not the policy that
  decided to expose or hide a capability.
- `Result<T>` owns the success/error envelope, but not whether a particular approval,
  retrieval, or execution should succeed.

## Documentation Conflicts

### Moira Code versus Moirae Code

Repository source currently uses `moira` as the canonical runtime constant and describes it
as the host application or client runtime, informally "Moira Code", in
[`src/constants/RuntimeNames.ts`](../src/constants/RuntimeNames.ts).

Conflicting prose:

- [`docs/ADR-XXXX-runtime-contracts-content-surface-preflight.md`](./ADR-XXXX-runtime-contracts-content-surface-preflight.md)
  also refers to "Moirae Code".

Current documentation set uses "Moira Code" when referring to the implemented `moira`
runtime constant and reports the conflicting prose rather than silently rewriting history.

### Horae And Moira Consumer Status

Current evidence is inconsistent about whether Horae and Moira Code are current consumers or
future/planned ecosystem projects:

- [`README.md`](../README.md) previously listed them as current and future consumers.
- [`docs/HORAE_READINESS.md`](./HORAE_READINESS.md) describes Horae as a future
  orchestration plane.
- [`package.json`](../package.json) description names only Ananke and Mnemosyne.

The concise README now names only the consumers that are consistently evidenced across
package metadata, examples, and source. The broader ecosystem references remain documented
here as a conflict rather than a silently resolved fact.

## Open Questions

- Whether "context pack" should be formalized as a Mnemosyne-owned public contract term.
- Whether negotiation should be explicitly owned by the host/product, by each peer runtime,
  or by a future orchestration layer.
