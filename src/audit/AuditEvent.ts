import { z } from "zod";
import { SeveritySchema, Severity } from "../results/Severity";
import { ISO8601TimestampSchema } from "../utils/Timestamp";

/**
 * Audit event recording a significant occurrence in a runtime.
 *
 * Audit events are immutable facts that have already occurred. They must include:
 * - `timestamp`: ISO 8601 UTC/offset timestamp of when the event occurred.
 * - `runtime`: The runtime identifier that emitted this event.
 * - `event`: Machine-readable event type (e.g., "permission.granted", "data.accessed").
 * - `severity`: Impact level (info, warning, error, critical).
 * - `details`: Optional structured context (e.g., actor, resource, reason).
 *
 * Audit correlation:
 * - Include `correlationId` to link related events across runtimes.
 * - Include `sessionId` to group events within a single session.
 *
 * @property timestamp - ISO 8601 UTC/offset timestamp (required).
 * @property runtime - Identifier of the runtime emitting this audit event.
 * @property event - Machine-readable event type.
 * @property severity - Severity level of the audit event.
 * @property details - Optional structured event context (e.g., actor, resource, reason).
 *
 * @example
 * ```ts
 * const auditEvent: AuditEvent = {
 *   timestamp: new Date().toISOString(),
 *   runtime: "ananke",
 *   event: "permission.granted",
 *   severity: Severity.Warning,
 *   details: {
 *     actor: "user-123",
 *     resource: "api.write",
 *     reason: "elevated_privileges_detected",
 *   },
 * };
 * ```
 */
export const AuditEventSchema = z.object({
  timestamp: ISO8601TimestampSchema,
  runtime: z.string().min(1, "Runtime identifier is required"),
  event: z.string().min(1, "Event type is required"),
  severity: SeveritySchema,
  details: z.record(z.unknown()).optional(),
});

export type AuditEvent = z.infer<typeof AuditEventSchema>;

