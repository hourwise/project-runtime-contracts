import { z } from "zod";
import { RuntimeMetadataSchema } from "./RuntimeMetadata";
import { ISO8601TimestampSchema } from "../utils/Timestamp";

/**
 * Runtime role in a composition or session.
 *
 * Defines the function a runtime plays within a larger system or session.
 * Multiple roles may be combined when necessary.
 *
 * - `approval`: Grants or denies permissions (e.g., Ananke).
 * - `audit`: Records and monitors events (e.g., audit logger).
 * - `client`: Initiates requests or commands.
 * - `execution_governor`: Controls and monitors execution.
 * - `gateway`: Handles message routing and translation.
 * - `memory`: Manages knowledge and data storage (e.g., Mnemosyne).
 * - `orchestrator`: Coordinates multiple runtimes (e.g., Horae).
 * - `policy`: Enforces policies and constraints.
 * - `tool_source`: Provides or executes tools/actions.
 * - `other`: Unclassified or custom role.
 */
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

/** Zod schema for RuntimeBindingRole enum values. */
export const RuntimeBindingRoleSchema = z.enum([
  RuntimeBindingRole.Approval,
  RuntimeBindingRole.Audit,
  RuntimeBindingRole.Client,
  RuntimeBindingRole.ExecutionGovernor,
  RuntimeBindingRole.Gateway,
  RuntimeBindingRole.Memory,
  RuntimeBindingRole.Orchestrator,
  RuntimeBindingRole.Policy,
  RuntimeBindingRole.ToolSource,
  RuntimeBindingRole.Other,
]);

/**
 * Binding of a runtime to a role in a composition.
 *
 * @property role - The role this runtime plays in the composition (required).
 * @property runtime - Runtime identifier (required).
 * @property capabilityIds - Specific capabilities being used from this runtime.
 * @property required - Whether this binding is mandatory (optional, default true).
 * @property metadata - Custom binding metadata.
 *
 * @example
 * ```ts
 * const binding: RuntimeBinding = {
 *   role: RuntimeBindingRole.Memory,
 *   runtime: "mnemosyne",
 *   capabilityIds: ["memory.store", "memory.retrieve"],
 *   required: true,
 * };
 * ```
 */
export const RuntimeBindingSchema = z.object({
  role: RuntimeBindingRoleSchema,
  runtime: z.string().min(1, "Runtime identifier is required"),
  capabilityIds: z.array(z.string()).optional(),
  required: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Runtime composition: a specific set of runtimes bound together for a session or task.
 *
 * A composition defines which runtimes work together and what roles they play.
 * Compositions may be ephemeral (session-specific) or persistent (profiles).
 *
 * @property id - Unique composition identifier (required).
 * @property name - Human-readable name (optional).
 * @property projectId - Associated project identifier (optional).
 * @property sessionId - Associated session identifier (optional).
 * @property profileId - Associated profile identifier (optional).
 * @property protocolVersion - Protocol version (required).
 * @property bindings - Runtimes and their roles (required, at least one).
 * @property exposedCapabilityIds - Capabilities exposed to clients.
 * @property hiddenCapabilityIds - Capabilities hidden from clients.
 * @property createdAt - ISO 8601 creation timestamp (optional).
 * @property metadata - Custom metadata.
 *
 * @example
 * ```ts
 * const composition: RuntimeComposition = {
 *   id: "comp-123",
 *   name: "Standard Session Composition",
 *   sessionId: "sess-456",
 *   protocolVersion: "1.1.0",
 *   bindings: [
 *     { role: RuntimeBindingRole.Orchestrator, runtime: "horae" },
 *     { role: RuntimeBindingRole.Memory, runtime: "mnemosyne" },
 *     { role: RuntimeBindingRole.Approval, runtime: "ananke" },
 *   ],
 *   exposedCapabilityIds: ["query", "execute"],
 *   createdAt: new Date().toISOString(),
 * };
 * ```
 */
export const RuntimeCompositionSchema = z.object({
  id: z.string().min(1, "Composition id is required"),
  name: z.string().optional(),
  projectId: z.string().optional(),
  sessionId: z.string().optional(),
  profileId: z.string().optional(),
  protocolVersion: z.string().min(1, "Protocol version is required"),
  bindings: z.array(RuntimeBindingSchema).min(1, "At least one binding is required"),
  exposedCapabilityIds: z.array(z.string()).optional(),
  hiddenCapabilityIds: z.array(z.string()).optional(),
  createdAt: ISO8601TimestampSchema.optional(),
  metadata: RuntimeMetadataSchema.optional(),
});

export type RuntimeBinding = z.infer<typeof RuntimeBindingSchema>;
export type RuntimeComposition = z.infer<typeof RuntimeCompositionSchema>;
