import { z } from "zod";

export const RuntimeErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  recoverable: z.boolean(),
  details: z.record(z.unknown()).optional(),
});

export type RuntimeError = z.infer<typeof RuntimeErrorSchema>;

