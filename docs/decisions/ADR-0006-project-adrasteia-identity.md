# ADR-0006: Project Adrasteia Identity

- **Status:** Accepted
- **Date:** 2026-07-17
- **Decision owners:** Project Adrasteia maintainers
- **Applies to:** Project-facing documentation, ownership records, and adoption metadata

## Decision

Adopt **Project Adrasteia** as the canonical project identity for the shared Fates contract
foundation. Adrasteia represents the unavoidable contractual invariants and compatibility rules
that every participating Fate must satisfy.

The names are deliberately distinct:

| Concern | Canonical identity |
| --- | --- |
| Project identity | Project Adrasteia |
| Repository identity | Project-Adrasteia |
| Current Stage-A package identity | `project-runtime-contracts` |
| Intended future scoped package identity | `@fates/runtime-contracts` |
| Serialized protocol identity | Fates Runtime Protocol |

The source repository is now
`https://github.com/hourwise/Project-Adrasteia`. This ADR does not rename the npm package, publish
a scoped package, or claim scope ownership or release authority.

## Authority Boundary

Adrasteia owns portable contract representation and structural validation. It does not enforce
runtime authority. A request that passes a schema is not thereby authorised.

Ananke remains the owner of policy, approval, and governed execution. Portable schemas may carry
references and declarations needed for interoperability, but they do not replace Ananke's
authority decisions or execution controls.

## Naming And Distribution Consequences

- Project-facing titles and ownership records use Project Adrasteia.
- Technical terms such as runtime contracts, protocol contracts, compatibility manifest, and
  schema names remain unchanged where they improve precision.
- The adoption baseline uses the proposed tag
  `adrasteia-adoption-v0.4.0-protocol-1.4.0`.
- The package remains `project-runtime-contracts`; `@fates/runtime-contracts` is future intent
  only, pending scope ownership and explicit release authority.
- Serialized interoperability continues to identify itself as Fates Runtime Protocol.

## Evidence And Migration

The existing package name, import examples, and source paths remain technical or evidence-backed
identifiers. They are not rewritten to imply a package move. New baseline metadata records both
project/repository identity and the actual source URL so an artifact verifier can distinguish
naming intent from distribution state.
