'use strict';

const logger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} — ${res.statusCode} (${duration}ms)`;

    if (res.statusCode >= 500) return console.error(log);
    if (res.statusCode >= 400) return console.warn(log);
    console.log(log);
  });

  next();
};

module.exports = { logger };