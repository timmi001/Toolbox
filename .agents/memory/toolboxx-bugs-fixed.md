---
name: toolboxx production bugs fixed
description: Root causes and fixes for the 8 bugs found in the toolboxx pnpm monorepo (api-server + utility-tools) during a debugging session.
---

# Toolboxx Production Bugs — Fixed

## Critical

### GOOGLE_API_KEY vs GEMINI_API_KEY mismatch
- **Where:** `artifacts/api-server/src/routes/ai.ts`
- **Root cause:** Code read `process.env["GEMINI_API_KEY"]`; Replit secret is named `GOOGLE_API_KEY` (the canonical name the `@google/genai` SDK expects).
- **Fix:** Changed to `process.env["GOOGLE_API_KEY"]`.
- **Why durable:** If a new AI route is added, use `GOOGLE_API_KEY` not `GEMINI_API_KEY`.

## High

### app.listen callback never receives errors (Node.js behaviour)
- **Where:** `artifacts/api-server/src/index.ts`
- **Root cause:** `app.listen(port, (err) => { if (err) ... })` — the callback fires on `'listening'`, never with an error argument. Bind failures emit `'error'` events on the server object.
- **Fix:** Capture `const server = app.listen(...)` and attach `server.on('error', ...)`.
- **Why durable:** This is a Node.js invariant, not an Express version detail.

### No global Express error handler → HTML error bodies on a JSON API
- **Where:** `artifacts/api-server/src/app.ts`
- **Root cause:** No `(err, req, res, next)` middleware. Express 5 forwards async rejections to error handlers; without one, the default HTML renderer fires.
- **Fix:** Added four-argument error handler at end of middleware chain; also added JSON 404 catch-all before it.

### GoogleGenAI client instantiated per-request
- **Where:** `artifacts/api-server/src/routes/ai.ts`
- **Root cause:** `new GoogleGenAI({ apiKey })` inside the route handler — new HTTP pool per call.
- **Fix:** Module-level lazy singleton (`genAIClient`/`genAIClientKey`), re-created only if key changes.

### Gemini finish reason not checked → silent empty 200 on blocked content
- **Where:** `artifacts/api-server/src/routes/ai.ts`
- **Root cause:** `response.text ?? ""` — when safety/recitation blocks output the text is empty but no exception is thrown.
- **Fix:** Check `response.candidates?.[0]?.finishReason`; return 422 if not STOP/MAX_TOKENS.

## Medium

### SSRF in /http-headers developer route
- **Where:** `artifacts/api-server/src/routes/developer.ts`
- **Root cause:** Fetched arbitrary caller-supplied URLs with no block-list; internal IPs (127.x, 10.x, 169.254.x etc.) were reachable.
- **Fix:** DNS-resolve the hostname before fetching; reject any resolved address in private/loopback/link-local ranges. Fails closed on DNS errors.

### CORS wildcard on binary-streaming endpoints
- **Where:** `artifacts/api-server/src/app.ts`
- **Root cause:** `app.use(cors())` with no config allows all origins including `/video/stream`.
- **Fix:** Lock to `localhost`, `*.replit.dev`, `*.repl.co` by default; override via `ALLOWED_ORIGINS` env var.

### No React Error Boundary
- **Where:** `artifacts/utility-tools/src/App.tsx`
- **Root cause:** 300+ lazy-loaded routes with only `<Suspense>` (handles loading, not render errors). One thrown error whitescreens everything.
- **Fix:** Class-based `ErrorBoundary` wrapping `<Router>` with a "Try again" reset button.
