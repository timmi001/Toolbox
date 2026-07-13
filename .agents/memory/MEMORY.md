# Memory Index

- [Vercel-import multi-artifact quirks](vercel-import-quirks.md) — imported/re-exported apps may already be pnpm-workspace artifacts; check `.migration-backup` isn't the newer copy before treating it as source of truth.
- [yt-dlp version shadowing via PYTHONPATH](ytdlp-version-shadowing.md) — pip-installed newer yt-dlp in `.pythonlibs` is silently shadowed by the old Nix version unless invoked with `python -I -m yt_dlp`.
- [Vercel serverless can't run yt-dlp/ffmpeg/Python](vercel-yt-dlp-serverless.md) — subprocess-based tools always ENOENT on Vercel functions; needs a persistent-host backend or a hosted HTTP API instead.
