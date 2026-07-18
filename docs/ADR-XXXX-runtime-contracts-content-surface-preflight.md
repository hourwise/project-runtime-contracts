# ADR-XXXX: Project Adrasteia Content Surface Preflight Contracts

- **Status:** Proposed
- **Date:** 2026-07-12
- **Decision owners:** Project Adrasteia maintainers
- **Applies to:** Project Adrasteia, Project Horae, Project Ananke, Project Mnemosyne, Moirae Code
- **Related concepts:** typed outcomes, runtime identity, audit events, capability discovery, provenance

## Context

The runtime ecosystem already defines how components identify themselves, advertise capabilities, exchange typed outcomes, and record audit events. It does not yet define a shared contract for inspecting untrusted files or document-like content before that content is exposed to an LLM, agent, tool, or persistent memory system.

A tool call may be correctly authorised while the content returned by that tool remains unsafe or unsuitable for direct model ingestion. Examples include prompt-injection instructions, secrets, malformed documents, archive bombs, extension and MIME mismatches, embedded scripts, excessive extracted text, and attacker-controlled metadata.

## Decision

Project Adrasteia may define a common **Content Surface Preflight** contract separating observation, decision, receipt, and typed outcome, subject to the existing cross-owner gate.

The shared package will define stable types and validation rules only. It will not implement scanning, policy, routing, or UI logic.

## Required Types

```ts
export type ContentExposureLevel =
  | "NONE"
  | "DERIVED_ONLY"
  | "SANITIZED_METADATA"
  | "SELECTED_CONTENT"
  | "FULL_CONTENT";

export type ContentPreflightOutcome =
  | "PASS"
  | "PASS_WITH_FLAGS"
  | "DERIVED_ONLY"
  | "QUARANTINED"
  | "UNSUPPORTED"
  | "RESOURCE_LIMIT_EXCEEDED"
  | "INSPECTION_FAILED";

export type ContentRiskFlag =
  | "INSTRUCTION_LIKE_CONTENT"
  | "SECRET_LIKE_CONTENT"
  | "TYPE_MISMATCH"
  | "EMBEDDED_SCRIPT"
  | "EMBEDDED_EXECUTABLE"
  | "MACRO_PRESENT"
  | "EXTERNAL_REFERENCE"
  | "ENCRYPTED_CONTENT"
  | "PASSWORD_PROTECTED"
  | "ARCHIVE_NESTING"
  | "DECOMPRESSION_RISK"
  | "PATH_TRAVERSAL"
  | "SYMLINK_ESCAPE"
  | "ZERO_WIDTH_OR_HIDDEN_TEXT"
  | "EXCESSIVE_SIZE"
  | "EXCESSIVE_EXTRACTED_TEXT"
  | "PARSER_ERROR"
  | "UNKNOWN_FORMAT";

export interface ContentSourceIdentity {
  canonicalPath?: string;
  sourceUri?: string;
  contentHash: string;
  sizeBytes: number;
}

export interface ContentSurfaceObservation {
  observationId: string;
  source: ContentSourceIdentity;
  scannerRuntimeId: string;
  scannerVersion: string;
  scannerPolicyId?: string;
  detectedType: string;
  observedAt: string;
  structuralFacts: Record<string, boolean | number | string>;
  riskFlags: ContentRiskFlag[];
  outcome: ContentPreflightOutcome;
}

export interface ContentAccessDecision {
  decisionId: string;
  observationId: string;
  exposureLevel: ContentExposureLevel;
  permittedFields?: string[];
  omittedFields?: string[];
  reasonCodes: string[];
  requiresApproval: boolean;
  approvalId?: string;
  policyVersion: string;
  decidedAt: string;
}

export interface ContentPreflightReceipt {
  receiptId: string;
  observation: ContentSurfaceObservation;
  decision: ContentAccessDecision;
  emittedContentHash?: string;
  emittedSurfaceHash?: string;
  truncated: boolean;
  previousReceiptHash?: string;
  signature?: string;
}
```

## Contract Rules

1. Observation and authority remain separate.
2. Derived facts and source-controlled strings must be distinguishable.
3. The default exposure level for untrusted content is `DERIVED_ONLY`.
4. A failed or timed-out scan must never be represented as a clean pass.
5. Every decision must reference the exact observation it evaluated.
6. Every receipt must bind to the source content hash.
7. Transformed, redacted, selected, or truncated output should have its own emitted-surface hash.
8. Detector lexicons and private rules must not appear in agent-readable output.
9. Reason codes must not reveal sensitive detector internals.
10. Unknown or unsupported formats fail closed according to caller policy.

## Capability Discovery

Recommended capabilities:

- `content.observe`
- `content.inspect_structure`
- `content.inspect_metadata`
- `content.extract_selected`
- `content.extract_full`
- `content.verify_receipt`

## Audit Integration

Audit events should be able to reference observation, decision, receipt, source hash, emitted surface hash, scanner runtime/version, policy version, and approval identity.

## Consequences

### Positive

- One stable contract across the ecosystem.
- Stronger provenance and chain-of-custody.
- Progressive disclosure without tight coupling.
- Replaceable scanner implementations.

### Negative

- Additional type and versioning responsibilities.
- Backward compatibility must be maintained once published.
- Contracts alone do not guarantee secure parsing.

## Acceptance Criteria

- Shared types are published.
- Validation rejects missing hashes and invalid outcomes.
- Decisions cannot reference nonexistent observations.
- Receipts represent derived-only, selected, redacted, truncated, and full exposure.
- Audit events link observation, decision, and receipt identifiers.
- Tests prove scan failure cannot be interpreted as a clean pass.
