/**
 * Centralized API client.
 *
 * All requests to the backend go through this file.
 *
 * The API server is a separate artifact in this workspace, mounted at the
 * `/api` path behind the shared Replit proxy — so a same-origin relative
 * path always reaches it, in both development and production.
 *
 * Set VITE_API_URL only if the backend is hosted elsewhere.
 */

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || '/api';

interface RequestOptions extends Omit<RequestInit, 'body'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
}

/**
 * Base fetch wrapper. Automatically:
 *  - Prepends VITE_API_URL to every path
 *  - Sets Content-Type: application/json for object bodies
 *  - Throws on non-2xx responses with the server's error message
 */
const isDev = import.meta.env.DEV;

interface RequestOptionsWithTimeout extends RequestOptions {
  /** Aborts the request if it hasn't resolved within this many ms. */
  timeoutMs?: number;
}

async function request<T>(path: string, options: RequestOptionsWithTimeout = {}): Promise<T> {
  const { body, headers, timeoutMs, ...rest } = options;

  const isObject = body !== undefined && typeof body === 'object';

  // Abort long-hanging requests instead of leaving the UI stuck loading forever.
  const controller = new AbortController();
  const timer = timeoutMs
    ? setTimeout(() => controller.abort(), timeoutMs)
    : undefined;

  if (isDev) {
    // eslint-disable-next-line no-console
    console.debug(`[api] → ${options.method ?? 'GET'} ${path}`, isObject ? body : undefined);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...rest,
      signal: controller.signal,
      headers: {
        ...(isObject ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: isObject ? JSON.stringify(body) : body,
    });
  } catch (err) {
    if (isDev) console.debug(`[api] ✗ ${path}`, err);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('The request timed out. Please check your connection and try again.');
    }
    throw new Error('Network error — please check your connection and try again.');
  } finally {
    if (timer) clearTimeout(timer);
  }

  let data: unknown;
  const contentType = response.headers.get('content-type') ?? '';
  try {
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
  } catch (parseErr) {
    // Log parse errors instead of silently failing
    console.error(`[api] Failed to parse ${contentType} response for ${path}:`, parseErr);
    data = undefined;
  }

  if (!response.ok) {
    const message =
      (data as { error?: string })?.error ??
      `Request failed with status ${response.status}`;
    if (isDev) console.debug(`[api] ✗ ${path} (${response.status})`, message);
    throw new Error(message);
  }

  if (isDev) console.debug(`[api] ✓ ${path}`);
  return data as T;
}

// ─── AI endpoints ──────────────────────────────────────────────────────────

export interface AiGenerateRequest {
  toolId: string;
  inputs: Record<string, string>;
}

export interface AiGenerateResponse {
  result: string;
}

export const ai = {
  generate: (payload: AiGenerateRequest) =>
    request<AiGenerateResponse>('/ai/generate', {
      method: 'POST',
      body: payload,
    }),
};

/**
 * Strips markdown syntax (headers, bold/italic asterisks, bullet markers)
 * from Gemini's raw output so results render as clean plain text instead of
 * showing literal `#`/`*` characters. Keeps the underlying text content and
 * line structure intact.
 */
export function stripMarkdown(raw: string): string {
  return raw
    // Headers: "## Title" -> "Title"
    .replace(/^#{1,6}\s+/gm, '')
    // Bullet markers: "* Item" -> "• Item" (single leading asterisk + space)
    .replace(/^(\s*)[*-]\s+/gm, '$1• ')
    // Bold: "**text**" -> "text"
    .replace(/\*\*(.+?)\*\*/g, '$1')
    // Italic: "*text*" -> "text"
    .replace(/\*(.+?)\*/g, '$1')
    // Any remaining stray markdown symbols
    .replace(/[#*]/g, '')
    .trim();
}

// ─── HTTP Headers checker ──────────────────────────────────────────────────

export interface HttpHeadersResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export const httpHeaders = {
  check: (url: string) =>
    request<HttpHeadersResponse>('/http-headers', {
      method: 'POST',
      body: { url },
    }),
};

// ─── Video downloader endpoints ────────────────────────────────────────────

export type VideoPlatform = 'youtube' | 'facebook' | 'instagram' | 'twitter' | 'tiktok';

// Mirrors the backend's allow-list — used for instant client-side feedback
// before a network request is made (server re-validates regardless).
const VIDEO_PLATFORM_HOSTS: Record<VideoPlatform, string[]> = {
  youtube: ['youtube.com', 'youtu.be'],
  facebook: ['facebook.com', 'fb.watch'],
  instagram: ['instagram.com'],
  twitter: ['twitter.com', 'x.com'],
  tiktok: ['tiktok.com'],
};

/** Validates a URL client-side before it's sent to the backend. */
export function validateVideoUrl(rawUrl: string, platform: VideoPlatform): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return 'Please paste a video URL.';

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return 'That doesn\u2019t look like a valid URL.';
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return 'Only http(s) video links are supported.';
  }
  const host = parsed.hostname.toLowerCase();
  const allowed = VIDEO_PLATFORM_HOSTS[platform].some(base => host === base || host.endsWith(`.${base}`));
  if (!allowed) {
    return `That link doesn\u2019t look like a valid ${platform} URL.`;
  }
  return null;
}

export type VideoFormat = {
  formatId: string;   // opaque id used to request the actual stream
  quality: string;    // e.g. "1080p", "720p", "audio only"
  ext: string;        // e.g. "mp4", "webm", "m4a"
  filesize?: number;  // bytes, optional/approximate
};

export interface VideoDownloadRequest {
  url: string;
  platform: VideoPlatform;
}

export interface VideoDownloadResponse {
  title: string;
  thumbnail?: string;
  duration?: number;   // seconds
  formats: VideoFormat[];
}

export const videoDownload = {
  /** Step 1: resolve title/thumbnail/duration + available formats. */
  fetch: (payload: VideoDownloadRequest) =>
    request<VideoDownloadResponse>('/video/download', {
      method: 'POST',
      body: payload,
      timeoutMs: 50_000,
    }),

  /**
   * Step 2: build the same-origin URL that actually streams the file.
   * The backend re-fetches from the source platform with the right
   * headers/cookies and pipes bytes straight through — the browser never
   * talks to the third-party CDN directly, so this works even for
   * platforms (e.g. TikTok) whose direct links require session cookies.
   */
  buildStreamUrl: (opts: {
    sourceUrl: string;
    platform: VideoPlatform;
    format: VideoFormat;
    title: string;
  }) => {
    const params = new URLSearchParams({
      src: opts.sourceUrl,
      platform: opts.platform,
      format: opts.format.formatId,
      ext: opts.format.ext,
      title: opts.title,
    });
    return `${API_BASE}/video/stream?${params.toString()}`;
  },

  /**
   * Build the URL for the audio-only extraction endpoint.
   * Returns a GET URL so the browser can trigger a download directly via
   * an <a href> — no JS blob dance required.
   */
  buildAudioUrl: (opts: {
    sourceUrl: string;
    platform: VideoPlatform;
    title: string;
  }) => {
    const params = new URLSearchParams({
      src: opts.sourceUrl,
      platform: opts.platform,
      title: opts.title,
    });
    return `${API_BASE}/video/audio?${params.toString()}`;
  },
};

// ─── Add more endpoint groups here as the app grows ────────────────────────
// export const pdf = { ... }
// export const image = { ... }
