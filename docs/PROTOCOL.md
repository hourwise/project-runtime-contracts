# Protocol Overview

This document captures the high-level protocol and conventions used by runtimes that implement these contracts.

- Versioning: semantic major changes are breaking; minor/patch are backwards compatible.
- Messages: runtime-to-runtime messages use `RuntimeMessage` shape.
- Error handling: `Result<T>` and `RuntimeError` are the canonical error/result shapes.

Expand this file as protocol features are finalized and as cross-runtime needs emerge.

