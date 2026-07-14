# Design gates and unresolved decisions

The following items remain deliberately open. They must be decided by the named owner
before a future change turns them into normative protocol behaviour.

- **Package scope and publication:** current package name is `project-runtime-contracts`;
  scoped publication ownership is not assigned.
- **Content preflight:** the repository does not merge Ananke policy outcomes with
  Mnemosyne provenance; a shared receipt requires a cross-repository decision.
- **Horae session context:** `ExecutionContext` is a portable shape, not a decision that
  Horae creates or owns every session across runtimes.
- **Wildcard scopes:** no wildcard language or safety semantics are accepted.
- **Action outcomes:** Ananke owns domain outcome meaning; this package keeps `Result<T>`
  generic.
- **Negotiation sequencing:** the helpers are symmetric, but deployment ownership of
  host-led negotiation and its ordering relative to discovery is open.
- **Unknown union variants and new enum members:** receiving behaviour is not silently
  defined by this package; each owner must decide whether to reject, preserve, or ignore.
- **Correlation generation and canonicalization:** producers own generation; no shared
  uniqueness, canonical ordering, or serialization-order rule is defined.
- **Idempotency vocabulary:** `none`, `single_use`, and `bounded_replay` are portable
  declaration values for this working tree; Ananke must confirm their final safety and
  replay semantics before treating them as an enforcement contract.
