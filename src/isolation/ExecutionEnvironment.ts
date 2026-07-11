import { z } from "zod";

/** Execution isolation available to a runtime. */
export enum IsolationLevel {
  Host = "host",
  Process = "process",
  Container = "container",
  Microvm = "microvm",
  RemoteSandbox = "remote-sandbox",
}

/** Zod schema for serialized isolation-level values. */
export const IsolationLevelSchema = z.enum([
  IsolationLevel.Host,
  IsolationLevel.Process,
  IsolationLevel.Container,
  IsolationLevel.Microvm,
  IsolationLevel.RemoteSandbox,
]);

/**
 * Declared limits for an execution environment.
 *
 * CPU is a provider-neutral resource expression such as `"1"` or `"500m"`.
 * Memory and timeout values are positive integer megabytes and milliseconds.
 */
export const ResourceLimitsSchema = z.object({
  cpu: z.string().min(1, "CPU limit must not be empty").optional(),
  memoryMb: z.number().int().positive().optional(),
  timeoutMs: z.number().int().positive().optional(),
});

export type ResourceLimits = z.infer<typeof ResourceLimitsSchema>;

/**
 * Provider-neutral description of where a runtime executes.
 *
 * `filesystemScope` selectors are opaque strings. Their producing runtime
 * defines whether a selector represents a path, pattern, or another portable
 * scope reference; consumers must not assume a shared filesystem syntax.
 */
export const ExecutionEnvironmentSchema = z.object({
  isolationLevel: IsolationLevelSchema,
  provider: z.string().min(1, "Provider must not be empty").optional(),
  operatingSystem: z.string().min(1, "Operating system must not be empty").optional(),
  architecture: z.string().min(1, "Architecture must not be empty").optional(),
  networkPolicyId: z.string().min(1, "Network policy id must not be empty").optional(),
  filesystemScope: z.array(z.string().min(1, "Filesystem scope selector must not be empty")).optional(),
  resourceLimits: ResourceLimitsSchema.optional(),
});

export type ExecutionEnvironment = z.infer<typeof ExecutionEnvironmentSchema>;

