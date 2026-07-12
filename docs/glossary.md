# Glossary

This glossary defines repository terminology using implemented source and current project
docs. Where a term is not yet represented by a public contract, that is stated explicitly.

## Runtime

An independently identifiable component in the ecosystem that can advertise identity,
capabilities, health, and other shared protocol metadata. Repository evidence:
`RuntimeIdentity`, `RuntimeRegistration`, `RuntimeKind`, and `RUNTIME_NAMES`.

## Host

A client or host application participating in runtime interactions. Current source evidence
appears in [`src/constants/RuntimeNames.ts`](../src/constants/RuntimeNames.ts), where the
well-known `moira` runtime is described as the host application or client runtime,
informally "Moira Code".

## Capability

A declared function or service a runtime offers, represented by `Capability` /
`RuntimeCapability`. A capability has an `id`, `name`, `version`, and optional descriptive
metadata such as category, exposure, tags, and risk indication.

## Composition

A selected set of runtimes bound to explicit roles for a project, session, or profile
context. The shared representation is `RuntimeComposition`, which contains one or more
`RuntimeBinding` records.

## Proposal

A pre-execution request or intent record. This term is not yet an implemented public
contract in the current repository. It appears only indirectly in roadmap material such as
the proposed `BrowserActionProposal` work. Do not treat "proposal" as a current stable
export.

## Approval

A governance decision point for allowing or denying an action. Repository evidence includes
`CapabilityCategory.Approval`, `RuntimeBindingRole.Approval`, and core event names such as
`approval.granted` and `approval.denied`. Detailed approval policy semantics are not owned
by this repository.

## Execution

The act of performing work through a runtime or tool source. The repository currently
provides related vocabulary such as `CapabilityCategory.Execution` and
`RuntimeBindingRole.ExecutionGovernor`, but it does not define a full execution protocol or
runtime behaviour.

## Outcome

The result of an operation. The shared envelope is `Result<T>`, which distinguishes success
with `data` from failure with `error`. Domain-specific outcome meaning belongs to the
producing runtime.

## Audit Event

An immutable fact recording a significant occurrence that has already happened. The shared
shape is `AuditEvent`, with `timestamp`, `runtime`, `event`, `severity`, and optional
structured `details`.

## Context Pack

A repository-external memory/context term that appears only in prose today. The README
explicitly lists "Context packs or memory stores" as out of scope for this package. The
current docs suggest this area belongs with Mnemosyne semantics, but there is no public
`ContextPack` contract in this repository yet.

## Protocol Version

The shared interoperability version range represented by `ProtocolVersion.version` and
`ProtocolVersion.minimumSupported`. It is separate from the npm package version.

## Correlation Identifier

An optional string used to link related messages or events across runtimes. It appears in
`RuntimeMessage.correlationId` and `RuntimeEvent.correlationId`. The repository does not
define how such identifiers are generated or whether they are globally unique.

## Connector

An integration surface or bridge to another system. This term does not currently have a
public contract in the repository source. Related implemented terms are `RuntimeTransport`,
`RuntimeEndpoint`, and `gateway`, but "connector" itself is not a stable exported type.

## Model Broker

A component that would select or route between model providers. This term is not currently
represented by a public contract in the repository. The roadmap mentions future model
capability discovery work, but no `ModelBroker` or equivalent export exists today.

## Open Questions

- Whether "context pack" should be formalized as a Mnemosyne-owned public contract term.
- Whether "connector" should remain host/product terminology or become a shared protocol term.
- Whether future model-selection contracts should define a first-class "model broker" role.
