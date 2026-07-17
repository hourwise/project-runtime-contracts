# Dependency Advisory Review

## Scope And Result

`npm audit --json` was queried on 2026-07-17 against the current lockfile. It reported six
package-level vulnerabilities: three moderate, one high, and two critical. All six occur only in
the Vitest/Vite development toolchain. `npm ls --omit=dev --all` reports only `zod@3.25.76` in the
production dependency tree, so none of the six is in the packed runtime dependency path.

No dependency was upgraded in the protocol-baseline pass. The audit recommends Vitest and
`@vitest/ui` `4.1.10`, which is a semver-major toolchain migration from the locked `2.1.9` line and
requires a separate compatibility review.

## Advisory Classification

| Package and locked version | Severity | Relationship and path | Packed runtime tree | Exploitability in this repository | Recommendation / deferral |
| --- | --- | --- | --- | --- | --- |
| `@vitest/mocker@2.1.9` | Moderate | Transitive dev dependency: `vitest -> @vitest/mocker -> vite` | No | Used only by the test toolchain; the package exposes no mocker or development server at runtime. | Upgrade with the Vitest major migration and rerun the full suite. Deferrable from this baseline. |
| `@vitest/ui@2.1.9` | Critical | Direct dev dependency; linked to `vitest` | No | The repository's validation scripts use headless `vitest run` and do not start the UI server. Exposure would increase if a developer served the UI on an untrusted interface. | Remove if unused or upgrade with Vitest to `4.1.10` in a dependency-only change. Deferrable if the UI server is not exposed. |
| `esbuild@0.21.5` | Moderate | Transitive dev dependency: `vitest -> vite -> esbuild` | No | The advisory concerns development-server request behavior. Runtime Contracts does not ship or run that server for consumers. | Remediate through the reviewed Vitest/Vite upgrade. Deferrable from the contract baseline. |
| `vite@5.4.21` | High | Transitive dev dependency of Vitest, also used by mocker and vite-node | No | Reported issues concern Vite development-server path handling and Windows launch-editor behavior. CI uses `vitest run`; the package has no production Vite server. | Upgrade through the Vitest major migration; avoid exposing a local Vite/Vitest UI server meanwhile. Deferrable from the protocol baseline. |
| `vite-node@2.1.9` | Moderate | Transitive dev dependency: `vitest -> vite-node -> vite` | No | Test runner only; not imported by the packaged library. Risk follows the Vite development surface. | Upgrade with Vitest and verify tests/build/package smoke. Deferrable from this baseline. |
| `vitest@2.1.9` | Critical | Direct dev dependency; brings mocker, UI, vite-node, and Vite | No | The critical advisory applies when the Vitest UI server is listening. Repository CI and baseline commands use non-server `vitest run`. This does not make the advisory irrelevant, but the vulnerable surface is not part of the distributed library. | Plan a separate `vitest@4.1.10` migration, including Node support and configuration review. Deferrable from this baseline while no UI server is exposed. |

## Operational Recommendation

Track one dependency-only maintenance item for the Vitest 4 migration. It should update Vitest
and `@vitest/ui` together, review whether the UI dependency is needed, run the complete baseline
matrix, and compare the packed production tree. Do not use `npm audit fix --force` in this
protocol pass.

This review is an exposure assessment for the current contracts-only package, not a claim that
development-tool vulnerabilities are harmless or resolved.

