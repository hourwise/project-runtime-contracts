import { z } from "zod";

/**
 * Semantic version (major.minor.patch).
 *
 * - **Major**: Breaking changes incompatible with previous versions.
 * - **Minor**: Additive changes, backwards compatible.
 * - **Patch**: Bug fixes and non-behavioral changes.
 *
 * @property major - Major version number (non-negative integer).
 * @property minor - Minor version number (non-negative integer).
 * @property patch - Patch version number (non-negative integer).
 *
 * @example
 * ```ts
 * const version: Version = { major: 1, minor: 2, patch: 3 };
 * ```
 */
export const VersionSchema = z.object({
  major: z.number().int().nonnegative(),
  minor: z.number().int().nonnegative(),
  patch: z.number().int().nonnegative(),
});

export type Version = z.infer<typeof VersionSchema>;

