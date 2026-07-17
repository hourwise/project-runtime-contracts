/**
 * Well-known runtime identifiers in the Project Ananke ecosystem.
 *
 * These are the canonical names runtimes use to identify themselves.
 * Other runtimes should not use these reserved names.
 *
 * - `ananke`: Policy and authorization decision engine.
 * - `mnemosyne`: Memory and knowledge management runtime.
 * - `horae`: Orchestration and task management runtime.
 * - `moira`: Host application or client runtime (Moirae Code).
 *
 * @example
 * ```ts
 * const runtimeName: RuntimeName = RUNTIME_NAMES.ANANKE; // "ananke"
 * ```
 */
export const RUNTIME_NAMES = {
  ANANKE: "ananke",
  MNEMOSYNE: "mnemosyne",
  HORAE: "horae",
  MOIRA: "moira",
} as const;

/**
 * Type representing any of the well-known runtime names.
 */
export type RuntimeName = (typeof RUNTIME_NAMES)[keyof typeof RUNTIME_NAMES];

