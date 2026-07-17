# ADR-0003: Dual-Principal Identity, Scoped MCP Delegation, and Cross-Runtime Compatibility

- **Status:** Accepted
- **Implementation status:** Partially implemented in Runtime Contracts; enforcement and downstream adoption pending
- **Date:** 2026-07-13
- **Decision owners:** Project Ananke / Project Horae maintainers
- **Applies to:** Project Ananke, Project Horae, Project Mnemosyne, Project Runtime Contracts, Project Moirae Code
- **Related concerns:** MCP access control, agent identity, human delegation, short-lived credentials, standalone runtime operation, ecosystem compatibility

## Context

MCP servers are frequently exposed to agents using a single shared bearer token or API credential. That model treats access to the server as equivalent to authority to use every tool exposed by the server.

This is insufficient for the Fates ecosystem.

A governed agent action may involve at least two distinct identities:

1. the authenticated human or service principal on whose behalf the action is being performed; and
2. the agent, runtime, or automation process attempting the action.

Authority may also depend on:

- the active project and session;
- the target MCP server;
- the specific tool and operation;
- the tenant, account, record, file, or other target resource;
- the purpose of the request;
- an explicit approval;
- the time window for which authority is valid;
- the model, runtime profile, or execution mode in use.

A shared server token cannot express these restrictions. It also creates ambient authority: any process that can access the credential may be able to call unrelated tools or act against unrelated resources.

The Fates ecosystem already separates responsibilities:

- **Ananke** governs execution and policy enforcement.
- **Horae** coordinates runtimes, sessions, identities, and execution context.
- **Mnemosyne** governs memory and evidence, but must not grant authority.
- **Runtime Contracts** defines the shared protocol and data structures.
- **Moirae Code** provides a governed developer surface and must not create bypass paths around the enforcement boundary.

This ADR makes delegated identity, capability scoping, short-lived credentials, compatibility checking, and standalone operation explicit architectural requirements.

## Decision

The Fates ecosystem shall use a **dual-principal, capability-based delegation model** for governed MCP and external API access.

Every governed request must distinguish:

- the **delegating principal**: the authenticated human or service account;
- the **acting principal**: the agent, runtime, or automation executing the request.

Access shall be granted only when the combined user, agent, session, capability, resource, purpose, and time constraints are satisfied.

Ananke shall be the final policy enforcement point for governed actions. Horae shall assemble and propagate the execution context. Runtime Contracts shall define the portable identity, delegation, capability, and decision envelopes. Mnemosyne may supply contextual evidence but shall never independently enlarge authority.

Where a target MCP server or API supports scoped, short-lived credentials, Ananke or a dedicated credential-broker component shall mint or obtain a temporary credential bound to the approved request.

Where the target supports only a coarse long-lived credential, that credential shall remain inside a protected gateway or broker. It must not be exposed to the agent process, model context, client application, browser, IDE extension, or untrusted tool runtime.

## Decision details

### 1. Separate human and agent identities

Every governed execution request must carry or resolve:

- `userPrincipal`
- `agentPrincipal`
- `sessionId`
- `runtimeIdentity`
- `projectId` or equivalent scope, where applicable
- `tenantId` or account boundary, where applicable

The agent identity must not be substituted for the human identity, and the human identity must not erase the identity of the acting agent.

### 2. Authority is conjunctive

Permission shall be evaluated across the full request context.

A request is authorised only when all required dimensions match:

- user;
- agent;
- session;
- runtime;
- target server;
- target tool;
- operation;
- resource scope;
- tenant or account;
- purpose;
- approval state;
- validity period;
- relevant runtime profile and policy.

Possession of any one credential or identifier is not sufficient.

### 3. Tool discovery does not imply authority

An agent may be aware that a server or tool exists without being permitted to call it.

Tool-listing responses should be filtered where practical so that an agent sees only the capabilities available to its current context. When filtering is not possible, Ananke must still deny unauthorised calls at execution time.

### 4. No ambient authority

Long-lived credentials, API keys, service-role keys, refresh tokens, and unrestricted MCP tokens must not be placed in:

- model prompts or context;
- agent-readable environment variables;
- browser storage;
- frontend bundles;
- IDE extension state accessible to arbitrary extensions;
- logs;
- audit payloads;
- error messages;
- memory records;
- generated code or configuration files committed to source control.

The existence of a configured integration must not make that integration automatically callable by every agent.

### 5. Short-lived capability grants

A capability grant should be bound to the narrowest practical scope, including:

- intended audience or target server;
- allowed tool or operation;
- resource or tenant boundary;
- acting agent;
- delegating user;
- session;
- purpose;
- approval reference;
- issued-at time;
- expiry time;
- nonce or unique grant identifier;
- optional request hash.

A representative grant may contain:

```json
{
  "subject": {
    "userId": "user-123",
    "agentId": "trace-research-agent",
    "sessionId": "session-456"
  },
  "audience": "billing-mcp",
  "allowedTools": ["invoice.read"],
  "resourceScope": {
    "tenantId": "tenant-789"
  },
  "purpose": "answer-current-user-query",
  "approvalId": "approval-abc",
  "expiresAt": "2026-07-13T14:31:00Z"
}
```

The grant must not authorise unrelated tools, resources, tenants, users, sessions, or future requests.

### 6. Approval binding

Where approval is required, the approval must be cryptographically or canonically bound to the exact action being authorised.

The approval binding should include, at minimum:

- user principal;
- agent principal;
- target server;
- tool;
- arguments or canonical argument hash;
- resource scope;
- tenant;
- purpose;
- expiry;
- relevant policy version.

Any material mutation invalidates the approval.

### 7. Credential broker behaviour

The broker must:

- keep upstream secrets outside the agent boundary;
- issue or exchange only narrowly scoped credentials;
- prefer short-lived tokens;
- enforce audience restriction;
- support revocation where available;
- avoid returning reusable upstream secrets;
- redact all sensitive values from logs and errors;
- fail closed when scope cannot be proven;
- record the grant identifier without recording the credential itself.

### 8. Coarse-credential fallback

Some MCP servers or APIs support only one broad API key.

In that case:

- the broad credential remains server-side inside the gateway;
- the agent receives no copy of it;
- every request still passes through Ananke;
- Ananke applies local tool, operation, resource, and tenant policy;
- the gateway must prevent direct network or stdio access that bypasses Ananke;
- the integration must be marked as using a coarse upstream credential;
- documentation must state which restrictions are locally enforced rather than provider-enforced;
- particularly dangerous integrations may be denied until adequate scoping is possible.

### 9. Mnemosyne cannot grant authority

Mnemosyne may remember:

- previous requests;
- previous approvals;
- user preferences;
- tool history;
- policy evidence;
- prior outcomes.

It must not treat remembered approval as current authority.

Expired, revoked, differently scoped, or differently contextualised permission must not be reconstructed from memory. Ananke must independently verify current authority for every governed action.

### 10. Audit requirements

Every governed call must be attributable to:

- the delegating principal;
- the acting principal;
- the runtime and session;
- the requested server and tool;
- the resource and tenant scope;
- the policy decision;
- the approval, if any;
- the capability grant identifier;
- the credential-broker path used;
- the final outcome.

Secrets and bearer tokens must never appear in the audit record.

### 11. Revocation and expiry

Capability grants must expire automatically.

The system should support revocation at one or more of these levels:

- user session;
- agent identity;
- runtime identity;
- tenant;
- integration;
- server;
- tool;
- individual grant.

Revoked or expired authority must produce an explicit typed outcome rather than silently retrying with broader credentials.

### 12. Typed failure outcomes

The runtime should distinguish at least:

- unauthenticated principal;
- unknown agent;
- invalid delegation;
- insufficient capability;
- tenant or resource mismatch;
- approval required;
- approval invalidated;
- expired grant;
- revoked grant;
- unsupported provider scoping;
- broker unavailable;
- upstream credential failure;
- direct-bypass attempt.

These should map into the existing Ananke outcome and reason-code model.

## Cross-runtime compatibility and standalone operation

Each Fates repository shall remain independently buildable, testable, and understandable, while also being compatible with the current released or workspace versions of the other Fates components.

A cross-repository compatibility pass must verify both:

### Standalone ability

Each repository must:

- install from a clean checkout;
- build without requiring sibling repositories to be present;
- run its own tests independently;
- provide mocks, fixtures, or adapters for unavailable sibling runtimes;
- document optional integrations separately from core requirements;
- fail clearly when an optional runtime is absent;
- avoid importing sibling source files by relative filesystem path;
- depend only on published packages, workspace contracts, or documented interfaces;
- avoid hidden assumptions about another repository's local directory structure.

### Ecosystem compatibility

Each repository must verify:

- protocol-version compatibility;
- contract compatibility;
- identity and session field alignment;
- outcome-envelope compatibility;
- event-name and event-payload compatibility;
- capability and endpoint semantics;
- no circular ownership of responsibilities;
- no duplicate canonical type definitions;
- no bypass of Ananke's enforcement boundary;
- no use of Mnemosyne memory as authority;
- Horae can compose the runtime through documented interfaces;
- Moirae Code can integrate without direct access to protected credentials;
- degraded behaviour is defined when another runtime is unavailable.

## Required compatibility artefact

Each repository should maintain a machine-readable compatibility declaration, for example:

```json
{
  "runtime": "ananke",
  "version": "0.4.0",
  "protocolVersion": "1.0",
  "minimumProtocolVersion": "1.0",
  "compatibleWith": {
    "runtime-contracts": "^1.0.0",
    "horae": ">=0.2.0",
    "mnemosyne": ">=0.3.0"
  },
  "optionalIntegrations": [
    "mnemosyne",
    "horae"
  ],
  "standalone": true
}
```

The exact filename and schema should be standardised in Runtime Contracts.

## Required cross-repository review process

Before a milestone or release, an agent may be given read-only access to the other Fates repositories and instructed to perform a compatibility review.

The review must:

1. inspect actual code, manifests, exported types, tests, ADRs, and current documentation;
2. compare implementation against Runtime Contracts;
3. distinguish confirmed incompatibilities from uncertain or undocumented assumptions;
4. avoid changing repositories during the initial review;
5. produce a structured report for the repository being assessed;
6. propose minimal fixes in the owning repository;
7. avoid copying canonical types into multiple repositories;
8. verify both standalone and composed operation;
9. run available builds and tests;
10. record repository commit identifiers used for the review.

Cross-repository review is a verification mechanism, not a substitute for versioned contracts and automated integration tests.

## Automated consistency checks

The ecosystem should add:

- contract conformance tests;
- protocol compatibility tests;
- consumer-driven contract tests where appropriate;
- a small cross-runtime integration test suite;
- CI checks against supported Runtime Contracts versions;
- a compatibility matrix in each release;
- detection of duplicate exported contract types;
- checks that no direct credential path bypasses Ananke;
- checks that optional integrations can be disabled;
- clean-checkout standalone build tests.

A scheduled or release-triggered compatibility workflow may clone the relevant repositories at pinned commits and run the shared integration suite.

## Consequences

### Positive

- Compromise of one agent does not automatically compromise every MCP tool.
- Human authority and agent authority remain separately attributable.
- Tenant and resource boundaries can be enforced.
- Approvals become exact, expiring, and non-transferable.
- Long-lived provider secrets remain outside agent reach.
- The Fates ecosystem gains a clear security distinction from simple MCP routing gateways.
- Repositories remain usable independently.
- Cross-runtime drift becomes detectable before release.
- Integration assumptions become explicit and testable.

### Negative

- Identity propagation and token exchange add implementation complexity.
- Some providers do not support fine-grained credentials.
- Local policy enforcement may be required around coarse upstream APIs.
- Cross-repository testing increases CI time and release coordination.
- Compatibility declarations and matrices require maintenance.
- Version skew must be deliberately managed.

## Rejected alternatives

### One shared token per MCP server

Rejected because it grants server-wide ambient authority and does not distinguish user, agent, tool, resource, tenant, or purpose.

### One token per agent

Rejected as insufficient by itself. It improves attribution but does not prove which user the agent represents or which resources and operations are allowed.

### Trust the MCP server to enforce everything

Rejected because not every MCP server implements equivalent identity, policy, tenant, or delegation controls.

### Let Horae enforce policy without Ananke

Rejected because orchestration and enforcement must remain separate. Horae assembles context; Ananke makes the final governed execution decision.

### Reuse remembered approvals from Mnemosyne

Rejected because memory is evidence, not authority.

### Rely only on agents manually reviewing the other repositories

Rejected because manual or model-led review is non-deterministic and can miss version drift. It is useful as an additional review layer but must be backed by contracts and automated tests.

### Make every repository require all other Fates repositories at build time

Rejected because it destroys standalone operation, increases coupling, and makes partial adoption difficult.

## Security invariants

1. No agent receives unrestricted upstream credentials.
2. No remembered fact grants current authority.
3. No discovered tool is callable solely because it is visible.
4. No approval survives a material request mutation.
5. No cross-tenant access is permitted without explicit scope.
6. No runtime may bypass Ananke for governed actions.
7. No repository may require sibling source-tree access for a standalone build.
8. No canonical cross-runtime contract may be independently redefined by multiple repositories.
9. No compatibility claim may be made without recording the tested versions or commits.
10. All failures involving uncertain authority fail closed.

## Implementation sequence

1. Add dual-principal and delegation types to Runtime Contracts.
2. Add capability-grant and broker-decision envelopes.
3. Add reason codes and typed outcomes to Ananke.
4. Add execution-context propagation to Horae.
5. Add broker interface and coarse-credential fallback policy to Ananke.
6. Add audit fields without storing secrets.
7. Add tests proving memory cannot recreate authority.
8. Add compatibility declaration schema to Runtime Contracts.
9. Add standalone build tests to every repository.
10. Add a pinned cross-repository integration workflow.
11. Add Moirae Code checks preventing direct credential exposure or bypass.
12. Document supported and unsupported provider scoping modes.

## Acceptance criteria

This ADR is implemented when:

- user and agent identities are independently represented;
- every governed MCP call is evaluated against explicit capability scope;
- agents cannot access upstream long-lived credentials;
- approval binding includes identity, action, scope, and expiry;
- expired or mutated grants are denied;
- Mnemosyne cannot convert remembered approval into active authority;
- audit records identify both principals without storing secrets;
- each Fates repository builds and tests from a clean standalone checkout;
- each repository declares supported protocol and sibling versions;
- at least one automated composed-runtime test runs against pinned repository commits;
- a cross-repository compatibility report can be generated without allowing the reviewing agent to make uncontrolled changes.

## Open questions

- Whether Ananke itself should mint signed capability tokens or delegate that function to a separate broker package.
- Which token format should be used internally.
- Whether tool visibility should always be filtered or only execution-gated.
- How revocation should propagate across offline or local runtimes.
- Which repository owns the compatibility declaration schema and integration test harness.
- Whether compatibility checks should run on every pull request, nightly, or only before release.
