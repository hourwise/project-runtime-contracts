import { z } from "zod";
import { RuntimeIdentitySchema } from "../identity/RuntimeIdentity";
import { CapabilitySchema } from "./Capability";
import { RuntimeHealthSchema } from "./RuntimeHealth";
import { RuntimeMetadataSchema } from "./RuntimeMetadata";

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

export const RuntimeTransportSchema = z.nativeEnum(RuntimeTransport);

export const RuntimeEndpointSchema = z.object({
  id: z.string().optional(),
  transport: RuntimeTransportSchema,
  url: z.string().optional(),
  command: z.string().optional(),
  args: z.array(z.string()).optional(),
  protocol: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const RuntimeRegistrationSchema = z.object({
  identity: RuntimeIdentitySchema,
  capabilities: z.array(CapabilitySchema).optional(),
  health: RuntimeHealthSchema.optional(),
  endpoints: z.array(RuntimeEndpointSchema).optional(),
  registeredAt: z.string().optional(),
  expiresAt: z.string().optional(),
  profileIds: z.array(z.string()).optional(),
  metadata: RuntimeMetadataSchema.optional(),
});

export type RuntimeEndpoint = z.infer<typeof RuntimeEndpointSchema>;
export type RuntimeRegistration = z.infer<typeof RuntimeRegistrationSchema>;
