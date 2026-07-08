import { z } from "zod";

export const RuntimeIdentitySchema = z.object({
  runtime: z.string(),
  version: z.string(),
  protocolVersion: z.string(),
});

export type RuntimeIdentity = z.infer<typeof RuntimeIdentitySchema>;

