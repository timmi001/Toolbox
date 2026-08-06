This folder contains runtime helpers introduced to improve performance and
reduce duplicate yt-dlp work:

- `cache.js`: simple in-memory LRU cache for metadata and direct URLs.

Notes:
- In-process cache is best-effort and not shared across replicas. For
  multi-instance deployments use an external cache like Redis.
