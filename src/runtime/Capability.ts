import { z } from "zod";

export const CapabilitySchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
});

export type Capability = z.infer<typeof CapabilitySchema>;

