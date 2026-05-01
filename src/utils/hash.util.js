'use strict';

const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

const hashPassword = async (plainPassword) => {
  return await bcrypt.hash(plainPassword, SALT_ROUNDS);
};

const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = { hashPassword, comparePassword };