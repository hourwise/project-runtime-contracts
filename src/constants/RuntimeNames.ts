/**
 * Well-known runtime names.
 * Runtimes identify themselves using these canonical names.
 */

export const RUNTIME_NAMES = {
  ANANKE: "ananke",
  MNEMOSYNE: "mnemosyne",
  MOIRA: "moira",
} as const;

export type RuntimeName = (typeof RUNTIME_NAMES)[keyof typeof RUNTIME_NAMES];

