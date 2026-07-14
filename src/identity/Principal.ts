import { z } from "zod";

/** Stable principal kinds. Identity is descriptive and does not grant authority. */
export enum PrincipalKind {
  Human = "human",
  Service = "service",
  Agent = "agent",
  Runtime = "runtime",
}

export const PrincipalKindSchema = z.enum([
  PrincipalKind.Human,
  PrincipalKind.Service,
  PrincipalKind.Agent,
  PrincipalKind.Runtime,
]);

const PrincipalIdentifierSchema = z.string().min(1, "Principal identifier is required");

/** Provider-specific subject identifiers remain opaque strings. */
export const PrincipalIdentitySchema = z.object({
  id: PrincipalIdentifierSchema,
  kind: PrincipalKindSchema,
  issuer: z.string().min(1).optional(),
  tenantId: z.string().min(1).optional(),
  attributes: z.record(z.string()).optional(),
});

export type PrincipalIdentity = z.infer<typeof PrincipalIdentitySchema>;

export const HumanPrincipalSchema = PrincipalIdentitySchema.extend({
  kind: z.literal(PrincipalKind.Human),
});

export const ServicePrincipalSchema = PrincipalIdentitySchema.extend({
  kind: z.literal(PrincipalKind.Service),
});

export const AgentPrincipalSchema = PrincipalIdentitySchema.extend({
  kind: z.literal(PrincipalKind.Agent),
});

export const RuntimePrincipalSchema = PrincipalIdentitySchema.extend({
  kind: z.literal(PrincipalKind.Runtime),
});

export type HumanPrincipal = z.infer<typeof HumanPrincipalSchema>;
export type ServicePrincipal = z.infer<typeof ServicePrincipalSchema>;
export type AgentPrincipal = z.infer<typeof AgentPrincipalSchema>;
export type RuntimePrincipal = z.infer<typeof RuntimePrincipalSchema>;

/**
 * Cross-runtime application context. Both authenticated and acting principals are required;
 * the schema does not authenticate either principal or infer authority from identity.
 */
export const ExecutionContextSchema = z.object({
  authenticatedPrincipal: PrincipalIdentitySchema,
  actingPrincipal: PrincipalIdentitySchema,
  representedPrincipal: PrincipalIdentitySchema.optional(),
  runtimeId: z.string().min(1, "Runtime identifier is required"),
  runtimeInstanceId: z.string().min(1).optional(),
  sessionId: z.string().min(1, "Session identifier is required"),
  projectId: z.string().min(1).optional(),
  workspaceId: z.string().min(1).optional(),
  tenantId: z.string().min(1).optional(),
});

export type ExecutionContext = z.infer<typeof ExecutionContextSchema>;

export const isPrincipalIdentity = (value: unknown): value is PrincipalIdentity =>
  PrincipalIdentitySchema.safeParse(value).success;

export const isExecutionContext = (value: unknown): value is ExecutionContext =>
  ExecutionContextSchema.safeParse(value).success;
