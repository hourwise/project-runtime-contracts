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

```ts
export type RuntimeLifecycleState =
  | "registered"
  | "initialising"
  | "ready"
  | "busy"
  | "waiting"
  | "degraded"
  | "cancelling"
  | "terminated"
  | "failed";
```

Potential records:
- `RuntimeHeartbeat`
- `RuntimeCancellationRequest`
- `RuntimeTerminationRecord`
- `RuntimeRecoveryRecord`

## Model capability contracts

```ts
export interface ModelCapabilityProfile {
  provider: string;
  modelId: string;
  contextWindow?: number;
  supportsTools: boolean;
  supportsVision: boolean;
  supportsStructuredOutput: boolean;
  supportsReasoningControls?: boolean;
  supportsLocalExecution?: boolean;
  supportsStreamingAudio?: boolean;
  supportsFullDuplexAudio?: boolean;
}
```

## Speech contracts

```ts
export interface TranscriptAlternative {
  text: string;
  confidence?: number;
}

export interface TranscriptSegment {
  text: string;
  startMs: number;
  endMs: number;
  confidence?: number;
  locale?: string;
  alternatives?: TranscriptAlternative[];
  requiresConfirmation: boolean;
}

export interface SpeechProviderCapability {
  mode: "on-device" | "local-service" | "cloud";
  streaming: boolean;
  fullDuplex: boolean;
  supportedLocales: string[];
  returnsConfidence: boolean;
  interruptionSupport: boolean;
}
```

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
