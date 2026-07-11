import { z } from "zod";

/**
 * ISO 8601 timestamp pattern (supports UTC and offset formats).
 * Examples: "2024-07-11T14:30:00Z", "2024-07-11T14:30:00+00:00", "2024-07-11T14:30:00-05:00"
 */
const ISO8601_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/;

/**
 * Zod schema for ISO 8601 UTC/offset timestamps.
 *
 * Valid formats:
 * - `2024-07-11T14:30:00Z` (UTC)
 * - `2024-07-11T14:30:00.123Z` (UTC with milliseconds)
 * - `2024-07-11T14:30:00+05:30` (with offset)
 * - `2024-07-11T14:30:00-08:00` (with negative offset)
 */
export const ISO8601TimestampSchema = z
  .string()
  .regex(ISO8601_PATTERN, {
    message:
      "Timestamp must be ISO 8601 format (e.g., 2024-07-11T14:30:00Z or 2024-07-11T14:30:00+05:30)",
  })
  .refine((value) => !isNaN(Date.parse(value)), {
    message: "Timestamp must be a valid ISO 8601 date",
  });

/**
 * Check if a string is a valid ISO 8601 timestamp.
 *
 * @param timestamp - The timestamp string to validate.
 * @returns True if the timestamp is valid ISO 8601, false otherwise.
 */
export function isValidISO8601Timestamp(timestamp: string): boolean {
  return ISO8601TimestampSchema.safeParse(timestamp).success;
}

/**
 * Get the current time as an ISO 8601 UTC timestamp.
 *
 * @returns Current time in ISO 8601 format with UTC timezone.
 */
export function getCurrentISO8601Timestamp(): string {
  return new Date().toISOString();
}

