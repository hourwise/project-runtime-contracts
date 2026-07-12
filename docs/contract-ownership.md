# Contract Ownership

This document distinguishes shared representation owned by this repository from the
semantic decisions owned by the relevant runtime or product. It does not assign runtime
behaviour to this package merely because the package exports a related schema or enum.

## Ownership Table

| Semantic area | Owner | Evidence and status | Boundary |
| --- | --- | --- | --- |
| Shared interoperability shapes, schemas, enums, protocol vocabulary, version metadata, and compatibility helpers | Project Runtime Contracts | Implemented exports in [`src/index.ts`](../src/index.ts), the package description, and the README | This repository owns representation and validation, not runtime logic. |
| Action-outcome semantics for Ananke-governed actions | Project Ananke | Documentation-pass authority boundary; [`Result<T>`](../src/results/Result.ts) only supplies the generic success/error envelope | This repository does not export an Ananke action-outcome vocabulary or policy engine. A different runtime owns the meaning of its own outcomes. |
| Context-pack, memory, source-reference, retrieval, citation, and reliability semantics | Project Mnemosyne | Documentation-pass authority boundary; [`RuntimeSkill`](../src/skill/RuntimeSkill.ts) and `CapabilityCategory.Memory` are shared declarations only | No `ContextPack` or reliability contract is exported here. Mnemosyne ownership is a boundary assignment, not evidence of an implemented context-pack protocol. |
| Composition selection and orchestration semantics | Project Horae | Documentation-pass authority boundary; [`RuntimeComposition`](../src/runtime/RuntimeComposition.ts) provides the shared record shape | The package does not create compositions, select bindings, or impose an orchestration lifecycle. Horae remains described as a future orchestration plane in [`HORAE_READINESS.md`](./HORAE_READINESS.md). |
| Host and product behaviour associated with `RUNTIME_NAMES.MOIRA` | Moirae Code | Documentation-pass authority boundary; [`RuntimeNames.ts`](../src/constants/RuntimeNames.ts) establishes only the serialized identifier `moira` | The shared package defines neither product UX nor host policy. See the naming conflict below. |
| Capability and profile semantics | Producing runtime or host | [`Capability`](../src/runtime/Capability.ts), [`RuntimeProfile`](../src/runtime/RuntimeProfile.ts) | The package represents declarations, categories, and references. It does not decide whether a capability is authorized, available, or executable. |
| Lifecycle correlation, idempotency, and record representation | Project Runtime Contracts | [`RuntimeLifecycle.ts`](../src/lifecycle/RuntimeLifecycle.ts) | The package owns the shared envelope and validation only. Horae or another lifecycle engine owns transition legality, persistence, retries, and operation execution. |
| Model/speech capability, portable transcript, locale, and provider/model-change representation | Project Runtime Contracts | [`ModelCapability.ts`](../src/model/ModelCapability.ts), [`Speech.ts`](../src/speech/Speech.ts) | The package owns representation and validation. Model selection, context management, confidence calculation, recognition, provider transport, routing, failover, and availability remain external. |
| Transport implementation behaviour | Producing runtime, host, or gateway | [`RuntimeRegistration.ts`](../src/runtime/RuntimeRegistration.ts) | `RuntimeTransport` and `RuntimeEndpoint` are shapes only; no transport implementation or endpoint completeness rule is supplied. |
| Correlation-ID and message-ID generation | Unassigned | [`RuntimeMessage.ts`](../src/runtime/RuntimeMessage.ts), [`RuntimeEvent.ts`](../src/runtime/RuntimeEvent.ts) | Fields are optional strings. The package has no generator, uniqueness rule, or cross-record enforcement. |
| Canonicalization of paths, URLs, capability IDs, metadata, or serialization order | Unassigned | [`ProjectIdentity.ts`](../src/identity/ProjectIdentity.ts), [`RuntimeMetadata.ts`](../src/runtime/RuntimeMetadata.ts), [`ExecutionEnvironment.ts`](../src/isolation/ExecutionEnvironment.ts) | The schemas validate selected shapes; they do not define canonical forms or serialization ordering. |

## What This Repository Explicitly Does Not Own

The README keeps these concerns out of the shared contracts package:

- policy engines;
- orchestration logic;
- memory systems, context packs, retrieval, and reliability scoring;
- persistence and database adapters;
- gateway implementations;
- provider transport; and
- host/product behaviour.

Source: [`README.md`](../README.md)

## Shared Representation Versus Domain Meaning

The shared contracts preserve enough structure for runtimes to exchange records. They do
not make the records' domain effect a package-level decision. For example:

- `Result<T>` describes a success/error envelope; it does not decide whether an approval,
  retrieval, or execution should succeed.
- `RuntimeComposition` describes bindings; it does not decide which runtimes or
  capabilities should be bound.
- `RuntimeEvent` describes an event envelope; an event payload's meaning remains with its
  producer or extension owner.
- `RuntimeRiskClass` and `SkillTrustState` are declarations; neither enforces a policy.

## Documentation Conflicts

### Moirae Code naming

This documentation uses **Moirae Code** for the host/product boundary, as specified for
this documentation pass. The stable serialized runtime identifier remains `moira`.

[`RuntimeNames.ts`](../src/constants/RuntimeNames.ts) currently calls that host application
"Moira Code" in a source comment. That comment is code documentation and cannot be changed
in this documentation-only pass. It is therefore a remaining source/documentation naming
conflict, not a reason to rename the `moira` identifier.

### Consumer status

The current README and package description name Project Ananke and Project Mnemosyne as
consumers. They do not establish Project Horae or Moirae Code as current consumers.
`HORAE_READINESS.md` calls Horae a future orchestration plane. References to Horae or Moirae
Code in examples, proposals, and roadmaps are not evidence of current consumption.

## Open Questions

- Whether a `ContextPack` should become an explicit Mnemosyne-owned public contract.
- Whether negotiation is operationally owned by a host/product, peer runtimes, or a future
  orchestration layer.
- Whether reliability needs shared representation at all, or should remain solely
  Mnemosyne semantics.
