import { Router } from "express";
import rateLimit from "express-rate-limit";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { logger } from "../lib/logger";

const execFileAsync = promisify(execFile);
const router = Router();

const isDev = process.env["NODE_ENV"] !== "production";

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

function friendlyErrorFromStderr(stderr: string, timedOut: boolean): string {
  if (timedOut) return "The request timed out. Please try again in a moment.";
  if (/private|sign.?in|log.?in required|authentication|cookies/i.test(stderr)) {
    return "This video is private, age-restricted, or requires login — it can't be downloaded here.";
  }
  if (/unsupported url|no extractor/i.test(stderr)) {
    return "This link isn't supported yet.";
  }
  if (/no video could be found/i.test(stderr)) {
    return "No video was found at that link. Double-check the URL and try again.";
  }
  if (/unavailable|not available|removed|404/i.test(stderr)) {
    return "This video is unavailable or may have been removed.";
  }
  if (/rate.?limit|429|too many requests/i.test(stderr)) {
    return "The platform is rate-limiting requests right now. Please try again shortly.";
  }
  return "Could not fetch this video. Please check the link and try again.";
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

  const combined = raw.filter(
    (f) =>
      !!f.url &&
      !!f.vcodec &&
      f.vcodec !== "none" &&
      !!f.acodec &&
      f.acodec !== "none" &&
      !(f.protocol ?? "").includes("m3u8") &&
      !(f.protocol ?? "").includes("dash"),
  );

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

  try {
    if (isDev) logger.debug({ platform, targetUrl }, "[video] resolving info");

    const { stdout } = await execFileAsync(
      "yt-dlp",
      [
        "-j",
        "--no-warnings",
        "--no-playlist",
        "--socket-timeout",
        "20",
        ...extractorArgsFor(platform),
        targetUrl,
      ],
      { timeout: 30_000, maxBuffer: 25 * 1024 * 1024 },
    );

    const info = JSON.parse(stdout) as YtDlpInfo;
    const formats = selectFormats(info);

    if (formats.length === 0) {
      res.status(502).json({ error: "No downloadable video formats were found for this link." });
      return;
    }

    res.json({
      title: info.title ?? "video",
      thumbnail: info.thumbnail,
      duration: info.duration,
      formats,
    });
  } catch (err) {
    const stderr = extractStderr(err);
    const timedOut = isTimeoutError(err);
    logger.error(
      { platform, timedOut, detail: isDev ? stderr || (err as Error)?.message : undefined },
      "yt-dlp info fetch failed",
    );
    res.status(502).json({ error: friendlyErrorFromStderr(stderr, timedOut) });
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
  const targetUrl = validation.url.toString();

  if (isDev) logger.debug({ platform, format: format, targetUrl }, "[video] starting stream");

  const child = spawn(
    "yt-dlp",
    [
      "-f",
      format,
      "--no-warnings",
      "--no-part",
      "--socket-timeout",
      "20",
      ...extractorArgsFor(platform),
      "-o",
      "-",
      targetUrl,
    ],
    { stdio: ["ignore", "pipe", "pipe"] },
  );

  let stderrBuf = "";
  child.stderr.on("data", (chunk: Buffer) => {
    stderrBuf += chunk.toString();
    if (stderrBuf.length > 8000) stderrBuf = stderrBuf.slice(-8000);
  });

  const killTimer = setTimeout(
    () => {
      child.kill("SIGKILL");
    },
    3 * 60 * 1000,
  );

  let started = false;
  req.on("close", () => {
    // Client navigated away / cancelled — stop the yt-dlp process.
    if (!res.writableEnded) child.kill("SIGKILL");
  });

  child.stdout.on("data", (chunk: Buffer) => {
    if (!started) {
      started = true;
      res.status(200);
      res.setHeader("Content-Type", EXT_MIME[safeExt] ?? "application/octet-stream");
      res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}.${safeExt}"`);
      res.setHeader("Cache-Control", "no-store");
    }
    res.write(chunk);
  });

  child.on("error", (err) => {
    clearTimeout(killTimer);
    logger.error({ err: err.message, platform }, "yt-dlp stream failed to start");
    if (!started && !res.headersSent) {
      res.status(502).json({ error: "Failed to start the download. Please try again." });
    } else {
      res.end();
    }
  });

  child.on("close", (code) => {
    clearTimeout(killTimer);
    if (!started) {
      logger.error(
        { code, platform, detail: isDev ? stderrBuf : undefined },
        "yt-dlp stream produced no output",
      );
      if (!res.headersSent) {
        res.status(502).json({ error: friendlyErrorFromStderr(stderrBuf, false) });
      }
      return;
    }
    if (code !== 0) {
      logger.error({ code, platform, detail: isDev ? stderrBuf : undefined }, "yt-dlp stream exited with error");
    }
    res.end();
  });
});

export default router;
