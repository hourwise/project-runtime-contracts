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
 *   version: "1.1.0",
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
  version: "1.1.0",
  minimumSupported: "1.0.0",
};

