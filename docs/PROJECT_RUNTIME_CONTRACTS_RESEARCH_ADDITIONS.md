# Project Runtime Contracts — Research Additions

## Purpose

Proposed shared contract additions arising from research into portable skills, sandboxes, model portability, persistent memory, browser agents, and voice systems.

The package should contain types and schemas only, with no runtime logic.

## Skill contracts

```ts
export type SkillKind = "guidance" | "workflow" | "executable";
export type SkillTrustState = "unreviewed" | "verified" | "restricted" | "blocked";

export interface SkillSource {
  repository?: string;
  revision?: string;
  publisher?: string;
  licence?: string;
}

export interface RuntimeSkill {
  id: string;
  version: string;
  kind: SkillKind;
  source: SkillSource;
  declaredCapabilities: RuntimeCapability[];
  requiredSecrets?: string[];
  networkRequirements?: string[];
  supportedRuntimes?: string[];
  supportedModels?: string[];
  trustState: SkillTrustState;
}
```

## Isolation contracts

```ts
export type IsolationLevel =
  | "host"
  | "process"
  | "container"
  | "microvm"
  | "remote-sandbox";

export interface ExecutionEnvironment {
  isolationLevel: IsolationLevel;
  provider?: string;
  operatingSystem?: string;
  architecture?: string;
  networkPolicyId?: string;
  filesystemScope?: string[];
  resourceLimits?: {
    cpu?: string;
    memoryMb?: number;
    timeoutMs?: number;
  };
}
```

## Lifecycle contracts

**Status: implemented in protocol 1.3.0.** This research sketch is superseded by
[`RuntimeLifecycle.ts`](../src/lifecycle/RuntimeLifecycle.ts) and
[ADR-0001](./decisions/ADR-0001-lifecycle-correlation-idempotency.md).

The implemented surface is `RuntimeLifecycleState`, `RuntimeLifecycleEvent`,
`RuntimeHeartbeat`, `RuntimeCancellationRecord`, `RuntimeTerminationRecord`, and
`RuntimeRecoveryRecord`. Lifecycle commands and events use the mandatory correlation and
idempotency envelope; heartbeats use the reduced observational envelope. The package does
not implement state-transition policy or lifecycle execution.

## Model capability contracts

**Status: implemented in protocol 1.4.0.** This research sketch is superseded by
[`ModelCapability.ts`](../src/model/ModelCapability.ts) and
[ADR-0002](./decisions/ADR-0002-model-speech-portable-locale.md).

The implemented `ModelCapabilityProfile` uses opaque `providerId` and `modelId` identifiers.
`contextWindow` is an optional finite positive integer measured in native model tokens.

## Speech contracts

**Status: implemented in protocol 1.4.0.** `TranscriptAlternative`, `TranscriptSegment`, and
`SpeechProviderCapability` are defined in [`Speech.ts`](../src/speech/Speech.ts). Confidence
is optional within `0..1`, and `locale` plus `supportedLocales` use the Portable Locale
Profile. `producerLocaleLabel` keeps opaque producer labels separate from portable locales.

## Browser-action contracts

```ts
export interface BrowserActionProposal {
  origin: string;
  route?: string;
  controlLabel?: string;
  controlRole?: string;
  action: string;
  intendedEffect: string;
  destructive: boolean;
  tenantScopeChecked?: boolean;
  beforeStateHash?: string;
}

export interface BrowserActionEvidence {
  screenshotBefore?: string;
  screenshotAfter?: string;
  resultingRoute?: string;
  resultingMessage?: string;
  afterStateHash?: string;
}
```

## Memory record kinds

```ts
export type ProjectRecordKind =
  | "fact"
  | "decision"
  | "requirement"
  | "constraint"
  | "hypothesis"
  | "task-state"
  | "generated-output"
  | "external-reference"
  | "observation"
  | "conflict";
```

## Risk classes

```ts
export type RuntimeRiskClass =
  | "READ_ONLY"
  | "INTERNAL_WRITE"
  | "EXTERNAL_SEND"
  | "DELETE"
  | "PAYMENT"
  | "DEPLOYMENT"
  | "PERMISSION_CHANGE"
  | "CREDENTIAL_ACCESS"
  | "NETWORK_EGRESS"
  | "SKILL_INSTALL"
  | "MODEL_PROVIDER_CHANGE"
  | "UNKNOWN";
```

## Compatibility requirements

- JSON serialisable
- schema versioned
- backward-compatible where possible
- explicit optional fields
- provider-neutral
- no runtime dependencies
- migration notes
- positive and negative fixtures

## Suggested tests

- invalid skill version
- missing skill source
- blocked skill registration
- unsupported isolation level
- cancellation lifecycle
- provider-switch event
- ambiguous transcript
- browser action without origin
- conflicting project record
- partial capability declaration
