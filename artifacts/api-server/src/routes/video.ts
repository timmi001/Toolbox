import { Router, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";

const router = Router();
const videoLimiter = rateLimit({
  windowMs: 60_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many download requests. Please try again shortly." },
});

type Platform = "youtube" | "facebook" | "instagram" | "twitter" | "tiktok" | "pinterest" | "reddit";

const PLATFORM_HOSTS: Record<Platform, string[]> = {
  youtube: ["youtube.com", "youtu.be"],
  facebook: ["facebook.com", "fb.watch"],
  instagram: ["instagram.com"],
  twitter: ["twitter.com", "x.com"],
  tiktok: ["tiktok.com"],
  pinterest: ["pinterest.com", "pin.it"],
  reddit: ["reddit.com", "redd.it"],
};

function isPlatform(value: unknown): value is Platform {
  return typeof value === "string" && Object.hasOwn(PLATFORM_HOSTS, value);
}

function validateSource(value: unknown, platform: Platform): string | null {
  if (typeof value !== "string" || !value.trim()) return "A video URL is required.";
  let parsed: URL;
  try {
    parsed = new URL(value.trim());
  } catch {
    return "That doesn't look like a valid URL.";
  }
  if (!/^https?:$/.test(parsed.protocol)) return "Only http(s) video links are supported.";
  const hostname = parsed.hostname.toLowerCase();
  if (!PLATFORM_HOSTS[platform].some((host) => hostname === host || hostname.endsWith(`.${host}`))) {
    return `That link doesn't look like a valid ${platform} URL.`;
  }
  return null;
}

function providerUnavailable(res: Response) {
  res.status(503).json({
    error: "Video download provider is not configured yet.",
    reason: "provider_unavailable",
  });
}

function validateRequest(body: Record<string, unknown>) {
  const { url, platform } = body;
  if (!isPlatform(platform)) return "Unsupported or unknown platform.";
  return validateSource(url, platform) ?? null;
}

// Kept stable for the frontend and for the future Cobalt adapter.
router.post("/video/info", videoLimiter, (req, res) => {
  const error = validateRequest(req.body as Record<string, unknown>);
  if (error) {
    res.status(400).json({ error });
    return;
  }
  providerUnavailable(res);
});

function streamRequest(req: Request, res: Response) {
  const input = req.method === "POST" ? req.body : req.query;
  const body = input as Record<string, unknown>;
  const error = validateRequest(body);
  if (error) {
    res.status(400).json({ error });
    return;
  }
  if (typeof body.format !== "string" || !/^[\w.-]+$/.test(body.format)) {
    res.status(400).json({ error: "A valid format selection is required." });
    return;
  }
  providerUnavailable(res);
}

router.get("/video/stream", videoLimiter, streamRequest);
router.post("/video/download", videoLimiter, streamRequest);
router.get("/video/audio", videoLimiter, (req, res) => {
  const error = validateRequest(req.query as Record<string, unknown>);
  if (error) {
    res.status(400).json({ error });
    return;
  }
  providerUnavailable(res);
});

export default router;
