import app from "./app";
import { logger } from "./lib/logger";
import { validateGeminiEnv } from "./lib/ai-service";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

async function logDownloaderDiagnostics(): Promise<void> {
  const versionOf = async (command: string, args: string[]): Promise<string> => {
    try {
      const { stdout } = await execFileAsync(command, args, { timeout: 10_000 });
      return stdout.trim().split(/\r?\n/)[0] || "unknown";
    } catch (error) {
      return `unavailable (${error instanceof Error ? error.message : String(error)})`;
    }
  };

  const [ytDlpVersion, ytDlpPath, ffmpegVersion, ffmpegPath] = await Promise.all([
    versionOf("yt-dlp", ["--version"]),
    versionOf("sh", ["-c", "command -v yt-dlp"]),
    versionOf("ffmpeg", ["-version"]),
    versionOf("sh", ["-c", "command -v ffmpeg"]),
  ]);

  logger.info(
    {
      ytDlpVersion,
      ytDlpExecutablePath: ytDlpPath,
      ffmpegVersion,
      ffmpegExecutablePath: ffmpegPath,
      nodeVersion: process.version,
    },
    "Downloader runtime diagnostics",
  );
}

// Validate Gemini only when a Gemini-style key is actually configured.
// This avoids preventing AgentRouter-only deployments from starting.
if (process.env["GEMINI_API_KEY"] || process.env["GOOGLE_API_KEY"]) {
  validateGeminiEnv();
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
  logger.error(
    { configured: 0, required: AI_KEYS.length },
    "No AI provider keys are configured — every /ai/generate request will fail. " +
      "Set at least one of: AGENTROUTER_API_KEY, GEMINI_API_KEY (or GOOGLE_API_KEY), GROQ_API_KEY, OPENROUTER_API_KEY.",
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
      { configured: configuredProviders.length, missing: missingProviders.map(k => k.label) },
      "Some AI provider keys are not configured — they will be skipped in the fallback chain.",
    );
  } else {
    logger.info(
      { configured: configuredProviders.map(k => k.label) },
      "All AI provider keys are configured.",
    );
  }
}

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

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
  void logDownloaderDiagnostics();
});

server.on("error", (err) => {
  logger.error({ err }, "Failed to bind server — exiting");
  process.exit(1);
});
