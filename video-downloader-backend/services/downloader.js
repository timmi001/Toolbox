const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');

const tempDir = path.join(__dirname, '..', 'temp');
const downloadsDir = path.join(__dirname, '..', 'downloads');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'], ...options });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(stderr || `Process exited with code ${code}`));
      }
    });
  });
}

async function inspectUrl(url) {
  const { stdout } = await runCommand('yt-dlp', ['--print', 'title', '--print', 'thumbnail', '--print', 'duration', '--print', 'uploader', '--print', 'upload_date', '--print', 'format_id', '--print', 'quality', '--print', 'filesize', '--print', 'ext', '--print', 'url', '--no-warnings', url]);

  const lines = stdout.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) {
    throw new Error('Unable to inspect the provided URL.');
  }

  return {
    title: lines[0] || 'Unknown title',
    thumbnail: lines[1] || '',
    duration: lines[2] || null,
    uploader: lines[3] || 'Unknown uploader',
    uploadDate: lines[4] || null,
    formats: [],
    audioFormats: [],
    filesize: lines[6] || null,
    quality: lines[5] || null,
    sourceUrl: url,
  };
}

async function downloadVideo(url, format) {
  ensureDir(tempDir);
  ensureDir(downloadsDir);

  const outputName = `${uuidv4()}.mp4`;
  const outputPath = path.join(downloadsDir, outputName);
  const tempOutputPath = path.join(tempDir, outputName);

  const args = ['-f', format === 'best' ? 'bestvideo+bestaudio/best' : format, '-o', tempOutputPath, '--no-warnings', url];
  await runCommand('yt-dlp', args);

  fs.renameSync(tempOutputPath, outputPath);

  return {
    filePath: outputPath,
    fileName: outputName,
  };
}

async function downloadAudio(url, format) {
  ensureDir(tempDir);
  ensureDir(downloadsDir);

  const outputName = `${uuidv4()}.mp3`;
  const outputPath = path.join(downloadsDir, outputName);
  const tempOutputPath = path.join(tempDir, outputName);

  const args = ['-x', '--audio-format', format || 'mp3', '-o', tempOutputPath, '--no-warnings', url];
  await runCommand('yt-dlp', args);

  fs.renameSync(tempOutputPath, outputPath);

  return {
    filePath: outputPath,
    fileName: outputName,
  };
}

async function cleanupTempFiles(files = []) {
  for (const file of files) {
    try {
      if (file && fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    } catch (error) {
      console.error('Cleanup failed:', error.message);
    }
  }
}

module.exports = {
  inspectUrl,
  downloadVideo,
  downloadAudio,
  cleanupTempFiles,
};
