import { describe, expect, it } from "vitest";
import {
  PortableLocaleSchema,
  SpeechProviderCapabilitySchema,
  SpeechProviderMode,
  TranscriptAlternativeSchema,
  TranscriptConfidenceSchema,
  TranscriptSegmentSchema,
} from "./Speech";

describe("PortableLocaleSchema", () => {
  it("accepts portable-profile BCP 47 tags and preserves supplied casing", () => {
    for (const locale of ["en", "en-GB", "eng", "fr-CA", "zh-Hant-TW", "sr-Latn", "und", "und-Latn", "en-GB-x-provider"]) {
      expect(PortableLocaleSchema.parse(locale)).toBe(locale);
    }
    expect(PortableLocaleSchema.parse("EN-gb")).toBe("EN-gb");
  });

  it("rejects opaque labels, private-use-only tags, and long primary subtags", () => {
    for (const locale of ["provider-default", "automatic", "default-locale", "x-provider-default", "english_uk", "British English", ""]) {
      expect(() => PortableLocaleSchema.parse(locale)).toThrow();
    }
  });
});

describe("TranscriptConfidenceSchema", () => {
  it("accepts inclusive confidence endpoints", () => {
    expect(TranscriptConfidenceSchema.parse(0)).toBe(0);
    expect(TranscriptConfidenceSchema.parse(1)).toBe(1);
  });

  it("rejects out-of-range and non-finite confidence", () => {
    for (const value of [-0.01, 1.01, 75, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => TranscriptConfidenceSchema.parse(value)).toThrow();
    }
  });
});

describe("transcript schemas", () => {
  it("retains omitted confidence and opaque producer labels separately from locale", () => {
    const segment = {
      text: "hello",
      startMs: 0,
      endMs: 250,
      locale: "en-GB",
      producerLocaleLabel: "provider-default",
      requiresConfirmation: false,
    };
    expect(TranscriptSegmentSchema.parse(segment)).toEqual(segment);
    expect(TranscriptAlternativeSchema.parse({ text: "hello" })).toEqual({ text: "hello" });
    expect(TranscriptSegmentSchema.parse(JSON.parse(JSON.stringify(segment)))).toEqual(segment);
  });

  it("rejects invalid timing, confidence, and locale values", () => {
    expect(() =>
      TranscriptSegmentSchema.parse({ text: "hello", startMs: 250, endMs: 0, requiresConfirmation: false }),
    ).toThrow();
    expect(() =>
      TranscriptSegmentSchema.parse({ text: "hello", startMs: 0, endMs: 1, confidence: 1.1, requiresConfirmation: false }),
    ).toThrow();
    expect(() =>
      TranscriptSegmentSchema.parse({ text: "hello", startMs: 0, endMs: 1, locale: "provider-default", requiresConfirmation: false }),
    ).toThrow();
  });
});

describe("SpeechProviderCapabilitySchema", () => {
  it("represents provider declarations with portable supported locales", () => {
    const capability = {
      mode: SpeechProviderMode.Cloud,
      streaming: true,
      fullDuplex: false,
      supportedLocales: ["en", "fr-CA"],
      returnsConfidence: true,
      interruptionSupport: true,
    };
    expect(SpeechProviderCapabilitySchema.parse(capability)).toEqual(capability);
  });
});
