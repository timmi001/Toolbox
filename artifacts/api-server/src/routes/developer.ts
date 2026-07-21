import { Router } from "express";
import dns from "node:dns/promises";
import net from "node:net";

const router = Router();

// ---------------------------------------------------------------------------
// SSRF guard — block requests to loopback, private, link-local, and reserved
// address ranges. The /http-headers endpoint fetches arbitrary caller-supplied
// URLs, so without this check an attacker can probe the internal network
// (e.g. http://169.254.169.254 for cloud metadata, http://10.x.x.x services).
// ---------------------------------------------------------------------------
function isPrivateOrReserved(ip: string): boolean {
  // Normalise IPv4-mapped IPv6 (::ffff:x.x.x.x) to plain IPv4
  const addr = ip.startsWith("::ffff:") ? ip.slice(7) : ip;

  if (net.isIPv4(addr)) {
    const parts = addr.split(".").map(Number);
    const [a, b] = parts;
    return (
      a === 10 ||                          // 10.0.0.0/8
      (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
      (a === 192 && b === 168) ||          // 192.168.0.0/16
      a === 127 ||                         // 127.0.0.0/8 loopback
      (a === 169 && b === 254) ||          // 169.254.0.0/16 link-local (AWS metadata etc.)
      a === 0 ||                           // 0.0.0.0/8
      a >= 224                             // multicast + reserved (224–255)
    );
  }

  if (net.isIPv6(addr)) {
    const lo = addr.toLowerCase();
    return (
      lo === "::1" ||          // IPv6 loopback
      lo.startsWith("fc") ||   // Unique local (fc00::/7)
      lo.startsWith("fd") ||
      lo.startsWith("fe80")    // Link-local (fe80::/10)
    );
  }

  return true; // Fail closed on anything unrecognised
}

async function resolvesSafeAddress(hostname: string): Promise<boolean> {
  try {
    const result = await dns.lookup(hostname, { all: true });
    return result.every((r) => !isPrivateOrReserved(r.address));
  } catch {
    return false; // DNS failure — block rather than proceed
  }
}

// ---------------------------------------------------------------------------
// POST /api/http-headers
// Fetches HTTP response headers for a given URL server-side (bypasses browser
// CORS restrictions) and returns status + headers as JSON.
// ---------------------------------------------------------------------------
router.post("/http-headers", async (req, res) => {
  const { url } = req.body as { url?: unknown };

  if (typeof url !== "string" || !url.trim()) {
    res.status(400).json({ error: "url is required." });
    return;
  }

  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    res.status(400).json({ error: "Invalid URL." });
    return;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    res.status(400).json({ error: "Only http and https URLs are supported." });
    return;
  }

  // SSRF: resolve the hostname and reject any private/internal address before
  // making the outbound request. This runs after protocol validation so we
  // only DNS-resolve http(s) hostnames.
  const isSafe = await resolvesSafeAddress(parsed.hostname);
  if (!isSafe) {
    res.status(400).json({ error: "Requests to private or internal addresses are not allowed." });
    return;
  }

  try {
    const response = await fetch(parsed.href, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(10_000),
    });

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    res.json({
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (err) {
    const message =
      err instanceof Error && err.name === "TimeoutError"
        ? "Request timed out."
        : "Failed to reach the URL.";
    res.status(502).json({ error: message });
  }
});

export default router;
