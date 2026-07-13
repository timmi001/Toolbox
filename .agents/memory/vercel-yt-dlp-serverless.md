---
name: Vercel serverless can't run yt-dlp/ffmpeg/Python
description: Why the video downloader (or any subprocess-based tool) fails on Vercel even when it works on Replit.
---

- Vercel (and any Lambda-style serverless host) runs Node functions in a
  minimal, ephemeral container with no OS-level binaries beyond Node itself,
  and no way to install more at deploy time. Any `execFile`/`spawn` of a
  system tool (yt-dlp, ffmpeg, a Python interpreter, imagemagick, etc.)
  throws ENOENT there, no matter how the command path is resolved.
  **Why:** this is a platform capability boundary, not a config bug — nixpkgs
  (Replit) vs. Vercel's function runtime are fundamentally different
  environments; code that shells out to binaries can only run on a host that
  provides them (a Replit deployment, a VPS/container, etc.).
  **How to apply:** detect `process.env.VERCEL` / `AWS_LAMBDA_FUNCTION_NAME`
  at startup and log a clear one-time warning if a subprocess-dependent route
  is about to run there; don't let generic ENOENT-derived error messages hide
  the real cause in production logs — log full runtime diagnostics
  (resolved command, PATH, isServerless flag) unconditionally whenever the
  "missing binary" failure path is hit, not just in dev.
  **Fix:** either keep the binary-dependent backend on a persistent host and
  point the Vercel-hosted frontend at it via an absolute API URL, or replace
  the subprocess call with a hosted HTTP API that does the work server-side
  elsewhere (no local binary needed).
