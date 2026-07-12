# ADR-0002: Model, Speech, and Portable Locale Contracts

- **Status:** Accepted
- **Date:** 2026-07-12
- **Decision owners:** Project Runtime Contracts maintainers
- **Applies to:** Protocol 1.4.0 model, speech, locale, and provider/model-change records

## Context

The runtime ecosystem needs portable model and speech declarations without assigning model
selection, recognition, routing, confidence calculation, or failover behaviour to this shared
contracts package. The Slice D research also requires a deterministic locale profile that does
not depend on a live language-subtag registry.

## Decision

`ModelCapabilityProfile` declares opaque `providerId` and `modelId`, common model capability
flags, and optional `contextWindow`. `contextWindow` is the active model's maximum total
per-invocation context capacity in native tokens. When present, it is a finite positive
integer; omission means unknown, unavailable, or undeclared.

Transcript confidence is optional and is a finite number in the inclusive range `0..1`.
Omission is distinct from zero. `TranscriptSegment` uses finite non-negative millisecond
timings with `endMs >= startMs` and requires an explicit `requiresConfirmation` boolean.

`locale` and speech-provider `supportedLocales` use the Mnemosyne/Runtime Contracts Portable
Locale Profile:

1. the platform's BCP 47 structural validator must accept the tag;
2. the original primary subtag must be exactly two ASCII letters, exactly three ASCII letters,
   or `und`; and
3. the tag must not be empty or private-use-only.

This profile rejects wider five-to-eight-letter primary subtags, including
`provider-default`, without requiring a registry lookup. Opaque producer labels use optional
`producerLocaleLabel` and are not interpreted as locales.

`RuntimeProviderModelChangedEvent` is an immutable specialized event record with runtime
identity, correlation, causation, local sequence, effective timestamp, previous/current opaque
provider-model selections, and a closed machine-readable reason. `INITIAL_SELECTION` requires
`previous: null`; a non-null prior selection must differ from the current selection in
`providerId` or `modelId`.

## Consequences

- The package validates representation and serialization only. It does not select models,
  calculate confidence, manage context limits, recognize speech, route requests, perform
  failover, or enforce provider lifecycle behaviour.
- A context-window correction alone is not a provider/model change event.
- Provider and model identifiers are opaque and preserved exactly as supplied.
- Closed provider modes, change reasons, and specialized event names reject unknown values.
- Generic `RuntimeEvent` remains an open envelope. Consumers needing the specialized change
  record must validate `RuntimeProviderModelChangedEvent` directly.

## Evidence

- [`src/model/ModelCapability.ts`](../../src/model/ModelCapability.ts)
- [`src/model/ModelCapability.test.ts`](../../src/model/ModelCapability.test.ts)
- [`src/speech/Speech.ts`](../../src/speech/Speech.ts)
- [`src/speech/Speech.test.ts`](../../src/speech/Speech.test.ts)
- [`docs/protocol-specification.md`](../protocol-specification.md)
