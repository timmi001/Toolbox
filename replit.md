# ToolboxX

A comprehensive collection of 200+ free online tools covering text processing, developer utilities, calculators, image tools, PDF tools, file conversion, business tools, and AI-powered writing/coding tools. No sign-up required.

## Run & Operate

- `pnpm --filter @workspace/utility-tools run dev` — run the frontend (port 18470, served at `/`)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 22729, served at `/api`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 20, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS v4 + wouter (routing)
- UI: shadcn/ui components (Radix primitives), Framer Motion, Recharts
- Backend: Express 5 + pino logging
- AI: Google Generative AI (@google/genai), OpenAI, Groq
- Build: esbuild (API server)

## Where things live

- `artifacts/utility-tools/` — main frontend app (React + Vite)
  - `src/App.tsx` — all routes (200+ lazy-loaded tool pages)
  - `src/pages/tools/` — tool page components organized by category
  - `src/components/` — Layout, Navbar, Footer, ToolCard, etc.
  - `src/index.css` — Tailwind theme tokens (purple/green palette, Inter font)
- `artifacts/api-server/` — Express API server
  - `src/routes/ai.ts` — AI-powered tool endpoints (uses Google Generative AI)
  - `src/routes/developer.ts` — developer utility endpoints
  - `src/routes/video.ts` — provider-neutral video download endpoints

## Architecture decisions

- All frontend tool pages are lazy-loaded (`React.lazy`) for fast initial load
- AI routes proxy to Google Generative AI with rate limiting
- Video routes are ready for a separately integrated download provider
- No database required — all tools are client-side or stateless API calls
- wouter used instead of React Router for lightweight client-side routing

## Product

ToolboxX gives creators, students, developers, and businesses instant access to 200+ browser-based tools with no installation or account required. Categories: AI writing/coding, text processing, developer tools, PDF tools, image tools, calculators, file conversion, and business tools.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The api-server dev script builds then starts (not a watch mode); restart after code changes
- `pnpm approve-builds` required if @google/genai build scripts need to run

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
