import { z } from "zod";
import { CapabilitySchema } from "../runtime/Capability";
import { RuntimeTransportSchema } from "../runtime/RuntimeRegistration";
import { ISO8601TimestampSchema } from "../utils/Timestamp";
import { ProtocolVersionRangeSchema, SemanticVersionSchema } from "./ProtocolVersion";
import { compareVersions } from "./ProtocolCompatibility";

const IdentifierSchema = z.string().min(1);
const StringListSchema = z.array(IdentifierSchema).min(1);

export const TestedPeerSchema = z.object({
  runtime: IdentifierSchema,
  version: IdentifierSchema.optional(),
  protocolVersion: SemanticVersionSchema.optional(),
  commit: IdentifierSchema.optional(),
  testedAt: ISO8601TimestampSchema.optional(),
});

export type TestedPeer = z.infer<typeof TestedPeerSchema>;

/** Portable, descriptive compatibility facts. It does not perform discovery or negotiation. */
export const CompatibilityManifestSchema = z
  .object({
    manifestSchemaVersion: SemanticVersionSchema,
    runtimeName: IdentifierSchema,
    runtimeVersion: IdentifierSchema,
    clientName: IdentifierSchema.optional(),
    clientVersion: IdentifierSchema.optional(),
    packageVersion: IdentifierSchema,
    buildVersion: IdentifierSchema.optional(),
    protocolVersion: SemanticVersionSchema,
    minimumSupportedProtocolVersion: SemanticVersionSchema,
    preferredProtocolVersion: SemanticVersionSchema.optional(),
    supportedProtocolRange: ProtocolVersionRangeSchema,
    requiredRuntimeContractsVersionRange: IdentifierSchema,
    supportedMcpVersions: StringListSchema.optional(),
    supportedMcpProtocolEras: StringListSchema.optional(),
    optionalIntegrations: StringListSchema.optional(),
    requiredIntegrations: StringListSchema.optional(),
    supportedTransports: z.array(RuntimeTransportSchema).optional(),
    capabilities: z.array(CapabilitySchema).optional(),
    standalone: z.boolean(),
    knownConstraints: StringListSchema.optional(),
    degradedModes: StringListSchema.optional(),
    testedPeers: z.array(TestedPeerSchema).optional(),
    generatedAt: ISO8601TimestampSchema.optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .superRefine((manifest, context) => {
    if (manifest.minimumSupportedProtocolVersion !== manifest.supportedProtocolRange.minimum) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["minimumSupportedProtocolVersion"], message: "Minimum protocol version must match supported range" });
    }
    if (manifest.protocolVersion !== manifest.supportedProtocolRange.maximum) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["protocolVersion"], message: "Protocol version must match supported range maximum" });
    }
    if (manifest.preferredProtocolVersion &&
        (compareVersions(manifest.preferredProtocolVersion, manifest.supportedProtocolRange.minimum) < 0 ||
         compareVersions(manifest.preferredProtocolVersion, manifest.supportedProtocolRange.maximum) > 0)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["preferredProtocolVersion"], message: "Preferred protocol version must be within supported range" });
    }
  });

export type CompatibilityManifest = z.infer<typeof CompatibilityManifestSchema>;

export const parseCompatibilityManifest = (value: unknown): CompatibilityManifest =>
  CompatibilityManifestSchema.parse(value);

export const isCompatibilityManifest = (value: unknown): value is CompatibilityManifest =>
  CompatibilityManifestSchema.safeParse(value).success;
