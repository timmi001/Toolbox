---
name: Vercel-import multi-artifact quirks
description: Lessons for porting an imported Vercel app when it may already be a pnpm-workspace multi-artifact app rather than raw Next.js.
---

- A repo tagged as an "imported Vercel app" may in fact have originated on Replit,
  been exported to Vercel, then re-imported — meaning it's already structured as
  a pnpm-workspace multi-artifact app (separate `artifacts/*` dirs, its own
  `artifact.toml`s), not a raw Next.js project needing conversion. Check the
  actual structure before assuming the generic Next.js-to-Replit playbook applies.

- When such a repo has both a root scaffold and a `.migration-backup/` (or similar)
  snapshot of the original import, don't assume the backup is authoritative. Diff
  key files (routes, config, feature lists) between the two — the root scaffold
  may be a newer/more complete version that was built after the original export.
  **Why:** in one case the root had more routes/components than the backup.
  **How to apply:** diff before overwriting; treat the more complete side as source
  of truth and keep the other only as a reference, not to copy from wholesale.

- If `.migration-backup/`-style directories carry their own `.replit-artifact/`
  registration folders, the platform will auto-register them as duplicate
  artifacts/workflows alongside the real ones. Delete those nested
  `.replit-artifact` dirs from the backup copy to stop the duplicate registration.

- Frontend code from a Vercel deployment often hardcodes an external API host
  (e.g. a Render/Vercel URL) via an env var. When co-locating the API as its own
  artifact in the same Replit project, default that env var to a same-origin
  relative path (e.g. `/api`) so it resolves through the shared proxy in both dev
  and prod, and remove/ignore the now-stale `vercel.json` deployment config.

- Category-to-route mismatches are an easy regression source when a tool-catalog
  app has categories that don't have their own route namespace (e.g. a
  "marketing" category tools living under `/tools/ai/*` routes). Centralize any
  category→route-path mapping in one helper used by every card/link/search
  component, rather than constructing paths inline from the raw category field.
