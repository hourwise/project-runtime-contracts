import { execFileSync } from "node:child_process";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const command = process.env.npm_execpath ? process.execPath : npm;
const args = process.env.npm_execpath
  ? [process.env.npm_execpath, "pack", "--dry-run", "--json"]
  : ["pack", "--dry-run", "--json"];
const output = execFileSync(command, args, { encoding: "utf8" });
const pack = JSON.parse(output)[0];
const files = new Set(pack.files.map((entry) => entry.path));

const required = [
  "LICENSE",
  "README.md",
  "CHANGELOG.md",
  "dist/index.js",
  "dist/index.d.ts",
  "dist/protocol/AdoptionBaselineManifest.js",
  "dist/protocol/AdoptionBaselineManifest.d.ts",
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
  "docs/decisions/ADR-0006-project-adrasteia-identity.md",
  "examples/adoption-baseline.example.json",
  "examples/compatibility-manifest.json",
  "fixtures/adoption-v1/catalog.json",
];
const missing = required.filter((path) => !files.has(path));
if (missing.length > 0) throw new Error(`npm package is missing required files: ${missing.join(", ")}`);
if ([...files].some((path) => path.startsWith("src/") || /^[A-Za-z]:[\\/]/.test(path))) {
  throw new Error("npm package contains source-tree or machine-local paths");
}

process.stdout.write(
  `${JSON.stringify({ result: "passed", packageFilename: pack.filename, fileCount: files.size, requiredFiles: required.length }, null, 2)}\n`,
);
