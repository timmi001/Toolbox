---
name: Bundled PDF.js runtime
description: Non-obvious runtime requirements for server-side pdf-parse v2 in the bundled API service
---

When using pdf-parse v2 in the bundled API server, keep the parser import lazy, install its native canvas runtime explicitly, and configure the worker URL to the worker shipped inside pdf-parse.

**Why:** Eager or incomplete setup can stop the API at startup with a DOMMatrix error, or allow startup but fail every extraction because PDF.js cannot locate its worker after esbuild bundling.

**How to apply:** After changing the parser or build setup, restart the managed API workflow and test a real text PDF through the multipart endpoint; do not rely on typechecking alone.