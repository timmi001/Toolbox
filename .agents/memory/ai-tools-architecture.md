---
name: AI tools architecture
description: How the 28 AI tools powered by Gemini are structured end-to-end
---

## Pattern

**Backend**: Single `POST /api/ai/generate` route (`artifacts/api-server/src/routes/ai.ts`)
- Accepts `{ toolId, inputs }` 
- Per-tool schema validation (required fields + max input lengths) via `TOOL_SCHEMAS`
- Rate limited to 20 req/min per IP via `express-rate-limit`
- Calls `gemini-2.5-flash` via `@google/genai` SDK (GoogleGenAI class)
- Does NOT leak internal error strings to clients

**Frontend**: Config-driven
- `artifacts/utility-tools/src/lib/ai-tools-config.ts` — field definitions (type, label, options, maxLength) per tool
- `artifacts/utility-tools/src/components/AiToolShell.tsx` — single shared UI component (inputs → fetch → result + copy/download)
- `artifacts/utility-tools/src/pages/tools/ai/<slug>.tsx` — 28 thin wrapper files, each just `<AiToolShell tool={getToolBySlug('...')!} />`

**Why:** Minimizes code duplication. Adding a new AI tool = 1 new config entry + 1 new prompt case + 1 thin page file + 1 route registration.

## API call in frontend
Fetches `/api/ai/generate` (relative URL). In Replit dev, the Replit proxy routes `/api` to the api-server — no Vite proxy needed.

## GEMINI_API_KEY
Stored as a Replit secret. Never hardcoded. Backend reads `process.env["GEMINI_API_KEY"]`.
