import { Router } from "express";

const router = Router();

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
