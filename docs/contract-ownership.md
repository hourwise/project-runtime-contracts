# Contract Ownership

This document distinguishes shared representation owned by this repository from the
semantic decisions owned by the relevant runtime or product. It does not assign runtime
behaviour to this package merely because the package exports a related schema or enum.

The detailed consolidated family mapping is in the [canonical contract ownership matrix](./contract-ownership-matrix.md).

## Ownership Table

| Semantic area | Owner | Evidence and status | Boundary |
| --- | --- | --- | --- |
| Shared interoperability shapes, schemas, enums, protocol vocabulary, version metadata, and compatibility helpers | Project Runtime Contracts | Implemented exports in [`src/index.ts`](../src/index.ts), the package description, and the README | This repository owns representation and validation, not runtime logic. |
| Action-outcome semantics for Ananke-governed actions | Project Ananke | Verified in Ananke's local `OutcomeState`, `FailureReasonCode`, and `Outcome`; [`Result<T>`](../src/results/Result.ts) only supplies the generic success/error envelope | This repository does not export an Ananke action-outcome vocabulary or policy engine. A different runtime owns the meaning of its own outcomes. |
| Context-pack, memory, source-reference, retrieval, citation, and reliability semantics | Project Mnemosyne | Verified in Mnemosyne's repository boundary; [`RuntimeSkill`](../src/skill/RuntimeSkill.ts) and `CapabilityCategory.Memory` are shared declarations only | No `ContextPack` or reliability contract is exported here. Mnemosyne ownership is a boundary assignment, not evidence of an implemented context-pack protocol. |
| Composition selection and orchestration semantics | Project Horae | Verified in Horae's local planner, registry, lifecycle, and session packages; [`RuntimeComposition`](../src/runtime/RuntimeComposition.ts) provides the shared record shape | The package does not create compositions, select bindings, or impose an orchestration lifecycle. |
| Host and product behaviour associated with `RUNTIME_NAMES.MOIRA` | Moirae Code | Verified in Moirae Code's apps, adapters, supervisor, and host documentation; [`RuntimeNames.ts`](../src/constants/RuntimeNames.ts) establishes only the serialized identifier `moira` | The shared package defines neither product UX nor host policy. |
| Capability and profile semantics | Producing runtime or host | [`Capability`](../src/runtime/Capability.ts), [`RuntimeProfile`](../src/runtime/RuntimeProfile.ts) | The package represents declarations, categories, and references. It does not decide whether a capability is authorized, available, or executable. |
| Lifecycle correlation, idempotency, and record representation | Project Runtime Contracts | [`RuntimeLifecycle.ts`](../src/lifecycle/RuntimeLifecycle.ts) | The package owns the shared envelope and validation only. Horae or another lifecycle engine owns transition legality, persistence, retries, and operation execution. |
| Model/speech capability, portable transcript, locale, and provider/model-change representation | Project Runtime Contracts | [`ModelCapability.ts`](../src/model/ModelCapability.ts), [`Speech.ts`](../src/speech/Speech.ts) | The package owns representation and validation. Model selection, context management, confidence calculation, recognition, provider transport, routing, failover, and availability remain external. |
| Transport implementation behaviour | Producing runtime, host, or gateway | [`RuntimeRegistration.ts`](../src/runtime/RuntimeRegistration.ts) | `RuntimeTransport` and `RuntimeEndpoint` are shapes only; no transport implementation or endpoint completeness rule is supplied. |
| Correlation-ID and message-ID generation | Producer runtime/host | [`Correlation.ts`](../src/protocol/Correlation.ts), [`RuntimeMessage.ts`](../src/runtime/RuntimeMessage.ts), [`RuntimeEvent.ts`](../src/runtime/RuntimeEvent.ts) | `CorrelationContext` requires request and correlation IDs; legacy message/event fields remain optional. The package has no generator, uniqueness rule, or cross-record enforcement. |
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

## Naming

This repository uses **Moirae Code** for the host/product boundary. The stable serialized
runtime identifier remains `moira`; the identifier is not a product-name spelling.

### Consumer status

The four sibling manifests reviewed at the commits recorded in the ownership matrix do not
depend on this package. Horae and Moirae Code retain local competing shapes, while Ananke and
Mnemosyne also retain local domain schemas. References in examples, proposals, and roadmaps
are intended-consumer evidence only, not current consumption.

## Open Questions

- Whether a `ContextPack` should become an explicit Mnemosyne-owned public contract.
- Whether negotiation is operationally owned by a host/product, peer runtimes, or a future
  orchestration layer.
- Whether reliability needs shared representation at all, or should remain solely
  Mnemosyne semantics.
