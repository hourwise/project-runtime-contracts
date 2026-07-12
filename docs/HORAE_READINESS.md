# Horae Readiness

**Status: designed, not an implemented Horae integration.** Horae is treated here as a
future orchestration plane, not as another gateway implementation.

The implemented contracts can represent runtime self-description and composition data that a
future Horae implementation might use without importing Ananke or Mnemosyne internals. They
do not require every runtime to publish every record, nor do they implement orchestration.

## Responsibilities

- Ananke owns policy, approval, and action-outcome semantics for Ananke-governed actions.
  `AuditEvent` is a shared record shape; the meaning of an audit event remains with its
  producing runtime.
- Mnemosyne owns memory, source-reference, retrieval, citation, context-pack, and
  reliability semantics.
- Horae owns orchestration and composition-selection semantics.

These are ownership boundaries, not implemented behaviour in this package. See
[contract ownership](./contract-ownership.md) for the evidence and limits of each assignment.

## Available Contract Shapes

- `RuntimeIdentity`, `Capability`, and `RuntimeHealth` can represent runtime declarations.
- `RuntimeRegistration` can represent a record intended for discovery; no discovery protocol
  or registry persistence is implemented.
- `RuntimeSession` and `RuntimeProfile` can represent project, actor, task, and profile
  context where a producer supplies it.
- `RuntimeEvent` can represent cross-runtime events; delivery and coupling choices remain
  external.
- `RuntimeComposition` can represent a selected operating context; selection is not
  performed here.

## Design Principles

- Right Context: a future Horae design may use project, policy, memory, and capability
  context when composing a session.
- Minimal Surface: a future policy may expose only the capabilities needed for a task.
- Runtime Composition: the shared `RuntimeComposition` shape can name gateways, memories,
  policies, tools, and approvals explicitly.
- No Silent Drift and Observable Passage: a future system may use version declarations and
  events as evidence, but the package provides no monitoring or delivery guarantees.
- Replaceable Gateways and Progressive Disclosure: the shared shapes do not require a
  particular gateway implementation or an immediate disclosure strategy.

## Non-Goals

- No orchestration engine belongs in this package.
- No registry persistence belongs in this package.
- No Ananke policy evaluation belongs in this package.
- No Mnemosyne memory retrieval belongs in this package.
- No MCP gateway implementation belongs in this package.
