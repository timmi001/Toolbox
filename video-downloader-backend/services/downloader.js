const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');

const tempDir = path.join(__dirname, '..', 'temp');
const downloadsDir = path.join(__dirname, '..', 'downloads');

// Cache for discovered binaries
let binaryCache = {
  'yt-dlp': null,
  'ffmpeg': null,
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/**
 * Discover the full path to a binary by searching common locations
 * @param {string} command - The command to find (e.g., 'yt-dlp', 'ffmpeg')
 * @returns {string|null} - Full path to the binary or null if not found
 */
function discoverBinary(command) {
  // Return cached result if available
  if (binaryCache[command] !== undefined && binaryCache[command] !== null) {
    return binaryCache[command];
  }

  const commonPaths = [
    // Linux/Mac common locations
    `/usr/local/bin/${command}`,
    `/usr/bin/${command}`,
    `/bin/${command}`,
    `/opt/local/bin/${command}`,
    // Windows
    `C:\\Python311\\Scripts\\${command}.exe`,
    `C:\\Python310\\Scripts\\${command}.exe`,
    `C:\\Python39\\Scripts\\${command}.exe`,
    // Try via which/where command
  ];

  // First try: direct execution via spawn (checks PATH)
  try {
    const result = execSync(`which ${command} 2>/dev/null || where ${command} 2>nul`, {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (result) {
      binaryCache[command] = result;
      return result;
    }
  } catch (e) {
    // which/where might not work, continue searching
  }

  // Second try: check common paths
  for (const binPath of commonPaths) {
    if (fs.existsSync(binPath)) {
      binaryCache[command] = binPath;
      return binPath;
    }
  }

  // Third try: use execSync to find via command availability
  try {
    const fullPath = execSync(`python3 -m site --user-scripts 2>/dev/null && which ${command} 2>/dev/null || echo ''`, {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (fullPath && fs.existsSync(fullPath)) {
      binaryCache[command] = fullPath;
      return fullPath;
    }
  } catch (e) {
    // Continue to next method
  }

  return null;
}

/**
 * Run a command with automatic binary discovery
 * @param {string} command - The command to run
 * @param {string[]} args - Arguments for the command
 * @param {object} options - spawn options
 * @returns {Promise} - Resolves with { stdout, stderr }
 */
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    // Try to find the binary
    let execPath = command;
    const discoveredPath = discoverBinary(command);
    if (discoveredPath) {
      execPath = discoveredPath;
    }

    const child = spawn(execPath, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (err) => {
      if (err.code === 'ENOENT') {
        const discoveryHint = discoveredPath
          ? `(discovered at ${discoveredPath} but execution failed)`
          : '(not found on PATH or in common locations)';

        let installMsg = '';
        if (command === 'yt-dlp') {
          installMsg = `\n  Install with: pip3 install yt-dlp\n  Or on Render: ensure yt-dlp is in Dockerfile`;
        } else if (command === 'ffmpeg') {
          installMsg = `\n  Install with: apt-get install ffmpeg (Linux) or brew install ffmpeg (macOS)`;
        }

        const fullError = `Missing or inaccessible required binary '${command}' ${discoveryHint}${installMsg}`;
        reject(new Error(fullError));
      } else {
        reject(err);
      }
    });

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
  const { stdout } = await runCommand('yt-dlp', [
    '--print', 'title',
    '--print', 'thumbnail',
    '--print', 'duration',
    '--print', 'uploader',
    '--print', 'upload_date',
    '--print', 'format_id',
    '--print', 'quality',
    '--print', 'filesize',
    '--print', 'ext',
    '--print', 'url',
    '--no-warnings',
    url,
  ]);

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

  const args = [
    '-f', format === 'best' ? 'bestvideo+bestaudio/best' : format,
    '-o', tempOutputPath,
    '--no-warnings',
    url,
  ];
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

  const args = [
    '-x',
    '--audio-format', format || 'mp3',
    '-o', tempOutputPath,
    '--no-warnings',
    url,
  ];
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

async function verifyDependencies() {
  const deps = ['yt-dlp', 'ffmpeg'];
  const missing = [];

  for (const dep of deps) {
    try {
      await runCommand(dep, ['--version']);
    } catch (error) {
      if (error.message.includes('not installed') || error.message.includes('ENOENT')) {
        missing.push(dep);
      }
    }
  }

  if (missing.length > 0) {
    console.warn(`⚠️  Missing dependencies: ${missing.join(', ')}`);
    if (missing.includes('yt-dlp')) {
      console.warn('Install yt-dlp with: pip install yt-dlp');
    }
    if (missing.includes('ffmpeg')) {
      console.warn('Install ffmpeg with: apt-get install ffmpeg (Linux) or brew install ffmpeg (macOS)');
    }
    return false;
  }

  console.log('✓ All dependencies (yt-dlp, ffmpeg) verified');
  return true;
}

module.exports = {
  inspectUrl,
  downloadVideo,
  downloadAudio,
  cleanupTempFiles,
  verifyDependencies,
};
