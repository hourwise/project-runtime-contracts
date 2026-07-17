import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const directory = mkdtempSync(join(tmpdir(), "runtime-contracts-smoke-"));
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

  const packagePath = join(directory, tarball);
  const artifact = readFileSync(packagePath);
  const artifactSha256 = createHash("sha256").update(artifact).digest("hex");
  const artifactSizeBytes = statSync(packagePath).size;

  writeFileSync(
    join(directory, "package.json"),
    JSON.stringify({ name: "packed-consumer", private: true, type: "module" }),
  );
  runNpm(["install", "--ignore-scripts", "--no-audit", "--no-fund", packagePath], {
    cwd: directory,
    stdio: "inherit",
  });

  const installedRoot = join(directory, "node_modules", "project-runtime-contracts");
  const requiredDocumentation = [
    "README.md",
    "CHANGELOG.md",
    "docs/protocol-specification.md",
    "docs/version-negotiation.md",
    "docs/evolution-policy.md",
    "docs/contract-ownership.md",
    "docs/adoption-baseline.md",
    "docs/ananke-adapter-report.md",
    "docs/conformance.md",
    "docs/dependency-advisory-review.md",
    "docs/glossary.md",
    "docs/distribution.md",
    "docs/downstream-migration.md",
    "docs/design-gates.md",
    "docs/decisions/ADR-0005-adoption-baseline-release-classification.md",
  ];
  const requiredFiles = [
    ...requiredDocumentation,
    "examples/adoption-baseline.example.json",
    "examples/compatibility-manifest.json",
    "fixtures/adoption-v1/catalog.json",
  ];
  const missingFiles = requiredFiles.filter((path) => !existsSync(join(installedRoot, path)));
  if (missingFiles.length > 0) {
    throw new Error(`Packed package is missing public evidence: ${missingFiles.join(", ")}`);
  }
  if (existsSync(join(installedRoot, "src"))) {
    throw new Error("Packed consumer must not depend on or include the repository source tree");
  }

  const typeConsumer = `
    import {
      AdoptionBaselineManifestSchema,
      AgentExecutionContextSchema,
      PrincipalKind,
      type AdoptionBaselineManifest,
      type AgentExecutionContext,
    } from "project-runtime-contracts";
    const context: AgentExecutionContext = {
      authenticatedPrincipal: { id: "human-1", kind: PrincipalKind.Human },
      actingPrincipal: { id: "agent-1", kind: PrincipalKind.Agent },
      runtimeId: "packed-consumer",
      sessionId: "session-1",
    };
    AgentExecutionContextSchema.parse(context);
    const schema: typeof AdoptionBaselineManifestSchema = AdoptionBaselineManifestSchema;
    const evidence: AdoptionBaselineManifest | undefined = undefined;
    void schema;
    void evidence;
  `;
  writeFileSync(join(directory, "consumer.ts"), typeConsumer);
  const tsc = join(repositoryRoot, "node_modules", "typescript", "bin", "tsc");
  if (!existsSync(tsc)) throw new Error("TypeScript compiler is unavailable for packed type import check");
  execFileSync(
    process.execPath,
    [
      tsc,
      "--noEmit",
      "--skipLibCheck",
      "--target",
      "ES2022",
      "--module",
      "NodeNext",
      "--moduleResolution",
      "NodeNext",
      "consumer.ts",
    ],
    { cwd: directory, stdio: "inherit" },
  );

  const runtimeConsumer = `
    import { readFileSync } from "node:fs";
    import { join } from "node:path";
    import * as contracts from "project-runtime-contracts";

    const required = [
      "AdoptionBaselineManifestSchema",
      "AgentExecutionContextSchema",
      "CompatibilityManifestSchema",
      "DelegationDescriptorSchema",
      "DelegationRequestSchema",
      "DualPrincipalContextSchema",
      "PrincipalIdentitySchema",
      "ProtocolVersion",
      "ResourceScopeSchema",
      "RuntimeHealthSchema",
      "RuntimeIdentitySchema",
      "RuntimeReadinessSchema",
      "RuntimeRegistrationSchema",
      "negotiateDetailed",
    ];
    const missing = required.filter((name) => contracts[name] === undefined);
    if (missing.length) throw new Error("Missing public exports: " + missing.join(", "));

    const packageRoot = process.env.RUNTIME_CONTRACTS_PACKED_ROOT;
    if (!packageRoot) throw new Error("Packed root was not supplied");
    const catalog = JSON.parse(readFileSync(join(packageRoot, "fixtures/adoption-v1/catalog.json"), "utf8"));
    const schemaByFamily = {
      "principal-identity": "PrincipalIdentitySchema",
      "dual-principal-context": "DualPrincipalContextSchema",
      "agent-execution-context": "AgentExecutionContextSchema",
      "resource-scope": "ResourceScopeSchema",
      "correlation-and-causation": "CorrelationContextSchema",
      "delegation-request": "DelegationRequestSchema",
      "delegation-descriptor": "DelegationDescriptorSchema",
      "runtime-identity": "RuntimeIdentitySchema",
      "runtime-registration": "RuntimeRegistrationSchema",
      "runtime-readiness": "RuntimeReadinessSchema",
      "runtime-health": "RuntimeHealthSchema",
      "protocol-version-range": "ProtocolVersionRangeSchema",
      "compatibility-manifest": "CompatibilityManifestSchema",
    };
    for (const family of catalog.families) {
      const fixture = family.cases.find((entry) => entry.category === "minimal_valid");
      if (!fixture) throw new Error("No minimal fixture for " + family.id);
      if (family.id === "protocol-negotiation") {
        const p = fixture.payload;
        const actual = contracts.negotiateDetailed(p.runtime1Version, p.runtime1Minimum, p.runtime2Version, p.runtime2Minimum);
        if (JSON.stringify(actual) !== JSON.stringify(fixture.expected)) throw new Error("Negotiation fixture failed");
      } else {
        const schemaName = fixture.schema ?? schemaByFamily[family.id];
        const schema = contracts[schemaName];
        if (!schema || !schema.safeParse(fixture.payload).success) throw new Error("Fixture failed: " + family.id);
      }
    }
  `;
  execFileSync(process.execPath, ["--input-type=module", "-e", runtimeConsumer], {
    cwd: directory,
    env: { ...process.env, RUNTIME_CONTRACTS_PACKED_ROOT: installedRoot },
    stdio: "inherit",
  });

  process.stdout.write(
    `${JSON.stringify(
      {
        result: "passed",
        tarballPath: packagePath,
        artifactFilename: tarball,
        artifactSizeBytes,
        artifactSha256,
        validatedFixtureFamilies: 15,
        publicDocumentationFiles: requiredDocumentation.length,
        siblingSourceRequired: false,
        temporaryDirectoryRemoved: true,
      },
      null,
      2,
    )}\n`,
  );
} finally {
  rmSync(directory, { recursive: true, force: true });
}
