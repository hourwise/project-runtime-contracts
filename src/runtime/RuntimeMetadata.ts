import { z } from "zod";

/**
 * Optional metadata for a runtime, runtime composition, or capability.
 *
 * This is a flexible key-value store for runtime-specific annotations and labels.
 * Use labels for searchable string metadata and annotations for complex data.
 *
 * @property displayName - Human-readable display name (optional).
 * @property description - Detailed description (optional).
 * @property homepageUrl - URL to runtime's home page.
 * @property repositoryUrl - URL to source repository.
 * @property documentationUrl - URL to documentation.
 * @property labels - String-valued metadata for filtering and discovery.
 * @property annotations - Complex metadata (any JSON-serializable value).
 *
 * @example
 * ```ts
 * const metadata: RuntimeMetadata = {
 *   displayName: "Memory Runtime",
 *   description: "Manages runtime memory and knowledge bases",
 *   homepageUrl: "https://example.com",
 *   repositoryUrl: "https://github.com/example/memory-runtime",
 *   labels: { version: "1.0", env: "production" },
 *   annotations: { config: { maxSize: 1000 } },
 * };
 * ```
 */
export const RuntimeMetadataSchema = z.object({
  displayName: z.string().optional(),
  description: z.string().optional(),
  homepageUrl: z.string().optional(),
  repositoryUrl: z.string().optional(),
  documentationUrl: z.string().optional(),
  labels: z.record(z.string()).optional(),
  annotations: z.record(z.unknown()).optional(),
});

export type RuntimeMetadata = z.infer<typeof RuntimeMetadataSchema>;
