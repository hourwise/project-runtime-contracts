import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceFixture = join(repositoryRoot, "tests", "consumer", "ananke-1e38e458.json");
const directory = mkdtempSync(join(tmpdir(), "runtime-contracts-ananke-consumer-"));
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const runNpm = (args, options = {}) => {
  const command = process.env.npm_execpath ? process.execPath : npm;
  const commandArgs = process.env.npm_execpath ? [process.env.npm_execpath, ...args] : args;
  return execFileSync(command, commandArgs, options);
};

try {
  const tarball = runNpm(["pack", "--silent", "--pack-destination", directory], {
    cwd: repositoryRoot,
    encoding: "utf8",
  })
    .trim()
    .split(/\r?\n/)
    .pop();
  if (!tarball) throw new Error("npm pack did not report a tarball filename");

  writeFileSync(
    join(directory, "package.json"),
    JSON.stringify({ name: "ananke-packed-consumer", private: true, type: "module" }),
  );
  writeFileSync(join(directory, "ananke-fixture.json"), readFileSync(sourceFixture));
  runNpm(["install", "--ignore-scripts", "--no-audit", "--no-fund", join(directory, tarball)], {
    cwd: directory,
    stdio: "inherit",
  });

  const harness = `
    import { readFileSync } from "node:fs";
    import {
      AgentExecutionContextSchema,
      ApprovalReferenceSchema,
      AuditReferenceSchema,
      CorrelationContextSchema,
      PrincipalIdentitySchema,
      ResourceScopeSchema,
    } from "project-runtime-contracts";

    const fixture = JSON.parse(readFileSync("ananke-fixture.json", "utf8"));
    const assertions = [];
    const assert = (condition, message) => {
      if (!condition) throw new Error(message);
      assertions.push(message);
    };

    assert(!PrincipalIdentitySchema.safeParse(fixture.operatorIdentity).success, "Ananke OperatorIdentity is not a direct principal match");
    const operatorPrincipal = {
      id: fixture.operatorIdentity.operatorId,
      kind: "human",
      attributes: { authMethod: fixture.operatorIdentity.authMethod },
    };
    assert(PrincipalIdentitySchema.safeParse(operatorPrincipal).success, "OperatorIdentity rename adapter validates");

    assert(!AgentExecutionContextSchema.safeParse(fixture.executionIdentity).success, "Ananke ExecutionIdentity is not a direct agent context match");
    const agentContext = {
      authenticatedPrincipal: fixture.adapterInputs.authenticatedPrincipal,
      actingPrincipal: { id: fixture.executionIdentity.agentPrincipalId, kind: "agent" },
      runtimeId: fixture.adapterInputs.runtimeId,
      sessionId: fixture.executionIdentity.sessionId,
      tenantId: fixture.executionIdentity.tenantId,
    };
    assert(AgentExecutionContextSchema.safeParse(agentContext).success, "Agent context validates after trusted principal/runtime context is supplied");

    assert(!ResourceScopeSchema.safeParse(fixture.executionIdentity.resourceScope).success, "Ananke string scope is not a direct ResourceScope match");
    const [resourceType, ...resourceParts] = fixture.executionIdentity.resourceScope.split(":");
    const resourceScope = {
      mode: "bounded",
      tenantId: fixture.executionIdentity.tenantId,
      resourceType,
      resourceIds: [resourceParts.join(":")],
    };
    assert(ResourceScopeSchema.safeParse(resourceScope).success, "Non-wildcard Ananke scope maps through a structural adapter");
    const [wildcardType, ...wildcardParts] = fixture.wildcardExecutionContext.resourceScope.split(":");
    assert(!ResourceScopeSchema.safeParse({ mode: "bounded", tenantId: fixture.wildcardExecutionContext.tenantId, resourceType: wildcardType, resourceIds: [wildcardParts.join(":")] }).success, "Wildcard Ananke scope remains incompatible");

    assert(!CorrelationContextSchema.safeParse(fixture.executionContext).success, "Ananke execution context has no direct correlation envelope");
    assert(CorrelationContextSchema.safeParse({ requestId: fixture.adapterInputs.requestId, correlationId: fixture.adapterInputs.correlationId, sessionId: fixture.executionContext.sessionId }).success, "Caller-supplied request and correlation identifiers validate");

    const approvalReference = {
      approvalId: fixture.approvalGrant.id,
      sourceRuntime: "ananke",
      policyVersion: fixture.approvalGrant.executionContext.policyVersion,
    };
    assert(ApprovalReferenceSchema.safeParse(approvalReference).success, "Approval grant can emit a portable reference without moving approval semantics");
    assert(AuditReferenceSchema.safeParse({ auditId: fixture.auditEvent.id, sourceRuntime: "ananke" }).success, "Audit event can emit a portable reference without moving audit semantics");

    const result = {
      result: "adapter_required",
      consumer: fixture.consumer,
      sourceCommit: fixture.sourceCommit,
      exactContractFamilyMatches: [],
      structurallyReusableFields: ["agentPrincipalId", "tenantId", "sessionId", "operatorId", "approval id", "audit id"],
      incompatibleFields: ["resourceScope string envelope", "wildcard resource scopes", "OperatorIdentity field names"],
      additionalContextRequired: ["authenticated principal", "runtime id", "request id", "correlation id"],
      unavailableFamilies: fixture.unavailableFamilies,
      domainOwnedFamilies: fixture.domainOwnedFamilies,
      assertions: assertions.length,
      modifiedAnanke: false,
      siblingSourceImported: false,
    };
    process.stdout.write(JSON.stringify(result, null, 2) + "\\n");
  `;
  execFileSync(process.execPath, ["--input-type=module", "-e", harness], {
    cwd: directory,
    stdio: "inherit",
  });
} finally {
  rmSync(directory, { recursive: true, force: true });
}

