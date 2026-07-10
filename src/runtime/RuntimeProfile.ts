import { z } from "zod";
import { RuntimeMetadataSchema } from "./RuntimeMetadata";

export enum RuntimeProfileMode {
  Autonomous = "autonomous",
  Ci = "ci",
  PersonalDevelopment = "personal_development",
  Production = "production",
  ReadOnly = "read_only",
  StrictEnterprise = "strict_enterprise",
  Testing = "testing",
}

export enum CapabilityDiscoveryMode {
  Static = "static",
  Progressive = "progressive",
}

export const RuntimeProfileModeSchema = z.nativeEnum(RuntimeProfileMode);
export const CapabilityDiscoveryModeSchema = z.nativeEnum(CapabilityDiscoveryMode);

export const SessionBudgetSchema = z.object({
  maxDurationMs: z.number().int().nonnegative().optional(),
  maxToolCalls: z.number().int().nonnegative().optional(),
  maxWriteActions: z.number().int().nonnegative().optional(),
  maxApprovalRequests: z.number().int().nonnegative().optional(),
});

export const RuntimeProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  mode: RuntimeProfileModeSchema.optional(),
  discoveryMode: CapabilityDiscoveryModeSchema.optional(),
  requiredCapabilities: z.array(z.string()).optional(),
  exposedCapabilities: z.array(z.string()).optional(),
  hiddenCapabilities: z.array(z.string()).optional(),
  runtimeNames: z.array(z.string()).optional(),
  gatewayProfileId: z.string().optional(),
  policyProfileId: z.string().optional(),
  memoryProfileId: z.string().optional(),
  approvalProfileId: z.string().optional(),
  auditProfileId: z.string().optional(),
  budget: SessionBudgetSchema.optional(),
  metadata: RuntimeMetadataSchema.optional(),
});

export type CapabilityDiscoveryModeType = z.infer<typeof CapabilityDiscoveryModeSchema>;
export type RuntimeProfile = z.infer<typeof RuntimeProfileSchema>;
export type SessionBudget = z.infer<typeof SessionBudgetSchema>;
