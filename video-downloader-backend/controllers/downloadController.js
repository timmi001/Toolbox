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
    res.download(result.filePath, result.fileName, async (err) => {
      if (err) {
        return next(err);
      }

      await cleanupTempFiles([result.filePath]);
    });
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
    res.download(result.filePath, result.fileName, async (err) => {
      if (err) {
        return next(err);
      }

      await cleanupTempFiles([result.filePath]);
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getInfo,
  downloadVideoHandler,
  downloadAudioHandler,
};
