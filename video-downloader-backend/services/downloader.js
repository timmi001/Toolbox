/**
 * Downloader provider boundary.
 *
 * The previous subprocess-based provider has been removed. A Cobalt provider
 * can implement these functions later without changing the HTTP routes.
 */

const fs = require('fs');
const path = require('path');

const tempDir = path.join(__dirname, '..', 'temp');
const downloadsDir = path.join(__dirname, '..', 'downloads');

function ensureDirectories() {
  fs.mkdirSync(tempDir, { recursive: true });
  fs.mkdirSync(downloadsDir, { recursive: true });
}

function providerUnavailable() {
  const error = new Error('Video download provider is not configured.');
  error.statusCode = 503;
  error.code = 'DOWNLOADER_PROVIDER_UNAVAILABLE';
  throw error;
}

function inspectUrl() {
  return providerUnavailable();
}

function downloadVideo() {
  return providerUnavailable();
}

function downloadAudio() {
  return providerUnavailable();
}

async function cleanupTempFiles(files = []) {
  for (const file of files) {
    try {
      if (file && fs.existsSync(file)) fs.unlinkSync(file);
    } catch (error) {
      console.error(`[cleanup] ${error.message}`);
    }
  }
}

async function verifyDependencies(options = {}) {
  ensureDirectories();
  const result = { ok: true, diagnostics: { node: process.version }, missing: [] };
  if (options.log) console.log(`[deps] Node version: ${result.diagnostics.node}`);
  return result;
}

ensureDirectories();

module.exports = {
  inspectUrl,
  downloadVideo,
  downloadAudio,
  cleanupTempFiles,
  verifyDependencies,
};
