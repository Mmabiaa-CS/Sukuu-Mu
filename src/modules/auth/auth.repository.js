'use strict';

const { pool } = require('../../database/connection');

const findAllUsers = async () => {
  const [rows] = await pool.execute(
    `SELECT
       u.id,
       u.name,
       u.email,
       u.is_active,
       r.id   AS role_id,
       r.name AS role_name,
       u.created_at,
       u.updated_at
     FROM users u
     LEFT JOIN roles r ON u.role_id = r.id
     ORDER BY u.created_at DESC`
  );
  return rows;
};

const findUserByEmail = async (email) => {
  const [rows] = await pool.execute(
    `SELECT
       u.id,
       u.name,
       u.email,
       u.password,
       u.is_active,
       r.id   AS role_id,
       r.name AS role_name
     FROM users u
     LEFT JOIN roles r ON u.role_id = r.id
     WHERE u.email = ?
     LIMIT 1`,
    [email]
  );
  return rows[0] || null;
};

const findUserById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT
       u.id,
       u.name,
       u.email,
       u.is_active,
       r.id   AS role_id,
       r.name AS role_name,
       u.created_at,
       u.updated_at
     FROM users u
     LEFT JOIN roles r ON u.role_id = r.id
     WHERE u.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

const createUser = async ({ name, email, password, role_id }) => {
  const [result] = await pool.execute(
    `INSERT INTO users (name, email, password, role_id, is_active, created_at)
     VALUES (?, ?, ?, ?, 1, NOW())`,
    [name, email, password, role_id]  // ✅ removed role_name, kept role_id
  );
  return { id: result.insertId, name, email, role_id, is_active: 1, created_at: new Date() };
};

const findRoleByName = async (name) => {
  const [rows] = await pool.execute(
    `SELECT id, name FROM roles WHERE name = ? LIMIT 1`,
    [name]
  );
  return rows[0] || null;
};

const findRoleById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT id, name FROM roles WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

const updatePassword = async (userId, hashedPassword) => {
  await pool.execute(
    `UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?`,
    [hashedPassword, userId]
  );
};

module.exports = {
  findAllUsers,
  findUserByEmail,
  findUserById,
  createUser,
  findRoleByName,
  updatePassword,
  findRoleById
};