import { z } from "zod";

/**
 * Project identity information.
 *
 * Identifies a project in the runtime system. May be included in sessions
 * to provide context about the project that initiated the session.
 *
 * @property id - Unique project identifier (required).
 * @property name - Human-readable project name.
 * @property rootPath - File system root path of the project.
 *
 * @example
 * ```ts
 * const project: ProjectIdentity = {
 *   id: "proj-123",
 *   name: "My AI Project",
 *   rootPath: "/home/user/my-project",
 * };
 * ```
 */
export const ProjectIdentitySchema = z.object({
  id: z.string().min(1, "Project id is required"),
  name: z.string().min(1, "Project name is required"),
  rootPath: z.string().min(1, "Project root path is required"),
});

export type ProjectIdentity = z.infer<typeof ProjectIdentitySchema>;

