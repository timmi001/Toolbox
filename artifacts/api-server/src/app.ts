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
//   1. Add toolboxx.site (www + apex) to the hard-coded default list so the
//      production frontend works without any environment variable being set.
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
];

const DEV_ORIGINS: (string | RegExp)[] = [
  /^https?:\/\/localhost(:\d+)?$/,
  /\.replit\.dev$/,
  /\.repl\.co$/,
];

const ALLOWED_ORIGINS: (string | RegExp)[] = process.env["ALLOWED_ORIGINS"]
  ? process.env["ALLOWED_ORIGINS"].split(",").map((o) => o.trim())
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

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
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const status = (err && typeof err === "object" && "status" in err && typeof (err as { status: unknown }).status === "number")
    ? (err as { status: number }).status
    : 500;
  const message =
    err instanceof Error ? err.message : "An unexpected error occurred.";

  logger.error({ err, status }, "Unhandled Express error");

  if (!res.headersSent) {
    res.status(status).json({ error: process.env["NODE_ENV"] === "production" ? "Internal server error." : message });
  }
});

export default app;
