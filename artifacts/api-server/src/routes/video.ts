import { Router, type Response } from "express";
import rateLimit from "express-rate-limit";
import { CobaltError, openCobaltTunnel, requestCobalt, toNodeStream, type CobaltRequest, type CobaltResult } from "../lib/cobalt";

const router = Router();
const limiter = rateLimit({ windowMs: 60_000, max: 20, standardHeaders: true, legacyHeaders: false, message: { error: "Too many download requests. Please try again shortly." } });
type Platform = "youtube" | "facebook" | "instagram" | "twitter" | "tiktok" | "pinterest" | "reddit";
const HOSTS: Record<Platform, string[]> = { youtube: ["youtube.com", "youtu.be"], facebook: ["facebook.com", "fb.watch"], instagram: ["instagram.com"], twitter: ["twitter.com", "x.com"], tiktok: ["tiktok.com"], pinterest: ["pinterest.com", "pin.it"], reddit: ["reddit.com", "redd.it"] };

function isPlatform(value: unknown): value is Platform { return typeof value === "string" && Object.hasOwn(HOSTS, value); }
function validateUrl(value: unknown, platform: Platform) {
  if (typeof value !== "string" || !value.trim()) return "A video URL is required.";
  let parsed: URL;
  try { parsed = new URL(value.trim()); } catch { return "That doesn't look like a valid URL."; }
  if (!/^https?:$/.test(parsed.protocol)) return "Only http(s) video links are supported.";
  if (!HOSTS[platform].some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`))) return `That link doesn't look like a valid ${platform} URL.`;
  return null;
}
function requestError(error: unknown, res: Response) {
  if (error instanceof CobaltError) { res.status(error.statusCode).json({ error: error.message, reason: error.reason }); return; }
  res.status(502).json({ error: "The video provider returned an unexpected response.", reason: "provider_error" });
}
function requestBody(input: Record<string, unknown>) {
  const platform = input.platform;
  if (!isPlatform(platform)) return { error: "Unsupported or unknown platform." } as const;
  const error = validateUrl(input.url, platform);
  if (error) return { error } as const;
  return { platform, url: String(input.url).trim() } as const;
}
function qualityFromFormat(format: unknown): CobaltRequest["videoQuality"] {
  if (typeof format !== "string") return "1080";
  const match = format.match(/(?:cobalt-)?(4320|2160|1440|1080|720|480|360|240|144)/);
  return (match?.[1] as CobaltRequest["videoQuality"]) ?? "1080";
}
function cobaltPayload(input: Record<string, unknown>, audio = false): CobaltRequest {
  return { url: String(input.url).trim(), downloadMode: audio ? "audio" : "auto", videoQuality: qualityFromFormat(input.format), audioFormat: audio ? "mp3" : undefined, audioBitrate: audio ? "128" : undefined, filenameStyle: "basic", alwaysProxy: true };
}
function filename(result: CobaltResult, fallback = "video.mp4") { return (result.filename ?? result.output?.filename ?? fallback).replace(/[^a-z0-9._ -]/gi, "").trim().slice(0, 120) || fallback; }
function firstMediaUrl(result: CobaltResult) { return result.url ?? result.tunnel?.[0] ?? result.picker?.[0]?.url; }
function sendMetadata(result: CobaltResult, res: Response) {
  const media = result.picker?.[0]; const fileName = filename(result); const ext = fileName.split(".").pop() || "mp4";
  res.json({ title: result.output?.metadata?.title ?? (fileName.replace(/\.[^.]+$/, "") || "video"), thumbnail: media?.thumb, duration: null, formats: [{ formatId: "cobalt-1080", quality: "Best available", ext }] });
}
router.post("/video/info", limiter, async (req, res) => {
  const body = requestBody(req.body as Record<string, unknown>); if ("error" in body) { res.status(400).json(body); return; }
  try { console.info(`[cobalt] metadata request platform=${body.platform}`); sendMetadata(await requestCobalt({ ...cobaltPayload(body), videoQuality: "1080" }), res); } catch (error) { requestError(error, res); }
});
async function download(input: Record<string, unknown>, res: Response, audio = false) {
  const body = requestBody(input); if ("error" in body) { res.status(400).json(body); return; }
  try {
    console.info(`[cobalt] download request platform=${body.platform} audio=${audio}`);
    const result = await requestCobalt(cobaltPayload({ ...input, ...body }, audio));
    if (result.status === "picker") { const url = firstMediaUrl(result); if (!url) throw new CobaltError("Cobalt returned no downloadable media.", 422, "no_media"); res.redirect(302, url); return; }
    if (result.status === "redirect") { if (!result.url) throw new CobaltError("Cobalt returned no download URL.", 502, "missing_url"); res.redirect(302, result.url); return; }
    const tunnelUrl = result.url ?? result.tunnel?.[0]; if (!tunnelUrl) throw new CobaltError("Cobalt returned no media tunnel.", 502, "missing_tunnel");
    const upstream = await openCobaltTunnel(tunnelUrl); res.status(200); res.setHeader("Content-Type", upstream.headers.get("content-type") ?? (audio ? "audio/mpeg" : "video/mp4")); res.setHeader("Content-Disposition", `attachment; filename="${filename(result, audio ? "audio.mp3" : "video.mp4")}"`); res.setHeader("Cache-Control", "no-store");
    const length = upstream.headers.get("content-length"); if (length) res.setHeader("Content-Length", length); toNodeStream(upstream.body).pipe(res);
  } catch (error) { requestError(error, res); }
}
router.get("/video/stream", limiter, (req, res) => void download(req.query as Record<string, unknown>, res));
router.post("/video/download", limiter, (req, res) => void download(req.body as Record<string, unknown>, res));
router.get("/video/audio", limiter, (req, res) => void download({ ...(req.query as Record<string, unknown>), format: "cobalt-1080" }, res, true));
export default router;
