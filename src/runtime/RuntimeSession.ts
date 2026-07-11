import { z } from "zod";
import { ProjectIdentitySchema } from "../identity/ProjectIdentity";
import { RuntimeMetadataSchema } from "./RuntimeMetadata";
import { ISO8601TimestampSchema } from "../utils/Timestamp";

/**
 * Actor involved in a runtime session (user, agent, or system).
 *
 * @property id - Actor identifier (optional).
 * @property name - Actor name (optional).
 * @property kind - Actor kind/type (optional, e.g., "user", "agent", "system").
 *
 * @example
 * ```ts
 * const actor: RuntimeActor = {
 *   id: "user-123",
 *   name: "Alice",
 *   kind: "user",
 * };
 * ```
 */
export const RuntimeActorSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  kind: z.string().optional(),
});

/**
 * Task being performed in a runtime session.
 *
 * @property id - Unique task identifier (optional).
 * @property summary - Task description (optional).
 * @property riskClass - Risk classification (optional, e.g., "high", "medium", "low").
 * @property requiredCapabilities - Capabilities needed for this task.
 *
 * @example
 * ```ts
 * const task: RuntimeTask = {
 *   id: "task-456",
 *   summary: "Analyze user data",
 *   riskClass: "high",
 *   requiredCapabilities: ["data.read", "analysis.execute"],
 * };
 * ```
 */
export const RuntimeTaskSchema = z.object({
  id: z.string().optional(),
  summary: z.string().optional(),
  riskClass: z.string().optional(),
  requiredCapabilities: z.array(z.string()).optional(),
});

/**
 * Runtime session: a bounded execution context involving multiple runtimes.
 *
 * Sessions group related operations, correlate events and messages, and provide
 * a scope for policies, budgets, and audit trails.
 *
 * @property id - Unique session identifier (required).
 * @property profileId - Associated runtime profile (optional).
 * @property project - Project context (optional).
 * @property agent - Initiating agent or actor (optional).
 * @property task - Task being performed (optional).
 * @property runtimeIds - Runtimes involved in this session.
 * @property startedAt - ISO 8601 session start timestamp (required).
 * @property expiresAt - ISO 8601 session expiration time (optional).
 * @property metadata - Custom session metadata.
 *
 * @example
 * ```ts
 * const session: RuntimeSession = {
 *   id: "sess-123",
 *   profileId: "prof-prod",
 *   project: { id: "proj-001", name: "MyProject", rootPath: "/path" },
 *   agent: { id: "agent-1", name: "AI Assistant", kind: "agent" },
 *   task: { summary: "Answer user query", requiredCapabilities: ["query"] },
 *   runtimeIds: ["horae", "ananke", "mnemosyne"],
 *   startedAt: new Date().toISOString(),
 * };
 * ```
 */
export const RuntimeSessionSchema = z.object({
  id: z.string().min(1, "Session id is required"),
  profileId: z.string().optional(),
  project: ProjectIdentitySchema.optional(),
  agent: RuntimeActorSchema.optional(),
  task: RuntimeTaskSchema.optional(),
  runtimeIds: z.array(z.string()).optional(),
  startedAt: ISO8601TimestampSchema,
  expiresAt: ISO8601TimestampSchema.optional(),
  metadata: RuntimeMetadataSchema.optional(),
});

export type RuntimeActor = z.infer<typeof RuntimeActorSchema>;
export type RuntimeTask = z.infer<typeof RuntimeTaskSchema>;
export type RuntimeSession = z.infer<typeof RuntimeSessionSchema>;
