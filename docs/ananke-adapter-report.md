# Ananke Packed-Consumer And Adapter Report

## Evidence Boundary

- Ananke repository: `https://github.com/hourwise/Project-Ananke`
- Commit: `1e38e4580ca0f8db46a35dce67362e0e2467d794`
- Read-only source paths:
  - `package.json`
  - `packages/schema/src/index.ts`
  - `packages/runtime-core/src/auth.ts`
  - `packages/runtime-core/src/index.ts`
- Reproducible representative payloads:
  `tests/consumer/ananke-1e38e458.json`
- Disposable packed test: `npm run ananke:consumer`

Ananke is private package `ananke@0.1.0` at the reviewed commit and does not declare
`project-runtime-contracts`. The consumer test copies pinned representative payload data into a
temporary project, installs the Runtime Contracts tarball, imports only the package root, and
does not modify or import Ananke source.

## Result

Overall classification: **adapter required**.

No complete first-migration contract family is an exact direct match. Several identifiers are
structurally reusable, and approval/audit pointers need only small reference adapters. Execution,
scope, correlation, registration, readiness, health, and protocol declarations need structural
mapping or additional trusted context. Canonical schemas are not weakened to accept Ananke's
local draft shapes.

## Adapter Map

Validation point for every mapped value is the Ananke boundary immediately before emitting or
accepting the portable contract. Unless stated otherwise, the adapter belongs in Ananke or an
Ananke-owned integration package.

| Family | Current Ananke source | Target | Classification | Conversion, missing data, and ownership |
| --- | --- | --- | --- | --- |
| Authenticated principal | Workload `ExecutionIdentity` has no separate human/service principal. Dashboard `OperatorIdentity.operatorId` identifies an operator. | `AuthenticatedPrincipal` | Additional-context requirement; rename-only only for operator-side human context | Workload calls must obtain a trusted human/service principal from Ananke authentication. For operator-side records, map `operatorId` to `id` and set `kind: "human"`; do not silently treat every operator as the workload authenticator. Validate with `AuthenticatedPrincipalSchema`. |
| Acting agent | `ExecutionIdentity.agentPrincipalId` / `ExecutionContext.agentPrincipalId` | `ActingAgentPrincipal` | Rename-only adapter | Map to `{ id: agentPrincipalId, kind: "agent" }`; validate with `ActingAgentPrincipalSchema`. Identity is not a grant. |
| Runtime identity | No exported runtime identity/version/protocol envelope | `RuntimeIdentity` | Additional-context requirement | Supply runtime name/version, protocol version/range, and optional build/package facts from trusted Ananke configuration or build metadata. Validate with `RuntimeIdentitySchema`; information is currently unavailable in the payload. |
| Runtime registration | No exported registration | `RuntimeRegistration` | Additional-context requirement | Compose validated runtime identity plus endpoints/capabilities/health/readiness that Ananke explicitly exposes. Do not infer endpoint readiness from process existence. |
| Execution context | `ExecutionIdentity` and `ExecutionContext` contain agent, tenant, string scope, session, auth metadata, and Ananke-owned `policyVersion` | `AgentExecutionContext` | Structural adapter plus additional context | Map agent and session/tenant fields; add trusted authenticated principal and `runtimeId`. Keep `policyVersion` in Ananke domain data. Validate with `AgentExecutionContextSchema`. |
| Tenant/project/workspace scope | `tenantId` exists; project/workspace identifiers do not occur in these exported execution shapes | `AgentExecutionContext.tenantId/projectId/workspaceId` | Direct field plus additional-context requirement | Copy non-empty `tenantId`. Supply project/workspace only when a trusted Ananke source has them; do not derive them from the scope string. |
| Resource scope | `resourceScope: string`, including examples such as `filesystem:/workspace` and wildcard forms such as `filesystem:*` | `ResourceScope` | Structural adapter; wildcard inputs blocked by unresolved semantics | Parse a known non-wildcard namespace into explicit bounded fields and retain `tenantId`. Validate with `ResourceScopeSchema`. Wildcards are rejected and require an Ananke migration decision; never translate `*` to `unscoped`. |
| Request/correlation/causation IDs | Not present in exported execution identity/context | `CorrelationContext` | Additional-context requirement | Generate or propagate `requestId` and `correlationId` at the Ananke request boundary; propagate `causationId` only when known. Runtime Contracts validates but does not generate these IDs. |
| Action ID | `ApprovalGrant.actionHash` is a canonical action binding, not an action identifier | `CorrelationContext.actionId` / `ReferenceId` | Additional-context requirement; action hash domain-owned | Do not map `actionHash` to `actionId`. Add a distinct action identifier if Ananke adopts one. Keep hashing and binding semantics in Ananke. |
| Approval reference | `ApprovalGrant.id`, execution-context `policyVersion`; optional binding/hash fields | `ApprovalReference` | Rename-only/structural reference adapter | Map `id` to `approvalId`, add `sourceRuntime: "ananke"`, and copy `policyVersion` when present. Do not claim that `actionHash` is `requestHash` without an Ananke decision. Validate with `ApprovalReferenceSchema`. |
| Delegation reference | No portable grant or delegation descriptor; capability/tool names are not grants | `GrantReference` / `DelegationDescriptor` | Additional-context requirement | Ananke must issue or receive an actual grant before emitting a reference/descriptor. A capability declaration must not be adapted into a grant. |
| Audit reference | `AuditEvent.id` | `AuditReference` | Rename-only adapter | Map to `{ auditId: id, sourceRuntime: "ananke" }`; validate with `AuditReferenceSchema`. Audit event meaning and storage remain Ananke-owned. |
| Readiness | No exported readiness snapshot | `RuntimeReadiness` | Additional-context requirement | Add an Ananke-owned readiness probe and map only measured facts. Validate with `RuntimeReadinessSchema`. |
| Health | No exported runtime health snapshot | `RuntimeHealth` | Additional-context requirement | Add an Ananke-owned health observation including required uptime and warnings. Validate with `RuntimeHealthSchema`. |
| Protocol range | No current/minimum protocol declaration | `ProtocolVersionRange` | Additional-context requirement | Adopt explicit `1.0.0`–`1.4.0` only after Ananke supports that claim; validate the range and negotiate with `negotiateDetailed`. Do not infer support from repository links. |
| Compatibility manifest | No manifest | `CompatibilityManifest` | Additional-context requirement | Generate from validated runtime/build/protocol/configuration facts. Capability entries are descriptive, not grants or proof of callability. Validate with `CompatibilityManifestSchema`. |

## Structurally Reusable Fields

`agentPrincipalId`, `tenantId`, `sessionId`, `operatorId`, `ApprovalGrant.id`, and `AuditEvent.id`
can be mapped without changing their opaque identifier contents. Their surrounding objects are
not direct matches.

## Intentionally Excluded Ananke Domains

The migration must retain these in Ananke:

- `RiskClass`, `PolicyDecision`, `OutcomeState`, `FailureReasonCode`, and `Outcome` semantics;
- approval lifecycle, action/binding hashes, replay/use rules, and operator authorization;
- audit event types, retention, and evidentiary meaning;
- canonical action hashing;
- credential authentication and policy enforcement;
- all current content-preflight observations, decisions, bindings, receipts, and reason codes.

Portable approval, grant, action, and audit references point to those authoritative records; they
do not replace them.

## Content Preflight

Content preflight is non-blocking for the contract families above. Ananke's local types remain
authoritative within Ananke. Runtime Contracts makes no compatibility claim for them and adds no
preflight adapter or schema in this baseline.

