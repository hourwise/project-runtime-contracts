import { z } from "zod";

export const VersionSchema = z.object({
  major: z.number().int().nonnegative(),
  minor: z.number().int().nonnegative(),
  patch: z.number().int().nonnegative(),
});

export type Version = z.infer<typeof VersionSchema>;

