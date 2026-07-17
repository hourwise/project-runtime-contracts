import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const directory = mkdtempSync(join(tmpdir(), "runtime-contracts-smoke-"));
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const runNpm = (args, options = {}) => {
  const command = process.env.npm_execpath ? process.execPath : npm;
  const commandArgs = process.env.npm_execpath ? [process.env.npm_execpath, ...args] : args;
  return execFileSync(command, commandArgs, options);
};
try {
  const tarball = runNpm(["pack", "--silent", "--pack-destination", directory], { encoding: "utf8" }).trim().split(/\r?\n/).pop();
  const packagePath = join(directory, tarball);
  writeFileSync(join(directory, "package.json"), JSON.stringify({ name: "packed-consumer", private: true, type: "module" }));
  runNpm(["install", "--ignore-scripts", packagePath], { cwd: directory, stdio: "inherit" });
  const importCheck = `
    import('project-runtime-contracts').then((contracts) => {
      const required = [
        'AgentExecutionContextSchema',
        'CompatibilityManifestSchema',
        'DelegationRequestSchema',
        'PrincipalKind',
        'ProtocolVersion',
        'ResourceScopeSchema',
        'negotiateDetailed',
      ];
      if (required.some((name) => contracts[name] === undefined)) process.exit(1);
    });
  `;
  execFileSync(process.execPath, ["--input-type=module", "-e", importCheck], { cwd: directory, stdio: "inherit" });
} finally {
  rmSync(directory, { recursive: true, force: true });
}
