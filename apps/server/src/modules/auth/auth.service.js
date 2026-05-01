'use strict';

const authRepository = require('./auth.repository');
const { hashPassword, comparePassword } = require('../../utils/hash.util');
const { signToken } = require('../../utils/jwt.util');

// ── Login ──────────────────────────────────────────────────────────────────
const login = async ({ email, password }) => {
  const user = await authRepository.findUserByEmail(email);
  if (!user) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  if (!user.is_active) {
    const err = new Error('Account is disabled. Contact your administrator.');
    err.status = 403;
    throw err;
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const token = signToken({
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role_name,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role_name,
    },
  };
};

// ── Register ───────────────────────────────────────────────────────────────
const register = async ({ name, email, password, role_name }) => {
  // 1. Check duplicate email
  const existing = await authRepository.findUserByEmail(email);
  if (existing) {
    const err = new Error('Email is already registered');
    err.status = 409;
    throw err;
  }

  // 2. Resolve role by NAME (default: student)
  // ✅ fixed: was using role_id and findRoleById — now correctly uses role_name and findRoleByName
  const roleName = role_name || 'student';
  const role = await authRepository.findRoleByName(roleName);
  if (!role) {
    const err = new Error(`Role "${roleName}" does not exist`);
    err.status = 400;
    throw err;
  }

  // 3. Hash password
  const hashed = await hashPassword(password);

  // 4. Create user
  const created = await authRepository.createUser({
    name,
    email,
    password: hashed,
    role_id: role.id,
  });

  // 5. Sign token
  // ✅ fixed: was using undefined variable roleName from wrong scope
  const token = signToken({
    sub: created.id,
    name: created.name,
    email: created.email,
    role: roleName,
  });

  return {
    token,
    user: {
      id: created.id,
      name: created.name,
      email: created.email,
      role: roleName,
    },
  };
};

// ── Get all users ──────────────────────────────────────────────────────────
const getAllUsers = async () => {
  const users = await authRepository.findAllUsers();
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role_name,
    is_active: u.is_active,
    created_at: u.created_at,
    updated_at: u.updated_at,
  }));
};

// ── Get profile ────────────────────────────────────────────────────────────
const getMe = async (userId) => {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role_name,
    is_active: user.is_active,
  };
};

// ── Change password ────────────────────────────────────────────────────────
const changePassword = async (userId, { current_password, new_password }) => {
  const user = await authRepository.findUserByEmail(
    (await authRepository.findUserById(userId)).email
  );

  const isMatch = await comparePassword(current_password, user.password);
  if (!isMatch) {
    const err = new Error('Current password is incorrect');
    err.status = 401;
    throw err;
  }

  const hashed = await hashPassword(new_password);
  await authRepository.updatePassword(userId, hashed);
};

module.exports = { login, register, getMe, getAllUsers, changePassword };