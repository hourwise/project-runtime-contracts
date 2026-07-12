import { describe, expect, it } from "vitest";
import {
  ContextWindowSchema,
  ModelCapabilityProfileSchema,
  ProviderModelChangeReason,
  ProviderModelSelectionSchema,
  RuntimeProviderModelChangedEventName,
  RuntimeProviderModelChangedEventSchema,
} from "./ModelCapability";

const selection = {
  providerId: "provider/opaque-id",
  modelId: "model/opaque-id",
  contextWindow: 128000,
};

const eventEnvelope = {
  eventId: "evt-provider-001",
  eventName: RuntimeProviderModelChangedEventName.ProviderModelChanged,
  schemaVersion: "1.4.0",
  runtimeId: "model-runtime",
  runtimeInstanceId: "model-runtime-001",
  correlationId: "corr-001",
  causationId: "cmd-001",
  sequence: 4,
  occurredAt: "2026-07-12T12:00:00Z",
};

describe("ContextWindowSchema", () => {
  it("accepts positive integer token capacities and permits omission from selections", () => {
    expect(ContextWindowSchema.parse(1)).toBe(1);
    const selectionWithoutContextWindow = { providerId: "provider", modelId: "model" };
    expect(ProviderModelSelectionSchema.parse(selectionWithoutContextWindow)).toEqual({
      providerId: "provider",
      modelId: "model",
    });
    expect(
      ProviderModelSelectionSchema.parse(JSON.parse(JSON.stringify(selectionWithoutContextWindow))),
    ).toEqual(selectionWithoutContextWindow);
  });

  it("rejects zero, negative, fractional, and non-finite capacities", () => {
    for (const value of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => ContextWindowSchema.parse(value)).toThrow();
    }
  });
});

describe("ModelCapabilityProfileSchema", () => {
  it("represents declared model capabilities without selecting a provider", () => {
    const profile = {
      ...selection,
      supportsTools: true,
      supportsVision: true,
      supportsStructuredOutput: false,
      supportsStreamingAudio: true,
    };
    expect(ModelCapabilityProfileSchema.parse(profile)).toEqual(profile);
  });
});

describe("RuntimeProviderModelChangedEventSchema", () => {
  it("accepts an initial selection with no prior selection", () => {
    const initial = {
      ...eventEnvelope,
      previous: null,
      current: selection,
      reason: ProviderModelChangeReason.InitialSelection,
    };
    expect(RuntimeProviderModelChangedEventSchema.parse(initial)).toEqual(initial);
  });

  it("preserves opaque identifiers for provider-only and model-only changes", () => {
    const providerChanged = {
      ...eventEnvelope,
      previous: selection,
      current: { ...selection, providerId: "other-provider/opaque-id" },
      reason: ProviderModelChangeReason.ProviderFailover,
    };
    const modelChanged = {
      ...eventEnvelope,
      eventId: "evt-provider-002",
      sequence: 5,
      previous: selection,
      current: { ...selection, modelId: "other-model/opaque-id" },
      reason: ProviderModelChangeReason.ModelFallback,
    };

    expect(RuntimeProviderModelChangedEventSchema.parse(providerChanged)).toEqual(providerChanged);
    expect(RuntimeProviderModelChangedEventSchema.parse(modelChanged)).toEqual(modelChanged);
    expect(RuntimeProviderModelChangedEventSchema.parse(JSON.parse(JSON.stringify(providerChanged)))).toEqual(
      providerChanged,
    );
  });

  it("rejects unchanged effective selections and invalid initial history", () => {
    expect(() =>
      RuntimeProviderModelChangedEventSchema.parse({
        ...eventEnvelope,
        previous: selection,
        current: { ...selection, contextWindow: 64000 },
        reason: ProviderModelChangeReason.ConfigurationChanged,
      }),
    ).toThrow();
    expect(() =>
      RuntimeProviderModelChangedEventSchema.parse({
        ...eventEnvelope,
        previous: selection,
        current: { ...selection, modelId: "new-model" },
        reason: ProviderModelChangeReason.InitialSelection,
      }),
    ).toThrow();
  });

  it("requires current selection and the complete correlation/runtime envelope", () => {
    const changed = {
      ...eventEnvelope,
      previous: selection,
      current: { ...selection, modelId: "new-model" },
      reason: ProviderModelChangeReason.UserRequest,
    };

    for (const field of [
      "runtimeId",
      "runtimeInstanceId",
      "correlationId",
      "causationId",
      "sequence",
      "occurredAt",
    ]) {
      const incomplete = { ...changed } as Record<string, unknown>;
      delete incomplete[field];
      expect(() => RuntimeProviderModelChangedEventSchema.parse(incomplete)).toThrow();
    }

    expect(() => RuntimeProviderModelChangedEventSchema.parse({ ...changed, current: { modelId: "new-model" } })).toThrow();
    expect(() => RuntimeProviderModelChangedEventSchema.parse({ ...changed, current: { providerId: "provider" } })).toThrow();
  });
});
