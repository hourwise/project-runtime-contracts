import { z } from "zod";
import { RuntimeIdentitySchema } from "../identity/RuntimeIdentity";
import { CapabilitySchema } from "./Capability";
import { RuntimeHealthSchema } from "./RuntimeHealth";
import { RuntimeReadinessSchema } from "./RuntimeReadiness";
import { RuntimeMetadataSchema } from "./RuntimeMetadata";
import { ISO8601TimestampSchema } from "../utils/Timestamp";

/**
 * Runtime communication transport protocol.
 *
 * - `cli`: Command-line invocation.
 * - `http`: HTTP/HTTPS protocol.
 * - `local`: Local in-process communication.
 * - `mcp`: Model Context Protocol.
 * - `stdio`: Standard input/output.
 * - `sse`: Server-Sent Events.
 * - `websocket`: WebSocket protocol.
 * - `unknown`: Unknown or unspecified transport.
 */
export enum RuntimeTransport {
  Cli = "cli",
  Http = "http",
  Local = "local",
  Mcp = "mcp",
  Stdio = "stdio",
  Sse = "sse",
  WebSocket = "websocket",
  Unknown = "unknown",
}

/** Zod schema for RuntimeTransport enum values. */
export const RuntimeTransportSchema = z.enum([
  RuntimeTransport.Cli,
  RuntimeTransport.Http,
  RuntimeTransport.Local,
  RuntimeTransport.Mcp,
  RuntimeTransport.Stdio,
  RuntimeTransport.Sse,
  RuntimeTransport.WebSocket,
  RuntimeTransport.Unknown,
]);

/**
 * Endpoint for communicating with a runtime.
 *
 * @property id - Unique endpoint identifier (optional).
 * @property transport - Communication protocol (required).
 * @property url - URL for HTTP, WebSocket, or SSE transports.
 * @property command - Command to execute for CLI transport.
 * @property args - Arguments for CLI command.
 * @property protocol - Protocol version or specification name.
 * @property metadata - Custom endpoint metadata.
 *
 * @example
 * ```ts
 * const endpoint: RuntimeEndpoint = {
 *   id: "ep-1",
 *   transport: RuntimeTransport.Http,
 *   url: "http://localhost:3000/rpc",
 *   protocol: "json-rpc-2.0",
 * };
 * ```
 */
export const RuntimeEndpointSchema = z.object({
  id: z.string().optional(),
  transport: RuntimeTransportSchema,
  url: z.string().optional(),
  command: z.string().optional(),
  args: z.array(z.string()).optional(),
  protocol: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Complete runtime registration information.
 *
 * Runtimes register with their identity, capabilities, health status, and endpoints.
 * Registrations may be stored in a registry for discovery and orchestration.
 *
 * @property identity - Runtime identity and version (required).
 * @property capabilities - Capabilities exposed by this runtime.
 * @property health - Current health status (optional).
 * @property endpoints - Communication endpoints.
 * @property registeredAt - ISO 8601 registration timestamp (optional).
 * @property expiresAt - ISO 8601 registration expiration time (optional).
 * @property profileIds - Associated profile identifiers.
 * @property metadata - Custom registration metadata.
 *
 * @example
 * ```ts
 * const registration: RuntimeRegistration = {
 *   identity: {
 *     runtime: "mnemosyne",
 *     version: "1.0.0",
 *     protocolVersion: "1.1.0",
 *   },
 *   capabilities: [
 *     { id: "mem.store", name: "Store", version: "1.0" },
 *   ],
 *   health: { healthy: true, uptimeMs: 3600000, warnings: [] },
 *   endpoints: [
 *     { transport: RuntimeTransport.Http, url: "http://localhost:3000" },
 *   ],
 *   registeredAt: new Date().toISOString(),
 * };
 * ```
 */
export const RuntimeRegistrationSchema = z.object({
  identity: RuntimeIdentitySchema,
  capabilities: z.array(CapabilitySchema).optional(),
  health: RuntimeHealthSchema.optional(),
  readiness: RuntimeReadinessSchema.optional(),
  endpoints: z.array(RuntimeEndpointSchema).optional(),
  registeredAt: ISO8601TimestampSchema.optional(),
  expiresAt: ISO8601TimestampSchema.optional(),
  profileIds: z.array(z.string()).optional(),
  metadata: RuntimeMetadataSchema.optional(),
  healthEndpoint: z.string().min(1).optional(),
  readinessEndpoint: z.string().min(1).optional(),
  inspectionMechanism: z.string().min(1).optional(),
  optionalIntegrations: z.array(z.string().min(1)).min(1).optional(),
  requiredIntegrations: z.array(z.string().min(1)).min(1).optional(),
  standalone: z.boolean().optional(),
  degradedModes: z.array(z.string().min(1)).min(1).optional(),
});

export type RuntimeEndpoint = z.infer<typeof RuntimeEndpointSchema>;
export type RuntimeRegistration = z.infer<typeof RuntimeRegistrationSchema>;
