import { z } from "zod";
import { CapabilitySchema } from "../runtime/Capability";
import { RuntimeKindSchema } from "../runtime/RuntimeKind";
import { RuntimeMetadataSchema } from "../runtime/RuntimeMetadata";
import { ProtocolVersionRangeSchema } from "../protocol/ProtocolVersion";

/**
 * Runtime identity and version information.
 *
 * Runtimes identify themselves using their `runtime` name (e.g., "ananke", "mnemosyne").
 * The `protocolVersion` must match or be compatible with the receiving runtime's version.
 *
 * @property runtime - Canonical runtime identifier (required).
 * @property version - Runtime implementation version (e.g., "1.2.0").
 * @property protocolVersion - Protocol version this runtime implements (required).
 * @property minimumProtocolVersion - Minimum compatible protocol version (optional).
 * @property kind - Runtime kind/role (optional).
 * @property instanceId - Unique instance identifier (optional, for multi-instance runtimes).
 * @property displayName - Human-readable runtime name (optional).
 * @property capabilities - Capabilities exposed by this runtime.
 * @property metadata - Additional runtime metadata.
 *
 * @example
 * ```ts
 * const identity: RuntimeIdentity = {
 *   runtime: "ananke",
 *   version: "1.0.0",
 *   protocolVersion: "1.1.0",
 *   minimumProtocolVersion: "1.0.0",
 *   kind: RuntimeKind.Ananke,
 *   instanceId: "ananke-prod-001",
 *   displayName: "Ananke Policy Engine",
 *   capabilities: [{ id: "cap1", name: "policy.evaluate", version: "1.0" }],
 * };
 * ```
 */
export const RuntimeIdentitySchema = z.object({
  runtime: z.string().min(1, "Runtime identifier is required"),
  version: z.string().min(1, "Runtime version is required"),
  protocolVersion: z.string().min(1, "Protocol version is required"),
  minimumProtocolVersion: z.string().optional(),
  packageVersion: z.string().min(1).optional(),
  buildVersion: z.string().min(1).optional(),
  supportedProtocolRange: ProtocolVersionRangeSchema.optional(),
  optionalIntegrations: z.array(z.string().min(1)).min(1).optional(),
  requiredIntegrations: z.array(z.string().min(1)).min(1).optional(),
  standalone: z.boolean().optional(),
  kind: RuntimeKindSchema.optional(),
  instanceId: z.string().optional(),
  displayName: z.string().optional(),
  capabilities: z.array(CapabilitySchema).optional(),
  metadata: RuntimeMetadataSchema.optional(),
});

export type RuntimeIdentity = z.infer<typeof RuntimeIdentitySchema>;
