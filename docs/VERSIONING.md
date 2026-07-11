# Versioning

We use semantic versioning for the package and for `ProtocolVersion`.

- Major: incompatible protocol changes.
- Minor: additive, backwards-compatible changes.
- Patch: documentation or non-behavioral changes.

When bumping `ProtocolVersion`, update `src/protocol/ProtocolVersion.ts` and add an entry to the protocol history.

## Protocol History

- `1.2.0`: Additive contracts for portable skills, execution isolation, and shared runtime risk classes. Existing open-ended capability risk strings remain supported.
- `1.1.0`: Additive Horae-readiness contracts for runtime capabilities, health status, registration, profiles, sessions, events, and runtime composition.
- `1.0.0`: Initial shared runtime identity, result, audit, message, and protocol version contracts.

## Migration Notes

### 1.2.0

- No existing payload changes are required.
- Consumers may adopt `RuntimeSkill`, `ExecutionEnvironment`, and `RuntimeRiskClass` incrementally.
- `Capability.riskClass` remains an open-ended legacy field in 1.x. New contracts use the shared `RuntimeRiskClass` vocabulary; no consumer must migrate until a future major release.
