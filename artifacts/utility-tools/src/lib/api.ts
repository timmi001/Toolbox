/**
 * Centralized API client.
 *
 * All requests to the backend go through this file.
 *
 * Environment variable:
 *   VITE_API_URL — base URL of the backend API (no trailing slash)
 *
 * Development  → set in .env.local:  VITE_API_URL=http://localhost:3001/api
 * Production   → set in Vercel dashboard: VITE_API_URL=https://toolbox-api-nqgb.onrender.com/api
 */

const API_BASE = import.meta.env.VITE_API_URL as string;

if (!API_BASE) {
  console.warn(
    '[api] VITE_API_URL is not set. ' +
      'Create .env.local with VITE_API_URL=http://localhost:3001/api for development, ' +
      'or set it in your Vercel environment variables for production.',
  );
}

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

// ─── Add more endpoint groups here as the app grows ────────────────────────
// export const pdf = { ... }
// export const image = { ... }
