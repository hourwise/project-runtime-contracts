import { z } from "zod";
import { RuntimeCapabilitySchema } from "../runtime/Capability";

/** The form in which a skill is supplied to a runtime. */
export enum SkillKind {
  Guidance = "guidance",
  Workflow = "workflow",
  Executable = "executable",
}

/** The declared review and activation state of a skill. */
export enum SkillTrustState {
  Unreviewed = "unreviewed",
  Verified = "verified",
  Restricted = "restricted",
  Blocked = "blocked",
}

/** Zod schema for serialized skill kinds. */
export const SkillKindSchema = z.enum([
  SkillKind.Guidance,
  SkillKind.Workflow,
  SkillKind.Executable,
]);

/** Zod schema for serialized skill trust states. */
export const SkillTrustStateSchema = z.enum([
  SkillTrustState.Unreviewed,
  SkillTrustState.Verified,
  SkillTrustState.Restricted,
  SkillTrustState.Blocked,
]);

/**
 * Provenance declaration for a runtime skill.
 *
 * A source must identify either a portable repository locator or a publisher.
 * `repository` may be an HTTP URL, source-control locator, package reference,
 * or another runtime-neutral source identifier.
 */
export const SkillSourceSchema = z
  .object({
    repository: z.string().min(1, "Repository must not be empty").optional(),
    revision: z.string().min(1, "Revision must not be empty").optional(),
    publisher: z.string().min(1, "Publisher must not be empty").optional(),
    licence: z.string().min(1, "Licence must not be empty").optional(),
  })
  .refine((source) => source.repository !== undefined || source.publisher !== undefined, {
    message: "Skill source requires a repository or publisher",
  });

export type SkillSource = z.infer<typeof SkillSourceSchema>;

const SemanticVersionSchema = z.string().regex(
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/,
  "Skill version must be a semantic version",
);

/**
 * Portable declaration of a skill a runtime may discover or register.
 *
 * `trustState` is descriptive. In particular, a blocked skill remains valid
 * data so that policy and audit consumers can observe the declaration; this
 * schema does not decide whether the skill can be activated.
 */
export const RuntimeSkillSchema = z.object({
  id: z.string().min(1, "Skill id is required"),
  version: SemanticVersionSchema,
  kind: SkillKindSchema,
  source: SkillSourceSchema,
  declaredCapabilities: z.array(RuntimeCapabilitySchema),
  requiredSecrets: z.array(z.string().min(1, "Secret reference must not be empty")).optional(),
  networkRequirements: z.array(z.string().min(1, "Network requirement must not be empty")).optional(),
  supportedRuntimes: z.array(z.string().min(1, "Runtime identifier must not be empty")).optional(),
  supportedModels: z.array(z.string().min(1, "Model identifier must not be empty")).optional(),
  trustState: SkillTrustStateSchema,
});

export type RuntimeSkill = z.infer<typeof RuntimeSkillSchema>;

