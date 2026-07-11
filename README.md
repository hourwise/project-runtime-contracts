# Project Runtime Contracts

Project Runtime Contracts defines the shared protocol, types, schemas, and interfaces used by the Ananke and Mnemosyne runtimes.

The project intentionally contains no runtime logic. Its purpose is to provide a small, stable, well-documented set of types and interfaces that independent runtimes can import to remain protocol compatible.

Current consumers:
- Project Ananke
- Project Mnemosyne
- Project Horae
- Moira Code

Future / potential consumers:
- Project Horae
- Moira Code
- Third-party runtimes

This repository should remain focused on contracts only. It should not contain engines, databases, persistence, policies, or runtime behavior. Keep the surface area small and stable: types, enums, constants, and small utility helpers if absolutely necessary.

## Design Goals

These principles guide all decisions in this repository:

- **Runtime independent**: no code assumes or depends on any specific runtime implementation.
- **No business logic**: only types, schemas, constants, and protocol definitions.
- **Stable public API**: changes are rare and well-considered; breaking changes require major version bumps.
- **Semantic versioning**: major, minor, patch follow standard conventions; `ProtocolVersion` tracks protocol compatibility separately.
- **Backwards compatibility where practical**: new fields are optional; old consumers should continue working.
- **Small surface area**: fewer exports means fewer breaking changes later.

Why this matters: when an orchestrator discovers that Ananke speaks Protocol 2 but Mnemosyne only speaks Protocol 1, it should immediately know they are incompatible, not halfway through execution. These contracts make that negotiation fast and deterministic.

What does not belong here:

- `ApprovalEngine`
- `MemoryEngine`
- `WorkspaceGuard`
- SQLite or database adapters
- Audit database implementations
- Retrieval, policies, or reliability scoring
- Context packs or memory stores
- MCP gateway implementations
- Horae orchestration logic

Those belong inside runtime implementations, not inside the shared contracts package.

## Quick Start

Install dev dependencies and build:

```powershell
Set-Location "D:\Users\fleur\Project Runtime Contracts"
npm install
npm run build
node dist/demo/sample-run.js
```

## Usage

Import from the package after building or when published as an npm package:

```ts
import {
  CapabilityCategory,
  ProtocolVersion,
  RuntimeHealthStatus,
  RuntimeIdentity,
  RuntimeIdentitySchema,
  RuntimeRegistrationSchema,
  RuntimeTransport,
  RUNTIME_NAMES,
} from "project-runtime-contracts";

// Check protocol compatibility.
const myProtocol = ProtocolVersion.version;
const minimum = ProtocolVersion.minimumSupported;

// Identify your runtime.
const identity: RuntimeIdentity = {
  runtime: RUNTIME_NAMES.ANANKE,
  version: "0.1.0",
  protocolVersion: myProtocol,
  minimumProtocolVersion: minimum,
  capabilities: [
    {
      id: "approval",
      name: "Approval",
      version: "0.1.0",
      category: CapabilityCategory.Approval,
    },
  ],
};

RuntimeIdentitySchema.parse(identity);

// Register a runtime without coupling to its implementation.
const registration = RuntimeRegistrationSchema.parse({
  identity,
  health: {
    healthy: true,
    status: RuntimeHealthStatus.Healthy,
    uptimeMs: 1200,
    warnings: [],
  },
  endpoints: [
    {
      transport: RuntimeTransport.Http,
      url: "http://localhost:3000",
    },
  ],
});
```

## Horae Readiness

The package now includes the contract surface needed for a future Horae orchestrator while staying runtime-neutral:

- `RuntimeIdentity` lets Ananke, Mnemosyne, Horae, gateways, and third-party runtimes answer "who are you?"
- `RuntimeCapability` describes what a runtime can provide without requiring callers to know the implementation.
- `RuntimeHealth` reports `healthy`, `busy`, `read_only`, `updating`, `unavailable`, and `degraded` states.
- `RuntimeRegistration` describes endpoints, transport, health, and capability metadata for discovery.
- `RuntimeProfile` captures operating modes such as strict enterprise, personal development, read-only, CI, production, testing, and autonomous.
- `RuntimeSession` makes project, agent, task, profile, and runtime bindings first-class.
- `RuntimeEvent` provides a shared event envelope for registration, health changes, approvals, memory updates, policy changes, and audit completion.
- `RuntimeComposition` lets an orchestrator expose only the capabilities appropriate for a task-scoped operating context.

These are contracts only. Horae can coordinate Ananke and Mnemosyne through these shapes later, but this package does not perform orchestration, routing, policy enforcement, memory retrieval, or persistence.

## Design Notes

- Keep this package minimal: only types, enums, constants, and small runtime-agnostic helpers.
- Export everything from `src/index.ts` so consumers can import from the package root.
- Use string enums where values are serialized across IPC or the network.
- Prefer capability-first contracts over runtime-specific coupling.
- Consumers should ask for `approval`, `policy`, `memory`, `citation`, or `gateway` capabilities rather than hard-coding one runtime implementation.
- Maintain a strict protocol change policy and bump `ProtocolVersion` for breaking changes.

If this package becomes widely adopted, consider shortening the repository name, for example `runtime-contracts`, and publishing as an npm package, for example `@your-org/runtime-contracts`.
