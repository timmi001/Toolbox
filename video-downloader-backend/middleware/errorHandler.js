function errorHandler(err, req, res, next) {
  console.error(`[error] ${err.stack || err.message}`);

  // Map error codes to user-friendly messages
  let statusCode = err.statusCode || err.status || 500;
  let userMessage = err.message || 'Internal server error';

  // Handle specific error scenarios
  if (err.code === 'ENOENT') {
    statusCode = 404;
    userMessage = 'File not found. The download may have expired or been cleaned up.';
  } else if (err.code === 'ETIMEDOUT' || err.message?.includes('[timeout]')) {
    statusCode = 504;
    userMessage = 'Request timeout. The operation took too long. Please try again.';
  } else if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    userMessage = 'Service unavailable. The download service is temporarily unavailable.';
  } else if (err.message?.includes('Invalid URL')) {
    statusCode = 400;
    userMessage = 'Invalid URL provided. Please check the URL and try again.';
  } else if (err.message?.includes('parse failed')) {
    statusCode = 400;
    userMessage = 'Unable to parse the provided URL. The content may not be supported.';
  } else if (err.message?.includes('platform')) {
    statusCode = 400;
    userMessage = 'Invalid platform specified.';
  }

  console.error(`[error] statusCode=${statusCode} userMessage=${userMessage} originalMessage=${err.message}`);

  res.status(statusCode).json({
    error: userMessage,
    ...(process.env.NODE_ENV === 'development' && { details: err.message }),
  });
}

module.exports = {
  errorHandler,
};
