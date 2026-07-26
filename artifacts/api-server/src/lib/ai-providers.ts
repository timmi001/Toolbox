/**
 * AI provider client singletons for Groq and OpenRouter.
 *
 * Each getter is lazy: the client is created on first use and reused
 * across requests. This mirrors the Gemini singleton pattern in
 * routes/ai.ts.
 *
 * Usage (future fallback logic):
 *
 *   import { getGroqClient, getOpenRouterClient } from "../lib/ai-providers";
 *
 *   const groq = getGroqClient();
 *   const openrouter = getOpenRouterClient();
 *
 * Environment variables:
 *   GROQ_API_KEY        — Groq Cloud API key
 *   OPENROUTER_API_KEY  — OpenRouter API key
 */

import Groq from "groq-sdk";
import OpenAI from "openai";

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
  const key = process.env["GROQ_API_KEY"];
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
  const key = process.env["OPENROUTER_API_KEY"];
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
      "HTTP-Referer": process.env["PUBLIC_SITE_URL"] ?? "https://toolboxx.site",
      "X-Title": "ToolboXX",
    },
  });
  _openRouterKey = key;
  return _openRouterClient;
}
