/**
 * ai-service.ts — Resilient multi-provider AI generation pipeline.
 *
 * Provider order: Gemini → Groq → OpenRouter
 *
 * A provider is skipped when:
 *   - Its API key is absent from the environment
 *   - It returns a fallbackable error: 404 (model retired), 429 (quota /
 *     rate-limit), 5xx (server error), timeout, or network failure
 *
 * Non-fallbackable errors (safety blocks, bad auth, malformed input) abort
 * the chain immediately so they surface clearly.
 *
 * Timeouts:
 *   Standard tools — 30 s
 *   Complex / long-form tools — 60 s
 *
 * Retries (within the same provider):
 *   1 automatic retry with 200 ms backoff for transient network / 5xx errors.
 *   Quota and model-not-found errors skip to the next provider immediately.
 */

import { GoogleGenAI } from "@google/genai";
import { getAgentRouterClient, getGroqClient, getOpenRouterClient } from "./ai-providers";
import { logger } from "./logger";

// ---------------------------------------------------------------------------
// Model configuration
// ---------------------------------------------------------------------------

/**
 * Canonical model IDs per provider.
 *
 * Gemini
 *   standard → gemini-2.0-flash-lite   (stable; replaces retired gemini-2.5-flash-lite)
 *   complex  → gemini-2.5-flash        (best reasoning, higher quota cost)
 *
 * Groq (fallback #1)
 *   standard → llama-3.1-8b-instant    (high rate-limit ceiling)
 *   complex  → llama-3.3-70b-versatile (highest quality on Groq)
 *
 * OpenRouter (fallback #2)
 *   standard → google/gemini-2.0-flash-lite-001
 *   complex  → google/gemini-2.0-flash-001
 */
export const PROVIDER_MODELS = {
  // AgentRouter — primary. "auto" lets AgentRouter pick the best model
  // automatically. Override with AGENTROUTER_MODEL if a specific model is needed.
  agentrouter: {
    standard: "auto",
    complex:  "auto",
  },
  gemini: {
    standard: "gemini-2.0-flash-lite",
    complex:  "gemini-2.5-flash",
  },
  groq: {
    standard: "llama-3.1-8b-instant",
    complex:  "llama-3.3-70b-versatile",
  },
  openrouter: {
    standard: "google/gemini-2.0-flash-lite-001",
    complex:  "google/gemini-2.0-flash-001",
  },
} as const;

// ---------------------------------------------------------------------------
// Timeouts
// ---------------------------------------------------------------------------

const TIMEOUT_STANDARD_MS = 30_000;
const TIMEOUT_COMPLEX_MS  = 60_000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GenerationParams {
  prompt: string;
  toolId: string;
  maxOutputTokens: number;
  isComplex: boolean;
  requestId: string;
}

export interface GenerationResult {
  text: string;
  provider: string;
  model: string;
  durationMs: number;
  finishReason?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface ProviderAttempt {
  provider: string;
  model: string;
  durationMs: number;
  succeeded: boolean;
  fallbackReason?: string;
  errorCode?: number;
  errorMessage?: string;
}

export interface GenerationOutput {
  result: GenerationResult;
  attempts: ProviderAttempt[];
}

// ---------------------------------------------------------------------------
// Provider SDK error detail extractor
//
// Groq SDK / OpenAI SDK errors expose HTTP-level fields beyond the standard
// Error interface:
//   .status          — HTTP status code from the upstream provider
//   .headers         — response headers (useful for Retry-After, request IDs)
//   .error           — parsed JSON response body (the raw provider error object)
//
// @google/genai throws plain Errors but sometimes attaches .status and
// .errorDetails. Extracting all of these into a flat log field means the
// Render log contains the full provider response even when the message alone
// is not enough to diagnose the failure.
// ---------------------------------------------------------------------------

interface ProviderErrorDetails {
  errorName?: string;
  stack?: string;
  sdkStatus?: number;
  sdkResponseBody?: unknown;
  sdkHeaders?: unknown;
}

function extractProviderErrorDetails(err: unknown): ProviderErrorDetails {
  if (!err || typeof err !== "object") {
    return {};
  }
  const e = err as Record<string, unknown>;
  return {
    errorName:       err instanceof Error ? err.constructor.name : undefined,
    stack:           err instanceof Error ? err.stack            : undefined,
    sdkStatus:       typeof e["status"] === "number" ? (e["status"] as number) : undefined,
    // OpenAI/Groq SDK: `.error` is the parsed provider JSON response body.
    // Fallback to `.response` or `.body` for other SDK conventions.
    sdkResponseBody: e["error"] ?? e["response"] ?? e["body"] ?? undefined,
    sdkHeaders:      e["headers"] ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Error classification
// ---------------------------------------------------------------------------

interface ErrorMeta {
  code: number | undefined;
  message: string;
  isFallbackable: boolean;
  reason: string;
}

function classifyError(err: unknown): ErrorMeta {
  const code =
    (err as { status?: number })?.status ??
    (err as { statusCode?: number })?.statusCode;

  const raw = err instanceof Error ? err.message : String(err);
  const msg = raw.toLowerCase();

  // Timeout — our own sentinel prefix
  if (msg.startsWith("[timeout]") || msg.includes("timed out")) {
    return { code, message: raw, isFallbackable: true, reason: "timeout" };
  }

  // Network / connection failures
  if (
    msg.includes("econnreset")   ||
    msg.includes("enotfound")    ||
    msg.includes("etimedout")    ||
    msg.includes("econnrefused") ||
    msg.includes("fetch failed") ||
    msg.includes("failed to fetch") ||
    msg.includes("network error") ||
    msg.includes("socket hang up")
  ) {
    return { code, message: raw, isFallbackable: true, reason: "network" };
  }

  // 429 / quota / rate-limit
  if (
    code === 429 ||
    msg.includes("quota")             ||
    msg.includes("resource_exhausted") ||
    msg.includes("rate_limit")         ||
    msg.includes("rate limit")         ||
    msg.includes("too many requests")
  ) {
    return { code, message: raw, isFallbackable: true, reason: "rate_limit" };
  }

  // 404 — model retired or endpoint gone
  if (code === 404 || msg.includes("not_found") || msg.includes("not found")) {
    return { code, message: raw, isFallbackable: true, reason: "model_not_found" };
  }

  // 5xx — provider-side server errors
  if (
    (typeof code === "number" && code >= 500 && code < 600) ||
    msg.includes("internal server error") ||
    msg.includes("service unavailable")   ||
    msg.includes("bad gateway")           ||
    msg.includes("gateway timeout")
  ) {
    return { code, message: raw, isFallbackable: true, reason: "server_error" };
  }

  // Missing API key / provider not configured (thrown by getGroqClient etc.)
  if (
    msg.includes("is not set")     ||
    msg.includes("not configured") ||
    msg.includes("api key")        ||
    msg.includes("apikey")
  ) {
    return { code, message: raw, isFallbackable: true, reason: "missing_key" };
  }

  // Everything else is fatal — safety block, bad auth, malformed input, etc.
  return { code, message: raw, isFallbackable: false, reason: "fatal" };
}

// ---------------------------------------------------------------------------
// Timeout wrapper — uses Promise.race with a sentinel error
// ---------------------------------------------------------------------------

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer!: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`[timeout] ${label} did not respond within ${ms}ms`)),
      ms,
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// ---------------------------------------------------------------------------
// Sleep (backoff)
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Safe response parsing helpers
// ---------------------------------------------------------------------------

function extractContentText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map(item => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const text = (item as { text?: unknown }).text;
          return typeof text === "string" ? text : "";
        }
        return "";
      })
      .join("");
  }
  if (content && typeof content === "object") {
    const text = (content as { text?: unknown }).text;
    if (typeof text === "string") return text;
  }
  return "";
}

function normalizeUsage(raw: unknown): GenerationResult["usage"] | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const usage = raw as {
    prompt_tokens?: unknown;
    completion_tokens?: unknown;
    total_tokens?: unknown;
  };

  const promptTokens = typeof usage.prompt_tokens === "number" ? usage.prompt_tokens : undefined;
  const completionTokens = typeof usage.completion_tokens === "number" ? usage.completion_tokens : undefined;
  const totalTokens = typeof usage.total_tokens === "number" ? usage.total_tokens : undefined;

  if (promptTokens === undefined && completionTokens === undefined && totalTokens === undefined) {
    return undefined;
  }

  return {
    promptTokens,
    completionTokens,
    totalTokens,
  };
}

function normalizeOpenAIResponse(completion: unknown): { text: string; finishReason?: string; usage?: GenerationResult["usage"] } {
  if (!completion || typeof completion !== "object") {
    throw new Error("Provider returned an invalid completion payload.");
  }

  const payload = completion as {
    choices?: Array<{
      finish_reason?: string;
      message?: { content?: unknown };
    }>;
    usage?: unknown;
  };

  const firstChoice = payload.choices?.[0];
  const text = extractContentText(firstChoice?.message?.content);
  const finishReason = typeof firstChoice?.finish_reason === "string" ? firstChoice.finish_reason : undefined;

  return {
    text,
    finishReason,
    usage: normalizeUsage(payload.usage),
  };
}

// ---------------------------------------------------------------------------
// AgentRouter  (OpenAI-compatible)
// ---------------------------------------------------------------------------

async function runAgentRouter(
  params: GenerationParams,
  model: string,
): Promise<GenerationResult> {
  const client = getAgentRouterClient();
  const timeoutMs = params.isComplex ? TIMEOUT_COMPLEX_MS : TIMEOUT_STANDARD_MS;
  const start = Date.now();

  // Allow the operator to override the model via env var.
  const resolvedModel = process.env["AGENTROUTER_MODEL"] ?? model;

  logger.info(
    {
      requestId: params.requestId,
      provider: "agentrouter",
      model: resolvedModel,
      baseURL: process.env["AGENTROUTER_BASE_URL"] ?? "https://co.agentrouter.org/v1",
      timeoutMs,
      ts: new Date().toISOString(),
    },
    `[ai-service][${params.requestId}] AgentRouter request sent`,
  );

  const completion = await withTimeout(
    client.chat.completions.create({
      model: resolvedModel,
      messages: [{ role: "user", content: params.prompt }],
      max_tokens: params.maxOutputTokens,
    }),
    timeoutMs,
    `AgentRouter/${resolvedModel}`,
  );

  const normalized = normalizeOpenAIResponse(completion);

  logger.info(
    {
      requestId: params.requestId,
      provider: "agentrouter",
      model: resolvedModel,
      outputChars: normalized.text.length,
      finishReason: normalized.finishReason,
      ts: new Date().toISOString(),
    },
    `[ai-service][${params.requestId}] AgentRouter response received`,
  );
  return {
    text: normalized.text,
    provider: "agentrouter",
    model: resolvedModel,
    durationMs: Date.now() - start,
    finishReason: normalized.finishReason,
    usage: normalized.usage,
  };
}

// ---------------------------------------------------------------------------
// Gemini
// ---------------------------------------------------------------------------

let _geminiClient: GoogleGenAI | null = null;
let _geminiKey: string | null = null;

function getGeminiApiKey(): string {
  const key = process.env["GEMINI_API_KEY"] ?? process.env["GOOGLE_API_KEY"];
  if (!key) {
    throw new Error("GEMINI_API_KEY/GOOGLE_API_KEY is not set.");
  }
  return key;
}

function getGeminiClient(): GoogleGenAI {
  const key = getGeminiApiKey();
  if (_geminiClient && _geminiKey === key) return _geminiClient;
  _geminiClient = new GoogleGenAI({ apiKey: key });
  _geminiKey = key;
  return _geminiClient;
}

type GeminiChunk = {
  text?: unknown;
  candidates?: Array<{
    finishReason?: string;
    content?: { parts?: Array<{ text?: unknown }> };
  }>;
};

function extractGeminiText(chunk: GeminiChunk): string {
  if (typeof chunk.text === "string") return chunk.text;
  const parts = chunk.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts
    .map(p => (typeof p.text === "string" ? p.text : ""))
    .filter(Boolean)
    .join("");
}

async function runGemini(
  params: GenerationParams,
  model: string,
): Promise<GenerationResult> {
  const ai = getGeminiClient();
  const timeoutMs = params.isComplex ? TIMEOUT_COMPLEX_MS : TIMEOUT_STANDARD_MS;
  const start = Date.now();

  // Wrap the ENTIRE operation (stream acquisition + chunk iteration) in a
  // single timeout. The previous approach only timed out stream acquisition —
  // if the stream stalled mid-way after the first chunk arrived, the timeout
  // would never fire and the request could hang indefinitely.
  const result = await withTimeout(
    (async () => {
      const stream = await ai.models.generateContentStream({
        model,
        contents: params.prompt,
        config: {
          maxOutputTokens: params.maxOutputTokens,
          // Disable internal reasoning/thinking — these tools are
          // structured prompt→output tasks; thinking adds latency with no gain.
          thinkingConfig: { thinkingBudget: 0 },
        },
      });

      let text = "";
      let finishReason: string | undefined;

      for await (const chunk of stream) {
        text += extractGeminiText(chunk as GeminiChunk);
        const fr = (chunk as GeminiChunk).candidates?.[0]?.finishReason;
        if (fr) finishReason = fr;
      }

      return { text, finishReason };
    })(),
    timeoutMs,
    `Gemini/${model}`,
  );

  return {
    text: result.text,
    provider: "gemini",
    model,
    durationMs: Date.now() - start,
    finishReason: result.finishReason,
  };
}

// ---------------------------------------------------------------------------
// Groq
// ---------------------------------------------------------------------------

async function runGroq(
  params: GenerationParams,
  model: string,
): Promise<GenerationResult> {
  const groq = getGroqClient();
  const timeoutMs = params.isComplex ? TIMEOUT_COMPLEX_MS : TIMEOUT_STANDARD_MS;
  const start = Date.now();

  logger.info(
    {
      requestId: params.requestId,
      provider: "groq",
      model,
      timeoutMs,
      ts: new Date().toISOString(),
    },
    `[ai-service][${params.requestId}] Groq request sent`,
  );

  const completion = await withTimeout(
    groq.chat.completions.create({
      model,
      messages: [{ role: "user", content: params.prompt }],
      max_tokens: params.maxOutputTokens,
    }),
    timeoutMs,
    `Groq/${model}`,
  );

  const normalized = normalizeOpenAIResponse(completion);

  logger.info(
    {
      requestId: params.requestId,
      provider: "groq",
      model,
      outputChars: normalized.text.length,
      finishReason: normalized.finishReason,
      ts: new Date().toISOString(),
    },
    `[ai-service][${params.requestId}] Groq response received`,
  );
  return {
    text: normalized.text,
    provider: "groq",
    model,
    durationMs: Date.now() - start,
    finishReason: normalized.finishReason,
    usage: normalized.usage,
  };
}

// ---------------------------------------------------------------------------
// OpenRouter
// ---------------------------------------------------------------------------

async function runOpenRouter(
  params: GenerationParams,
  model: string,
): Promise<GenerationResult> {
  const client = getOpenRouterClient();
  const timeoutMs = params.isComplex ? TIMEOUT_COMPLEX_MS : TIMEOUT_STANDARD_MS;
  const start = Date.now();

  logger.info(
    {
      requestId: params.requestId,
      provider: "openrouter",
      model,
      timeoutMs,
      ts: new Date().toISOString(),
    },
    `[ai-service][${params.requestId}] OpenRouter request sent`,
  );

  const completion = await withTimeout(
    client.chat.completions.create({
      model,
      messages: [{ role: "user", content: params.prompt }],
      max_tokens: params.maxOutputTokens,
    }),
    timeoutMs,
    `OpenRouter/${model}`,
  );

  const normalized = normalizeOpenAIResponse(completion);

  logger.info(
    {
      requestId: params.requestId,
      provider: "openrouter",
      model,
      outputChars: normalized.text.length,
      finishReason: normalized.finishReason,
      ts: new Date().toISOString(),
    },
    `[ai-service][${params.requestId}] OpenRouter response received`,
  );
  return {
    text: normalized.text,
    provider: "openrouter",
    model,
    durationMs: Date.now() - start,
    finishReason: normalized.finishReason,
    usage: normalized.usage,
  };
}

// ---------------------------------------------------------------------------
// Provider chain
// ---------------------------------------------------------------------------

interface ProviderDef {
  name: string;
  model: string;
  hasKey: () => boolean;
  run: (params: GenerationParams, model: string) => Promise<GenerationResult>;
}

function buildChain(isComplex: boolean): ProviderDef[] {
  const tier = isComplex ? "complex" : "standard";
  return [
    // AgentRouter is PRIMARY — tried first on every request.
    {
      name:   "agentrouter",
      model:  PROVIDER_MODELS.agentrouter[tier],
      hasKey: () => Boolean(process.env["AGENTROUTER_API_KEY"]),
      run:    runAgentRouter,
    },
    {
      name:   "gemini",
      model:  PROVIDER_MODELS.gemini[tier],
      hasKey: () => Boolean(process.env["GEMINI_API_KEY"] ?? process.env["GOOGLE_API_KEY"]),
      run:    runGemini,
    },
    {
      name:   "groq",
      model:  PROVIDER_MODELS.groq[tier],
      hasKey: () => Boolean(process.env["GROQ_API_KEY"]),
      run:    runGroq,
    },
    {
      name:   "openrouter",
      model:  PROVIDER_MODELS.openrouter[tier],
      hasKey: () => Boolean(process.env["OPENROUTER_API_KEY"]),
      run:    runOpenRouter,
    },
  ];
}

// ---------------------------------------------------------------------------
// Retry config
// ---------------------------------------------------------------------------

/** Error reasons that warrant a single within-provider retry before moving on. */
const RETRYABLE_REASONS = new Set(["network", "server_error"]);
const MAX_RETRIES_PER_PROVIDER = 1;

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Generate text using the best available provider.
 *
 * Tries AgentRouter → Gemini → Groq → OpenRouter in order. Throws only when
 * all providers are exhausted or a fatal (non-fallbackable) error occurs.
 */
export async function generateText(params: GenerationParams): Promise<GenerationOutput> {
  const chain   = buildChain(params.isComplex);
  const attempts: ProviderAttempt[] = [];

  for (const provider of chain) {
    // Skip providers with no key configured
    if (!provider.hasKey()) {
      logger.info(
        {
          requestId: params.requestId,
          provider:  provider.name,
          model:     provider.model,
          reason:    "missing_key",
        },
        `[ai-service][${params.requestId}] ${provider.name} skipped — API key not configured`,
      );
      attempts.push({
        provider: provider.name,
        model:    provider.model,
        durationMs:    0,
        succeeded:     false,
        fallbackReason: "missing_key",
      });
      continue;
    }

    let retryCount = 0;

    while (retryCount <= MAX_RETRIES_PER_PROVIDER) {
      const attemptStart = Date.now();

      if (retryCount > 0) {
        const backoffMs = 200 * Math.pow(2, retryCount - 1);
        logger.info(
          {
            requestId: params.requestId,
            provider:  provider.name,
            retryCount,
            backoffMs,
          },
          `[ai-service][${params.requestId}] ${provider.name} retry #${retryCount} in ${backoffMs}ms`,
        );
        await sleep(backoffMs);
      }

      logger.info(
        {
          requestId:       params.requestId,
          provider:        provider.name,
          model:           provider.model,
          toolId:          params.toolId,
          maxOutputTokens: params.maxOutputTokens,
          isComplex:       params.isComplex,
          retryCount,
          ts:              new Date().toISOString(),
        },
        `[ai-service][${params.requestId}] → ${provider.name}/${provider.model} (attempt ${retryCount + 1})`,
      );

      try {
        const result = await provider.run(params, provider.model);

        logger.info(
          {
            requestId:   params.requestId,
            provider:    result.provider,
            model:       result.model,
            toolId:      params.toolId,
            durationMs:  result.durationMs,
            outputChars: result.text.length,
            finishReason: result.finishReason,
            usage:       result.usage,
            ts:          new Date().toISOString(),
          },
          `[ai-service][${params.requestId}] ✓ ${result.provider}/${result.model} in ${result.durationMs}ms`,
        );

        attempts.push({
          provider:  provider.name,
          model:     provider.model,
          durationMs: Date.now() - attemptStart,
          succeeded: true,
        });

        return { result, attempts };

      } catch (err) {
        const meta      = classifyError(err);
        const durationMs = Date.now() - attemptStart;
        const sdkDetails = extractProviderErrorDetails(err);

        logger.warn(
          {
            requestId:      params.requestId,
            provider:       provider.name,
            model:          provider.model,
            toolId:         params.toolId,
            retryCount,
            errorCode:      meta.code,
            errorMessage:   meta.message,
            fallbackReason: meta.reason,
            isFallbackable: meta.isFallbackable,
            durationMs,
            // Full SDK error details — visible in Render logs even when
            // the classified message is a truncated excerpt.
            errorName:         sdkDetails.errorName,
            stack:             sdkDetails.stack,
            sdkStatus:         sdkDetails.sdkStatus,
            sdkResponseBody:   sdkDetails.sdkResponseBody,
            sdkHeaders:        sdkDetails.sdkHeaders,
            ts:             new Date().toISOString(),
          },
          `[ai-service][${params.requestId}] ✗ ${provider.name}/${provider.model} — ${meta.reason}: ${meta.message.slice(0, 120)}`,
        );

        // Fatal — abort the entire chain
        if (!meta.isFallbackable) {
          logger.error(
            {
              requestId:       params.requestId,
              provider:        provider.name,
              errorMessage:    meta.message,
              // Full details repeated at error level so fatal failures are
              // always identifiable without cross-referencing the warn above.
              errorName:       sdkDetails.errorName,
              stack:           sdkDetails.stack,
              sdkStatus:       sdkDetails.sdkStatus,
              sdkResponseBody: sdkDetails.sdkResponseBody,
            },
            `[ai-service][${params.requestId}] fatal error from ${provider.name} — aborting chain`,
          );
          attempts.push({
            provider:       provider.name,
            model:          provider.model,
            durationMs,
            succeeded:      false,
            fallbackReason: meta.reason,
            errorCode:      meta.code,
            errorMessage:   meta.message,
          });
          throw err;
        }

        // Retry within this provider for transient errors only
        if (RETRYABLE_REASONS.has(meta.reason) && retryCount < MAX_RETRIES_PER_PROVIDER) {
          retryCount++;
          continue;
        }

        // Fallbackable but not retryable — move to next provider
        attempts.push({
          provider:       provider.name,
          model:          provider.model,
          durationMs,
          succeeded:      false,
          fallbackReason: meta.reason,
          errorCode:      meta.code,
          errorMessage:   meta.message,
        });
        break;
      }
    }
  }

  // All providers exhausted
  const summary = attempts
    .map(a => `${a.provider}/${a.model}(${a.fallbackReason ?? "ok"})`)
    .join(" → ");

  logger.error(
    { requestId: params.requestId, toolId: params.toolId, attempts },
    `[ai-service][${params.requestId}] all providers exhausted: ${summary}`,
  );

  throw new Error(
    "All AI providers are currently unavailable. Please try again in a moment.",
  );
}
