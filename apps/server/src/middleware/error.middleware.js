'use strict';

const errorHandler = (err, req, res, next) => {
  const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
  const message = err.message || 'Internal Server Error';
  const requestId = req.requestId || '-';
  const userId = req.user?.id ?? '-';

  const logLine = `[ERROR] req=${requestId} user=${userId} ${req.method} ${req.originalUrl} → ${status} ${message}`;

  if (status >= 500) {
    console.error(logLine);
    if (process.env.NODE_ENV === 'development' && err.stack) {
      console.error(err.stack);
    }
  } else {
    console.warn(logLine);
  }

  return res.status(status).json({
    success: false,
    message,
    requestId,
    ...(process.env.NODE_ENV === 'development' && err.stack ? { stack: err.stack } : {}),
  });
};

module.exports = { errorHandler };
