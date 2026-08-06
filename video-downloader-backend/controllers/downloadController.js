const fs = require('fs');
const path = require('path');
const { validateUrl, validateDownloadRequest } = require('../utils/validator');
const { inspectUrl, downloadVideo, downloadAudio, cleanupTempFiles } = require('../services/downloader');

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

async function getInfo(req, res, next) {
  try {
    const { url } = req.body;
    console.log(`[handler][getInfo] url=${url}`);

    if (!validateUrl(url)) {
      console.warn(`[handler][getInfo] validation failed for url=${url}`);
      return res.status(400).json({ error: 'A valid URL is required.' });
    }

    console.log(`[handler][getInfo] validated, calling inspectUrl for url=${url}`);
    const info = await inspectUrl(url);
    console.log(`[handler][getInfo] success: title=${info.title}, formats=${info.formats.length}`);
    res.json(info);
  } catch (error) {
    console.error(`[handler][getInfo] error: ${error.message}`);
    next(error);
  }
}

async function downloadVideoHandler(req, res, next) {
  try {
    const { url, format = 'best' } = req.body;
    console.log(`[handler][downloadVideoHandler] url=${url} format=${format}`);

    const validation = validateDownloadRequest(url, format);
    if (!validation.valid) {
      console.warn(`[handler][downloadVideoHandler] validation failed: ${validation.error}`);
      return res.status(400).json({ error: validation.error });
    }

    console.log(`[handler][downloadVideoHandler] validated, calling downloadVideo`);
    const result = await downloadVideo(url, format);
    
    if (result.direct) {
      console.log(`[handler][downloadVideoHandler] direct URL: ${result.url}`);
      return res.json({ direct: true, url: result.url, fileName: result.fileName });
    }

    console.log(`[handler][downloadVideoHandler] streaming file: ${result.filePath}`);
    const mimeType = getMimeType(result.fileName);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
    
    const stream = fs.createReadStream(result.filePath);
    stream.on('error', (err) => {
      console.error(`[handler][downloadVideoHandler] stream error: ${err.message}`);
      next(err);
    });
    stream.on('close', async () => {
      console.log(`[handler][downloadVideoHandler] stream closed, cleaning up ${result.filePath}`);
      await cleanupTempFiles([result.filePath]);
    });
    stream.pipe(res);
  } catch (error) {
    console.error(`[handler][downloadVideoHandler] error: ${error.message}`);
    next(error);
  }
}

async function downloadAudioHandler(req, res, next) {
  try {
    const { url, format = 'mp3' } = req.body;
    console.log(`[handler][downloadAudioHandler] url=${url} format=${format}`);

    const validation = validateDownloadRequest(url, format);
    if (!validation.valid) {
      console.warn(`[handler][downloadAudioHandler] validation failed: ${validation.error}`);
      return res.status(400).json({ error: validation.error });
    }

    console.log(`[handler][downloadAudioHandler] validated, calling downloadAudio`);
    const result = await downloadAudio(url, format);
    
    if (result.direct) {
      console.log(`[handler][downloadAudioHandler] direct URL: ${result.url}`);
      return res.json({ direct: true, url: result.url, fileName: result.fileName });
    }

    console.log(`[handler][downloadAudioHandler] streaming file: ${result.filePath}`);
    const mimeType = getMimeType(result.fileName);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
    
    const stream = fs.createReadStream(result.filePath);
    stream.on('error', (err) => {
      console.error(`[handler][downloadAudioHandler] stream error: ${err.message}`);
      next(err);
    });
    stream.on('close', async () => {
      console.log(`[handler][downloadAudioHandler] stream closed, cleaning up ${result.filePath}`);
      await cleanupTempFiles([result.filePath]);
    });
    stream.pipe(res);
  } catch (error) {
    console.error(`[handler][downloadAudioHandler] error: ${error.message}`);
    next(error);
  }
}

module.exports = {
  getInfo,
  downloadVideoHandler,
  downloadAudioHandler,
};
