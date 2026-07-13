import { Router } from "express";
import rateLimit from "express-rate-limit";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { existsSync } from "node:fs";
import path from "node:path";
import { logger } from "../lib/logger";

const execFileAsync = promisify(execFile);
const router = Router();

const isDev = process.env["NODE_ENV"] !== "production";

// ---------------------------------------------------------------------------
// yt-dlp resolution.
//
// The Nix-provided `yt-dlp` binary on PATH is version-pinned by the nixpkgs
// channel and can lag over a year behind upstream — old enough that some
// sites' extractors are simply broken against it (e.g. Instagram's "empty
// media response" bug, fixed upstream months after this channel's release).
// A newer version is kept up to date via pip (`uv add yt-dlp[default]`,
// tracked in pyproject.toml/uv.lock) into the project-local `.pythonlibs`
// venv — but invoking that venv's own `yt-dlp` *script* still picks up the
// old version, because the environment's PYTHONPATH (set by the Nix yt-dlp
// package) puts the old package ahead of the venv's site-packages on
// sys.path. Running the venv's Python with `-I` (isolated mode) ignores
// PYTHONPATH entirely, so `-m yt_dlp` reliably resolves to the pip-installed
// version. Falls back to the plain `yt-dlp` command if the venv isn't
// present (e.g. a different environment where the pip package wasn't set up).
// ---------------------------------------------------------------------------
const PROJECT_ROOT = process.env["REPL_HOME"] ?? path.resolve(import.meta.dirname, "../../../..");
const VENV_PYTHON = path.join(PROJECT_ROOT, ".pythonlibs/bin/python");
const USE_VENV_YTDLP = existsSync(VENV_PYTHON);

function ytDlpCommand(): { command: string; baseArgs: string[] } {
  if (USE_VENV_YTDLP) {
    return { command: VENV_PYTHON, baseArgs: ["-I", "-m", "yt_dlp"] };
  }
  return { command: "yt-dlp", baseArgs: [] };
}

logger.info(
  { usingVenvYtDlp: USE_VENV_YTDLP, venvPython: VENV_PYTHON },
  "[video] yt-dlp resolution",
);

// ---------------------------------------------------------------------------
// Timeouts — configurable via env so slow networks / large files don't need
// a code change. Defaults are generous enough for most public videos while
// still bounding worst-case resource usage.
// ---------------------------------------------------------------------------
const INFO_TIMEOUT_MS = Number(process.env["VIDEO_INFO_TIMEOUT_MS"] ?? 45_000);
const INFO_SOCKET_TIMEOUT_S = Number(process.env["VIDEO_INFO_SOCKET_TIMEOUT_S"] ?? 25);
const STREAM_SOCKET_TIMEOUT_S = Number(process.env["VIDEO_STREAM_SOCKET_TIMEOUT_S"] ?? 25);
const STREAM_MAX_DURATION_MS = Number(process.env["VIDEO_STREAM_MAX_DURATION_MS"] ?? 10 * 60 * 1000);

let requestCounter = 0;
function nextRequestId(): number {
  requestCounter += 1;
  return requestCounter;
}

// ---------------------------------------------------------------------------
// Rate limiting — video extraction/streaming is heavier than a normal API call
// ---------------------------------------------------------------------------
const videoInfoLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait a moment before trying again." },
});

const videoStreamLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many download requests. Please wait a moment before trying again." },
});

// ---------------------------------------------------------------------------
// Supported platforms + allow-listed hostnames.
// The allow-list also doubles as SSRF protection for /video/stream, whose
// `src` query param would otherwise let a caller point yt-dlp at an arbitrary URL.
// ---------------------------------------------------------------------------
type Platform = "youtube" | "facebook" | "instagram" | "twitter" | "tiktok";

const PLATFORM_HOSTS: Record<Platform, string[]> = {
  youtube: ["youtube.com", "youtu.be"],
  facebook: ["facebook.com", "fb.watch"],
  instagram: ["instagram.com"],
  twitter: ["twitter.com", "x.com"],
  tiktok: ["tiktok.com"],
};

function isValidPlatform(p: unknown): p is Platform {
  return typeof p === "string" && Object.prototype.hasOwnProperty.call(PLATFORM_HOSTS, p);
}

function hostMatchesPlatform(hostname: string, platform: Platform): boolean {
  const host = hostname.toLowerCase();
  return PLATFORM_HOSTS[platform].some((base) => host === base || host.endsWith(`.${base}`));
}

function validateVideoUrl(
  rawUrl: unknown,
  platform: Platform,
): { ok: true; url: URL } | { ok: false; error: string } {
  if (typeof rawUrl !== "string" || !rawUrl.trim()) {
    return { ok: false, error: "A video URL is required." };
  }
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { ok: false, error: "That doesn't look like a valid URL." };
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { ok: false, error: "Only http(s) video links are supported." };
  }
  if (!hostMatchesPlatform(parsed.hostname, platform)) {
    return { ok: false, error: `That link doesn't look like a valid ${platform} URL.` };
  }
  return { ok: true, url: parsed };
}

// Extra yt-dlp CLI args needed per platform to reliably resolve/stream formats.
// YouTube's default web client is frequently blocked without auth; the android
// client player API avoids that for public videos.
function extractorArgsFor(platform: Platform): string[] {
  if (platform === "youtube") {
    return ["--extractor-args", "youtube:player_client=android"];
  }
  return [];
}

function extractStderr(err: unknown): string {
  if (err && typeof err === "object" && "stderr" in err) {
    return String((err as { stderr?: unknown }).stderr ?? "");
  }
  return "";
}

function isTimeoutError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { killed?: boolean; signal?: string; code?: string };
  return Boolean(e.killed) || e.signal === "SIGTERM" || e.code === "ETIMEDOUT";
}

/** True when yt-dlp itself isn't installed/on PATH — a server config problem, not a bad link. */
function isMissingBinaryError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: string };
  return e.code === "ENOENT";
}

// ---------------------------------------------------------------------------
// Error classification — maps a raw failure to (httpStatus, userMessage, reason)
// so every failure path returns a clear, specific response instead of a bare
// 502. Reason codes are always logged (never leaked to the client) so the
// exact cause is traceable in server logs.
// ---------------------------------------------------------------------------
type FailureReason =
  | "missing_binary"
  | "timeout"
  | "bot_check"
  | "blocked_or_rate_limited"
  | "auth_required"
  | "unsupported_url"
  | "not_found"
  | "unavailable"
  | "no_formats"
  | "malformed_response"
  | "unknown_extractor_error";

function classifyFailure(
  err: unknown,
  stderr: string,
): { status: number; message: string; reason: FailureReason } {
  if (isMissingBinaryError(err)) {
    return {
      status: 500,
      message: "The video downloader isn't available on this server right now. Please contact support.",
      reason: "missing_binary",
    };
  }
  if (isTimeoutError(err)) {
    return {
      status: 504,
      message: "The video source took too long to respond. Please try again in a moment.",
      reason: "timeout",
    };
  }
  // YouTube frequently challenges requests from data-center/server IPs with
  // a bot-check, even for ordinary public videos — this is unrelated to the
  // video's actual privacy and shouldn't be reported as "private/login
  // required", which misleads users into thinking the video itself is
  // restricted.
  if (/sign in to confirm you.?re not a bot/i.test(stderr)) {
    return {
      status: 429,
      message:
        "The source platform is challenging this server's requests as a bot right now. This isn't specific to your video — please try again in a few minutes.",
      reason: "bot_check",
    };
  }
  if (/HTTP Error 403|Forbidden|blocked|HTTP Error 429|rate.?limit|too many requests/i.test(stderr)) {
    return {
      status: 429,
      message: "The platform is blocking or rate-limiting requests right now. Please try again shortly.",
      reason: "blocked_or_rate_limited",
    };
  }
  if (/private|sign.?in|log.?in required|authentication|cookies/i.test(stderr)) {
    return {
      status: 422,
      message: "This video is private, age-restricted, or requires login — it can't be downloaded here.",
      reason: "auth_required",
    };
  }
  if (/unsupported url|no extractor/i.test(stderr)) {
    return { status: 422, message: "This link isn't supported yet.", reason: "unsupported_url" };
  }
  if (/no video could be found|HTTP Error 404|404: not found/i.test(stderr)) {
    return {
      status: 404,
      message: "No video was found at that link. Double-check the URL and try again.",
      reason: "not_found",
    };
  }
  if (/unavailable|not available|removed|has been deleted/i.test(stderr)) {
    return {
      status: 422,
      message: "This video is unavailable or may have been removed.",
      reason: "unavailable",
    };
  }
  return {
    status: 502,
    message: "Could not fetch this video from the source platform. Please check the link and try again.",
    reason: "unknown_extractor_error",
  };
}

// ---------------------------------------------------------------------------
// Format selection — restrict to combined (video+audio) progressive formats
// so bytes can be streamed straight through without server-side muxing.
// ---------------------------------------------------------------------------
interface YtDlpFormat {
  format_id: string;
  ext: string;
  url?: string;
  filesize?: number | null;
  filesize_approx?: number | null;
  height?: number | null;
  vcodec?: string;
  acodec?: string;
  format_note?: string | null;
  protocol?: string;
}

interface YtDlpInfo {
  title?: string;
  thumbnail?: string;
  duration?: number;
  formats?: YtDlpFormat[];
}

interface OutFormat {
  formatId: string;
  quality: string;
  ext: string;
  filesize?: number;
}

function selectFormats(info: YtDlpInfo): OutFormat[] {
  const raw = info.formats ?? [];

  // A format is usable for a single-file progressive download when:
  //  - it has a direct URL and isn't a segmented stream (HLS/DASH manifest,
  //    which would need server-side muxing we don't do), and
  //  - it isn't *explicitly* marked video-only (acodec === "none") or
  //    audio-only (vcodec === "none").
  //
  // Some platforms (notably X/Twitter) serve their best progressive files
  // over plain https with vcodec/acodec left unset (null) rather than
  // populated — those are still full muxed video+audio files, just with
  // incomplete metadata. Requiring truthy codec fields (the previous
  // behavior) silently filtered out every format for those platforms and
  // surfaced as "No downloadable video formats", reported as a 502.
  const combined = raw.filter((f) => {
    if (!f.url) return false;
    const protocol = f.protocol ?? "";
    if (protocol.includes("m3u8") || protocol.includes("dash") || protocol.includes("f4m")) return false;
    if (f.vcodec === "none") return false; // audio-only
    if (f.acodec === "none") return false; // video-only, no audio track
    return true;
  });

  const sorted = [...combined].sort((a, b) => (b.height ?? 0) - (a.height ?? 0));

  const seen = new Set<string>();
  const out: OutFormat[] = [];
  for (const f of sorted) {
    const key = f.height ? String(f.height) : f.format_id;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      formatId: f.format_id,
      quality: f.format_note || (f.height ? `${f.height}p` : "Standard"),
      ext: f.ext,
      filesize: f.filesize ?? f.filesize_approx ?? undefined,
    });
    if (out.length >= 5) break;
  }
  return out;
}

// ---------------------------------------------------------------------------
// POST /video/download — resolve title/thumbnail/duration + available formats
// ---------------------------------------------------------------------------
router.post("/video/download", videoInfoLimiter, async (req, res) => {
  const requestId = nextRequestId();
  const startedAt = Date.now();
  const { url, platform } = req.body as { url?: unknown; platform?: unknown };

  if (!isValidPlatform(platform)) {
    res.status(400).json({ error: "Unsupported or unknown platform." });
    return;
  }

  const validation = validateVideoUrl(url, platform);
  if (!validation.ok) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const targetUrl = validation.url.toString();
  logger.info({ requestId, platform }, "[video/download] request received");

  try {
    const { command, baseArgs } = ytDlpCommand();
    const { stdout } = await execFileAsync(
      command,
      [
        ...baseArgs,
        "-j",
        "--no-warnings",
        "--no-playlist",
        "--socket-timeout",
        String(INFO_SOCKET_TIMEOUT_S),
        ...extractorArgsFor(platform),
        targetUrl,
      ],
      { timeout: INFO_TIMEOUT_MS, maxBuffer: 25 * 1024 * 1024 },
    );

    let info: YtDlpInfo;
    try {
      info = JSON.parse(stdout) as YtDlpInfo;
    } catch (parseErr) {
      logger.error(
        { requestId, platform, err: (parseErr as Error).message },
        "[video/download] yt-dlp returned non-JSON output",
      );
      res.status(502).json({ error: "The video source returned an unexpected response. Please try again." });
      return;
    }

    const formats = selectFormats(info);

    if (formats.length === 0) {
      logger.warn(
        { requestId, platform, rawFormatCount: info.formats?.length ?? 0 },
        "[video/download] no usable progressive formats after filtering",
      );
      res.status(422).json({
        error: "No downloadable video was found for this link — it may only contain non-video content.",
      });
      return;
    }

    logger.info(
      { requestId, platform, formatCount: formats.length, ms: Date.now() - startedAt },
      "[video/download] DONE",
    );
    res.json({
      title: info.title ?? "video",
      thumbnail: info.thumbnail,
      duration: info.duration,
      formats,
    });
  } catch (err) {
    const stderr = extractStderr(err);
    const { status, message, reason } = classifyFailure(err, stderr);
    logger.error(
      {
        requestId,
        platform,
        reason,
        status,
        ms: Date.now() - startedAt,
        detail: isDev ? stderr || (err as Error)?.message : undefined,
      },
      "[video/download] failed",
    );
    res.status(status).json({ error: message });
  }
});

// ---------------------------------------------------------------------------
// GET /video/stream — actually stream the chosen format's bytes to the client.
// Using our own server (rather than handing back the raw CDN url from step 1)
// avoids two real problems: some platforms (e.g. TikTok) require session
// cookies/headers the browser doesn't have, and CDN links expire quickly.
// ---------------------------------------------------------------------------
const EXT_MIME: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  mkv: "video/x-matroska",
  m4a: "audio/mp4",
  mp3: "audio/mpeg",
};

router.get("/video/stream", videoStreamLimiter, (req, res) => {
  const requestId = nextRequestId();
  const startedAt = Date.now();
  const { src, format, platform, ext, title } = req.query as Record<string, string | undefined>;

  if (!isValidPlatform(platform)) {
    res.status(400).json({ error: "Unsupported or unknown platform." });
    return;
  }
  const validation = validateVideoUrl(src, platform);
  if (!validation.ok) {
    res.status(400).json({ error: validation.error });
    return;
  }
  if (!format || !/^[\w.-]+$/.test(format)) {
    res.status(400).json({ error: "A valid format selection is required." });
    return;
  }
  const safeExt = ext && /^[a-z0-9]{2,5}$/i.test(ext) ? ext.toLowerCase() : "mp4";
  const safeTitle = (title ?? "video").replace(/[^a-z0-9 _-]/gi, "").trim().slice(0, 80) || "video";
  // NOTE: deliberately not sending a Content-Length header here. The only
  // size we have is yt-dlp's `filesize_approx` — an *estimate* — and the
  // real byte count streamed can differ slightly. A Content-Length that
  // doesn't match the actual bytes sent makes browsers/curl treat a fully
  // successful download as truncated/corrupted. Omitting it means the
  // response is chunked and the browser shows bytes-received progress
  // instead of an exact percentage — less precise, but never wrong.
  const targetUrl = validation.url.toString();

  logger.info({ requestId, platform, format }, "[video/stream] request received");

  // Note: spawn() itself essentially never throws synchronously — a missing
  // binary (ENOENT) surfaces asynchronously via the 'error' event below,
  // which is handled and mapped to a clear 500 response.
  const { command: streamCommand, baseArgs: streamBaseArgs } = ytDlpCommand();
  const child = spawn(
    streamCommand,
    [
      ...streamBaseArgs,
      "-f",
      format,
      "--no-warnings",
      "--no-part",
      "--socket-timeout",
      String(STREAM_SOCKET_TIMEOUT_S),
      ...extractorArgsFor(platform),
      "-o",
      "-",
      targetUrl,
    ],
    { stdio: ["ignore", "pipe", "pipe"] },
  );

  let stderrBuf = "";
  child.stderr?.on("data", (chunk: Buffer) => {
    stderrBuf += chunk.toString();
    if (stderrBuf.length > 8000) stderrBuf = stderrBuf.slice(-8000);
  });

  // Guards against a hung download (e.g. a stalled upstream connection)
  // pinning a process + socket open forever. Configurable for large files.
  const killTimer = setTimeout(() => {
    logger.warn(
      { requestId, platform, maxDurationMs: STREAM_MAX_DURATION_MS },
      "[video/stream] exceeded max duration — killing process",
    );
    child.kill("SIGKILL");
  }, STREAM_MAX_DURATION_MS);

  let started = false;
  let bytesWritten = 0;
  let clientDisconnected = false;

  req.on("close", () => {
    // Client navigated away / cancelled — stop the yt-dlp process so it
    // doesn't keep downloading (and holding memory/bandwidth) for nobody.
    clientDisconnected = true;
    if (!res.writableEnded) child.kill("SIGKILL");
  });

  child.stdout?.on("data", (chunk: Buffer) => {
    if (!started) {
      started = true;
      res.status(200);
      res.setHeader("Content-Type", EXT_MIME[safeExt] ?? "application/octet-stream");
      res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}.${safeExt}"`);
      res.setHeader("Cache-Control", "no-store");
    }
    bytesWritten += chunk.length;
    // Respect backpressure instead of buffering everything in memory if the
    // client is slower than the source — avoids unbounded memory growth on
    // large files / slow connections.
    const canContinue = res.write(chunk);
    if (!canContinue) child.stdout?.pause();
  });

  res.on("drain", () => {
    child.stdout?.resume();
  });

  child.on("error", (err) => {
    clearTimeout(killTimer);
    const missingBinary = isMissingBinaryError(err);
    logger.error(
      { requestId, platform, err: err.message, missingBinary },
      "[video/stream] failed to start",
    );
    if (!started && !res.headersSent) {
      res.status(missingBinary ? 500 : 502).json({
        error: missingBinary
          ? "The video downloader isn't available on this server right now."
          : "Failed to start the download. Please try again.",
      });
    } else if (!res.writableEnded) {
      res.end();
    }
  });

  child.on("close", (code, signal) => {
    clearTimeout(killTimer);
    const ms = Date.now() - startedAt;

    if (!started) {
      const { status, message, reason } = classifyFailure(
        signal === "SIGKILL" ? { killed: true } : null,
        stderrBuf,
      );
      logger.error(
        { requestId, platform, code, signal, reason, ms, detail: isDev ? stderrBuf : undefined },
        "[video/stream] produced no output before exiting",
      );
      if (!res.headersSent) {
        res.status(status).json({ error: message });
      }
      return;
    }

    if (code !== 0 && !clientDisconnected) {
      logger.error(
        { requestId, platform, code, signal, bytesWritten, ms, detail: isDev ? stderrBuf : undefined },
        "[video/stream] exited with error mid-stream",
      );
    } else {
      logger.info({ requestId, platform, bytesWritten, ms, clientDisconnected }, "[video/stream] DONE");
    }
    if (!res.writableEnded) res.end();
  });
});

export default router;
