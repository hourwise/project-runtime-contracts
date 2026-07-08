import { z } from "zod";

export const RuntimeHealthSchema = z.object({
  healthy: z.boolean(),
  uptimeMs: z.number(),
  warnings: z.array(z.string()),
});

export type RuntimeHealth = z.infer<typeof RuntimeHealthSchema>;

