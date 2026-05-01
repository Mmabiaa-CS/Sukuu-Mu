'use strict';

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const signToken = (payload) => {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const verifyToken = (token) => {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not defined');
  return jwt.verify(token, JWT_SECRET);
};

module.exports = { signToken, verifyToken };