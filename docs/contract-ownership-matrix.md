# Project Adrasteia canonical contract ownership matrix

Project Adrasteia owns portable contract representation and structural validation for the Fates
Runtime Protocol. It does not enforce runtime authority: a schema-valid request is not necessarily
an authorised request. Ananke owns policy, approval, and governed execution.

This matrix assigns portable representation separately from domain semantics. It is based on
the target repository and read-only review of Ananke `1e38e458`, Mnemosyne `c5d3ed08`, Horae
`80bba3a8`, and Moirae Code `e3a99c09` on 2026-07-17.

| Contract family | Canonical owner and extent | Verified current duplicate or local shape | Migration target | Compatibility risk |
| --- | --- | --- | --- | --- |
| runtime identity and instance | Project Adrasteia runtime contracts, full portable shape | Horae `@horae/schema`; Moirae Code `@moirae/runtime-contracts` | `RuntimeIdentity` | local required fields and versions differ |
| registration and endpoints | Project Adrasteia runtime contracts, full portable shape | Horae registration; Moirae Code copied registration family | `RuntimeRegistration` | endpoint completeness and transport assumptions are not standardized |
| health and readiness | Project Adrasteia runtime contracts, portable observations | Horae local health/lifecycle; Moirae Code copied health plus supervisor logic | `RuntimeHealth`, `RuntimeReadiness` | health and readiness must remain distinct; supervisor policy stays local |
| lifecycle records | Project Adrasteia runtime contracts, envelopes and vocabulary | Horae lifecycle state and transition engine | lifecycle exports | transition legality and persistence remain Horae/runtime-owned |
| Fates protocol and compatibility | Project Adrasteia runtime contracts, versions, ranges, helpers, manifest | Horae exact `0.1.0`; Moirae Code copied protocol `1.1.0`; Mnemosyne reports unknown in testbench | `ProtocolVersion`, negotiation helpers, `CompatibilityManifest` | no adoption claim until pinned consumer tests pass |
| capability declarations | Project Adrasteia runtime contracts, descriptive shape | Horae and Moirae Code local capability types | `Capability` | discovery never implies authorization or availability |
| session/application context | Project Adrasteia runtime contracts only for portable context | Horae orchestration sessions; Moirae Code copied `RuntimeSession` | `AgentExecutionContext` and portable `RuntimeSession` fields | MCP/transport and orchestration state must not be conflated |
| composition | Horae semantics; Project Adrasteia runtime-contract record shape only | Horae local composition/planning packages | `RuntimeComposition` for interchange | selection and workflow policy remain Horae-owned |
| generic event and result | Project Adrasteia runtime contracts for open event/generic transport result | Horae and Moirae Code local copies; Ananke domain `Outcome` | `RuntimeEvent`, `Result<T>` where generic | domain outcomes and retry meaning must not be flattened |
| generic audit reference/envelope | Project Adrasteia runtime contracts for correlation only | each runtime has domain audit records | `AuditReference`, `AuditEvent` where portable | arbitrary metadata must be redacted by producer; no canonical ordering |
| approval reference | Project Adrasteia runtime-contract reference envelope only | Ananke approval grants and receipts | `ApprovalReference` | validation, hashes, stores, and authority stay in Ananke |
| action outcomes | Ananke | Ananke `OutcomeState`, `FailureReasonCode`, `Outcome` | remain in Ananke; reference through generic result only when appropriate | copying would create competing policy semantics |
| memory context pack, provenance, reliability | Mnemosyne | Mnemosyne memory packages | remain in Mnemosyne; add a shared reference only after agreement | reliability and admission meanings are unresolved cross-runtime |
| content preflight | Ananke policy/decision semantics; shared transport ownership gated | Ananke implemented local observation/access types; Horae and Moirae Code proposed flows; no matching Mnemosyne contract | design gate before any Project Adrasteia runtime-contract schema | field ownership and destination/admission semantics are not agreed |
| dual-principal delegation | Project Adrasteia runtime-contract portable descriptor; Ananke authority | Ananke local execution identity lacks the full shared pair | `AgentExecutionContext`, `DelegationRequest`, `DelegationDescriptor` | metadata is not a credential or authorization decision |
| tenant/resource scope | Project Adrasteia runtime-contract portable declaration; policy owner interprets | Ananke currently uses a string scope | `ResourceScope` | wildcards are rejected; explicit `unscoped` must not be inferred |
| host/product behaviour | Moirae Code | Moirae Code apps, supervisor, adapters, and UX | remain in Moirae Code | shared schemas must not absorb host behaviour |

## Adoption status

None of the four reviewed sibling manifests depends on `project-runtime-contracts` or
`@fates/runtime-contracts`. The duplicate locations above remain authoritative locally until
their owners approve and test migrations. This matrix is not evidence of current consumption.
