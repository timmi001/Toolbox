# Memory Index

- [Vercel-import multi-artifact quirks](vercel-import-quirks.md) — imported/re-exported apps may already be pnpm-workspace artifacts; check `.migration-backup` isn't the newer copy before treating it as source of truth.
- [toolboxx production bugs fixed](toolboxx-bugs-fixed.md) — 8 bugs across api-server + frontend; most important: use GOOGLE_API_KEY (not GEMINI_API_KEY), app.listen errors need server.on('error'), always add a JSON 404 catch-all + 4-arg error handler.
