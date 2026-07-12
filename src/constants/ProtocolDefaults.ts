/**
 * Protocol defaults used when runtimes lack explicit configuration.
 *
 * These constants serve as fallbacks during protocol negotiation and
 * are applied when no version is explicitly specified.
 *
 * - `DEFAULT_PROTOCOL_VERSION`: Current protocol version (semver).
 * - `DEFAULT_MINIMUM_SUPPORTED_VERSION`: Minimum compatible version.
 *
 * @see ProtocolVersion for the authoritative version.
 * @see VERSIONING.md for compatibility rules.
 */

/**
 * Default protocol version when not explicitly specified.
 */
export const DEFAULT_PROTOCOL_VERSION = "1.4.0";

/**
 * Default minimum supported protocol version.
 * Runtimes with older versions cannot interoperate.
 */
export const DEFAULT_MINIMUM_SUPPORTED_VERSION = "1.0.0";

