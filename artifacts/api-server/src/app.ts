import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Replit's shared proxy sits in front of this server and sets X-Forwarded-For,
// so express-rate-limit needs to trust it to key rate limits by real client IP.
app.set("trust proxy", 1);

// Security headers (helmet) and gzip compression — ported from the
// standalone video-downloader-backend and applied globally.
app.use(helmet());
app.use(compression());

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
          headers: {
            accept: req.headers.accept,
            origin: req.headers.origin,
          },
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// ---------------------------------------------------------------------------
// CORS
//
// Why the browser was blocking requests:
//   The default ALLOWED_ORIGINS list only contained localhost and *.replit.dev
//   patterns. The production frontend (https://www.toolboxx.site) was not in
//   that list, so Express never added an Access-Control-Allow-Origin header to
//   responses. Browsers enforce CORS strictly: a missing header is treated the
//   same as an explicit rejection.
//
// Fix:
//   1. Add toolboxx.site (www + apex) and the deployed Vercel frontend origin
//      to the hard-coded default list so the production frontend works without
//      any environment variable being set.
//   2. Expose ALLOWED_ORIGINS as an env var so operators can add more origins
//      (e.g. staging domains) without a code change.
//   3. Explicitly declare methods and allowedHeaders so preflight OPTIONS
//      requests receive a correct 204 response with all required headers.
//   4. Call app.options("*", cors(...)) BEFORE routes so Express handles
//      preflight before any route middleware can interfere.
// ---------------------------------------------------------------------------

const PRODUCTION_ORIGINS = [
  "https://www.toolboxx.site",
  "https://toolboxx.site",
  "https://toolbox-ashy-six.vercel.app",
];

const DEV_ORIGINS: (string | RegExp)[] = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/[^/]+\.vercel\.app$/,
  /\.replit\.dev$/,
  /\.repl\.co$/,
];

// When ALLOWED_ORIGINS is set, merge the operator-supplied strings WITH the
// built-in regex patterns so that setting this variable to add one new domain
// (e.g. a staging environment) does not accidentally drop localhost / vercel.app
// / replit.dev access that the RegExp patterns provide.
const ALLOWED_ORIGINS: (string | RegExp)[] = process.env["ALLOWED_ORIGINS"]
  ? [
      ...process.env["ALLOWED_ORIGINS"].split(",").map((o) => o.trim()),
      ...DEV_ORIGINS,
    ]
  : [...PRODUCTION_ORIGINS, ...DEV_ORIGINS];

const corsOptions: cors.CorsOptions = {
  origin: ALLOWED_ORIGINS,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204, // IE11 chokes on 200 for OPTIONS
};

// Handle preflight (OPTIONS) for every route before any other middleware runs.
// Express 5 uses path-to-regexp v8 which rejects bare "*" — use a named wildcard.
app.options("/{*path}", cors(corsOptions));

// Apply CORS headers to all actual requests.
app.use(cors(corsOptions));

// 2 MB covers the largest AI tool inputs (up to 20 000-char transcript/essay
// fields) while still rejecting obviously oversized payloads.
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Mount the router at /api for the Replit dev environment, where the shared
// proxy routes /<artifact-slug>/* so multiple services share one domain.
// Also mount at / (root) for standalone deployments such as Render, where
// the api-server is the only service and there is no proxy prefix — the
// frontend there sends to https://toolbox-iph5.onrender.com/ai/generate
// (no /api segment). Both mounts share the same router instance; Express
// matches routes in registration order and stops at the first hit.
app.use("/api", router);
app.use("/", router);

// ---------------------------------------------------------------------------
// 404 — no route matched. Without this Express returns its built-in HTML
// "Cannot GET /path" response, which breaks any JSON client expecting an error
// object. Must come after all routes but before the error handler.
// ---------------------------------------------------------------------------
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found." });
});

// ---------------------------------------------------------------------------
// Global error handler — MUST be the last middleware registered (four-argument
// signature is how Express 5 identifies it). Without this, Express falls back
// to its built-in HTML error renderer, so every unhandled async rejection in a
// route produces an HTML response body instead of the JSON the frontend expects.
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const status = (err && typeof err === "object" && "status" in err && typeof (err as { status: unknown }).status === "number")
    ? (err as { status: number }).status
    : 500;
  const message =
    err instanceof Error ? err.message : "An unexpected error occurred.";
  const stack = err instanceof Error ? err.stack : undefined;

  // Extract provider SDK fields if the error came from Groq/OpenAI/Gemini SDK.
  const sdkError = err && typeof err === "object" ? err as Record<string, unknown> : {};

  logger.error(
    {
      // Request context — makes it possible to correlate this log with the
      // pino-http "request errored" entry and the route's own error log.
      requestId:  (req as { id?: unknown }).id,
      route:      req.originalUrl,
      method:     req.method,
      // Log a sanitized body: present for AI/developer routes, omitted when
      // empty. Never include Authorization headers or cookie values.
      body: req.body && Object.keys(req.body as object).length > 0
        ? req.body
        : undefined,
      // Standard error fields
      status,
      message,
      stack,
      // SDK-specific fields (set when the error originates from a provider SDK)
      sdkStatus:       typeof sdkError["status"] === "number" ? sdkError["status"] : undefined,
      sdkResponseBody: sdkError["error"] ?? sdkError["response"] ?? sdkError["body"] ?? undefined,
    },
    "Unhandled Express error",
  );

  if (!res.headersSent) {
    res.status(status).json({
      success: false,
      message: process.env["NODE_ENV"] === "production" ? "Internal server error." : message,
      error: process.env["NODE_ENV"] === "production" ? undefined : message,
    });
  }
});

export default app;
