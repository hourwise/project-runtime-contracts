import { z } from "zod";

/** Wildcards are intentionally prohibited until the ecosystem agrees on their semantics. */
export enum ResourceScopeMode {
  Bounded = "bounded",
  Unscoped = "unscoped",
}

export const ResourceScopeModeSchema = z.enum([
  ResourceScopeMode.Bounded,
  ResourceScopeMode.Unscoped,
]);

const ScopeStringSchema = z.string().min(1);
const ScopeListSchema = z.array(ScopeStringSchema).min(1);

const containsWildcard = (value: string): boolean => /[*?\[\]{}]/.test(value);

/**
 * Portable tenant, project, and resource boundary metadata. This is a declaration only;
 * policy runtimes decide whether a bounded scope is sufficient for an operation.
 *
 * `mode: "unscoped"` is explicit and is never inferred from omitted fields. Wildcard values
 * are rejected because no shared wildcard language has been accepted.
 */
export const ResourceScopeSchema = z
  .object({
    mode: ResourceScopeModeSchema,
    tenantId: ScopeStringSchema.optional(),
    accountId: ScopeStringSchema.optional(),
    projectId: ScopeStringSchema.optional(),
    workspaceId: ScopeStringSchema.optional(),
    resourceType: ScopeStringSchema.optional(),
    resourceIds: ScopeListSchema.optional(),
    operations: ScopeListSchema.optional(),
    providerNamespace: ScopeStringSchema.optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .superRefine((scope, context) => {
    const boundedFields = [
      scope.tenantId,
      scope.accountId,
      scope.projectId,
      scope.workspaceId,
      scope.resourceType,
      scope.resourceIds,
      scope.operations,
      scope.providerNamespace,
    ];
    const hasBoundary = boundedFields.some((field) => field !== undefined);

    if (scope.mode === ResourceScopeMode.Bounded && !hasBoundary) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["mode"],
        message: "Bounded resource scope requires at least one boundary",
      });
    }

    if (scope.mode === ResourceScopeMode.Unscoped && hasBoundary) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["mode"],
        message: "Unscoped resource scope must not contain boundary fields",
      });
    }

    const values = [
      scope.tenantId,
      scope.accountId,
      scope.projectId,
      scope.workspaceId,
      scope.resourceType,
      scope.providerNamespace,
      ...(scope.resourceIds ?? []),
      ...(scope.operations ?? []),
    ].filter((value): value is string => value !== undefined);

    if (values.some(containsWildcard)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["resourceIds"],
        message: "Wildcard resource scopes are not part of the portable profile",
      });
    }
  });

export type ResourceScope = z.infer<typeof ResourceScopeSchema>;

export const isResourceScope = (value: unknown): value is ResourceScope =>
  ResourceScopeSchema.safeParse(value).success;
