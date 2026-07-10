import { z } from "zod";
import { ProjectIdentitySchema } from "../identity/ProjectIdentity";
import { RuntimeMetadataSchema } from "./RuntimeMetadata";

export const RuntimeActorSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  kind: z.string().optional(),
});

export const RuntimeTaskSchema = z.object({
  id: z.string().optional(),
  summary: z.string().optional(),
  riskClass: z.string().optional(),
  requiredCapabilities: z.array(z.string()).optional(),
});

export const RuntimeSessionSchema = z.object({
  id: z.string(),
  profileId: z.string().optional(),
  project: ProjectIdentitySchema.optional(),
  agent: RuntimeActorSchema.optional(),
  task: RuntimeTaskSchema.optional(),
  runtimeIds: z.array(z.string()).optional(),
  startedAt: z.string(),
  expiresAt: z.string().optional(),
  metadata: RuntimeMetadataSchema.optional(),
});

export type RuntimeActor = z.infer<typeof RuntimeActorSchema>;
export type RuntimeTask = z.infer<typeof RuntimeTaskSchema>;
export type RuntimeSession = z.infer<typeof RuntimeSessionSchema>;
