# Free Online Utility Tools

A hub of 100+ free browser-based utility tools — text, developer, image, PDF, calculator, business, SEO, and AI-powered tools — built on Replit.

## Run & Operate

- Workflows start automatically: `artifacts/utility-tools: web` (frontend) and `artifacts/api-server: API Server` (backend)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/utility-tools run typecheck` — typecheck frontend only
- Required env: `GEMINI_API_KEY` — Google Gemini API key (for AI tools at `/tools/ai/*`)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS v4, Wouter (routing), TanStack Query
- Backend: Express 5, `@google/genai` (Gemini 2.5 Flash), `express-rate-limit`
- UI: Radix UI primitives, Lucide React icons, shadcn/ui components
- PDF tools: `pdf-lib`, `pdfjs-dist`; QR tools: `qrcode`; ZIP: `jszip`

## Where things live

- `artifacts/utility-tools/src/App.tsx` — all routes (100+ tool pages via Wouter)
- `artifacts/utility-tools/src/pages/` — page components by category (`tools/`, `blog/`)
- `artifacts/utility-tools/src/components/` — shared layout, tool shell, UI primitives
- `artifacts/api-server/src/routes/ai.ts` — AI generation endpoint (`POST /api/ai/generate`)
- `artifacts/api-server/src/routes/health.ts` — health check (`GET /api/healthz`)

## Architecture decisions

- All tools run client-side in the browser; no user data hits the server except AI prompts.
- AI tools share a single Express endpoint (`/api/ai/generate`) with per-tool prompt builders and input validation, rate-limited to 20 req/min per IP.
- Routing is flat Wouter routes in `App.tsx` — no Next.js file-based routing.
- Tailwind CSS v4 with custom theme tokens in `src/index.css` (Inter font, HSL color system).

## Product

100+ free tools across 8 categories: AI Tools, Text Tools, Developer Tools, Image Tools, PDF Tools, Business Tools, Calculator Tools, and SEO Tools. Also includes a Blog section.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- AI tools require `GEMINI_API_KEY` secret. Without it, the backend returns 503.
- `pdfjs-dist` version was bumped to v6 during install — test PDF tools if issues arise.
- Do not run `pnpm dev` at the workspace root — use the managed workflows instead.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
- Frontend routes are in `artifacts/utility-tools/src/App.tsx`.
- AI prompts are in `artifacts/api-server/src/routes/ai.ts` (`buildPrompt` function).
