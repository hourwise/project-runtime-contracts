import { z } from "zod";

/**
 * Severity level for errors, warnings, audit events, and health status.
 *
 * - `info`: Informational message, no action needed.
 * - `warning`: Warning condition, review recommended.
 * - `error`: Error condition, action required.
 * - `critical`: Critical condition, immediate action required.
 */
export enum Severity {
  Info = "info",
  Warning = "warning",
  Error = "error",
  Critical = "critical",
}

/** Zod schema for Severity enum values. */
export const SeveritySchema = z.enum([
  Severity.Info,
  Severity.Warning,
  Severity.Error,
  Severity.Critical,
]);
