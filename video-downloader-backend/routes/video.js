const express = require('express');
const path = require('path');
const { validateUrl } = require('../utils/validator');
const { inspectUrl, downloadVideo, downloadAudio } = require('../services/downloader');

const router = express.Router();

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mkv': 'video/x-matroska',
    '.m4a': 'audio/mp4',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * POST /api/video/download
 * Fetch video metadata (title, duration, formats) from a URL.
 * Frontend calls this first to populate format options.
 */
router.post('/download', async (req, res, next) => {
  try {
    const { url, platform } = req.body;
    console.log(`[video][download] url=${url} platform=${platform}`);

    if (!url || typeof url !== 'string') {
      console.warn('[video][download] missing or invalid url parameter');
      return res.status(400).json({ error: 'URL is required.' });
    }

    if (!validateUrl(url)) {
      console.warn(`[video][download] url validation failed: ${url}`);
      return res.status(400).json({ error: 'Invalid URL.' });
    }

    if (platform && !['youtube', 'facebook', 'instagram', 'twitter', 'tiktok', 'pinterest', 'reddit'].includes(platform)) {
      console.warn(`[video][download] invalid platform: ${platform}`);
      return res.status(400).json({ error: 'Invalid platform.' });
    }

    console.log(`[video][download] calling inspectUrl for ${platform}:${url}`);
    const info = await inspectUrl(url);
    console.log(`[video][download] success: title=${info.title}, formats=${info.formats.length}`);

    // Transform formats to match frontend expectations
    const formats = info.formats.map((fmt) => ({
      formatId: fmt.formatId || 'best',
      quality: fmt.quality || 'unknown',
      ext: fmt.ext || 'mp4',
      filesize: fmt.filesize,
    }));

    res.json({
      title: info.title,
      thumbnail: info.thumbnail,
      duration: info.duration,
      formats,
    });
  } catch (error) {
    console.error(`[video][download] error: ${error.message}`);
    next(error);
  }
});

/**
 * GET /api/video/stream?src=...&platform=...&format=...&ext=...&title=...
 * Download the actual video file with the specified format.
 * Frontend uses this as the href for the download link.
 */
router.get('/stream', async (req, res, next) => {
  try {
    const { src: sourceUrl, platform, format, ext, title } = req.query;
    console.log(`[video][stream] sourceUrl=${sourceUrl} platform=${platform} format=${format} ext=${ext} title=${title}`);

    if (!sourceUrl || typeof sourceUrl !== 'string') {
      console.warn('[video][stream] missing or invalid src query parameter');
      return res.status(400).json({ error: 'src parameter is required.' });
    }

    if (!format || typeof format !== 'string') {
      console.warn('[video][stream] missing or invalid format query parameter');
      return res.status(400).json({ error: 'format parameter is required.' });
    }

    if (!validateUrl(sourceUrl)) {
      console.warn(`[video][stream] url validation failed: ${sourceUrl}`);
      return res.status(400).json({ error: 'Invalid URL.' });
    }

    if (platform && !['youtube', 'facebook', 'instagram', 'twitter', 'tiktok', 'pinterest', 'reddit'].includes(platform)) {
      console.warn(`[video][stream] invalid platform: ${platform}`);
      return res.status(400).json({ error: 'Invalid platform.' });
    }

    console.log(`[video][stream] calling downloadVideo for ${platform}:${sourceUrl}`);
    const result = await downloadVideo(sourceUrl, format);

    if (result.direct) {
      console.log(`[video][stream] returning direct URL: ${result.url}`);
      return res.json({ direct: true, url: result.url, fileName: result.fileName });
    }

    console.log(`[video][stream] streaming content, fileName=${result.fileName}`);
    const mimeType = result.contentType || getMimeType(result.fileName);
    const fileName = title && ext ? `${title}.${ext}` : result.fileName;

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    result.stream.on('error', (err) => {
      console.error(`[video][stream] read stream error: ${err.message}`);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream file.' });
      }
      next(err);
    });
    result.stream.pipe(res);
  } catch (error) {
    console.error(`[video][stream] error: ${error.message}`);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Failed to download video.' });
    } else {
      next(error);
    }
  }
});

/**
 * GET /api/video/audio?src=...&platform=...&title=...
 * Download audio-only extraction from a video.
 */
router.get('/audio', async (req, res, next) => {
  try {
    const { src: sourceUrl, platform, title } = req.query;
    console.log(`[video][audio] sourceUrl=${sourceUrl} platform=${platform} title=${title}`);

    if (!sourceUrl || typeof sourceUrl !== 'string') {
      console.warn('[video][audio] missing or invalid src query parameter');
      return res.status(400).json({ error: 'src parameter is required.' });
    }

    if (!validateUrl(sourceUrl)) {
      console.warn(`[video][audio] url validation failed: ${sourceUrl}`);
      return res.status(400).json({ error: 'Invalid URL.' });
    }

    if (platform && !['youtube', 'facebook', 'instagram', 'twitter', 'tiktok', 'pinterest', 'reddit'].includes(platform)) {
      console.warn(`[video][audio] invalid platform: ${platform}`);
      return res.status(400).json({ error: 'Invalid platform.' });
    }

    console.log(`[video][audio] calling downloadAudio for ${platform}:${sourceUrl}`);
    const result = await downloadAudio(sourceUrl, 'mp3');

    if (result.direct) {
      console.log(`[video][audio] returning direct URL: ${result.url}`);
      return res.json({ direct: true, url: result.url, fileName: result.fileName });
    }

    console.log(`[video][audio] streaming content, fileName=${result.fileName}`);
    const mimeType = result.contentType || getMimeType(result.fileName);
    const fileName = title ? `${title}.mp3` : result.fileName;

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const stream = result.stream;
    stream.on('error', (err) => {
      console.error(`[video][audio] read stream error: ${err.message}`);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream file.' });
      }
      next(err);
    });
    stream.pipe(res);
  } catch (error) {
    console.error(`[video][audio] error: ${error.message}`);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Failed to extract audio.' });
    } else {
      next(error);
    }
  }
});

module.exports = router;
