const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cache = require('../lib/cache');

// Simple in-process map for inflight requests to avoid duplicate yt-dlp runs
const inflight = new Map();

const tempDir = path.join(__dirname, '..', 'temp');
const downloadsDir = path.join(__dirname, '..', 'downloads');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function getPathEntries() {
  return (process.env.PATH || '')
    .split(path.delimiter)
    .filter(Boolean);
}

function buildMissingBinaryError(command) {
  const envVarName = command === 'yt-dlp'
    ? 'YTDLP_PATH'
    : command === 'ffmpeg'
      ? 'FFMPEG_PATH'
      : `${command.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_PATH`;

  switch (command) {
    case 'yt-dlp':
      return `Missing required binary '${command}'. It was not found on PATH or in common install locations. Install it with: python3 -m pip install --break-system-packages yt-dlp (Linux/macOS) or py -m pip install yt-dlp (Windows). You can also set ${envVarName} to the full executable path.`;
    case 'ffmpeg':
      return `Missing required binary '${command}'. It was not found on PATH or in common install locations. Install it with: apt-get install ffmpeg (Debian/Ubuntu), brew install ffmpeg (macOS), or choco install ffmpeg (Windows). You can also set ${envVarName} to the full executable path.`;
    default:
      return `Missing required binary '${command}'. It was not found on PATH or common install locations. Set ${envVarName} to the full executable path if needed.`;
  }
}

function resolveExecutable(command) {
  const overrideVarName = command === 'yt-dlp'
    ? 'YTDLP_PATH'
    : command === 'ffmpeg'
      ? 'FFMPEG_PATH'
      : `${command.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_PATH`;
  const overridePath = process.env[overrideVarName];
  if (overridePath) {
    const resolvedOverride = path.resolve(overridePath);
    if (fs.existsSync(resolvedOverride) && fs.statSync(resolvedOverride).isFile()) {
      return resolvedOverride;
    }
  }

  const candidateNames = [];
  const baseNames = [command];
  if (command === 'python3') {
    baseNames.push('python');
  } else if (command === 'python') {
    baseNames.push('python3');
  }

  for (const baseName of baseNames) {
    candidateNames.push(baseName);
    for (const suffix of ['', '.exe', '.cmd', '.bat']) {
      candidateNames.push(`${baseName}${suffix}`);
    }
  }

  const uniqueCandidateNames = Array.from(new Set(candidateNames));
  const pathEntries = getPathEntries();
  for (const candidate of uniqueCandidateNames) {
    if (path.isAbsolute(candidate)) {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return candidate;
      }
      continue;
    }

    for (const dir of pathEntries) {
      const fullPath = path.join(dir, candidate);
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        return fullPath;
      }
    }
  }

  const commonLocations = [
    `/usr/local/bin/${command}`,
    `/usr/bin/${command}`,
    `/bin/${command}`,
    `/opt/homebrew/bin/${command}`,
    `C:/Program Files/ffmpeg/bin/${command}`,
    `C:/ffmpeg/bin/${command}`,
    `C:/Program Files/yt-dlp/${command}`,
  ];

  for (const location of commonLocations) {
    if (fs.existsSync(location) && fs.statSync(location).isFile()) {
      return location;
    }
  }

  return null;
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const executable = resolveExecutable(command);
    if (!executable) {
      reject(new Error(buildMissingBinaryError(command)));
      return;
    }

    const env = {
      ...process.env,
      PATH: [path.dirname(executable), ...getPathEntries()].join(path.delimiter),
    };

    const child = spawn(executable, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env,
      ...options,
    });
    let stdout = '';
    let stderr = '';
    let timer;

    // support timeout option (ms)
    if (options && typeof options.timeout === 'number' && options.timeout > 0) {
      timer = setTimeout(() => {
        try {
          child.kill('SIGKILL');
        } catch (e) {}
        const err = new Error(`[timeout] ${command} did not respond within ${options.timeout}ms`);
        (err).code = 'ETIMEDOUT';
        reject(err);
      }, options.timeout);
    }

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (err) => {
      if (err.code === 'ENOENT' || err.message.includes('ENOENT')) {
        reject(new Error(buildMissingBinaryError(command)));
      } else {
        reject(err);
      }
    });

    child.on('close', (code) => {
      if (timer) clearTimeout(timer);
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        const body = stderr || `Process exited with code ${code}`;
        // attach status-like code for downstream classification
        const errObj = new Error(body);
        (errObj).code = code;
        reject(errObj);
      }
    });
  });
}

// Retry wrapper for runCommand with exponential backoff for transient errors
async function runCommandWithRetries(command, args, options = {}) {
  const attempts = options.retries && Number.isInteger(options.retries) ? options.retries : 1;
  let lastErr;
  for (let attempt = 0; attempt <= attempts; attempt++) {
    try {
      return await runCommand(command, args, options);
    } catch (err) {
      lastErr = err;
      const msg = (err && err.message) ? String(err.message).toLowerCase() : '';
      const code = (err && (err.code || err.code === 0)) ? err.code : undefined;
      const transient = (
        msg.includes('econnreset') || msg.includes('etimedout') || msg.includes('econnrefused') || msg.includes('timed out') || msg.includes('timeout') || msg.includes('network') || (typeof code === 'number' && code >= 500) || code === 'ETIMEDOUT'
      );
      if (!transient || attempt === attempts) break;
      const backoff = 200 * Math.pow(2, attempt);
      await new Promise(r => setTimeout(r, backoff));
      continue;
    }
  }
  throw lastErr;
}

async function inspectUrl(url) {
  // Cache metadata to avoid repeated yt-dlp runs
  const cacheKey = `meta:${url}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // Prevent duplicate concurrent inspections
  if (inflight.has(cacheKey)) {
    return inflight.get(cacheKey);
  }

  const promise = (async () => {
    const t0 = process.hrtime.bigint();
    // Use compact JSON for faster structured parsing and retry on transient failures
    const { stdout } = await runCommandWithRetries('yt-dlp', ['-j', '--no-warnings', url], { timeout: 1000 * 30, retries: 1 });
    let infoObj;
    try {
      infoObj = JSON.parse(stdout);
    } catch (e) {
      throw new Error('Unable to inspect the provided URL (parse failed).');
    }

    const result = {
      title: infoObj.title || 'Unknown title',
      thumbnail: infoObj.thumbnail || '',
      duration: infoObj.duration || null,
      uploader: infoObj.uploader || 'Unknown uploader',
      uploadDate: infoObj.upload_date || null,
      formats: infoObj.formats || [],
      audioFormats: (infoObj.formats || []).filter(f => (f.acodec && f.vcodec === 'none') || f.vcodec === 'none'),
      filesize: infoObj.filesize || null,
      quality: null,
      sourceUrl: url,
    };

    cache.set(cacheKey, result, 1000 * 60 * 10); // 10m TTL for metadata
    const durMs = Number(process.hrtime.bigint() - t0) / 1e6;
    console.info(`[perf][inspectUrl] url=${url} durationMs=${durMs.toFixed(1)}`);
    return result;
  })();

  inflight.set(cacheKey, promise);
  try {
    const r = await promise;
    return r;
  } finally {
    inflight.delete(cacheKey);
  }
}

async function downloadVideo(url, format) {
  ensureDir(tempDir);
  ensureDir(downloadsDir);
  const t0 = process.hrtime.bigint();
  // Fast path: check if a cached direct URL is available
  const cacheKey = `direct:${url}:${format}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.directUrl) {
    return {
      direct: true,
      url: cached.directUrl,
      fileName: path.basename(cached.directUrl.split('?')[0]) || `${uuidv4()}.mp4`,
    };
  }

  const outputName = `${uuidv4()}.mp4`;
  const outputPath = path.join(downloadsDir, outputName);
  const tempOutputPath = path.join(tempDir, outputName);

  // Use yt-dlp to extract the best direct URL when possible.
  // Use --no-playlist to avoid accidental playlists and --no-warnings to reduce stderr.
  // --no-check-certificate speeds up some sites; keep safe defaults.
  const args = ['-f', format === 'best' ? 'bestvideo+bestaudio/best' : format, '--no-playlist', '--no-warnings', '--print', 'url', url];

  // Avoid duplicate downloads for same URL+format
  const inflightKey = `dl:${url}:${format}`;
  if (inflight.has(inflightKey)) return inflight.get(inflightKey);

  const promise = (async () => {
    const { stdout } = await runCommandWithRetries('yt-dlp', args, { timeout: 1000 * 60 * 2, retries: 2 });
    const directUrl = stdout.split(/\r?\n/).find(Boolean);
    if (directUrl && isDirectDownloadSafe(directUrl)) {
      cache.set(cacheKey, { directUrl }, 1000 * 60 * 60); // 1 hour
      return { direct: true, url: directUrl, fileName: path.basename(directUrl.split('?')[0]) };
    }

    // Fallback: stream to disk via yt-dlp
    await runCommandWithRetries('yt-dlp', ['-f', format === 'best' ? 'bestvideo+bestaudio/best' : format, '-o', tempOutputPath, '--no-playlist', '--no-warnings', url], { timeout: 1000 * 60 * 5, retries: 2 });
    fs.renameSync(tempOutputPath, outputPath);
    return { direct: false, filePath: outputPath, fileName: outputName };
  })();

  inflight.set(inflightKey, promise);
  try {
    const r = await promise;
    const durMs = Number(process.hrtime.bigint() - t0) / 1e6;
    console.info(`[perf][downloadVideo] url=${url} format=${format} durationMs=${durMs.toFixed(1)} direct=${r.direct ? 1 : 0}`);
    return r;
  } finally {
    inflight.delete(inflightKey);
  }
}

async function downloadAudio(url, format) {
  ensureDir(tempDir);
  ensureDir(downloadsDir);
  const t0 = process.hrtime.bigint();

  const outputName = `${uuidv4()}.mp3`;
  const outputPath = path.join(downloadsDir, outputName);
  const tempOutputPath = path.join(tempDir, outputName);

  // Try extracting a direct audio URL first
  const cacheKey = `direct:${url}:audio:${format}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.directUrl) {
    return {
      direct: true,
      url: cached.directUrl,
      fileName: path.basename(cached.directUrl.split('?')[0]) || `${uuidv4()}.mp3`,
    };
  }

  const inflightKey = `dl:audio:${url}:${format}`;
  if (inflight.has(inflightKey)) return inflight.get(inflightKey);

  const promise = (async () => {
    const { stdout } = await runCommandWithRetries('yt-dlp', ['-f', 'bestaudio', '--no-playlist', '--no-warnings', '--print', 'url', url], { timeout: 1000 * 60 * 2, retries: 2 });
    const directUrl = stdout.split(/\r?\n/).find(Boolean);
    if (directUrl && isDirectDownloadSafe(directUrl)) {
      cache.set(cacheKey, { directUrl }, 1000 * 60 * 60);
      return { direct: true, url: directUrl, fileName: path.basename(directUrl.split('?')[0]) };
    }

    await runCommandWithRetries('yt-dlp', ['-x', '--audio-format', format || 'mp3', '-o', tempOutputPath, '--no-playlist', '--no-warnings', url], { timeout: 1000 * 60 * 5, retries: 2 });
    fs.renameSync(tempOutputPath, outputPath);
    return { direct: false, filePath: outputPath, fileName: outputName };
  })();

  inflight.set(inflightKey, promise);
  try {
    const r = await promise;
    const durMs = Number(process.hrtime.bigint() - t0) / 1e6;
    console.info(`[perf][downloadAudio] url=${url} format=${format} durationMs=${durMs.toFixed(1)} direct=${r.direct ? 1 : 0}`);
    return r;
  } finally {
    inflight.delete(inflightKey);
  }
}

function isDirectDownloadSafe(directUrl) {
  // Basic validation: only http(s) schemes and not chunked or m3u8 unless explicitly supported
  try {
    const u = new URL(directUrl);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
    // Avoid returning playlist/manifest URLs (m3u8) as direct unless client supports
    if (u.pathname.endsWith('.m3u8') || u.pathname.endsWith('.m3u')) return false;
    return true;
  } catch (e) {
    return false;
  }
}

async function cleanupTempFiles(files = []) {
  for (const file of files) {
    try {
      if (file && fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    } catch (error) {
      console.error('Cleanup failed:', error.message);
    }
  }
}

function startCleanupTask(intervalMs = 1000 * 60 * 10, maxAgeMs = 1000 * 60 * 60) {
  setInterval(() => {
    try {
      const entries = fs.readdirSync(tempDir);
      const now = Date.now();
      for (const entry of entries) {
        try {
          const filePath = path.join(tempDir, entry);
          const stat = fs.statSync(filePath);
          if (now - stat.mtimeMs > maxAgeMs) {
            fs.unlinkSync(filePath);
          }
        } catch (innerError) {
          // Ignore files that disappear or are unreadable during cleanup.
        }
      }
    } catch (error) {
      console.error('[cleanup] temp cleanup failed:', error.message);
    }
  }, intervalMs).unref();
}

startCleanupTask();

async function getBinaryDetails(command) {
  const resolvedPath = resolveExecutable(command);
  if (!resolvedPath) {
    return {
      command,
      available: false,
      version: null,
      path: null,
      error: buildMissingBinaryError(command),
    };
  }

  try {
    const { stdout, stderr } = await runCommand(command, ['--version']);
    const versionOutput = (stdout || stderr || '').trim().split(/\r?\n/)[0] || 'version unavailable';
    return {
      command,
      available: true,
      version: versionOutput,
      path: resolvedPath,
      error: null,
    };
  } catch (error) {
    return {
      command,
      available: false,
      version: null,
      path: resolvedPath,
      error: error.message,
    };
  }
}

async function verifyDependencies(options = {}) {
  const { log = false, throwOnMissing = false } = options;

  const pythonCommand = resolveExecutable('python3') ? 'python3' : resolveExecutable('python') ? 'python' : null;
  const diagnostics = {
    node: process.version,
    python: null,
    ytDlp: null,
    ffmpeg: null,
  };

  const pythonDetails = pythonCommand
    ? await getBinaryDetails(pythonCommand)
    : {
        command: 'python',
        available: false,
        version: null,
        path: null,
        error: 'Python was not found on PATH or in common install locations.',
      };

  const ytDlpDetails = await getBinaryDetails('yt-dlp');
  const ffmpegDetails = await getBinaryDetails('ffmpeg');

  diagnostics.python = pythonDetails.available
    ? `${pythonDetails.version} (${pythonDetails.path})`
    : pythonDetails.error;
  diagnostics.ytDlp = ytDlpDetails.available
    ? `${ytDlpDetails.version} (${ytDlpDetails.path})`
    : ytDlpDetails.error;
  diagnostics.ffmpeg = ffmpegDetails.available
    ? `${ffmpegDetails.version} (${ffmpegDetails.path})`
    : ffmpegDetails.error;

  if (log) {
    console.log(`[deps] Node version: ${diagnostics.node}`);
    console.log(`[deps] Python: ${diagnostics.python}`);
    console.log(`[deps] yt-dlp: ${diagnostics.ytDlp}`);
    console.log(`[deps] ffmpeg: ${diagnostics.ffmpeg}`);
  }

  const missing = [pythonDetails, ytDlpDetails, ffmpegDetails].filter((detail) => !detail.available);
  if (missing.length > 0) {
    const message = [
      'Dependency verification failed.',
      ...missing.map((detail) => `- ${detail.error}`),
    ].join('\n');

    if (log) {
      console.error(message);
    }

    if (throwOnMissing) {
      throw new Error(message);
    }

    return { ok: false, diagnostics, missing };
  }

  if (log) {
    console.log('[deps] Dependency verification succeeded.');
  }

  return { ok: true, diagnostics, missing: [] };
}

module.exports = {
  inspectUrl,
  downloadVideo,
  downloadAudio,
  cleanupTempFiles,
  verifyDependencies,
};
