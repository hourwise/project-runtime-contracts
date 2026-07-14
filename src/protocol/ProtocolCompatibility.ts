/**
 * Protocol compatibility utilities for runtime negotiation.
 *
 * Runtime protocol versions follow semantic versioning:
 * - Major version changes are incompatible
 * - Minor version changes are additive and backward-compatible
 * - Patch version changes are non-breaking
 */
import { z } from "zod";

/**
 * Parse a semantic version string into components.
 *
 * @param version - Version string in format "major.minor.patch"
 * @returns Object with major, minor, patch components, or null if invalid
 *
 * @example
 * ```ts
 * parseVersion("1.2.3"); // { major: 1, minor: 2, patch: 3 }
 * parseVersion("invalid"); // null
 * ```
 */
export function parseVersion(version: string): {
  major: number;
  minor: number;
  patch: number;
} | null {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return null;

  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
  };
}

/**
 * Compare two semantic versions.
 *
 * @returns
 *   - negative if v1 < v2
 *   - zero if v1 == v2
 *   - positive if v1 > v2
 *
 * @example
 * ```ts
 * compareVersions("1.0.0", "1.1.0"); // -1
 * compareVersions("1.1.0", "1.1.0"); // 0
 * compareVersions("2.0.0", "1.9.9"); // 1
 * ```
 */
export function compareVersions(v1: string, v2: string): number {
  const parsed1 = parseVersion(v1);
  const parsed2 = parseVersion(v2);

  if (!parsed1 || !parsed2) {
    throw new Error(`Invalid version format: ${!parsed1 ? v1 : v2}`);
  }

  if (parsed1.major !== parsed2.major) {
    return parsed1.major - parsed2.major;
  }
  if (parsed1.minor !== parsed2.minor) {
    return parsed1.minor - parsed2.minor;
  }
  return parsed1.patch - parsed2.patch;
}

/**
 * Determine if a runtime can accept a protocol version.
 *
 * A runtime with protocolVersion V and minimumSupported M accepts
 * any runtime with version V' where M <= V' <= V.
 *
 * @param runtimeVersion - The protocol version the runtime supports
 * @param minimumSupportedVersion - The minimum protocol version the runtime accepts
 * @param proposedVersion - The protocol version being proposed
 * @returns true if the proposed version is compatible
 *
 * @example
 * ```ts
 * isCompatible("1.1.0", "1.0.0", "1.0.5"); // true
 * isCompatible("1.1.0", "1.0.0", "2.0.0"); // false (incompatible major version)
 * isCompatible("1.1.0", "1.0.0", "0.9.0"); // false (too old)
 * ```
 */
export function isCompatible(
  runtimeVersion: string,
  minimumSupportedVersion: string,
  proposedVersion: string
): boolean {
  try {
    const proposed = parseVersion(proposedVersion);
    const runtime = parseVersion(runtimeVersion);
    const minimum = parseVersion(minimumSupportedVersion);

    if (!proposed || !runtime || !minimum) {
      return false;
    }

    if (compareVersions(minimumSupportedVersion, runtimeVersion) > 0) {
      return false;
    }

    if (minimum.major !== runtime.major) {
      return false;
    }

    // Major versions must match
    if (proposed.major !== runtime.major) {
      return false;
    }

    // Proposed version must be within supported range
    return compareVersions(proposedVersion, minimumSupportedVersion) >= 0 &&
      compareVersions(proposedVersion, runtimeVersion) <= 0;
  } catch {
    return false;
  }
}

/**
 * Find the best compatible protocol version from a list of candidates.
 *
 * Returns the highest compatible version, or null if none are compatible.
 *
 * @param runtimeVersion - The protocol version the runtime supports
 * @param minimumSupportedVersion - The minimum protocol version the runtime accepts
 * @param candidateVersions - List of candidate versions to choose from
 * @returns The highest compatible version, or null
 *
 * @example
 * ```ts
 * selectBestVersion("1.2.0", "1.0.0", ["1.0.0", "1.1.0", "1.2.0", "2.0.0"]);
 * // Returns "1.2.0"
 * ```
 */
export function selectBestVersion(
  runtimeVersion: string,
  minimumSupportedVersion: string,
  candidateVersions: string[]
): string | null {
  const compatible = candidateVersions.filter((v) =>
    isCompatible(runtimeVersion, minimumSupportedVersion, v)
  );

  if (compatible.length === 0) return null;

  // Sort in descending order and return the highest
  return compatible.sort((a, b) => compareVersions(b, a))[0];
}

/**
 * Negotiate a protocol version between two runtimes.
 *
 * Returns the highest version that is compatible with both runtimes,
 * or null if no compatible version exists.
 *
 * @param runtime1Version - Version of first runtime
 * @param runtime1MinimumSupported - Minimum supported by first runtime
 * @param runtime2Version - Version of second runtime
 * @param runtime2MinimumSupported - Minimum supported by second runtime
 * @returns Negotiated protocol version, or null if incompatible
 *
 * @example
 * ```ts
 * negotiate("1.1.0", "1.0.0", "1.1.0", "1.0.0"); // "1.1.0"
 * negotiate("1.1.0", "1.0.0", "1.0.5", "1.0.0"); // "1.0.5"
 * negotiate("1.0.0", "1.0.0", "2.0.0", "2.0.0"); // null (incompatible)
 * ```
 */
export function negotiate(
  runtime1Version: string,
  runtime1MinimumSupported: string,
  runtime2Version: string,
  runtime2MinimumSupported: string
): string | null {
  try {
    const v1 = parseVersion(runtime1Version);
    const v2 = parseVersion(runtime2Version);
    const m1 = parseVersion(runtime1MinimumSupported);
    const m2 = parseVersion(runtime2MinimumSupported);

    if (!v1 || !v2 || !m1 || !m2) {
      return null;
    }

    if (compareVersions(runtime1MinimumSupported, runtime1Version) > 0 ||
        compareVersions(runtime2MinimumSupported, runtime2Version) > 0) {
      return null;
    }

    if (m1.major !== v1.major || m2.major !== v2.major) {
      return null;
    }

    // Must have same major version
    if (v1.major !== v2.major) {
      return null;
    }

    // Find overlapping range
    const minVersion = compareVersions(runtime1MinimumSupported, runtime2MinimumSupported) > 0
      ? runtime1MinimumSupported
      : runtime2MinimumSupported;

    const maxVersion = compareVersions(runtime1Version, runtime2Version) < 0
      ? runtime1Version
      : runtime2Version;

    // Check if ranges overlap
    if (compareVersions(minVersion, maxVersion) > 0) {
      return null;
    }

    // Return the highest compatible version (which is maxVersion)
    return maxVersion;
  } catch {
    return null;
  }
}

/** Explicit reasons allow a host to report negotiation failure without inventing transport errors. */
export enum ProtocolNegotiationFailureReason {
  MalformedVersion = "malformed_version",
  InvalidRange = "invalid_range",
  UnsupportedMajor = "unsupported_major",
  NoOverlap = "no_overlap",
}

export const ProtocolNegotiationFailureReasonSchema = z.enum([
  ProtocolNegotiationFailureReason.MalformedVersion,
  ProtocolNegotiationFailureReason.InvalidRange,
  ProtocolNegotiationFailureReason.UnsupportedMajor,
  ProtocolNegotiationFailureReason.NoOverlap,
]);

export const ProtocolNegotiationResultSchema = z.discriminatedUnion("compatible", [
  z.object({ compatible: z.literal(true), negotiatedVersion: z.string().regex(/^\d+\.\d+\.\d+$/) }),
  z.object({ compatible: z.literal(false), reason: ProtocolNegotiationFailureReasonSchema, details: z.string().optional() }),
]);

export type ProtocolNegotiationResult = z.infer<typeof ProtocolNegotiationResultSchema>;

/** Negotiation result with a stable, machine-readable incompatibility reason. */
export function negotiateDetailed(
  runtime1Version: string,
  runtime1MinimumSupported: string,
  runtime2Version: string,
  runtime2MinimumSupported: string,
): ProtocolNegotiationResult {
  const versions = [runtime1Version, runtime1MinimumSupported, runtime2Version, runtime2MinimumSupported];
  if (versions.some((version) => !parseVersion(version))) {
    return { compatible: false, reason: ProtocolNegotiationFailureReason.MalformedVersion };
  }
  if (compareVersions(runtime1MinimumSupported, runtime1Version) > 0 ||
      compareVersions(runtime2MinimumSupported, runtime2Version) > 0) {
    return { compatible: false, reason: ProtocolNegotiationFailureReason.InvalidRange };
  }
  if (parseVersion(runtime1MinimumSupported)!.major !== parseVersion(runtime1Version)!.major ||
      parseVersion(runtime2MinimumSupported)!.major !== parseVersion(runtime2Version)!.major) {
    return { compatible: false, reason: ProtocolNegotiationFailureReason.InvalidRange };
  }
  if (parseVersion(runtime1Version)!.major !== parseVersion(runtime2Version)!.major) {
    return { compatible: false, reason: ProtocolNegotiationFailureReason.UnsupportedMajor };
  }
  const negotiatedVersion = negotiate(runtime1Version, runtime1MinimumSupported, runtime2Version, runtime2MinimumSupported);
  return negotiatedVersion
    ? { compatible: true, negotiatedVersion }
    : { compatible: false, reason: ProtocolNegotiationFailureReason.NoOverlap };
}

