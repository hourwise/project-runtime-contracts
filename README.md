# Project Runtime Contracts

Project Runtime Contracts defines the shared protocol vocabulary, schemas, types, and
compatibility helpers used across the runtime ecosystem. It is a contracts-only package:
it does not implement policy engines, orchestration, memory systems, transport adapters,
or other runtime logic.

Out of scope for this package: policy engines, orchestration logic, memory systems,
retrieval and reliability scoring, context packs or memory stores, persistence, database
adapters, gateway implementations, and other host/runtime behaviour.

Current consumers named consistently in package metadata, examples, and source:

- Project Ananke
- Project Mnemosyne

Install and validate locally:

```powershell
Set-Location "D:\Users\fleur\Project Runtime Contracts"
npm install
npm run validate
```

Minimal usage:

```ts
import {
  CapabilityCategory,
  ProtocolVersion,
  RuntimeHealthStatus,
  RuntimeIdentitySchema,
  RuntimeRegistrationSchema,
  RuntimeTransport,
  RUNTIME_NAMES,
} from "project-runtime-contracts";

const identity = RuntimeIdentitySchema.parse({
  runtime: RUNTIME_NAMES.ANANKE,
  version: "0.1.0",
  protocolVersion: ProtocolVersion.version,
  minimumProtocolVersion: ProtocolVersion.minimumSupported,
  capabilities: [
    {
      id: "approval",
      name: "Approval",
      version: "0.1.0",
      category: CapabilityCategory.Approval,
    },
  ],
});

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

Documentation:

- [Protocol specification](docs/protocol-specification.md)
- [Version negotiation](docs/version-negotiation.md)
- [Evolution policy](docs/evolution-policy.md)
- [Contract ownership](docs/contract-ownership.md)
- [Conformance](docs/conformance.md)
- [Glossary](docs/glossary.md)
- [Changelog](CHANGELOG.md)
- [ADR index](docs/decisions/README.md)

Additional repository planning and history:

- [Versioning notes and protocol history](docs/VERSIONING.md)
- [Roadmap](docs/ROADMAP.md)
- [Build plan](docs/BUILD_PLAN.md)
