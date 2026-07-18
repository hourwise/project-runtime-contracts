# Project Adrasteia

Project Adrasteia is the canonical project identity for the Fates Runtime Protocol. Its
repository identity is `Project-Adrasteia`; its current Stage-A package remains
`project-runtime-contracts`. Adrasteia defines shared runtime-contract vocabulary, schemas,
types, and compatibility helpers. It is a contracts-only package: it does not implement policy
engines, orchestration, memory systems, transport adapters, or other runtime logic.

Adrasteia owns portable contract representation and structural validation. It does not enforce
runtime authority: a schema-valid request is not necessarily an authorised request. Ananke owns
policy, approval, and governed execution.

The serialized protocol identity is **Fates Runtime Protocol**. The intended future scoped package
identity is `@fates/runtime-contracts`, pending scope ownership and explicit release authority;
no scoped publication is claimed.

Out of scope for this package: policy engines, orchestration logic, memory systems,
retrieval and reliability scoring, context packs or memory stores, persistence, database
adapters, gateway implementations, and other host/runtime behaviour.

The repository currently has no direct dependency evidence from a sibling runtime. The
following projects are the intended interoperability peers; their local contract packages
remain authoritative until they adopt this package:

- Project Ananke
- Project Mnemosyne
- Project Horae
- Moirae Code

Install and validate locally:

```text
npm ci
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
- [Canonical contract matrix](docs/contract-ownership-matrix.md)
- [Distribution and adoption](docs/distribution.md)
- [Stage-A adoption baseline](docs/adoption-baseline.md)
- [Ananke adapter report](docs/ananke-adapter-report.md)
- [Dependency advisory review](docs/dependency-advisory-review.md)
- [Downstream migration](docs/downstream-migration.md)
- [Design gates](docs/design-gates.md)
