# ADR-0004: Project Adrasteia Ownership of Runtime Contracts for Dual-Principal Delegation and Compatibility

- **Status:** Accepted
- **Implementation status:** Partially implemented; downstream adoption and composed conformance remain pending
- **Date:** 2026-07-14
- **Parent decision:** [ADR-0003: Dual-Principal Identity, Scoped MCP Delegation, and Cross-Runtime Compatibility](./ADR-0003-dual-principal-identity-scoped-mcp-delegation.md)
- **Related decision:** MCP 2026-07-28 Stateless Compatibility Architecture
- **Project:** Project Adrasteia
- **Decision scope:** Canonical portable contracts only

## Context

The ecosystem-wide decision requires shared representations for human and agent identity, delegation, capability scope, compatibility declarations, correlation, idempotency, and protocol-era negotiation.

Without one canonical owner, each runtime is likely to create subtly incompatible principal, session, audit, grant, and compatibility shapes.

Project Adrasteia runtime contracts must remain implementation-free. They must not contain Ananke policy, Horae workflow engines, Mnemosyne reliability logic, credential storage, network calls, or persistence.

## Decision

Project Adrasteia SHALL be the canonical owner of portable cross-runtime schemas for:

- delegating, authenticated, represented, and acting principals;
- runtime and client identity;
- tenant and resource scope;
- delegation envelopes;
- capability grants and grant references;
- approval references, without approval policy implementation;
- request, correlation, causation, workflow, execution, step, and attempt identifiers;
- idempotency declarations;
- opaque state-handle references;
- protocol version and protocol-era declarations;
- runtime compatibility manifests;
- server discovery and capability declarations;
- audit correlation fields;
- typed compatibility and authority failure reason vocabulary where shared.

It SHALL NOT mint credentials, make policy decisions, execute workflows, persist state, or infer authority.

## Required contract changes

### Principal model

Define distinct portable identities equivalent to:

```ts
interface PrincipalIdentity {
  id: string;
  kind: "human" | "service" | "agent" | "runtime";
  issuer?: string;
  tenantId?: string;
  attributes?: Record<string, string>;
}

interface DualPrincipalContext {
  authenticatedPrincipal: PrincipalIdentity;
  actingPrincipal: PrincipalIdentity;
  representedPrincipal?: PrincipalIdentity;
}
```

Exact fields shall be confirmed against existing exports and privacy requirements.

### Delegation envelope

The delegation contract SHALL support:

- issuer and subject;
- delegating and acting principals;
- audience;
- tool and operation scope;
- tenant and resource scope;
- purpose;
- approval reference;
- issued-at, not-before, and expiry;
- nonce or grant identifier;
- canonical request hash where applicable;
- execution-count or idempotency policy;
- revocation reference;
- signature metadata without implementing signing.

### Runtime request context

Replace or redefine any `RuntimeSession` semantics that imply MCP transport state.

The documentation SHALL state:

> A runtime context is Fates-owned application context. It is not an MCP protocol session, transport connection, authentication session, or proof of authority.

### Version separation

Define independent fields for:

- package version;
- Project Adrasteia runtime-contract schema/protocol version;
- supported MCP specification versions;
- supported MCP protocol eras;
- minimum and preferred versions.

MCP date-based versions SHALL NOT be represented as Fates semantic protocol versions.

### Compatibility declaration

Standardise a machine-readable manifest containing:

- runtime name and package version;
- Project Adrasteia runtime-contract version range;
- supported MCP versions and eras;
- required and optional sibling integrations;
- endpoint and transport capabilities;
- extension support;
- standalone status;
- tested commit or release references;
- declared degraded modes.

### Idempotency and state handles

Define portable, non-authoritative references. Do not define persistence or execution logic.

## Ownership boundaries

Project Adrasteia owns portable shape and structural validation; domain owners retain authority
meaning.

Ananke owns:

- authority evaluation;
- approval validation;
- credential brokering;
- idempotency enforcement;
- replay decisions.

Horae owns:

- durable workflow state;
- suspension and resumption;
- execution attempts;
- task orchestration.

Mnemosyne owns:

- governed memory and provenance;
- memory-specific access enforcement;
- reliability and conflict semantics.

Moirae Code owns:

- host/client behaviour;
- compatibility UX;
- local credential custody and process composition.

## Migration requirements

1. Inventory duplicated identity, session, audit, outcome, capability, and compatibility types.
2. Select canonical names and migration aliases.
3. Add schemas and validation tests.
4. Publish or provide an immutable versioned package.
5. Require consumers to import rather than copy canonical types.
6. Document legacy adapters and deprecation dates.
7. Add conformance fixtures for legacy and modern MCP eras.

## Security invariants

1. Contract types never imply that metadata is verified.
2. State handles never imply authority.
3. Discovery contracts never imply admission.
4. Optional fields never silently broaden authority.
5. Unknown principal, scope, protocol, or compatibility states remain representable as failures.
6. Project Adrasteia runtime contracts contain no secret material, credential exchange, policy
engine, or persistence.

## Acceptance criteria

- Canonical principal and delegation types are exported.
- `RuntimeSession` ambiguity is removed.
- Package, Fates-contract, and MCP versions are separate.
- Compatibility declaration schema is published.
- Idempotency and state-handle references are defined without implementation.
- All five repositories can consume the contracts without sibling source imports.
- Conformance tests detect duplicate or incompatible local definitions.
