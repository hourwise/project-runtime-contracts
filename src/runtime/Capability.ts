import { z } from "zod";

/**
 * Capability categories defined by the protocol.
 *
 * Capabilities expose the functions and services a runtime offers.
 * Categories help receivers understand what a capability does.
 */
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

/**
 * Capability exposure/visibility state.
 *
 * - `hidden`: Capability exists but is not discoverable.
 * - `discoverable`: Capability can be discovered but may not be active.
 * - `active`: Capability is discoverable and ready for use.
 */
export enum CapabilityExposure {
  Hidden = "hidden",
  Discoverable = "discoverable",
  Active = "active",
}

export enum CapabilityDependencyState {
  Available = "available",
  Degraded = "degraded",
  Unavailable = "unavailable",
  Unknown = "unknown",
}

export const CapabilityDependencyStateSchema = z.enum([
  CapabilityDependencyState.Available,
  CapabilityDependencyState.Degraded,
  CapabilityDependencyState.Unavailable,
  CapabilityDependencyState.Unknown,
]);

/** Zod schema for CapabilityCategory enum values. */
export const CapabilityCategorySchema = z.enum([
  CapabilityCategory.Approval,
  CapabilityCategory.Audit,
  CapabilityCategory.Citation,
  CapabilityCategory.Discovery,
  CapabilityCategory.Execution,
  CapabilityCategory.Gateway,
  CapabilityCategory.Health,
  CapabilityCategory.Knowledge,
  CapabilityCategory.Memory,
  CapabilityCategory.Policy,
  CapabilityCategory.Profile,
  CapabilityCategory.Registry,
  CapabilityCategory.Search,
  CapabilityCategory.Session,
  CapabilityCategory.Tool,
  CapabilityCategory.Other,
]);

/** Zod schema for CapabilityExposure enum values. */
export const CapabilityExposureSchema = z.enum([
  CapabilityExposure.Hidden,
  CapabilityExposure.Discoverable,
  CapabilityExposure.Active,
]);

/**
 * A capability exposed by a runtime.
 *
 * Capabilities are the contract of what a runtime can do. They are discovered
 * during registration and may be filtered by profiles and policies.
 *
 * @property id - Unique capability identifier (required).
 * @property name - Human-readable capability name (required).
 * @property version - Capability version (required).
 * @property description - Detailed description (optional).
 * @property category - Functional category (optional).
 * @property exposure - Visibility/discovery state (optional).
 * @property tags - Search and filtering tags.
 * @property requiresApproval - Whether use requires approval (optional).
 * @property riskClass - Risk classification (optional, e.g., "high", "medium", "low").
 * @property metadata - Custom capability metadata.
 *
 * @example
 * ```ts
 * const capability: Capability = {
 *   id: "memory.store",
 *   name: "Store in Memory",
 *   version: "1.0.0",
 *   description: "Store data in runtime memory",
 *   category: CapabilityCategory.Memory,
 *   exposure: CapabilityExposure.Active,
 *   tags: ["storage", "persistent"],
 *   requiresApproval: true,
 *   riskClass: "medium",
 * };
 * ```
 */
export const CapabilitySchema = z.object({
  id: z.string().min(1, "Capability id is required"),
  name: z.string().min(1, "Capability name is required"),
  version: z.string().min(1, "Capability version is required"),
  description: z.string().optional(),
  category: CapabilityCategorySchema.optional(),
  exposure: CapabilityExposureSchema.optional(),
  tags: z.array(z.string()).optional(),
  requiresApproval: z.boolean().optional(),
  riskClass: z.string().optional(),
  endpointId: z.string().min(1).optional(),
  requiredProtocolFeatures: z.array(z.string().min(1)).min(1).optional(),
  dependencyState: CapabilityDependencyStateSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type Capability = z.infer<typeof CapabilitySchema>;

export const RuntimeCapabilitySchema = CapabilitySchema;
export type RuntimeCapability = Capability;
