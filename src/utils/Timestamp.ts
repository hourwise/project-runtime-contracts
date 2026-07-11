import { z } from "zod";

/**
 * ISO 8601 timestamp pattern (supports UTC and offset formats).
 * Examples: "2024-07-11T14:30:00Z", "2024-07-11T14:30:00+00:00", "2024-07-11T14:30:00-05:00"
 */
const ISO8601_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/;

function hasValidCalendarDate(value: string): boolean {
  const [date] = value.split("T");
  const [yearText, monthText, dayText] = date.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1];
}

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
  .refine((value) => hasValidCalendarDate(value) && !isNaN(Date.parse(value)), {
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

