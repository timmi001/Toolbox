function validateUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function validateDownloadRequest(url, format) {
  if (!validateUrl(url)) {
    return { valid: false, error: 'A valid URL is required.' };
  }

  if (!format || typeof format !== 'string') {
    return { valid: false, error: 'A valid format is required.' };
  }

  return { valid: true };
}

module.exports = {
  validateUrl,
  validateDownloadRequest,
};
