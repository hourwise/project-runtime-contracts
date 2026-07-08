import { z } from "zod";

export const RuntimeMessageSchema = z.object({
  id: z.string().optional(),
  type: z.string(),
  payload: z.unknown().optional(),
  sender: z.string().optional(),
  timestamp: z.string().optional(),
  correlationId: z.string().optional(),
});

export type RuntimeMessage = z.infer<typeof RuntimeMessageSchema>;

