import { z } from "zod";

/**
 * Validate the Mnemosyne/Runtime Contracts Portable Locale Profile.
 *
 * The platform validates general BCP 47 structure without a live registry lookup. The profile
 * then restricts the original primary subtag to two letters, three letters, or `und` so opaque
 * five-to-eight-letter producer labels are not accepted as portable locales.
 */
export function isPortableLocale(value: string): boolean {
  try {
    Intl.getCanonicalLocales(value);
  } catch {
    return false;
  }

  const primarySubtag = value.split("-")[0].toLowerCase();
  return primarySubtag === "und" || /^[a-z]{2}$/i.test(primarySubtag) || /^[a-z]{3}$/i.test(primarySubtag);
}

export const PortableLocaleSchema = z
  .string()
  .min(1, "Locale must not be empty")
  .refine(isPortableLocale, "Locale must use the Portable Locale Profile");

/** Optional producer confidence, on the inclusive range from zero to one. */
export const TranscriptConfidenceSchema = z.number().finite().min(0).max(1);

export const TranscriptAlternativeSchema = z.object({
  text: z.string(),
  confidence: TranscriptConfidenceSchema.optional(),
});

/** A timed transcript segment. Timing and confidence are declarations; no recognition engine is implemented here. */
export const TranscriptSegmentSchema = z
  .object({
    text: z.string(),
    startMs: z.number().finite().nonnegative(),
    endMs: z.number().finite().nonnegative(),
    confidence: TranscriptConfidenceSchema.optional(),
    locale: PortableLocaleSchema.optional(),
    producerLocaleLabel: z.string().optional(),
    alternatives: z.array(TranscriptAlternativeSchema).optional(),
    requiresConfirmation: z.boolean(),
  })
  .refine((segment) => segment.endMs >= segment.startMs, {
    message: "Transcript segment endMs must not be less than startMs",
    path: ["endMs"],
  });

export type TranscriptAlternative = z.infer<typeof TranscriptAlternativeSchema>;
export type TranscriptSegment = z.infer<typeof TranscriptSegmentSchema>;

export enum SpeechProviderMode {
  OnDevice = "on-device",
  LocalService = "local-service",
  Cloud = "cloud",
}

export const SpeechProviderModeSchema = z.enum([
  SpeechProviderMode.OnDevice,
  SpeechProviderMode.LocalService,
  SpeechProviderMode.Cloud,
]);

/** Declared speech-provider capabilities. They do not guarantee provider availability. */
export const SpeechProviderCapabilitySchema = z.object({
  mode: SpeechProviderModeSchema,
  streaming: z.boolean(),
  fullDuplex: z.boolean(),
  supportedLocales: z.array(PortableLocaleSchema),
  returnsConfidence: z.boolean(),
  interruptionSupport: z.boolean(),
});

export type SpeechProviderCapability = z.infer<typeof SpeechProviderCapabilitySchema>;
