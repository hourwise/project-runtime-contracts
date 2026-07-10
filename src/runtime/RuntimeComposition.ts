import { z } from "zod";
import { RuntimeMetadataSchema } from "./RuntimeMetadata";

export enum RuntimeBindingRole {
  Approval = "approval",
  Audit = "audit",
  Client = "client",
  ExecutionGovernor = "execution_governor",
  Gateway = "gateway",
  Memory = "memory",
  Orchestrator = "orchestrator",
  Policy = "policy",
  ToolSource = "tool_source",
  Other = "other",
}

export const RuntimeBindingRoleSchema = z.nativeEnum(RuntimeBindingRole);

export const RuntimeBindingSchema = z.object({
  role: RuntimeBindingRoleSchema,
  runtime: z.string(),
  capabilityIds: z.array(z.string()).optional(),
  required: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const RuntimeCompositionSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  projectId: z.string().optional(),
  sessionId: z.string().optional(),
  profileId: z.string().optional(),
  protocolVersion: z.string(),
  bindings: z.array(RuntimeBindingSchema),
  exposedCapabilityIds: z.array(z.string()).optional(),
  hiddenCapabilityIds: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  metadata: RuntimeMetadataSchema.optional(),
});

export type RuntimeBinding = z.infer<typeof RuntimeBindingSchema>;
export type RuntimeComposition = z.infer<typeof RuntimeCompositionSchema>;
