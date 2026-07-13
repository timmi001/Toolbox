---
name: yt-dlp version shadowing via PYTHONPATH
description: Why a pip-installed newer yt-dlp can still silently run the old nixpkgs version, and how to force the new one.
---

- The Nix-provided `yt-dlp` binary is pinned to whatever the nixpkgs channel
  shipped — it can lag upstream by a year or more, which matters because
  individual site extractors (YouTube, Instagram, TikTok, etc.) get real
  bugfixes and anti-bot workarounds in every release. Check `yt-dlp --version`
  against the latest PyPI/GitHub release before assuming an extraction
  failure is a real site restriction rather than a stale-binary bug.

- Installing a newer `yt-dlp` via pip (`installLanguagePackages` /
  `uv add yt-dlp[default]`) into the project's `.pythonlibs` venv does NOT
  automatically take effect, even when that venv's own `python`/`yt-dlp`
  binaries are invoked directly. The environment's ambient `PYTHONPATH` (set
  by the Nix yt-dlp package) still lists the old package's site-packages
  dir, and it comes ahead of the venv's own site-packages on `sys.path` —
  so `import yt_dlp` silently resolves to the OLD version regardless of
  which `python`/`yt-dlp` executable you called.
  **Why:** `PYTHONPATH` entries are honored by any interpreter, including
  ones running inside an unrelated venv, unless isolated mode is used.
  **How to apply:** invoke the venv interpreter with `-I` (isolated mode) and
  `-m yt_dlp` instead of running the `yt-dlp` script directly — `-I` ignores
  `PYTHONPATH` and user-site entirely, so it reliably resolves to the venv's
  own (newer) package. Keep a fallback to the plain `yt-dlp` command for
  environments where the venv isn't present.
