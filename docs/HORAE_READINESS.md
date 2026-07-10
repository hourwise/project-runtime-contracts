# Horae Readiness

Horae is treated here as a future orchestration plane, not as another gateway implementation.

The contracts in this repository should let each runtime self-describe so Horae can compose a governed operating context without importing Ananke or Mnemosyne internals.

## Responsibilities

- Ananke governs execution: policy, approval, audit, and typed outcomes.
- Mnemosyne governs memory: knowledge, source references, reliability, retrieval, and citation.
- Horae should govern attention: which runtimes, memories, policies, gateways, and capabilities are visible for a given session.

## Contract Requirements

- Every runtime exposes `RuntimeIdentity`.
- Every runtime exposes capabilities using stable capability IDs and categories.
- Every runtime can report `RuntimeHealth`.
- Runtimes can publish `RuntimeRegistration` records for discovery.
- Sessions use `RuntimeSession` so project, agent, task, and profile context are explicit.
- Profiles use `RuntimeProfile` so strict enterprise, personal development, read-only, CI, production, testing, and autonomous modes can be selected without scattered config.
- Cross-runtime state changes use `RuntimeEvent` instead of direct coupling.
- A selected operating context is represented by `RuntimeComposition`.

## Laws Of Horae

- Right Context: an agent must operate inside the correct project, policy, memory, and capability context.
- Minimal Surface: expose only capabilities needed for the current task.
- Runtime Composition: gateways, memories, policies, tools, and approvals are composed explicitly.
- No Silent Drift: runtime versions, policies, memories, and capabilities must be visible when they change.
- Observable Passage: transitions between agent, gateway, runtime, memory, and tool should be traceable.
- Replaceable Gateways: no contract assumes a single gateway implementation.
- Progressive Disclosure: capabilities can remain hidden until they are appropriate for the task.

## Non-Goals

- No orchestration engine belongs in this package.
- No registry persistence belongs in this package.
- No Ananke policy evaluation belongs in this package.
- No Mnemosyne memory retrieval belongs in this package.
- No MCP gateway implementation belongs in this package.
