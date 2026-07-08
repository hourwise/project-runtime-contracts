import { z } from "zod";
import { SeveritySchema } from "../results/Severity";

export const AuditEventSchema = z.object({
  timestamp: z.string(), // ISO 8601
  runtime: z.string(),
  event: z.string(),
  severity: SeveritySchema,
  details: z.record(z.unknown()).optional(),
});

export type AuditEvent = z.infer<typeof AuditEventSchema>;

