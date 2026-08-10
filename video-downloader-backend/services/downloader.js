const { Readable } = require('node:stream');

const COBALT_API_URL = (process.env['COBALT_API_URL'] ?? '').trim().replace(/\/$/, '');
const COBALT_API_KEY = process.env['COBALT_API_KEY']?.trim();
const COBALT_TIMEOUT_MS = Number(process.env['COBALT_TIMEOUT_MS'] ?? 120_000);

function createError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function requireCobaltConfigured() {
  if (!COBALT_API_URL) {
    throw createError('Cobalt provider is not configured.', 503, 'DOWNLOADER_PROVIDER_UNAVAILABLE');
  }

  try {
    const parsed = new URL(`${COBALT_API_URL}/`);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new Error();
  } catch {
    throw createError('Cobalt API URL is invalid.', 503, 'DOWNLOADER_PROVIDER_CONFIGURATION');
  }
}

function cobaltHeaders() {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(COBALT_API_KEY ? { Authorization: `Api-Key ${COBALT_API_KEY}` } : {}),
  };
}

function messageForStatus(status, code) {
  if (status === 401 || status === 403) return 'The video provider rejected the downloader authorization.';
  if (status === 429) return 'The video provider is rate-limiting requests. Please try again later.';
  if (status >= 500) return 'The video provider is temporarily unavailable.';
  if (code?.toString().toLowerCase().includes('invalid')) return 'Invalid or unsupported video URL.';
  return 'The video provider could not process this URL.';
}

function filenameFromResult(result, fallback = 'video.mp4') {
  return (result.filename ?? result.output?.filename ?? fallback)
    .replace(/[^a-z0-9._ -]/gi, '')
    .trim()
    .slice(0, 120) || fallback;
}

function firstMediaUrl(result) {
  return result.url ?? result.tunnel?.[0] ?? result.picker?.[0]?.url;
}

function qualityFromFormat(format) {
  if (typeof format !== 'string') return '1080';
  const match = format.match(/(?:cobalt-)?(4320|2160|1440|1080|720|480|360|240|144)/);
  return (match?.[1] ?? '1080');
}

function cobaltPayload(url, audio = false, quality = '1080') {
  return {
    url,
    downloadMode: audio ? 'audio' : 'auto',
    videoQuality: audio ? undefined : quality,
    audioFormat: audio ? 'mp3' : undefined,
    audioBitrate: audio ? '128' : undefined,
    filenameStyle: 'basic',
    alwaysProxy: true,
  };
}

async function cobaltRequest(payload) {
  requireCobaltConfigured();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), COBALT_TIMEOUT_MS);

  try {
    const response = await fetch(`${COBALT_API_URL}/`, {
      method: 'POST',
      headers: cobaltHeaders(),
      body: JSON.stringify(payload),
      signal: controller.signal,
      redirect: 'manual',
    });

    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : undefined;
    } catch {
      throw createError('Cobalt returned an invalid response.', 502, 'MALFORMED_RESPONSE');
    }

    if (!response.ok || !data || data.status === 'error') {
      const code = data?.error?.code;
      const status = response.status === 429 ? 429 : response.status >= 500 ? 502 : 422;
      throw createError(messageForStatus(response.status, code), status, code ?? 'PROVIDER_ERROR');
    }

    return data;
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw createError('The video provider took too long to respond.', 504, 'TIMEOUT');
    }
    if (error?.statusCode) throw error;
    throw createError('The video provider could not be reached.', 503, 'PROVIDER_NETWORK');
  } finally {
    clearTimeout(timer);
  }
}

async function openCobaltTunnel(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), COBALT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: COBALT_API_KEY ? { Authorization: `Api-Key ${COBALT_API_KEY}` } : {},
      signal: controller.signal,
      redirect: 'follow',
    });

    if (!response.ok) {
      throw createError('Cobalt could not open the media tunnel.', response.status === 429 ? 429 : response.status >= 500 ? 502 : response.status, 'TUNNEL_ERROR');
    }

    return response;
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw createError('The media tunnel timed out.', 504, 'TIMEOUT');
    }
    if (error?.statusCode) throw error;
    throw createError('The media tunnel could not be reached.', 503, 'PROVIDER_NETWORK');
  } finally {
    clearTimeout(timer);
  }
}

function toNodeStream(body) {
  if (!body) {
    throw createError('Cobalt returned an empty media response.', 502, 'EMPTY_RESPONSE');
  }
  return Readable.fromWeb(body);
}

async function inspectUrl(url) {
  const result = await cobaltRequest(cobaltPayload(url, false, '1080'));
  const fileName = filenameFromResult(result, 'video.mp4');
  const ext = fileName.split('.').pop() || 'mp4';

  return {
    title: result.output?.metadata?.title ?? (fileName.replace(/\.[^.]+$/, '') || 'video'),
    thumbnail: result.picker?.[0]?.thumb,
    duration: null,
    formats: [
      {
        formatId: 'cobalt-1080',
        quality: 'Best available',
        ext,
        filesize: null,
        fileName,
      },
    ],
  };
}

async function downloadVideo(url, format = 'best') {
  const quality = qualityFromFormat(format);
  const result = await cobaltRequest(cobaltPayload(url, false, quality));
  const fileName = filenameFromResult(result, 'video.mp4');

  if (result.status === 'picker') {
    const mediaUrl = firstMediaUrl(result);
    if (!mediaUrl) throw createError('Cobalt returned no downloadable media.', 422, 'NO_MEDIA');
    return { direct: true, url: mediaUrl, fileName };
  }

  if (result.status === 'redirect') {
    if (!result.url) throw createError('Cobalt returned no download URL.', 502, 'MISSING_URL');
    return { direct: true, url: result.url, fileName };
  }

  const tunnelUrl = result.url ?? result.tunnel?.[0];
  if (!tunnelUrl) throw createError('Cobalt returned no media tunnel.', 502, 'MISSING_TUNNEL');

  const upstream = await openCobaltTunnel(tunnelUrl);
  return {
    stream: toNodeStream(upstream.body),
    contentType: upstream.headers.get('content-type') ?? 'video/mp4',
    fileName,
  };
}

async function downloadAudio(url, format = 'mp3') {
  const result = await cobaltRequest(cobaltPayload(url, true, '1080'));
  const fileName = filenameFromResult(result, 'audio.mp3').replace(/\.[^.]+$/, '.mp3');

  if (result.status === 'picker') {
    const mediaUrl = firstMediaUrl(result);
    if (!mediaUrl) throw createError('Cobalt returned no downloadable media.', 422, 'NO_MEDIA');
    return { direct: true, url: mediaUrl, fileName };
  }

  if (result.status === 'redirect') {
    if (!result.url) throw createError('Cobalt returned no download URL.', 502, 'MISSING_URL');
    return { direct: true, url: result.url, fileName };
  }

  const tunnelUrl = result.url ?? result.tunnel?.[0];
  if (!tunnelUrl) throw createError('Cobalt returned no media tunnel.', 502, 'MISSING_TUNNEL');

  const upstream = await openCobaltTunnel(tunnelUrl);
  return {
    stream: toNodeStream(upstream.body),
    contentType: upstream.headers.get('content-type') ?? 'audio/mpeg',
    fileName,
  };
}

async function verifyDependencies(options = {}) {
  const result = { ok: true, diagnostics: { node: process.version }, missing: [] };
  if (options.log) console.log(`[deps] Node version: ${result.diagnostics.node}`);
  return result;
}

module.exports = {
  inspectUrl,
  downloadVideo,
  downloadAudio,
  verifyDependencies,
};
