import { z } from "zod";

export const RuntimeMetadataSchema = z.object({
  displayName: z.string().optional(),
  description: z.string().optional(),
  homepageUrl: z.string().optional(),
  repositoryUrl: z.string().optional(),
  documentationUrl: z.string().optional(),
  labels: z.record(z.string()).optional(),
  annotations: z.record(z.unknown()).optional(),
});

export type RuntimeMetadata = z.infer<typeof RuntimeMetadataSchema>;
