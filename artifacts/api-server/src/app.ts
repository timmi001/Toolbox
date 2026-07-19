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

// CORS: allow same-origin and, in development, the Vite dev server.
// A wildcard '*' was the previous config — it allowed any website to trigger
// cross-origin requests against /video/stream (binary data) and the AI routes.
const ALLOWED_ORIGINS = process.env["ALLOWED_ORIGINS"]
  ? process.env["ALLOWED_ORIGINS"].split(",").map((o) => o.trim())
  : [/^https?:\/\/localhost(:\d+)?$/, /\.replit\.dev$/, /\.repl\.co$/];

app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  }),
);

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
