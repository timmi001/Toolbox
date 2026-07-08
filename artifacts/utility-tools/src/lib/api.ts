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
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const isObject = body !== undefined && typeof body === 'object';

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      ...(isObject ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: isObject ? JSON.stringify(body) : body,
  });

  let data: unknown;
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      (data as { error?: string })?.error ??
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

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

export type VideoFormat = {
  quality: string;   // e.g. "1080p", "720p", "audio only"
  ext: string;       // e.g. "mp4", "webm", "m4a"
  url: string;       // direct download URL
  filesize?: number; // bytes, optional
};

export interface VideoDownloadRequest {
  url: string;
  platform: 'youtube' | 'facebook' | 'instagram' | 'twitter' | 'tiktok';
}

export interface VideoDownloadResponse {
  title: string;
  thumbnail?: string;
  duration?: number;   // seconds
  formats: VideoFormat[];
}

export const videoDownload = {
  fetch: (payload: VideoDownloadRequest) =>
    request<VideoDownloadResponse>('/video/download', {
      method: 'POST',
      body: payload,
    }),
};

// ─── Add more endpoint groups here as the app grows ────────────────────────
// export const pdf = { ... }
// export const image = { ... }
