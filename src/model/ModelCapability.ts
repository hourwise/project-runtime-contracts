import { z } from "zod";
import { ISO8601TimestampSchema } from "../utils/Timestamp";

const IdentifierSchema = z.string().min(1, "Identifier is required");

/** Maximum total context capacity for one invocation, measured in native model tokens. */
export const ContextWindowSchema = z.number().finite().int().positive();

/**
 * Declared capabilities of a provider/model pair. These are declarations, not availability,
 * routing, selection, or failover decisions.
 */
export const ModelCapabilityProfileSchema = z.object({
  providerId: IdentifierSchema,
  modelId: IdentifierSchema,
  contextWindow: ContextWindowSchema.optional(),
  supportsTools: z.boolean(),
  supportsVision: z.boolean(),
  supportsStructuredOutput: z.boolean(),
  supportsReasoningControls: z.boolean().optional(),
  supportsLocalExecution: z.boolean().optional(),
  supportsStreamingAudio: z.boolean().optional(),
  supportsFullDuplexAudio: z.boolean().optional(),
});

export type ModelCapabilityProfile = z.infer<typeof ModelCapabilityProfileSchema>;

/** Opaque identifiers for the effective provider/model selection. */
export const ProviderModelSelectionSchema = z.object({
  providerId: IdentifierSchema,
  modelId: IdentifierSchema,
  contextWindow: ContextWindowSchema.optional(),
});

export type ProviderModelSelection = z.infer<typeof ProviderModelSelectionSchema>;

/** The only serialized name for a provider/model state-change record. */
export enum RuntimeProviderModelChangedEventName {
  ProviderModelChanged = "PROVIDER_MODEL_CHANGED",
}

export const RuntimeProviderModelChangedEventNameSchema = z.enum([
  RuntimeProviderModelChangedEventName.ProviderModelChanged,
]);

/** Machine-readable reason why an effective provider/model selection changed. */
export enum ProviderModelChangeReason {
  InitialSelection = "INITIAL_SELECTION",
  UserRequest = "USER_REQUEST",
  ConfigurationChanged = "CONFIGURATION_CHANGED",
  PolicyDecision = "POLICY_DECISION",
  ProviderFailover = "PROVIDER_FAILOVER",
  ModelFallback = "MODEL_FALLBACK",
  Recovery = "RECOVERY",
  CapabilityRequirement = "CAPABILITY_REQUIREMENT",
  ProviderUnavailable = "PROVIDER_UNAVAILABLE",
  Unknown = "UNKNOWN",
}

export const ProviderModelChangeReasonSchema = z.enum([
  ProviderModelChangeReason.InitialSelection,
  ProviderModelChangeReason.UserRequest,
  ProviderModelChangeReason.ConfigurationChanged,
  ProviderModelChangeReason.PolicyDecision,
  ProviderModelChangeReason.ProviderFailover,
  ProviderModelChangeReason.ModelFallback,
  ProviderModelChangeReason.Recovery,
  ProviderModelChangeReason.CapabilityRequirement,
  ProviderModelChangeReason.ProviderUnavailable,
  ProviderModelChangeReason.Unknown,
]);

/**
 * Immutable record of an effective provider/model selection change.
 *
 * The schema does not choose models, calculate capacities, execute failover, or enforce
 * sequence monotonicity across records.
 */
export const RuntimeProviderModelChangedEventSchema = z
  .object({
    eventId: IdentifierSchema,
    eventName: RuntimeProviderModelChangedEventNameSchema,
    schemaVersion: IdentifierSchema,
    runtimeId: IdentifierSchema,
    runtimeInstanceId: IdentifierSchema,
    correlationId: IdentifierSchema,
    causationId: IdentifierSchema,
    sequence: z.number().finite().int().nonnegative(),
    occurredAt: ISO8601TimestampSchema,
    previous: ProviderModelSelectionSchema.nullable(),
    current: ProviderModelSelectionSchema,
    reason: ProviderModelChangeReasonSchema,
    metadata: z.record(z.unknown()).optional(),
  })
  .superRefine((event, context) => {
    if (event.reason === ProviderModelChangeReason.InitialSelection && event.previous !== null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["previous"],
        message: "INITIAL_SELECTION requires previous to be null",
      });
    }

    if (
      event.previous !== null &&
      event.previous.providerId === event.current.providerId &&
      event.previous.modelId === event.current.modelId
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["current"],
        message: "Provider/model change requires providerId or modelId to change",
      });
    }
  });

export type RuntimeProviderModelChangedEvent = z.infer<typeof RuntimeProviderModelChangedEventSchema>;
