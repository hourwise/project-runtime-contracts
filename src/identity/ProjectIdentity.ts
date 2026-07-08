import { z } from "zod";

export const ProjectIdentitySchema = z.object({
  id: z.string(),
  name: z.string(),
  rootPath: z.string(),
});

export type ProjectIdentity = z.infer<typeof ProjectIdentitySchema>;

