# Protocol Overview

This document captures the high-level protocol and conventions used by runtimes that implement these contracts.

- Versioning: semantic major changes are breaking; minor and patch changes are backwards compatible.
- Messages: runtime-to-runtime messages use the `RuntimeMessage` shape.
- Error handling: `Result<T>` and `RuntimeError` are the canonical error/result shapes.
- Identity: each runtime should expose `RuntimeIdentity` so orchestrators can identify runtime name, implementation version, protocol version, minimum supported protocol, capabilities, and metadata.
- Capabilities: runtimes should describe capability IDs and categories rather than requiring callers to know implementation-specific package names.
- Health: runtimes should report `RuntimeHealth` with a coarse status such as `healthy`, `busy`, `read_only`, `updating`, `unavailable`, or `degraded`.
- Registration: runtimes can publish `RuntimeRegistration` records containing identity, health, endpoints, capabilities, and profile metadata.
- Profiles and sessions: orchestrators can use `RuntimeProfile`, `RuntimeSession`, and `RuntimeComposition` to expose only the capabilities appropriate to the current project, agent, task, and risk context.
- Events: cross-runtime notifications should use `RuntimeEvent` for registration, health changes, approval decisions, memory updates, policy changes, gateway failures, and audit completion.

Expand this file as protocol features are finalized and as cross-runtime needs emerge.
