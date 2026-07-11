import { z } from "zod";
import { RuntimeMetadataSchema } from "./RuntimeMetadata";

/**
 * Runtime operation mode in a profile.
 *
 * - `autonomous`: Fully autonomous operation.
 * - `ci`: Continuous integration mode.
 * - `personal_development`: Developer local environment.
 * - `production`: Production deployment.
 * - `read_only`: Read-only operations only.
 * - `strict_enterprise`: Strict enterprise policies.
 * - `testing`: Testing mode.
 */
export enum RuntimeProfileMode {
  Autonomous = "autonomous",
  Ci = "ci",
  PersonalDevelopment = "personal_development",
  Production = "production",
  ReadOnly = "read_only",
  StrictEnterprise = "strict_enterprise",
  Testing = "testing",
}

/**
 * Capability discovery mode.
 *
 * - `static`: Capabilities are fixed and known at startup.
 * - `progressive`: Capabilities are discovered dynamically during operation.
 */
export enum CapabilityDiscoveryMode {
  Static = "static",
  Progressive = "progressive",
}

/** Zod schema for RuntimeProfileMode enum values. */
export const RuntimeProfileModeSchema = z.enum([
  RuntimeProfileMode.Autonomous,
  RuntimeProfileMode.Ci,
  RuntimeProfileMode.PersonalDevelopment,
  RuntimeProfileMode.Production,
  RuntimeProfileMode.ReadOnly,
  RuntimeProfileMode.StrictEnterprise,
  RuntimeProfileMode.Testing,
]);

/** Zod schema for CapabilityDiscoveryMode enum values. */
export const CapabilityDiscoveryModeSchema = z.enum([
  CapabilityDiscoveryMode.Static,
  CapabilityDiscoveryMode.Progressive,
]);

/**
 * Session budget constraints.
 *
 * Limits resource consumption within a session.
 *
 * @property maxDurationMs - Maximum session duration in milliseconds.
 * @property maxToolCalls - Maximum number of tool invocations.
 * @property maxWriteActions - Maximum number of write operations.
 * @property maxApprovalRequests - Maximum number of approval requests.
 *
 * @example
 * ```ts
 * const budget: SessionBudget = {
 *   maxDurationMs: 3600000,
 *   maxToolCalls: 100,
 *   maxWriteActions: 10,
 *   maxApprovalRequests: 5,
 * };
 * ```
 */
export const SessionBudgetSchema = z.object({
  maxDurationMs: z.number().int().nonnegative().optional(),
  maxToolCalls: z.number().int().nonnegative().optional(),
  maxWriteActions: z.number().int().nonnegative().optional(),
  maxApprovalRequests: z.number().int().nonnegative().optional(),
});

/**
 * Runtime profile: a collection of configuration and policies for a session or deployment.
 *
 * Profiles define:
 * - Which runtimes and capabilities are available.
 * - The operation mode and discovery strategy.
 * - Resource constraints and budgets.
 * - Related policies, approvals, and audit configurations.
 *
 * @property id - Unique profile identifier (required).
 * @property name - Human-readable profile name (required).
 * @property description - Profile description (optional).
 * @property mode - Operation mode (optional).
 * @property discoveryMode - Capability discovery strategy (optional).
 * @property requiredCapabilities - Capabilities that must be available.
 * @property exposedCapabilities - Capabilities exposed for this profile.
 * @property hiddenCapabilities - Capabilities hidden for this profile.
 * @property runtimeNames - Runtime names allowed in this profile.
 * @property gatewayProfileId - Associated gateway profile.
 * @property policyProfileId - Associated policy profile.
 * @property memoryProfileId - Associated memory profile.
 * @property approvalProfileId - Associated approval profile.
 * @property auditProfileId - Associated audit profile.
 * @property budget - Resource budget constraints.
 * @property metadata - Custom profile metadata.
 *
 * @example
 * ```ts
 * const profile: RuntimeProfile = {
 *   id: "prof-prod",
 *   name: "Production Profile",
 *   mode: RuntimeProfileMode.Production,
 *   discoveryMode: CapabilityDiscoveryMode.Static,
 *   runtimeNames: ["ananke", "mnemosyne", "horae"],
 *   budget: { maxDurationMs: 3600000 },
 * };
 * ```
 */
export const RuntimeProfileSchema = z.object({
  id: z.string().min(1, "Profile id is required"),
  name: z.string().min(1, "Profile name is required"),
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
