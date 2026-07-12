# Changelog

This changelog records repository changes only where the repository itself provides evidence.
If a published release tag, date, or external release note is not present in the repository,
it is not fabricated here.

## Unreleased

- Added a documentation set for protocol specification, version negotiation, evolution
  policy, ownership boundaries, conformance, glossary terms, and an ADR index.
- Shortened the README so it links to the protocol documentation instead of duplicating it.
- Recorded current documentation conflicts around Horae consumer status and
  "Moira Code" versus "Moirae Code" naming.

## Evidence-Backed History

### Current package state

- [`package.json`](./package.json) currently declares package version `0.2.0`.
- [`src/protocol/ProtocolVersion.ts`](./src/protocol/ProtocolVersion.ts) currently declares
  protocol `1.2.0` with `minimumSupported` `1.0.0`.

### Protocol milestones recorded in repository docs

- `1.2.0`: additive contracts for portable skills, execution isolation, and shared runtime
  risk classes. Existing open-ended capability risk strings remain supported.
- `1.1.0`: additive Horae-readiness contracts for runtime capabilities, health status,
  registration, profiles, sessions, events, and runtime composition.
- `1.0.0`: initial shared runtime identity, result, audit, message, and protocol version
  contracts.

Source: [`docs/VERSIONING.md`](./docs/VERSIONING.md)
