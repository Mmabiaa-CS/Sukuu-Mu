'use strict';

const { randomUUID } = require('crypto');

const logger = (req, res, next) => {
  req.requestId = req.headers['x-request-id'] || randomUUID().slice(0, 8);
  res.setHeader('X-Request-Id', req.requestId);

  const start = Date.now();
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();

    // Determine color based on status code
    let statusColor = '\x1b[32m'; // Green for ok
    if (res.statusCode >= 500) statusColor = '\x1b[31m'; // Red for server errors
    else if (res.statusCode >= 400) statusColor = '\x1b[33m'; // Yellow for client errors
    else if (res.statusCode >= 300) statusColor = '\x1b[36m'; // Cyan for redirects

    // Format HTTP method to be fixed width
    const methodPad = req.method.padEnd(7, ' ');
    const resetColor = '\x1b[0m';

    const userTag = req.user?.id ? `user=${req.user.id}` : 'user=-';
    const logPrefix = `\x1b[90m[${timestamp}]\x1b[0m \x1b[90m#${req.requestId}\x1b[0m ${statusColor}${methodPad}\x1b[0m ${req.originalUrl}`;
    const logDetails = `${statusColor}${res.statusCode}\x1b[0m | \x1b[90m${duration}ms\x1b[0m | ${userTag} | \x1b[90m${ip}\x1b[0m`;

    const logEntry = `${logPrefix.padEnd(70, ' ')} ${logDetails}`;

    if (res.statusCode >= 500) {
      console.error(logEntry);
    } else if (res.statusCode >= 400) {
      console.warn(logEntry);
    } else {
      console.log(logEntry);
    }
  });

  next();
};

module.exports = { logger };