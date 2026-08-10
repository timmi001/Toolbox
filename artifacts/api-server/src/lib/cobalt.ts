import { Readable } from "node:stream";

const COBALT_API_URL = (process.env["COBALT_API_URL"] ?? "").trim().replace(/\/$/, "");
const COBALT_API_KEY = process.env["COBALT_API_KEY"]?.trim();
const COBALT_TIMEOUT_MS = Number(process.env["COBALT_TIMEOUT_MS"] ?? 120_000);

export type CobaltRequest = {
  url: string;
  downloadMode?: "auto" | "audio" | "mute";
  videoQuality?: "max" | "4320" | "2160" | "1440" | "1080" | "720" | "480" | "360" | "240" | "144";
  audioFormat?: "best" | "mp3" | "ogg" | "wav" | "opus";
  audioBitrate?: "320" | "256" | "128" | "96" | "64" | "8";
  alwaysProxy?: boolean;
  filenameStyle?: "classic" | "pretty" | "basic" | "nerdy";
};

export type CobaltResult = {
  status: "tunnel" | "redirect" | "local-processing" | "picker" | "error";
  url?: string;
  filename?: string;
  type?: string;
  output?: { filename?: string; metadata?: { title?: string } };
  error?: { code?: string; context?: Record<string, unknown> };
  picker?: Array<{ type?: string; url?: string; thumb?: string }>;
  tunnel?: string[];
};

export class CobaltError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly reason: string,
  ) {
    super(message);
    this.name = "CobaltError";
  }
}

function requireUrl() {
  if (!COBALT_API_URL) throw new CobaltError("Cobalt provider is not configured.", 503, "provider_unavailable");
  try {
    const parsed = new URL(`${COBALT_API_URL}/`);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error();
  } catch {
    throw new CobaltError("Cobalt API URL is invalid.", 503, "provider_configuration");
  }
}

function headers() {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(COBALT_API_KEY ? { Authorization: `Api-Key ${COBALT_API_KEY}` } : {}),
  };
}

function messageForStatus(status: number, code?: string) {
  if (status === 401 || status === 403) return "The video provider rejected the downloader authorization.";
  if (status === 429) return "The video provider is rate-limiting requests. Please try again later.";
  if (status >= 500) return "The video provider is temporarily unavailable.";
  if (code?.includes("invalid")) return "Invalid or unsupported video URL.";
  return "The video provider could not process this URL.";
}

export async function requestCobalt(payload: CobaltRequest): Promise<CobaltResult> {
  requireUrl();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), COBALT_TIMEOUT_MS);
  const started = Date.now();
  try {
    const response = await fetch(`${COBALT_API_URL}/`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(payload),
      signal: controller.signal,
      redirect: "manual",
    });
    const text = await response.text();
    let data: CobaltResult | undefined;
    try {
      data = text ? (JSON.parse(text) as CobaltResult) : undefined;
    } catch {
      throw new CobaltError("Cobalt returned an invalid response.", 502, "malformed_response");
    }
    if (!response.ok || !data || data.status === "error") {
      const code = data?.error?.code;
      throw new CobaltError(messageForStatus(response.status, code), response.status === 429 ? 429 : response.status >= 500 ? 502 : 422, code ?? "provider_error");
    }
    console.info(`[cobalt] request completed status=${data.status} durationMs=${Date.now() - started}`);
    return data;
  } catch (error) {
    if (error instanceof CobaltError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new CobaltError("The video provider took too long to respond.", 504, "timeout");
    }
    throw new CobaltError("The video provider could not be reached.", 503, "provider_network");
  } finally {
    clearTimeout(timer);
  }
}

export async function openCobaltTunnel(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), COBALT_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: COBALT_API_KEY ? { Authorization: `Api-Key ${COBALT_API_KEY}` } : {},
      signal: controller.signal,
      redirect: "follow",
    });
    if (!response.ok) throw new CobaltError("Cobalt could not open the media tunnel.", response.status === 429 ? 429 : response.status >= 500 ? 502 : response.status, "tunnel_error");
    return response;
  } catch (error) {
    if (error instanceof CobaltError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") throw new CobaltError("The media tunnel timed out.", 504, "timeout");
    throw new CobaltError("The media tunnel could not be reached.", 503, "provider_network");
  } finally {
    clearTimeout(timer);
  }
}

export function toNodeStream(body: ReadableStream<Uint8Array> | null) {
  if (!body) throw new CobaltError("Cobalt returned an empty media response.", 502, "empty_response");
  return Readable.fromWeb(body as never);
}
