# Project Adrasteia distribution and compatibility manifest

Project Adrasteia is the project identity and `Project-Adrasteia` is the repository identity.
The serialized protocol identity is `Fates Runtime Protocol`.
`package.json` package version and `ProtocolVersion` protocol version are independent.
The current repository package is `project-runtime-contracts` at `0.4.0` and advertises
protocol `1.4.0` through `1.0.0`; no registry publication authority is assigned here.

The proposed first immutable tag is
`adrasteia-adoption-v0.4.0-protocol-1.4.0`. It identifies the project and protocol context
without claiming npm publication. It has not been created. The final artifact and tag must point
to the final commit produced after this pass, not the reviewed pre-pass commit
`94df00f43fc90c78aba59763b585614a50f9b695`.

## Package identity decision

The current install and import name remains `project-runtime-contracts`. Renaming it in this
pass would break current local package references and the repository contains no evidence that
the `@fates` npm scope is owned or that publication is authorized.

The recommended future scoped package name is `@fates/runtime-contracts`, subject to explicit npm
scope ownership and release authorization. Migration must produce one implementation, not two
diverging packages: publish the same built surface under the authorized scoped name, deprecate
the old name only after consumers have an upgrade path, and record the mapping in release notes.
No scoped package publication or release is claimed here.

`CompatibilityManifestSchema` is a descriptive, machine-readable record containing:

- runtime, optional client, package, protocol, and supported-range versions;
- the required runtime-contracts package range;
- minimum and optional preferred protocol versions;
- optional and required integrations, supported transports, capabilities, standalone
  status, known constraints, degraded modes, and tested-peer evidence.

The manifest does not discover peers, negotiate transport, verify an MCP version, or prove
that a capability is callable. A producer must keep `protocolVersion`,
`minimumSupportedProtocolVersion`, and `supportedProtocolRange` consistent; the schema
rejects drift.

## Staged publication path

1. Stage A: build, typecheck, test, pack, and run the packed-consumer smoke test against a
   local tarball. Distribute only an immutable Git tag, GitHub release artifact, or tarball
   whose exact digest and source commit are recorded. Downstream manifests or lockfiles must
   record the exact package version, artifact, or commit; sibling source-tree imports are not
   permitted.
2. Stage B: publish under a scoped name only after an explicit maintainer/registry owner
   authorizes `@fates/runtime-contracts` and its migration. Consumers then use normal package
   version ranges consistent with the evolution policy. The current repository does not claim
   that authority.

No sibling repository is modified or published by this project. A downstream can adopt the
tarball or package after validating the manifest and its own local schemas.

The packed artifact includes the README, changelog, public protocol/evolution/conformance/
ownership documentation, ADR index and records, design gates, downstream migration guide, and
the compatibility and adoption-baseline examples. See the
[Stage-A adoption baseline](./adoption-baseline.md) for generation, digest verification, fixture
coverage, and status distinctions.
