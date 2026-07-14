# Downstream migration guide

This is an adoption checklist for Ananke, Mnemosyne, Horae, Moirae Code, or another peer.
It is not a claim that any peer has already migrated.

1. Inventory local runtime-contracts schemas and map each one to the ownership matrix.
2. Add the package as an explicit dependency in the downstream repository; retain local
   domain schemas where this package is intentionally non-owning.
3. Start with additive envelopes: `PrincipalIdentity`/`ExecutionContext`,
   `CorrelationContext`, `ResourceScope`, readiness, and compatibility manifests.
4. Keep domain meanings local: Ananke action outcomes, Mnemosyne context packs and
   reliability, Horae composition policy, and Moirae product behaviour are not replaced by
   generic fields.
5. Run positive, negative, unknown-field, unknown-enum, and JSON round-trip tests against
   the adopted schemas. Verify the negotiated range before sending a payload that uses a
   newer optional field.
6. Record the downstream commit, package version, protocol range, and any unsupported
   capability in `testedPeers` or release documentation.

## Compatibility cautions

- Existing sibling packages currently contain duplicate local schemas; replacing them is
  a breaking downstream change and requires an owner-approved migration.
- `ResourceScope` has explicit `bounded` and `unscoped` modes. Wildcard semantics are not
  defined and wildcard values are rejected by the portable profile.
- Correlation identifiers are required by `CorrelationContext`, but this package does not
  generate, deduplicate, persist, or globally validate them.
- A delegation descriptor is evidence of a grant-shaped record, not a credential or an
  authorization decision.
