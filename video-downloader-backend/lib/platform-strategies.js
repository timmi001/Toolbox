/**
 * lib/platform-strategies.ts
 * Platform-specific extraction strategies for optimized yt-dlp usage
 */

/**
 * Platform-specific yt-dlp strategies for fast metadata and direct URL extraction
 */
export const PLATFORM_STRATEGIES = {
  youtube: {
    name: 'youtube',
    patterns: [
      /(?:youtube\.com\/watch\?|youtu\.be\/|youtube\.com\/embed\/)/i,
    ],
    // Minimal metadata fields for fast extraction
    metadataFields: [
      'id', 'title', 'duration', 'thumbnail',
      'uploader', 'upload_date', 'view_count',
      'description', 'is_live',
    ],
    // Fast direct URL extraction
    directUrlArgs: ['-f', 'best', '--print', 'url', '--socket-timeout', '10'],
    // Download format selection
    downloadFormats: {
      best: ['bestvideo+bestaudio/best'],
      '1080p': ['bestvideo[height<=1080]+bestaudio/best'],
      '720p': ['bestvideo[height<=720]+bestaudio/best'],
      'audio': ['bestaudio'],
    },
    timeoutBase: 30000,        // 30 seconds base
    supportsDirectUrl: true,   // Direct MP4/WebM URLs available
    supportsStreaming: true,   // Browser-compatible formats
    description: 'YouTube video extraction',
    notes: 'Fast metadata extraction, direct MP4 URLs common',
  },

  tiktok: {
    name: 'tiktok',
    patterns: [
      /tiktok\.com\/@[\w.-]+\/video/i,
      /(?:vm|vt)\.tiktok\.com\/[A-Za-z0-9]+/i,
    ],
    metadataFields: [
      'id', 'title', 'duration', 'thumbnail',
      'uploader', 'upload_date', 'view_count',
    ],
    directUrlArgs: ['-f', 'best', '--print', 'url', '--socket-timeout', '15', '--user-agent', 'Mozilla/5.0'],
    downloadFormats: {
      best: ['best'],
      'video': ['best'],
    },
    timeoutBase: 45000,        // 45 seconds (slower region-specific access)
    supportsDirectUrl: false,  // Often returns encrypted/temporary URLs
    supportsStreaming: false,  // May require special headers
    description: 'TikTok video extraction',
    notes: 'Region-specific, may require retries, user-agent important',
  },

  instagram: {
    name: 'instagram',
    patterns: [
      /instagram\.com\/(p|reel)\//i,
      /instagram\.com\/[A-Za-z0-9._]+/i,
    ],
    metadataFields: [
      'id', 'title', 'duration', 'thumbnail',
      'uploader', 'upload_date',
    ],
    directUrlArgs: ['-f', 'best', '--print', 'url', '--socket-timeout', '20', '--no-warnings'],
    downloadFormats: {
      best: ['best'],
      'video': ['best'],
    },
    timeoutBase: 60000,        // 60 seconds (often requires retries)
    supportsDirectUrl: false,  // Temporary URLs, rate limited
    supportsStreaming: false,  // Requires specific headers
    description: 'Instagram photo/video extraction',
    notes: 'Slow extraction, frequent rate limiting, may require session',
  },

  facebook: {
    name: 'facebook',
    patterns: [
      /facebook\.com\/.*\/videos\//i,
      /facebook\.com\/watch\/\?v=/i,
      /fb\.watch\//i,
    ],
    metadataFields: [
      'id', 'title', 'duration', 'thumbnail',
      'uploader', 'upload_date',
    ],
    directUrlArgs: ['-f', 'best', '--print', 'url', '--socket-timeout', '15'],
    downloadFormats: {
      best: ['best'],
      'video': ['best'],
    },
    timeoutBase: 45000,        // 45 seconds
    supportsDirectUrl: false,  // Temporary URLs
    supportsStreaming: false,  // Variable quality
    description: 'Facebook video extraction',
    notes: 'Metadata slower than YouTube, direct URLs often temporary',
  },

  twitter: {
    name: 'twitter',
    patterns: [
      /twitter\.com\/\w+\/status\/\d+/i,
      /x\.com\/\w+\/status\/\d+/i,
      /twitter\.com\/i\/videos\//i,
    ],
    metadataFields: [
      'id', 'title', 'duration', 'thumbnail',
      'uploader', 'upload_date',
    ],
    directUrlArgs: ['-f', 'best', '--print', 'url', '--socket-timeout', '10'],
    downloadFormats: {
      best: ['best'],
      'video': ['best'],
    },
    timeoutBase: 30000,        // 30 seconds
    supportsDirectUrl: true,   // Direct m3u8 URLs
    supportsStreaming: true,   // HLS compatible
    description: 'X (Twitter) video extraction',
    notes: 'Fast extraction, HLS streams common, small video sizes',
  },

  generic: {
    name: 'generic',
    patterns: [/.*/],          // Match anything (last resort)
    metadataFields: [
      'id', 'title', 'duration', 'thumbnail',
      'uploader', 'upload_date', 'description',
    ],
    directUrlArgs: ['-f', 'best', '--print', 'url', '--socket-timeout', '15'],
    downloadFormats: {
      best: ['best'],
    },
    timeoutBase: 30000,
    supportsDirectUrl: false,
    supportsStreaming: false,
    description: 'Generic video extraction',
    notes: 'Fallback strategy for unknown platforms',
  },
};

/**
 * Get platform strategy by URL
 */
export function getPlatformStrategy(url) {
  for (const [key, strategy] of Object.entries(PLATFORM_STRATEGIES)) {
    if (key === 'generic') continue; // Check generic last
    for (const pattern of strategy.patterns) {
      if (pattern.test(url)) {
        return strategy;
      }
    }
  }
  return PLATFORM_STRATEGIES.generic;
}

/**
 * Build yt-dlp arguments for metadata extraction
 */
export function buildMetadataArgs(url, strategy) {
  const fields = strategy.metadataFields.join(',');
  return [
    '-j', // JSON output
    '--no-warnings',
    '--socket-timeout', '10',
    '--extract-flat=no',
    '--skip-download',
    url,
  ];
}

/**
 * Build yt-dlp arguments for direct URL extraction
 */
export function buildDirectUrlArgs(url, strategy) {
  return [
    '-f', 'best',
    '--print', 'url',
    '--no-warnings',
    '--socket-timeout', '10',
    '--skip-download',
    url,
  ];
}

/**
 * Build yt-dlp arguments for download
 */
export function buildDownloadArgs(url, format, strategy) {
  const formatSpec = strategy.downloadFormats[format] || strategy.downloadFormats.best;
  const formatStr = Array.isArray(formatSpec) ? formatSpec[0] : formatSpec;

  return [
    '-f', formatStr,
    '--no-warnings',
    '--no-playlist',
    '--no-check-certificate',
    '-o', '-', // stdout for streaming
    url,
  ];
}

/**
 * Get timeout for operation and platform
 */
export function getTimeout(operation, strategy) {
  const baseTimeout = strategy.timeoutBase;
  const multipliers = {
    metadata: 1.0,     // metadata: 1x base
    directUrl: 0.33,   // directUrl: 1/3 base (faster)
    download: 4.0,     // download: 4x base (longer operations)
  };
  return Math.ceil(baseTimeout * (multipliers[operation] || 1.0));
}

/**
 * Format classification for UI display
 */
export function classifyFormats(formats, strategy) {
  if (!formats || !Array.isArray(formats)) return [];

  return formats
    .filter((f) => f.vcodec && f.vcodec !== 'none') // Video only
    .slice(0, 20) // Top 20 formats
    .map((f) => ({
      formatId: f.format_id,
      quality: f.format,
      height: f.height,
      fps: f.fps,
      vcodec: f.vcodec,
      acodec: f.acodec,
      ext: f.ext,
      filesize: f.filesize,
    }));
}

/**
 * Detect if URL is likely a direct media URL (no further processing needed)
 */
export function isDirectMediaUrl(url) {
  if (!url) return false;
  // Check if it's a direct media file or CDN URL
  const directExtensions = /\.(mp4|webm|mkv|m3u8|ts)($|\?)/i;
  const cdnPatterns = [
    /cdn\./i,
    /cloudfront\./i,
    /akamai/i,
    /fastly/i,
    /\.mp4\?/,
    /\.m3u8\?/,
  ];

  return (
    directExtensions.test(url) ||
    cdnPatterns.some((p) => p.test(url))
  );
}

/**
 * Export all strategies as a lookup object
 */
export const STRATEGIES_BY_NAME = Object.fromEntries(
  Object.entries(PLATFORM_STRATEGIES).map(([key, strategy]) => [strategy.name, strategy])
);
