import app from "./app";
import { logger } from "./lib/logger";
import { validateGeminiEnv, validateAgentRouterEnv } from "./lib/ai-service";

// Validate configured providers early so bad credentials fail loudly in logs,
// but do not crash the server when the app is intentionally running in local
// demo mode without any external AI credentials. This keeps the app usable in
// development and staging while still surfacing misconfigurations.
if (process.env["AGENTROUTER_API_KEY"]) {
  try {
    validateAgentRouterEnv();
  } catch (err) {
    logger.error(
      { error: err instanceof Error ? err.message : String(err) },
      "AgentRouter validation failed — this is the PRIMARY AI provider",
    );
    throw err;
  }
}

if (process.env["GEMINI_API_KEY"] || process.env["GOOGLE_API_KEY"]) {
  try {
    validateGeminiEnv();
  } catch (err) {
    logger.error(
      { error: err instanceof Error ? err.message : String(err) },
      "Gemini validation failed",
    );
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Startup — warn early when AI provider keys are absent so the failure mode
// is visible in the deploy log rather than only surfacing at request time.
// ---------------------------------------------------------------------------
const AI_KEYS = [
  { name: "AGENTROUTER_API_KEY", label: "AgentRouter (primary)" },
  { name: "GEMINI_API_KEY",      label: "Gemini (fallback #1)" },
  { name: "GROQ_API_KEY",        label: "Groq (fallback #2)" },
  { name: "OPENROUTER_API_KEY",  label: "OpenRouter (fallback #3)" },
];

// Also accept GOOGLE_API_KEY as an alias for GEMINI_API_KEY.
const configuredProviders = AI_KEYS.filter(({ name }) => {
  if (name === "GEMINI_API_KEY") {
    return Boolean(process.env["GEMINI_API_KEY"] ?? process.env["GOOGLE_API_KEY"]);
  }
  return Boolean(process.env[name]);
});

if (configuredProviders.length === 0) {
  logger.warn(
    { configured: 0, required: AI_KEYS.length },
    "No AI provider keys are configured — app will run in demo-safe mode and return generated local responses instead of failing. " +
      "Configure AGENTROUTER_API_KEY (primary) or fallback keys for live AI responses.",
  );
} else {
  const missingProviders = AI_KEYS.filter(({ name }) => {
    if (name === "GEMINI_API_KEY") {
      return !Boolean(process.env["GEMINI_API_KEY"] ?? process.env["GOOGLE_API_KEY"]);
    }
    return !Boolean(process.env[name]);
  });

  if (missingProviders.length > 0) {
    logger.warn(
      {
        configured: configuredProviders.length,
        missing: missingProviders.map(k => k.label),
        fallbackChain: ["AgentRouter", "Gemini", "Groq", "OpenRouter"],
      },
      "Some AI provider keys are not configured — they will be skipped in the fallback chain.",
    );
  } else {
    logger.info(
      { configured: configuredProviders.map(k => k.label) },
      "All AI provider keys are configured — full fallback chain available.",
    );
  }
}

const rawPort = process.env["PORT"] ?? "3000";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// In Node.js, the listen() callback fires on the 'listening' event and NEVER
// receives an error argument — port-in-use / bind failures are emitted as
// 'error' events on the server object. Attaching a listener for that event
// prevents Node's uncaughtException default (which logs nothing useful) and
// ensures startup failures are captured in the Pino log before process exit.
const server = app.listen(port, () => {
  logger.info({ port }, "Server listening");
});

server.on("error", (err) => {
  logger.error({ err }, "Failed to bind server — exiting");
  process.exit(1);
});
