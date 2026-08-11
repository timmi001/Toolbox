/**
 * AI provider client singletons for AgentRouter, Groq, and OpenRouter.
 *
 * Each getter is lazy: the client is created on first use and reused
 * across requests. This mirrors the Gemini singleton pattern in
 * routes/ai.ts.
 *
 * Usage (future fallback logic):
 *
 *   import { getAgentRouterClient, getGroqClient, getOpenRouterClient } from "../lib/ai-providers";
 *
 * Environment variables:
 *   AGENTROUTER_API_KEY — AgentRouter API key (primary provider)
 *   GROQ_API_KEY        — Groq Cloud API key
 *   OPENROUTER_API_KEY  — OpenRouter API key
 */

import Groq from "groq-sdk";
import OpenAI from "openai";
import { logger } from "./logger";

function normalizeApiKey(rawKey: string | undefined): string {
  if (!rawKey) return "";
  let key = rawKey.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }
  return key;
}

function summarizeApiKey(key: string): { keyExists: boolean; keyLength: number; preview: string } {
  const normalized = key ?? "";
  return {
    keyExists: normalized.length > 0,
    keyLength: normalized.length,
    preview:
      normalized.length > 10
        ? `${normalized.slice(0, 6)}****${normalized.slice(-4)}`
        : normalized,
  };
}

// ---------------------------------------------------------------------------
// AgentRouter  (OpenAI-compatible API)
// ---------------------------------------------------------------------------

let _agentRouterClient: OpenAI | null = null;
let _agentRouterKey: string | null = null;

/**
 * Returns a cached AgentRouter client (OpenAI SDK pointed at the correct
 * OpenAI-compatible AgentRouter endpoint: https://co.agentrouter.org/v1).
 * Throws if AGENTROUTER_API_KEY is not set in the environment.
 */
export function getAgentRouterClient(): OpenAI {
  const rawKey = process.env["AGENTROUTER_API_KEY"];
  const key = normalizeApiKey(rawKey);
  const baseURL = process.env["AGENTROUTER_BASE_URL"]?.trim() || "https://co.agentrouter.org/v1";
  const summary = summarizeApiKey(key);

  logger.info(
    {
      provider: "agentrouter",
      keyExists: summary.keyExists,
      keyLength: summary.keyLength,
      preview: summary.preview,
      baseURL,
      ts: new Date().toISOString(),
    },
    "[ai-providers] AgentRouter API key summary",
  );

  if (!key) {
    throw new Error(
      "AGENTROUTER_API_KEY is not set. Add it to your environment secrets before using the AgentRouter provider."
    );
  }

  if (_agentRouterClient && _agentRouterKey === key) {
    return _agentRouterClient;
  }

  _agentRouterClient = new OpenAI({
    apiKey: key,
    baseURL,
  });
  _agentRouterKey = key;
  return _agentRouterClient;
}

// ---------------------------------------------------------------------------
// Groq
// ---------------------------------------------------------------------------

let _groqClient: Groq | null = null;
let _groqKey: string | null = null;

/**
 * Returns a cached Groq client.
 * Throws if GROQ_API_KEY is not set in the environment.
 */
export function getGroqClient(): Groq {
  const rawKey = process.env["GROQ_API_KEY"];
  const key = normalizeApiKey(rawKey);
  if (!key) {
    throw new Error(
      "GROQ_API_KEY is not set. Add it to your environment secrets before using the Groq provider."
    );
  }
  if (_groqClient && _groqKey === key) {
    return _groqClient;
  }
  _groqClient = new Groq({ apiKey: key });
  _groqKey = key;
  return _groqClient;
}

// ---------------------------------------------------------------------------
// OpenRouter  (OpenAI-compatible API)
// ---------------------------------------------------------------------------

let _openRouterClient: OpenAI | null = null;
let _openRouterKey: string | null = null;

/**
 * Returns a cached OpenRouter client (OpenAI SDK pointed at openrouter.ai).
 * Throws if OPENROUTER_API_KEY is not set in the environment.
 */
export function getOpenRouterClient(): OpenAI {
  const rawKey = process.env["OPENROUTER_API_KEY"];
  const key = normalizeApiKey(rawKey);
  if (!key) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Add it to your environment secrets before using the OpenRouter provider."
    );
  }
  if (_openRouterClient && _openRouterKey === key) {
    return _openRouterClient;
  }
  _openRouterClient = new OpenAI({
    apiKey: key,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      // OpenRouter recommends identifying your app in these headers.
      "HTTP-Referer": process.env["PUBLIC_SITE_URL"] ?? "https://toolbuxx.site",
      "X-Title": "ToolboXX",
    },
  });
  _openRouterKey = key;
  return _openRouterClient;
}
