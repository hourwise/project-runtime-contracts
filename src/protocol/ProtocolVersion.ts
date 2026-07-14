import { z } from "zod";

/** A strict, transport-independent semantic version. */
export const SemanticVersionSchema = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/, "Version must use major.minor.patch form");

export type SemanticVersion = z.infer<typeof SemanticVersionSchema>;

/** A closed protocol range advertised by a runtime. */
export const ProtocolVersionRangeSchema = z
  .object({
    minimum: SemanticVersionSchema,
    maximum: SemanticVersionSchema,
  })
  .superRefine((range, context) => {
    const parse = (value: string) => value.split(".").map(Number);
    const minimum = parse(range.minimum);
    const maximum = parse(range.maximum);
    if (minimum[0] !== maximum[0]) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["maximum"], message: "A protocol range cannot span major versions" });
    } else if (minimum[1] > maximum[1] || (minimum[1] === maximum[1] && minimum[2] > maximum[2])) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["maximum"], message: "Protocol range maximum must not be lower than minimum" });
    }
  });

export type ProtocolVersionRange = z.infer<typeof ProtocolVersionRangeSchema>;

/**
 * Protocol version and compatibility information.
 *
 * @property version - Current protocol version (semver format, e.g., "1.1.0").
 * @property minimumSupported - Minimum supported protocol version.
 *   Runtimes with versions below this cannot interoperate.
 *
 * @example
 * ```ts
 * export const ProtocolVersion = {
 *   version: "1.4.0",
 *   minimumSupported: "1.0.0",
 * };
 * ```
 */
export interface RuntimeProtocol {
  version: string;
  minimumSupported: string;
}

/**
 * Current runtime protocol version.
 *
 * Protocol versioning follows semantic versioning:
 * - **Major**: Breaking changes that are incompatible with previous versions.
 * - **Minor**: Additive changes that remain backward-compatible.
 * - **Patch**: Bug fixes and non-behavioral changes.
 *
 * Runtimes must support all protocol versions >= minimumSupported.
 *
 * @see VERSIONING.md for detailed compatibility rules.
 */
export const ProtocolVersion: RuntimeProtocol = {
  version: "1.4.0",
  minimumSupported: "1.0.0",
};

