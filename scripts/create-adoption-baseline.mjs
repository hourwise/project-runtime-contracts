import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const proposedTag = "runtime-contracts-adoption-v0.4.0-protocol-1.4.0";
const npmExecutable = process.platform === "win32" ? "npm.cmd" : "npm";

const argument = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
};
const outputArgument = argument("--output-dir", "artifacts");
if (!outputArgument) throw new Error("--output-dir requires a value");
const outputDirectory = resolve(repositoryRoot, outputArgument);
const outputRelative = relative(repositoryRoot, outputDirectory);
if (outputRelative.startsWith("..") || isAbsolute(outputRelative)) {
  throw new Error("The baseline artifact must be generated inside the repository workspace");
}

const run = (command, args, options = {}) =>
  execFileSync(command, args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
  });
const runNpm = (args, options = {}) => {
  if (process.env.npm_execpath) {
    return run(process.execPath, [process.env.npm_execpath, ...args], options);
  }
  return run(npmExecutable, args, options);
};
const runGit = (args, options = {}) =>
  run("git", ["-c", `safe.directory=${repositoryRoot.replaceAll("\\", "/")}`, ...args], options);

const initialStatus = runGit(["status", "--porcelain"], { capture: true }).trim();
if (initialStatus) {
  throw new Error(
    "Adoption baseline generation requires the final intended working tree to be committed and clean",
  );
}

const sourceCommit = runGit(["rev-parse", "HEAD"], { capture: true }).trim();
if (!/^[a-f0-9]{40}$/.test(sourceCommit)) throw new Error("Unable to resolve the exact source commit");

const validationCommands = [
  ["npm ci", () => runNpm(["ci"])],
  ["npm run typecheck", () => runNpm(["run", "typecheck"])],
  ["npm test", () => runNpm(["test"])],
  ["npm run build", () => runNpm(["run", "build"])],
  ["npm run validate", () => runNpm(["run", "validate"])],
  ["npm pack --dry-run", () => runNpm(["pack", "--dry-run"])],
  ["npm run pack:smoke", () => runNpm(["run", "pack:smoke"])],
  ["npm run fixtures:validate", () => runNpm(["run", "fixtures:validate"])],
  ["npm run ananke:consumer", () => runNpm(["run", "ananke:consumer"])],
  ["git diff --check", () => runGit(["diff", "--check"])],
];
for (const [, execute] of validationCommands) execute();

const finalStatus = runGit(["status", "--porcelain"], { capture: true }).trim();
if (finalStatus) throw new Error("Validation changed tracked files; refusing to generate a baseline");

mkdirSync(outputDirectory, { recursive: true });
const packOutput = JSON.parse(
  runNpm(["pack", "--json", "--pack-destination", outputDirectory], { capture: true }),
)[0];
const artifactFilename = packOutput.filename;
const artifactPath = join(outputDirectory, artifactFilename);
const artifactSha256 = createHash("sha256").update(readFileSync(artifactPath)).digest("hex");
const artifactSizeBytes = statSync(artifactPath).size;
const npmVersion = runNpm(["--version"], { capture: true }).trim();
const packageMetadata = JSON.parse(readFileSync(join(repositoryRoot, "package.json"), "utf8"));
if (packageMetadata.name !== "project-runtime-contracts" || packageMetadata.version !== "0.4.0") {
  throw new Error("Stage-A generation expects project-runtime-contracts@0.4.0");
}

const fixtureCatalog = JSON.parse(
  readFileSync(join(repositoryRoot, "fixtures", "adoption-v1", "catalog.json"), "utf8"),
);
const fixtureFamilies = fixtureCatalog.families.map((family) => ({
  id: family.id,
  caseCount: family.cases.length,
}));

const builtModule = await import(
  pathToFileURL(join(repositoryRoot, "dist", "index.js")).href
);
if (
  builtModule.ProtocolVersion?.version !== "1.4.0" ||
  builtModule.ProtocolVersion?.minimumSupported !== "1.0.0"
) {
  throw new Error("Stage-A generation expects protocol 1.4.0 with minimum 1.0.0");
}

const manifest = {
  schemaVersion: "1.0.0",
  recordStatus: "generated",
  packageName: packageMetadata.name,
  futurePackageName: "@fates/runtime-contracts",
  packageVersion: packageMetadata.version,
  protocolVersion: builtModule.ProtocolVersion.version,
  minimumSupportedProtocolVersion: builtModule.ProtocolVersion.minimumSupported,
  supportedProtocolRange: {
    minimum: builtModule.ProtocolVersion.minimumSupported,
    maximum: builtModule.ProtocolVersion.version,
  },
  sourceRepository: "https://github.com/hourwise/project-runtime-contracts",
  sourceCommit,
  proposedTag,
  artifactFilename,
  artifactSha256,
  artifactSizeBytes,
  generatedAt: new Date().toISOString(),
  nodeVersion: process.version,
  npmVersion,
  includedDocumentation: [
    "README.md",
    "CHANGELOG.md",
    "docs/protocol-specification.md",
    "docs/version-negotiation.md",
    "docs/evolution-policy.md",
    "docs/contract-ownership.md",
    "docs/conformance.md",
    "docs/glossary.md",
    "docs/distribution.md",
    "docs/downstream-migration.md",
    "docs/design-gates.md",
    "docs/adoption-baseline.md",
    "docs/ananke-adapter-report.md",
    "docs/dependency-advisory-review.md",
    "docs/decisions/ADR-0005-adoption-baseline-release-classification.md",
  ],
  fixtureFamilies,
  consumerTests: [
    {
      consumer: "Project-Ananke",
      sourceCommit: "1e38e4580ca0f8db46a35dce67362e0e2467d794",
      result: "adapter_required",
      report: "docs/ananke-adapter-report.md",
    },
  ],
  deferredContractFamilies: ["content-preflight"],
  designGates: [
    "scoped-package-publication-authority",
    "content-preflight-cross-owner-contract",
    "unknown-enum-and-union-receiving-policy",
    "wildcard-scope-semantics",
    "negotiation-sequencing",
  ],
  releaseClassification: "pre_release_correction_protocol_1_4",
  contentPreflightIncluded: false,
  validation: validationCommands.map(([command]) => ({ command, result: "passed" })),
};

const parsed = builtModule.AdoptionBaselineManifestSchema.parse(manifest);
const manifestFilename = `${artifactFilename}.baseline.json`;
writeFileSync(join(outputDirectory, manifestFilename), `${JSON.stringify(parsed, null, 2)}\n`);

process.stdout.write(
  `${JSON.stringify(
    {
      result: "generated",
      sourceCommit,
      proposedTag,
      artifactFilename,
      artifactSizeBytes,
      artifactSha256,
      manifestFilename,
      outputDirectory: relative(repositoryRoot, outputDirectory).replaceAll("\\", "/"),
    },
    null,
    2,
  )}\n`,
);
