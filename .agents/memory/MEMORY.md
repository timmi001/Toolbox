# Memory Index

- [Vercel-import multi-artifact quirks](vercel-import-quirks.md) — imported/re-exported apps may already be pnpm-workspace artifacts; check `.migration-backup` isn't the newer copy before treating it as source of truth.
- [yt-dlp version shadowing via PYTHONPATH](ytdlp-version-shadowing.md) — pip-installed newer yt-dlp in `.pythonlibs` is silently shadowed by the old Nix version unless invoked with `python -I -m yt_dlp`.
