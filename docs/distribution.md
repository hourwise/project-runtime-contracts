# Distribution and compatibility manifest

`package.json` package version and `ProtocolVersion` protocol version are independent.
The current repository package is `project-runtime-contracts` at `0.4.0` and advertises
protocol `1.4.0` through `1.0.0`; no registry publication authority is assigned here.

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
   local tarball. Record the package name, commit, package version, protocol range, and
   tested peers in release notes.
2. Stage B: publish under a scoped name only after an explicit maintainer/registry owner
   authorizes the name and migration. The current repository does not claim that authority.

No sibling repository is modified or published by this project. A downstream can adopt the
tarball or package after validating the manifest and its own local schemas.
