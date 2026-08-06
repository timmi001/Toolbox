# Video Downloader Backend: Audit & Redesign for FastDL-Like Performance

## Executive Summary

Current architecture combines URL parsing, metadata extraction, and downloading into monolithic service functions. This redesign separates concerns, optimizes yt-dlp usage for speed and concurrency, implements platform-specific strategies, adds intelligent caching, and enables low-latency streaming downloads suitable for production deployment on Google Cloud Run / Render.

---

## Current Architecture Issues

### 1. **Monolithic Service Functions**
- `inspectUrl()` and `downloadVideo()` mix parsing, metadata extraction, and file handling
- No clear separation between metadata phase and download phase
- Difficult to test and optimize individual components
- Hard to implement platform-specific strategies

### 2. **Suboptimal yt-dlp Usage**
- Single yt-dlp invocation for everything (parsing + direct URL extraction + download)
- No platform-specific flags or optimization
- Unnecessary JSON parsing for download-only operations
- No caching of format lists and extraction strategies

### 3. **Temporary File Dependency**
- Relies on disk writes for all non-direct downloads
- `temp/` directory cleanup only runs every 10 minutes
- Doesn't support streaming responses for browsers
- High I/O overhead on disk-constrained environments (Cloud Run)

### 4. **Weak Concurrency Control**
- Inflight deduplication is in-process only (doesn't survive server restart)
- No queue or backpressure handling for yt-dlp process spawning
- Can easily exhaust system resources with concurrent requests

### 5. **Insufficient Error Handling**
- Generic error messages don't help with debugging
- Platform-specific errors not captured
- Retry logic too simplistic (no jitter, limited backoff strategies)
- Network errors and quota errors treated the same way

### 6. **Missing Performance Metrics**
- No structured logging for latency analysis
- Cache hit/miss rates unknown
- Platform-specific performance not tracked
- No early warning system for degradation

### 7. **Timeout Strategy Issues**
- Static timeouts don't account for content size or platform
- No timeout variation for metadata vs. download phases
- No adaptive timeout based on historical performance

---

## New Architecture Design

### Layer 1: Platform Strategy Registry

Define extraction strategies per platform to optimize yt-dlp calls:

```typescript
interface PlatformStrategy {
  name: string;
  patterns: RegExp[];
  metadataArgs: string[];      // Minimal args for fast metadata fetch
  directUrlArgs: string[];     // Args for extracting direct URL
  downloadArgs: (format: string) => string[]; // Args for actual download
  timeoutMultiplier: number;   // Scale base timeouts for this platform
  supportsDirectUrl: boolean;  // Can we get m3u8/HLS streams?
  supportsStreaming: boolean;  // Browser-compatible streaming?
  formatFilter?: (formats) => formats[]; // Platform-specific format filtering
}
```

**Platforms to support:**
- YouTube: Fast metadata, direct MP4 URLs common, large format list
- TikTok: Region-specific, uses encrypted URLs, requires user-agent
- Instagram: Requires cookie/session, often video + carousel
- Facebook: Video resolution varies, metadata extraction slower
- X (Twitter): Short videos, often embed third-party content

### Layer 2: Modular Service Functions

**`parser.js`** — URL validation & platform detection
- Fast URL scheme validation
- Platform regex matching
- No yt-dlp calls

**`metadata.js`** — Fast metadata extraction
- Platform-specific yt-dlp calls (minimal fields only)
- Aggressive caching (in-memory + Redis-compatible)
- Concurrent limit to prevent yt-dlp overload
- Structured error classification

**`extractor.js`** — Direct URL extraction
- Fast format selection without full download
- Extracts direct CDN URLs when available
- Falls back to streaming format (m3u8/manifest)
- Short timeout (10-20 seconds)

**`downloader.js`** — Actual file download
- Stream-first approach: pipe yt-dlp → HTTP response
- Optional disk fallback for problematic platforms
- Resumable downloads for large files
- Proper cleanup and error recovery

**`queue.js`** — Concurrency control
- Worker pool pattern for yt-dlp processes
- Backpressure handling
- Fair scheduling (FIFO with priority)

### Layer 3: Production Features

**Streaming HTTP Responses**
```
GET /api/video/stream?src=URL&format=best
→ Pipe yt-dlp output directly to browser
→ No temp files, immediate start time
→ Proper Content-Type and Content-Length headers
→ Browser handles download UI
```

**Intelligent Caching**
```
Memory Tiers:
  L1: Hot metadata cache (1000 entries, 10 min TTL)
  L2: Recently watched (100 entries, 1 hour TTL)
  L3: Format lists (platform-specific, 24h TTL)

Redis-compatible for multi-server deployments
```

**Platform-Specific Timeouts**
```
Base timeout: 30s
Adjustments per platform:
  YouTube: 1.0x (30s metadata, 10s direct URL, 120s download)
  TikTok: 1.5x (45s metadata, 15s direct URL, 180s download)
  Instagram: 2.0x (60s metadata, 20s direct URL, 180s download)
  Facebook: 1.5x
  X: 1.0x
```

**Structured Logging**
```
[platform][phase][status] key=value pairs
Example: [youtube][metadata][success] url=... durationMs=250 formatCount=18
Searchable in Render/Cloud Run logs for debugging
```

---

## Implementation Plan

### Phase 1: Core Service Refactor (Priority 1)
1. Create `lib/platform-strategies.ts` — Platform registry
2. Create `lib/parser.ts` — URL validation & detection
3. Create `services/metadata.ts` — Fast metadata extraction
4. Create `services/extractor.ts` — Direct URL extraction
5. Update `services/downloader.ts` — Streaming downloads

### Phase 2: Advanced Features (Priority 2)
1. Create `lib/queue.ts` — Concurrency control
2. Update `routes/video.ts` — Streaming responses
3. Add structured logging middleware
4. Implement timeout adaptation

### Phase 3: Production Hardening (Priority 3)
1. Add memory profiling
2. Graceful shutdown handling
3. Health check endpoints
4. Deployment docs for Cloud Run/Render

---

## Expected Improvements

| Metric | Current | Target | Gain |
|--------|---------|--------|------|
| Metadata latency (YouTube) | 2-5s | 0.5-1s | 4-10x faster |
| Direct URL extraction latency | 1-3s | 0.2-0.5s | 6-15x faster |
| Download startup (streaming) | N/A | <100ms | Instant streaming |
| Peak concurrent requests | 5-10 | 50-100 | 10x throughput |
| Disk I/O | 100% of downloads | <10% (direct URLs) | 90% reduction |
| Memory usage | 500MB @ 10 req/s | 200MB @ 100 req/s | 3x efficiency |
| Error recovery time | 5-10s | 100-500ms | Resilient |

---

## Deployment Considerations

### Google Cloud Run
- Ephemeral `/tmp` filesystem (ideal for temp streaming)
- 2GB RAM limit → focus on streaming, minimal caching
- Automatic scaling with health checks

### Render.com
- Persistent disk available (can use for recovery)
- Better for hybrid streaming + backup download strategy
- Easier multi-process deployment

### Environment Variables
```
YTDLP_PATH=/usr/local/bin/yt-dlp (custom binary)
YTDLP_UPDATE=true (auto-update on startup)
CONCURRENT_LIMIT=20 (platform-dependent)
METADATA_CACHE_TTL=600000 (10 minutes)
DOWNLOAD_TIMEOUT_BASE=30000 (30 seconds)
ENABLE_DISK_FALLBACK=true (stream-first, disk backup)
LOG_LEVEL=info (json|info|warn|error)
```

---

## Performance Targets

1. **Metadata Extraction**: <1s for 95th percentile (all platforms)
2. **Direct URL Extraction**: <0.5s for 95th percentile
3. **Streaming Download Start**: <100ms from request to first data chunk
4. **Concurrent Capacity**: 100+ simultaneous active downloads @ 2GB RAM
5. **Error Recovery**: Automatic retry within 100-500ms, no user action needed
6. **Observability**: 100% of errors logged with structured context

---

## Success Criteria

✅ All metadata requests complete in <1s (p95)
✅ Direct URL extraction in <500ms (p95)
✅ Streaming downloads start within 100ms
✅ Support 100+ concurrent requests without process crashes
✅ Disk usage <500MB even with many temp operations
✅ Error messages actionable and platform-specific
✅ Production deployment guides complete
✅ Backwards compatible with existing frontend
✅ No breaking API changes
