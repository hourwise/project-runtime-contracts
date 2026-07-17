import { z } from "zod";
import { ISO8601TimestampSchema } from "../utils/Timestamp";
import { ProtocolVersionRangeSchema, SemanticVersionSchema } from "./ProtocolVersion";

const NonEmptyStringSchema = z.string().min(1);
const RepositoryRelativePathSchema = NonEmptyStringSchema.refine(
  (value) => !value.startsWith("/") && !/^[A-Za-z]:[\\/]/.test(value),
  "Path must be repository-relative and must not contain a machine-local absolute path",
);

export const AdoptionBaselineRecordStatusSchema = z.enum(["example", "generated"]);
export type AdoptionBaselineRecordStatus = z.infer<typeof AdoptionBaselineRecordStatusSchema>;

export const AdoptionConsumerTestResultSchema = z.enum([
  "direct",
  "adapter_required",
  "blocked",
  "not_run",
]);
export type AdoptionConsumerTestResult = z.infer<typeof AdoptionConsumerTestResultSchema>;

export const AdoptionValidationResultSchema = z.enum(["passed", "failed", "not_run"]);
export type AdoptionValidationResult = z.infer<typeof AdoptionValidationResultSchema>;

export const AdoptionFixtureFamilySchema = z.object({
  id: NonEmptyStringSchema,
  caseCount: z.number().int().positive(),
});
export type AdoptionFixtureFamily = z.infer<typeof AdoptionFixtureFamilySchema>;

export const AdoptionConsumerTestSchema = z.object({
  consumer: NonEmptyStringSchema,
  sourceCommit: z.string().regex(/^[a-f0-9]{40}$/, "Consumer commit must be a full lowercase Git SHA"),
  result: AdoptionConsumerTestResultSchema,
  report: RepositoryRelativePathSchema,
});
export type AdoptionConsumerTest = z.infer<typeof AdoptionConsumerTestSchema>;

export const AdoptionValidationEvidenceSchema = z.object({
  command: NonEmptyStringSchema,
  result: AdoptionValidationResultSchema,
  summary: NonEmptyStringSchema.optional(),
});
export type AdoptionValidationEvidence = z.infer<typeof AdoptionValidationEvidenceSchema>;

/**
 * Immutable evidence about a packaged Runtime Contracts adoption artifact.
 * This is release metadata, not a runtime registration or compatibility declaration.
 */
export const AdoptionBaselineManifestSchema = z
  .object({
    schemaVersion: SemanticVersionSchema,
    recordStatus: AdoptionBaselineRecordStatusSchema,
    packageName: z.literal("project-runtime-contracts"),
    futurePackageName: z.literal("@fates/runtime-contracts"),
    packageVersion: SemanticVersionSchema,
    protocolVersion: SemanticVersionSchema,
    minimumSupportedProtocolVersion: SemanticVersionSchema,
    supportedProtocolRange: ProtocolVersionRangeSchema,
    sourceRepository: z.string().url(),
    sourceCommit: z.string().regex(/^[a-f0-9]{40}$/, "Source commit must be a full lowercase Git SHA"),
    proposedTag: NonEmptyStringSchema,
    artifactFilename: z.string().regex(/\.tgz$/, "Artifact filename must identify an npm tarball"),
    artifactSha256: z.string().regex(/^[a-f0-9]{64}$/, "Artifact digest must be lowercase SHA-256"),
    artifactSizeBytes: z.number().int().positive(),
    generatedAt: ISO8601TimestampSchema,
    nodeVersion: NonEmptyStringSchema,
    npmVersion: NonEmptyStringSchema,
    includedDocumentation: z.array(RepositoryRelativePathSchema).min(1),
    fixtureFamilies: z.array(AdoptionFixtureFamilySchema).min(1),
    consumerTests: z.array(AdoptionConsumerTestSchema).min(1),
    deferredContractFamilies: z.array(NonEmptyStringSchema),
    designGates: z.array(NonEmptyStringSchema),
    releaseClassification: z.literal("pre_release_correction_protocol_1_4"),
    contentPreflightIncluded: z.literal(false),
    validation: z.array(AdoptionValidationEvidenceSchema).min(1),
  })
  .superRefine((manifest, context) => {
    if (manifest.minimumSupportedProtocolVersion !== manifest.supportedProtocolRange.minimum) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["minimumSupportedProtocolVersion"],
        message: "Minimum protocol version must match the supported range minimum",
      });
    }
    if (manifest.protocolVersion !== manifest.supportedProtocolRange.maximum) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["protocolVersion"],
        message: "Current protocol version must match the supported range maximum",
      });
    }
    if (manifest.recordStatus === "generated") {
      if (/^0+$/.test(manifest.sourceCommit)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sourceCommit"],
          message: "Generated records must identify the exact final source commit",
        });
      }
      if (/^0+$/.test(manifest.artifactSha256)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["artifactSha256"],
          message: "Generated records must contain the measured artifact digest",
        });
      }
      if (manifest.validation.some((entry) => entry.result !== "passed")) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["validation"],
          message: "Generated baseline records may contain only passed validation evidence",
        });
      }
    }
  });

export type AdoptionBaselineManifest = z.infer<typeof AdoptionBaselineManifestSchema>;

export const parseAdoptionBaselineManifest = (value: unknown): AdoptionBaselineManifest =>
  AdoptionBaselineManifestSchema.parse(value);

