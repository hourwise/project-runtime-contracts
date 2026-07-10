import { z } from "zod";

export enum CapabilityCategory {
  Approval = "approval",
  Audit = "audit",
  Citation = "citation",
  Discovery = "discovery",
  Execution = "execution",
  Gateway = "gateway",
  Health = "health",
  Knowledge = "knowledge",
  Memory = "memory",
  Policy = "policy",
  Profile = "profile",
  Registry = "registry",
  Search = "search",
  Session = "session",
  Tool = "tool",
  Other = "other",
}

export enum CapabilityExposure {
  Hidden = "hidden",
  Discoverable = "discoverable",
  Active = "active",
}

export const CapabilityCategorySchema = z.nativeEnum(CapabilityCategory);
export const CapabilityExposureSchema = z.nativeEnum(CapabilityExposure);

export const CapabilitySchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  category: CapabilityCategorySchema.optional(),
  exposure: CapabilityExposureSchema.optional(),
  tags: z.array(z.string()).optional(),
  requiresApproval: z.boolean().optional(),
  riskClass: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type Capability = z.infer<typeof CapabilitySchema>;

export const RuntimeCapabilitySchema = CapabilitySchema;
export type RuntimeCapability = Capability;

