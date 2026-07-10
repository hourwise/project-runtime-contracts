import { z } from "zod";
import { CapabilitySchema } from "../runtime/Capability";
import { RuntimeKindSchema } from "../runtime/RuntimeKind";
import { RuntimeMetadataSchema } from "../runtime/RuntimeMetadata";

export const RuntimeIdentitySchema = z.object({
  runtime: z.string(),
  version: z.string(),
  protocolVersion: z.string(),
  minimumProtocolVersion: z.string().optional(),
  kind: RuntimeKindSchema.optional(),
  instanceId: z.string().optional(),
  displayName: z.string().optional(),
  capabilities: z.array(CapabilitySchema).optional(),
  metadata: RuntimeMetadataSchema.optional(),
});

export type RuntimeIdentity = z.infer<typeof RuntimeIdentitySchema>;

