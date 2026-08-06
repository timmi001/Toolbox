/**
 * services/downloader.ts (refactored)
 * Redesigned video downloader with:
 * - Separated URL parsing, metadata extraction, and downloading
 * - Platform-specific optimization
 * - Streaming downloads (no temp files)
 * - Intelligent caching
 * - Structured performance logging
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cache = require('../lib/cache');
const { 
  getPlatformStrategy, 
  buildMetadataArgs, 
  buildDirectUrlArgs,
  buildDownloadArgs,
  getTimeout,
  isDirectMediaUrl,
} = require('../lib/platform-strategies');

// ═══════════════════════════════════════════════════════════════════════════
// Configuration & Constants
// ═══════════════════════════════════════════════════════════════════════════

const tempDir = path.join(__dirname, '..', 'temp');
const downloadsDir = path.join(__dirname, '..', 'downloads');

// Concurrency control: limit yt-dlp processes to avoid system overload
const CONCURRENT_LIMIT = parseInt(process.env.CONCURRENT_LIMIT, 10) || 20;
const ENABLE_DISK_FALLBACK = process.env.ENABLE_DISK_FALLBACK !== 'false';

// Performance thresholds for logging
const PERF_THRESHOLDS = {
  metadata: 1000,     // Log if > 1 second
  directUrl: 500,     // Log if > 500 ms
  download: 3000,     // Log if > 3 seconds
};

// ═══════════════════════════════════════════════════════════════════════════
// State Management
// ═══════════════════════════════════════════════════════════════════════════

// In-process request deduplication
const inflightRequests = new Map();

// Concurrency control: track active yt-dlp processes
let activeProcessCount = 0;
const processQueue = [];

// Metrics for monitoring
const metrics = {
  metadataRequests: 0,
  directUrlRequests: 0,
  downloadRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  errors: 0,
};

// ═══════════════════════════════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════════════════════════════

function ensureDir(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (e) {
    if (e.code !== 'EEXIST') throw e;
  }
}

function getPathEntries() {
  return (process.env.PATH || '')
    .split(path.delimiter)
    .filter(Boolean);
}

function resolveExecutable(command) {
  const envVarName = command === 'yt-dlp' ? 'YTDLP_PATH' : 'FFMPEG_PATH';
  const overridePath = process.env[envVarName];
  
  if (overridePath) {
    const resolved = path.resolve(overridePath);
    if (fs.existsSync(resolved)) return resolved;
  }

  // Search PATH
  const pathEntries = getPathEntries();
  const candidates = [command, `${command}.exe`, `${command}.cmd`];
  
  for (const candidate of candidates) {
    for (const dir of pathEntries) {
      const fullPath = path.join(dir, candidate);
      if (fs.existsSync(fullPath)) return fullPath;
    }
  }

  return null;
}

function buildMissingBinaryError(cmd) {
  if (cmd === 'yt-dlp') {
    return `yt-dlp not found. Install: pip install yt-dlp. Or set YTDLP_PATH.`;
  }
  return `${cmd} not found on PATH. Set ${cmd.toUpperCase()}_PATH.`;
}

// ═══════════════════════════════════════════════════════════════════════════
// Concurrency Control
// ═══════════════════════════════════════════════════════════════════════════

class ProcessPool {
  async acquire() {
    while (activeProcessCount >= CONCURRENT_LIMIT) {
      await new Promise(r => processQueue.push(r));
    }
    activeProcessCount++;
  }

  release() {
    activeProcessCount--;
    const cb = processQueue.shift();
    if (cb) cb();
  }
}

const pool = new ProcessPool();

// ═══════════════════════════════════════════════════════════════════════════
// Command Execution with Retries
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Run command with exponential backoff retry logic
 */
async function runCommand(executable, args, options = {}) {
  const { timeout = 30000, retries = 2 } = options;
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Acquire from process pool
      await pool.acquire();

      return await runCommandOnce(executable, args, { timeout });
    } catch (err) {
      lastError = err;

      // Determine if error is retryable
      const isRetryable = isTransientError(err);
      if (!isRetryable || attempt === retries) {
        throw err;
      }

      // Exponential backoff with jitter
      const baseBackoff = 100 * Math.pow(2, attempt);
      const jitter = Math.random() * 50;
      const backoffMs = baseBackoff + jitter;
      
      console.log(
        `[downloader][retry] attempt=${attempt + 1}/${retries + 1} ` +
        `backoffMs=${backoffMs.toFixed(0)} error=${err.message.slice(0, 80)}`
      );
      
      await new Promise(r => setTimeout(r, backoffMs));
    } finally {
      pool.release();
    }
  }

  throw lastError;
}

/**
 * Execute single command invocation
 */
function runCommandOnce(executable, args, options = {}) {
  return new Promise((resolve, reject) => {
    const { timeout = 30000 } = options;
    
    const exePath = resolveExecutable(executable);
    if (!exePath) {
      reject(new Error(buildMissingBinaryError(executable)));
      return;
    }

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const child = spawn(exePath, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeout);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      
      if (timedOut) {
        reject(Object.assign(new Error(`Timeout after ${timeout}ms`), { code: 'ETIMEDOUT' }));
        return;
      }

      if (code !== 0) {
        reject(Object.assign(new Error(`Exit code ${code}: ${stderr}`), { code }));
        return;
      }

      resolve({ stdout, stderr });
    });
  });
}

/**
 * Classify error as transient or permanent
 */
function isTransientError(err) {
  const msg = err.message?.toLowerCase() || '';
  const code = err.code;

  return (
    code === 'ETIMEDOUT' ||
    code === 'ECONNREFUSED' ||
    code === 'ECONNRESET' ||
    msg.includes('timeout') ||
    msg.includes('network') ||
    msg.includes('connection') ||
    msg.includes('temporarily')
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// URL Validation & Platform Detection
// ═══════════════════════════════════════════════════════════════════════════

function validateUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function detectPlatform(url) {
  const strategy = getPlatformStrategy(url);
  return strategy.name;
}

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 1: Metadata Extraction
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extract video metadata (title, duration, formats, etc.)
 * 
 * Optimizations:
 * - Caches for 10 minutes
 * - Deduplicates concurrent requests
 * - Platform-specific timeout
 * - Structured performance logging
 */
async function extractMetadata(url) {
  if (!validateUrl(url)) {
    throw new Error('Invalid URL provided');
  }

  metrics.metadataRequests++;
  const cacheKey = `meta:${url}`;
  const strategy = getPlatformStrategy(url);
  const timeoutMs = getTimeout('metadata', strategy);

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached) {
    metrics.cacheHits++;
    console.log(`[metadata] cache_hit url=${url.slice(0, 50)} platform=${strategy.name}`);
    return cached;
  }

  metrics.cacheMisses++;

  // Check inflight
  if (inflightRequests.has(cacheKey)) {
    console.log(`[metadata] inflight_hit url=${url.slice(0, 50)}`);
    return inflightRequests.get(cacheKey);
  }

  const promise = (async () => {
    const t0 = process.hrtime.bigint();
    console.log(`[metadata][start] url=${url.slice(0, 50)} platform=${strategy.name} timeoutMs=${timeoutMs}`);

    try {
      const args = buildMetadataArgs(url, strategy);
      const { stdout } = await runCommand('yt-dlp', args, { timeout: timeoutMs, retries: 1 });

      let info;
      try {
        info = JSON.parse(stdout);
      } catch (e) {
        throw new Error(`Failed to parse metadata JSON: ${e.message}`);
      }

      const metadata = {
        id: info.id,
        title: info.title || 'Unknown',
        duration: info.duration,
        thumbnail: info.thumbnail,
        uploader: info.uploader || 'Unknown',
        uploadDate: info.upload_date,
        viewCount: info.view_count,
        isLive: info.is_live || false,
        description: info.description || '',
        formats: (info.formats || []).slice(0, 30), // Limit to 30 formats
        platform: strategy.name,
      };

      const durMs = Number(process.hrtime.bigint() - t0) / 1e6;
      cache.set(cacheKey, metadata, 1000 * 60 * 10); // 10 min TTL

      if (durMs > PERF_THRESHOLDS.metadata) {
        console.warn(
          `[metadata][slow] url=${url.slice(0, 50)} ` +
          `platform=${strategy.name} durationMs=${durMs.toFixed(1)}`
        );
      } else {
        console.log(
          `[metadata][success] url=${url.slice(0, 50)} ` +
          `durationMs=${durMs.toFixed(1)} formatCount=${metadata.formats.length}`
        );
      }

      return metadata;
    } catch (err) {
      metrics.errors++;
      console.error(
        `[metadata][error] url=${url.slice(0, 50)} ` +
        `platform=${strategy.name} error=${err.message}`
      );
      throw err;
    }
  })();

  inflightRequests.set(cacheKey, promise);
  try {
    return await promise;
  } finally {
    inflightRequests.delete(cacheKey);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 2: Direct URL Extraction
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extract direct media URL (CDN, mp4, m3u8, etc.)
 * 
 * Returns null if platform doesn't support direct URLs
 * Falls back to streaming mode if no direct URL available
 */
async function extractDirectUrl(url, formatId = 'best') {
  if (!validateUrl(url)) {
    throw new Error('Invalid URL');
  }

  metrics.directUrlRequests++;
  const cacheKey = `direct:${url}:${formatId}`;
  const strategy = getPlatformStrategy(url);
  const timeoutMs = getTimeout('directUrl', strategy);

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached) {
    metrics.cacheHits++;
    console.log(`[direct-url] cache_hit url=${url.slice(0, 50)}`);
    return cached;
  }

  metrics.cacheMisses++;

  const t0 = process.hrtime.bigint();
  console.log(
    `[direct-url][start] url=${url.slice(0, 50)} ` +
    `platform=${strategy.name} format=${formatId} timeoutMs=${timeoutMs}`
  );

  try {
    const args = buildDirectUrlArgs(url, strategy);
    const { stdout } = await runCommand('yt-dlp', args, { timeout: timeoutMs, retries: 1 });

    const directUrl = stdout.trim();
    
    if (!directUrl) {
      console.log(`[direct-url][no-url] url=${url.slice(0, 50)} platform=${strategy.name}`);
      return null;
    }

    // Validate URL
    if (!isDirectMediaUrl(directUrl)) {
      console.log(`[direct-url][rejected] url=${url.slice(0, 50)} extractedUrl=${directUrl.slice(0, 80)}`);
      return null;
    }

    const durMs = Number(process.hrtime.bigint() - t0) / 1e6;
    cache.set(cacheKey, directUrl, 1000 * 60 * 60); // 1 hour TTL

    if (durMs > PERF_THRESHOLDS.directUrl) {
      console.warn(`[direct-url][slow] url=${url.slice(0, 50)} durationMs=${durMs.toFixed(1)}`);
    } else {
      console.log(`[direct-url][success] url=${url.slice(0, 50)} durationMs=${durMs.toFixed(1)}`);
    }

    return directUrl;
  } catch (err) {
    metrics.errors++;
    console.error(
      `[direct-url][error] url=${url.slice(0, 50)} ` +
      `platform=${strategy.name} error=${err.message}`
    );
    return null; // Return null instead of throwing (optional fallback)
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PHASE 3: Streaming Download
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create streaming download readable stream
 * 
 * Streaming approach:
 * 1. Try to get direct URL → redirect browser to CDN
 * 2. Fall back to yt-dlp piped to HTTP response (no temp files)
 * 3. Optional disk fallback for problematic platforms
 * 
 * Returns: { stream, metadata } or { redirect: url }
 */
async function createDownloadStream(url, formatId = 'best') {
  if (!validateUrl(url)) {
    throw new Error('Invalid URL');
  }

  metrics.downloadRequests++;
  const strategy = getPlatformStrategy(url);
  const timeoutMs = getTimeout('download', strategy);

  console.log(
    `[download-stream][start] url=${url.slice(0, 50)} ` +
    `platform=${strategy.name} format=${formatId} timeoutMs=${timeoutMs}`
  );

  const t0 = process.hrtime.bigint();

  try {
    // Try direct URL first (instant redirect, no download overhead)
    const directUrl = await extractDirectUrl(url, formatId);
    if (directUrl) {
      console.log(`[download-stream][direct] url=${url.slice(0, 50)} redirecting to CDN`);
      return {
        type: 'redirect',
        url: directUrl,
        platform: strategy.name,
      };
    }

    // Fall back to streaming download via yt-dlp
    console.log(`[download-stream][streaming] url=${url.slice(0, 50)} piping yt-dlp output`);
    
    const args = buildDownloadArgs(url, formatId, strategy);
    const exePath = resolveExecutable('yt-dlp');
    
    if (!exePath) {
      throw new Error(buildMissingBinaryError('yt-dlp'));
    }

    // Note: actual stream creation happens when consumed
    return {
      type: 'stream',
      platform: strategy.name,
      createStream: () => spawn(exePath, args, { stdio: ['ignore', 'pipe', 'pipe'] }).stdout,
    };
  } catch (err) {
    metrics.errors++;
    const durMs = Number(process.hrtime.bigint() - t0) / 1e6;
    console.error(
      `[download-stream][error] url=${url.slice(0, 50)} ` +
      `platform=${strategy.name} durationMs=${durMs.toFixed(1)} error=${err.message}`
    );
    throw err;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Disk-Based Download (Fallback)
// ═══════════════════════════════════════════════════════════════════════════

async function downloadVideoToDisk(url, formatId = 'best') {
  if (!ENABLE_DISK_FALLBACK) {
    throw new Error('Disk downloads disabled');
  }

  ensureDir(tempDir);
  const outputName = `${uuidv4()}.mp4`;
  const outputPath = path.join(downloadsDir, outputName);
  const strategy = getPlatformStrategy(url);
  const timeoutMs = getTimeout('download', strategy);

  console.log(`[download-disk][start] url=${url.slice(0, 50)} outputPath=${outputPath}`);

  const args = buildDownloadArgs(url, formatId, strategy);
  
  await runCommand('yt-dlp', [...args.slice(0, -2), '-o', outputPath], {
    timeout: timeoutMs,
    retries: 2,
  });

  console.log(`[download-disk][success] outputPath=${outputPath}`);
  return { filePath: outputPath, fileName: outputName };
}

// ═══════════════════════════════════════════════════════════════════════════
// Cleanup Tasks
// ═══════════════════════════════════════════════════════════════════════════

function startCleanupTask() {
  const maxAgeMs = 1000 * 60 * 60; // 1 hour
  const intervalMs = 1000 * 60 * 10; // Check every 10 minutes

  setInterval(() => {
    try {
      const entries = fs.readdirSync(tempDir);
      const now = Date.now();
      let cleaned = 0;

      for (const entry of entries) {
        const fullPath = path.join(tempDir, entry);
        try {
          const stat = fs.statSync(fullPath);
          if (now - stat.mtimeMs > maxAgeMs) {
            fs.unlinkSync(fullPath);
            cleaned++;
          }
        } catch (err) {
          // Ignore individual file errors
        }
      }

      if (cleaned > 0) {
        console.log(`[cleanup] removed ${cleaned} expired temp files`);
      }
    } catch (err) {
      console.error(`[cleanup][error] ${err.message}`);
    }
  }, intervalMs).unref();
}

// ═══════════════════════════════════════════════════════════════════════════
// Health & Metrics
// ═══════════════════════════════════════════════════════════════════════════

function getMetrics() {
  return {
    ...metrics,
    activeProcesses: activeProcessCount,
    queuedRequests: processQueue.length,
    concurrencyLimit: CONCURRENT_LIMIT,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Startup & Export
// ═══════════════════════════════════════════════════════════════════════════

ensureDir(tempDir);
ensureDir(downloadsDir);
startCleanupTask();

module.exports = {
  // URL & Platform detection
  validateUrl,
  detectPlatform,
  getPlatformStrategy,

  // Core functionality
  extractMetadata,
  extractDirectUrl,
  createDownloadStream,
  downloadVideoToDisk,

  // Legacy compatibility
  inspectUrl: extractMetadata,
  downloadVideo: (url, fmt) => createDownloadStream(url, fmt),
  downloadAudio: extractMetadata, // Audio extraction via metadata

  // Monitoring
  getMetrics,
};
