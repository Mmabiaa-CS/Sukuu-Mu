'use strict';

/**
 * Parse a route :id parameter. Rejects undefined, NaN, and non-positive integers.
 */
const parseIdParam = (raw, label = 'id') => {
  if (raw === undefined || raw === null || raw === 'undefined' || raw === '') {
    const err = new Error(`Invalid ${label}: a numeric id is required`);
    err.status = 400;
    throw err;
  }

  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) {
    const err = new Error(`Invalid ${label}: must be a positive integer`);
    err.status = 400;
    throw err;
  }

  return id;
};

module.exports = { parseIdParam };
