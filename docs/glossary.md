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
formerly described informally as "Moira Code." This documentation uses **Moirae Code** for the product boundary
specified for this documentation pass; the `moira` serialized identifier is unchanged.
See the documented naming conflict in [contract ownership](./contract-ownership.md).

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
documentation ownership boundary assigns its semantics to Project Mnemosyne, but there is
no public `ContextPack` contract in this repository yet.

## Protocol Version

The shared interoperability version range represented by `ProtocolVersion.version` and
`ProtocolVersion.minimumSupported`. It is separate from the npm package version. The
negotiation helpers accept numeric `major.minor.patch` strings; `RuntimeProtocol` itself is
only an interface with string fields.

## Correlation Identifier

An optional string used to link related messages or events across runtimes. It appears in
`RuntimeMessage.correlationId` and `RuntimeEvent.correlationId`. The repository does not
define how such identifiers are generated, whether they are globally unique, or whether a
recipient must echo one in a response.

## Connector

An integration surface or bridge to another system. This term does not currently have a
public contract in the repository source. Related implemented terms are `RuntimeTransport`,
`RuntimeEndpoint`, and `gateway`, but "connector" itself is not a stable exported type.

## Model Broker

A component that would select or route between model providers. This term is not currently
represented by a public `ModelBroker` contract in the repository. `ModelCapabilityProfile`
and `RuntimeProviderModelChangedEvent` represent declarations and observed effective changes,
but they do not select or route providers.

## Principal

An identified human, service, agent, or runtime represented by `PrincipalIdentity`. Identity
is descriptive; it is not proof of authentication or authority.

## Execution Context

The cross-runtime application context represented by `ExecutionContext`. It requires an
authenticated principal, an acting principal, a runtime identifier, and a session ID; it is
separate from any MCP transport session.

## Resource Scope

An explicit `ResourceScope` declaration. `bounded` carries at least one boundary and
`unscoped` carries none. Wildcard syntax has no portable semantics and is rejected.

## Delegation

A grant-shaped request or descriptor connecting principals, audience, purpose, capabilities,
scope, session, and validity interval. The shared package does not issue, sign, store,
revoke, or enforce a grant.

## Compatibility Manifest

The descriptive `CompatibilityManifest` record advertising versions, ranges, integrations,
transports, capabilities, constraints, degraded modes, and tested peers. It is not a
discovery or negotiation algorithm.

## Adoption Baseline Manifest

The immutable package-artifact evidence record validated by `AdoptionBaselineManifestSchema`.
It identifies the exact source commit, package and protocol versions, tarball digest and size,
validation, public documentation, fixture coverage, consumer tests, deferrals, and design gates.
It is not a `RuntimeRegistration` or `CompatibilityManifest` and does not imply publication or
downstream adoption.

## State Handle

An opaque `StateHandleReference` pointing to state owned by another runtime. It carries no
state contents, authority, persistence guarantee, or lifecycle operation.

## Open Questions

- Whether "context pack" should be formalized as a Mnemosyne-owned public contract term.
- Whether "connector" should remain host/product terminology or become a shared protocol term.
- Whether future model-selection contracts should define a first-class "model broker" role.
