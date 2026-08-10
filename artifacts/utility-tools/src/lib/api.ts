/**
 * Centralized API client.
 *
 * All requests to the backend go through this file.
 *
 * The API server is a separate artifact in this workspace, mounted at the
 * `/api` path behind the shared Replit proxy — so a same-origin relative
 * path always reaches it, in both development and production.
 *
 * VITE_API_URL should be the public HTTPS API origin, for example:
 * https://toolbox-iph5.onrender.com/api
 */

const configuredApiBase = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const API_BASE = configuredApiBase
  ? configuredApiBase.replace(/\/$/, '')
  : import.meta.env.PROD
    ? 'https://toolbox-iph5.onrender.com/api'
    : '/api';

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
      (data as { message?: string })?.message ??
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
      timeoutMs: 120_000,
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

export type VideoPlatform = 'youtube' | 'facebook' | 'instagram' | 'twitter' | 'tiktok' | 'pinterest' | 'reddit';

// Mirrors the backend's allow-list — used for instant client-side feedback
// before a network request is made (server re-validates regardless).
const VIDEO_PLATFORM_HOSTS: Record<VideoPlatform, string[]> = {
  youtube: ['youtube.com', 'youtu.be'],
  facebook: ['facebook.com', 'fb.watch'],
  instagram: ['instagram.com'],
  twitter: ['twitter.com', 'x.com'],
  tiktok: ['tiktok.com'],
  pinterest: ['pinterest.com', 'pin.it'],
  reddit: ['reddit.com', 'redd.it'],
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
    request<VideoDownloadResponse>('/video/info', {
      method: 'POST',
      body: payload,
      timeoutMs: 50_000,
    }),

  /** Step 2: submit the download as a native browser attachment request. */
  buildDownloadUrl: (payload: VideoDownloadRequest & { format: VideoFormat; title?: string }) => {
    const params = new URLSearchParams({
      url: payload.url,
      platform: payload.platform,
      format: payload.format.formatId,
      ext: payload.format.ext,
      ...(payload.title ? { title: payload.title } : {}),
    });
    return `${API_BASE}/video/stream?${params.toString()}`;
  },

  /** Legacy POST fallback retained for callers that require form submission. */
  start: (payload: VideoDownloadRequest & { format: VideoFormat }) => {
    const frame = document.createElement('iframe');
    frame.name = 'toolboxx-video-download';
    frame.title = 'Download';
    frame.style.display = 'none';
    document.body.appendChild(frame);
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `${API_BASE}/video/download`;
    form.target = 'toolboxx-video-download';
    form.style.display = 'none';
    const fields = {
      url: payload.url,
      platform: payload.platform,
      format: payload.format.formatId,
      ext: payload.format.ext,
    };
    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
    form.remove();
    window.setTimeout(() => frame.remove(), 10 * 60 * 1000);
  },

};

// ─── Add more endpoint groups here as the app grows ────────────────────────
// export const pdf = { ... }
// export const image = { ... }
