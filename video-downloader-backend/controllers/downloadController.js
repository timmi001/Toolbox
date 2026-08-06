const fs = require('fs');
const { validateUrl, validateDownloadRequest } = require('../utils/validator');
const { inspectUrl, downloadVideo, downloadAudio, cleanupTempFiles } = require('../services/downloader');

async function getInfo(req, res, next) {
  try {
    const { url } = req.body;

    if (!validateUrl(url)) {
      return res.status(400).json({ error: 'A valid URL is required.' });
    }

    const info = await inspectUrl(url);
    res.json(info);
  } catch (error) {
    next(error);
  }
}

async function downloadVideoHandler(req, res, next) {
  try {
    const { url, format = 'best' } = req.body;

    const validation = validateDownloadRequest(url, format);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const result = await downloadVideo(url, format);
    if (result.direct) {
      // Return redirect to the direct URL so clients can download directly
      return res.json({ direct: true, url: result.url, fileName: result.fileName });
    }

    // Stream file to response to avoid blocking server for long
    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
    const stream = fs.createReadStream(result.filePath);
    stream.on('error', next);
    stream.on('close', async () => {
      await cleanupTempFiles([result.filePath]);
    });
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
}

async function downloadAudioHandler(req, res, next) {
  try {
    const { url, format = 'mp3' } = req.body;

    const validation = validateDownloadRequest(url, format);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const result = await downloadAudio(url, format);
    if (result.direct) {
      return res.json({ direct: true, url: result.url, fileName: result.fileName });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
    const stream = fs.createReadStream(result.filePath);
    stream.on('error', next);
    stream.on('close', async () => {
      await cleanupTempFiles([result.filePath]);
    });
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getInfo,
  downloadVideoHandler,
  downloadAudioHandler,
};
