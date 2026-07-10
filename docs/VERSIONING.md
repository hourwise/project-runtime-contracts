# Versioning

We use semantic versioning for the package and for `ProtocolVersion`.

- Major: incompatible protocol changes.
- Minor: additive, backwards-compatible changes.
- Patch: documentation or non-behavioral changes.

When bumping `ProtocolVersion`, update `src/protocol/ProtocolVersion.ts` and add an entry to the protocol history.

## Protocol History

- `1.1.0`: Additive Horae-readiness contracts for runtime capabilities, health status, registration, profiles, sessions, events, and runtime composition.
- `1.0.0`: Initial shared runtime identity, result, audit, message, and protocol version contracts.
