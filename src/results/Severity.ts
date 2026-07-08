import { z } from "zod";

export enum Severity {
  Info = "info",
  Warning = "warning",
  Error = "error",
  Critical = "critical",
}

export const SeveritySchema = z.nativeEnum(Severity);

