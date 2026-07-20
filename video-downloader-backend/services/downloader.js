const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const tempDir = path.join(__dirname, '..', 'temp');
const downloadsDir = path.join(__dirname, '..', 'downloads');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function getPathEntries() {
  return (process.env.PATH || '')
    .split(path.delimiter)
    .filter(Boolean);
}

function buildMissingBinaryError(command) {
  const envVarName = command === 'yt-dlp'
    ? 'YTDLP_PATH'
    : command === 'ffmpeg'
      ? 'FFMPEG_PATH'
      : `${command.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_PATH`;

  switch (command) {
    case 'yt-dlp':
      return `Missing required binary '${command}'. It was not found on PATH or in common install locations. Install it with: python3 -m pip install --break-system-packages yt-dlp (Linux/macOS) or py -m pip install yt-dlp (Windows). You can also set ${envVarName} to the full executable path.`;
    case 'ffmpeg':
      return `Missing required binary '${command}'. It was not found on PATH or in common install locations. Install it with: apt-get install ffmpeg (Debian/Ubuntu), brew install ffmpeg (macOS), or choco install ffmpeg (Windows). You can also set ${envVarName} to the full executable path.`;
    default:
      return `Missing required binary '${command}'. It was not found on PATH or common install locations. Set ${envVarName} to the full executable path if needed.`;
  }
}

function resolveExecutable(command) {
  const overrideVarName = command === 'yt-dlp'
    ? 'YTDLP_PATH'
    : command === 'ffmpeg'
      ? 'FFMPEG_PATH'
      : `${command.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_PATH`;
  const overridePath = process.env[overrideVarName];
  if (overridePath) {
    const resolvedOverride = path.resolve(overridePath);
    if (fs.existsSync(resolvedOverride) && fs.statSync(resolvedOverride).isFile()) {
      return resolvedOverride;
    }
  }

  const candidateNames = [];
  const baseNames = [command];
  if (command === 'python3') {
    baseNames.push('python');
  } else if (command === 'python') {
    baseNames.push('python3');
  }

  for (const baseName of baseNames) {
    candidateNames.push(baseName);
    for (const suffix of ['', '.exe', '.cmd', '.bat']) {
      candidateNames.push(`${baseName}${suffix}`);
    }
  }

  const uniqueCandidateNames = Array.from(new Set(candidateNames));
  const pathEntries = getPathEntries();
  for (const candidate of uniqueCandidateNames) {
    if (path.isAbsolute(candidate)) {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return candidate;
      }
      continue;
    }

    for (const dir of pathEntries) {
      const fullPath = path.join(dir, candidate);
      if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        return fullPath;
      }
    }
  }

  const commonLocations = [
    `/usr/local/bin/${command}`,
    `/usr/bin/${command}`,
    `/bin/${command}`,
    `/opt/homebrew/bin/${command}`,
    `C:/Program Files/ffmpeg/bin/${command}`,
    `C:/ffmpeg/bin/${command}`,
    `C:/Program Files/yt-dlp/${command}`,
  ];

  for (const location of commonLocations) {
    if (fs.existsSync(location) && fs.statSync(location).isFile()) {
      return location;
    }
  }

  return null;
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const executable = resolveExecutable(command);
    if (!executable) {
      reject(new Error(buildMissingBinaryError(command)));
      return;
    }

    const env = {
      ...process.env,
      PATH: [path.dirname(executable), ...getPathEntries()].join(path.delimiter),
    };

    const child = spawn(executable, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env,
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
      if (err.code === 'ENOENT' || err.message.includes('ENOENT')) {
        reject(new Error(buildMissingBinaryError(command)));
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

async function getBinaryDetails(command) {
  const resolvedPath = resolveExecutable(command);
  if (!resolvedPath) {
    return {
      command,
      available: false,
      version: null,
      path: null,
      error: buildMissingBinaryError(command),
    };
  }

  try {
    const { stdout, stderr } = await runCommand(command, ['--version']);
    const versionOutput = (stdout || stderr || '').trim().split(/\r?\n/)[0] || 'version unavailable';
    return {
      command,
      available: true,
      version: versionOutput,
      path: resolvedPath,
      error: null,
    };
  } catch (error) {
    return {
      command,
      available: false,
      version: null,
      path: resolvedPath,
      error: error.message,
    };
  }
}

async function verifyDependencies(options = {}) {
  const { log = false, throwOnMissing = false } = options;

  const pythonCommand = resolveExecutable('python3') ? 'python3' : resolveExecutable('python') ? 'python' : null;
  const diagnostics = {
    node: process.version,
    python: null,
    ytDlp: null,
    ffmpeg: null,
  };

  const pythonDetails = pythonCommand
    ? await getBinaryDetails(pythonCommand)
    : {
        command: 'python',
        available: false,
        version: null,
        path: null,
        error: 'Python was not found on PATH or in common install locations.',
      };

  const ytDlpDetails = await getBinaryDetails('yt-dlp');
  const ffmpegDetails = await getBinaryDetails('ffmpeg');

  diagnostics.python = pythonDetails.available
    ? `${pythonDetails.version} (${pythonDetails.path})`
    : pythonDetails.error;
  diagnostics.ytDlp = ytDlpDetails.available
    ? `${ytDlpDetails.version} (${ytDlpDetails.path})`
    : ytDlpDetails.error;
  diagnostics.ffmpeg = ffmpegDetails.available
    ? `${ffmpegDetails.version} (${ffmpegDetails.path})`
    : ffmpegDetails.error;

  if (log) {
    console.log(`[deps] Node version: ${diagnostics.node}`);
    console.log(`[deps] Python: ${diagnostics.python}`);
    console.log(`[deps] yt-dlp: ${diagnostics.ytDlp}`);
    console.log(`[deps] ffmpeg: ${diagnostics.ffmpeg}`);
  }

  const missing = [pythonDetails, ytDlpDetails, ffmpegDetails].filter((detail) => !detail.available);
  if (missing.length > 0) {
    const message = [
      'Dependency verification failed.',
      ...missing.map((detail) => `- ${detail.error}`),
    ].join('\n');

    if (log) {
      console.error(message);
    }

    if (throwOnMissing) {
      throw new Error(message);
    }

    return { ok: false, diagnostics, missing };
  }

  if (log) {
    console.log('[deps] Dependency verification succeeded.');
  }

  return { ok: true, diagnostics, missing: [] };
}

module.exports = {
  inspectUrl,
  downloadVideo,
  downloadAudio,
  cleanupTempFiles,
  verifyDependencies,
};
