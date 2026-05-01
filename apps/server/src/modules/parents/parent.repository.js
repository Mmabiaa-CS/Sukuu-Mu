'use strict';

const { pool } = require('../../database/connection');

// ── Core CRUD ──────────────────────────────────────────────────────────────

const findAll = async ({ limit, offset, search }) => {
  let query = `
    SELECT
      p.id,
      p.first_name,
      p.last_name,
      p.email,
      p.phone,
      p.address,
      p.gender,
      p.occupation,
      p.is_active,
      p.created_at,
      p.updated_at,
      COUNT(ps.student_id) AS total_students
    FROM parents p
    LEFT JOIN parent_students ps ON ps.parent_id = p.id
  `;

  const params = [];

  if (search) {
    query += `
      WHERE
        p.first_name LIKE ? OR
        p.last_name  LIKE ? OR
        CONCAT(p.first_name, ' ', p.last_name) LIKE ? OR
        p.email      LIKE ? OR
        p.phone      LIKE ?
    `;
    const term = `%${search}%`;
    params.push(term, term, term, term, term);
  }

  query += ` GROUP BY p.id ORDER BY p.created_at DESC`;

  const limitInt  = parseInt(limit, 10);
  const offsetInt = parseInt(offset, 10);
  query += ` LIMIT ${limitInt} OFFSET ${offsetInt}`;

  const [rows] = await pool.execute(query, params);
  return rows;
};

const countAll = async ({ search }) => {
  let query = `SELECT COUNT(*) AS total FROM parents p`;
  const params = [];

  if (search) {
    query += `
      WHERE
        p.first_name LIKE ? OR
        p.last_name  LIKE ? OR
        CONCAT(p.first_name, ' ', p.last_name) LIKE ? OR
        p.email      LIKE ? OR
        p.phone      LIKE ?
    `;
    const term = `%${search}%`;
    params.push(term, term, term, term, term);
  }

  const [rows] = await pool.execute(query, params);
  return rows[0].total;
};

const findById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT
       p.id,
       p.first_name,
       p.last_name,
       p.email,
       p.phone,
       p.address,
       p.gender,
       p.occupation,
       p.is_active,
       p.created_at,
       p.updated_at
     FROM parents p
     WHERE p.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

const findByEmail = async (email) => {
  const [rows] = await pool.execute(
    `SELECT id, email FROM parents WHERE email = ? LIMIT 1`,
    [email]
  );
  return rows[0] || null;
};

const findByPhone = async (phone) => {
  const [rows] = await pool.execute(
    `SELECT id, phone FROM parents WHERE phone = ? LIMIT 1`,
    [phone]
  );
  return rows[0] || null;
};

const create = async ({
  first_name, last_name, email, phone,
  address, gender, occupation,
}) => {
  const [result] = await pool.execute(
    `INSERT INTO parents
       (first_name, last_name, email, phone, address, gender, occupation, is_active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
    [
      first_name,
      last_name,
      email       !== undefined ? email       : null,
      phone,
      address     !== undefined ? address     : null,
      gender      !== undefined ? gender      : null,
      occupation  !== undefined ? occupation  : null,
    ]
  );
  return findById(result.insertId);
};

const update = async (id, {
  first_name, last_name, email, phone,
  address, gender, occupation, is_active,
}) => {
  await pool.execute(
    `UPDATE parents SET
       first_name = COALESCE(?, first_name),
       last_name  = COALESCE(?, last_name),
       email      = COALESCE(?, email),
       phone      = COALESCE(?, phone),
       address    = COALESCE(?, address),
       gender     = COALESCE(?, gender),
       occupation = COALESCE(?, occupation),
       is_active  = COALESCE(?, is_active),
       updated_at = NOW()
     WHERE id = ?`,
    [
      first_name  !== undefined ? first_name  : null,
      last_name   !== undefined ? last_name   : null,
      email       !== undefined ? email       : null,
      phone       !== undefined ? phone       : null,
      address     !== undefined ? address     : null,
      gender      !== undefined ? gender      : null,
      occupation  !== undefined ? occupation  : null,
      is_active   !== undefined ? is_active   : null,
      id,
    ]
  );
  return findById(id);
};

const remove = async (id) => {
  const [result] = await pool.execute(
    `DELETE FROM parents WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};

// ── Search ─────────────────────────────────────────────────────────────────

const search = async (query) => {
  const term = `%${query}%`;
  const [rows] = await pool.execute(
    `SELECT
       p.id,
       p.first_name,
       p.last_name,
       p.email,
       p.phone,
       p.gender,
       p.occupation,
       p.is_active,
       COUNT(ps.student_id) AS total_students
     FROM parents p
     LEFT JOIN parent_students ps ON ps.parent_id = p.id
     WHERE
       p.first_name LIKE ? OR
       p.last_name  LIKE ? OR
       CONCAT(p.first_name, ' ', p.last_name) LIKE ? OR
       p.email      LIKE ? OR
       p.phone      LIKE ?
     GROUP BY p.id
     ORDER BY p.first_name ASC`,
    [term, term, term, term, term]
  );
  return rows;
};

// ── Student linking ────────────────────────────────────────────────────────

const findStudentsByParentId = async (parent_id) => {
  const [rows] = await pool.execute(
    `SELECT
       s.id,
       s.first_name,
       s.last_name,
       s.email,
       s.phone,
       s.gender,
       s.is_active,
       c.name        AS class_name,
       ps.relation,
       ps.is_primary
     FROM parent_students ps
     JOIN students s  ON ps.student_id = s.id
     LEFT JOIN classes c ON s.class_id = c.id
     WHERE ps.parent_id = ?
     ORDER BY ps.is_primary DESC, s.first_name ASC`,
    [parent_id]
  );
  return rows;
};

const findParentsByStudentId = async (student_id) => {
  const [rows] = await pool.execute(
    `SELECT
       p.id,
       p.first_name,
       p.last_name,
       p.email,
       p.phone,
       p.occupation,
       ps.relation,
       ps.is_primary
     FROM parent_students ps
     JOIN parents p ON ps.parent_id = p.id
     WHERE ps.student_id = ?
     ORDER BY ps.is_primary DESC, p.first_name ASC`,
    [student_id]
  );
  return rows;
};

const findLink = async (parent_id, student_id) => {
  const [rows] = await pool.execute(
    `SELECT id, parent_id, student_id, relation, is_primary
     FROM parent_students
     WHERE parent_id = ? AND student_id = ?
     LIMIT 1`,
    [parent_id, student_id]
  );
  return rows[0] || null;
};

const findStudentByIdOrName = async (value) => {
  const isNumeric = !isNaN(value);
  const [rows] = await pool.execute(
    isNumeric
      ? `SELECT id, first_name, last_name, email FROM students WHERE id = ? LIMIT 1`
      : `SELECT id, first_name, last_name, email FROM students
         WHERE first_name LIKE ? OR last_name LIKE ?
         OR CONCAT(first_name, ' ', last_name) LIKE ? LIMIT 1`,
    isNumeric ? [value] : [`%${value}%`, `%${value}%`, `%${value}%`]
  );
  return rows[0] || null;
};

const findParentByIdOrName = async (value) => {
  const isNumeric = !isNaN(value);
  const [rows] = await pool.execute(
    isNumeric
      ? `SELECT id, first_name, last_name FROM parents WHERE id = ? LIMIT 1`
      : `SELECT id, first_name, last_name FROM parents
         WHERE first_name LIKE ? OR last_name LIKE ?
         OR CONCAT(first_name, ' ', last_name) LIKE ? LIMIT 1`,
    isNumeric ? [value] : [`%${value}%`, `%${value}%`, `%${value}%`]
  );
  return rows[0] || null;
};

const linkStudent = async ({ parent_id, student_id, relation, is_primary }) => {
  const [result] = await pool.execute(
    `INSERT INTO parent_students (parent_id, student_id, relation, is_primary, created_at)
     VALUES (?, ?, ?, ?, NOW())`,
    [
      parent_id,
      student_id,
      relation   !== undefined ? relation   : 'guardian',
      is_primary !== undefined ? is_primary : 0,
    ]
  );
  return result.insertId;
};

const updateLink = async ({ parent_id, student_id, relation, is_primary }) => {
  await pool.execute(
    `UPDATE parent_students SET
       relation   = COALESCE(?, relation),
       is_primary = COALESCE(?, is_primary)
     WHERE parent_id = ? AND student_id = ?`,
    [
      relation   !== undefined ? relation   : null,
      is_primary !== undefined ? is_primary : null,
      parent_id,
      student_id,
    ]
  );
};

const unlinkStudent = async (parent_id, student_id) => {
  const [result] = await pool.execute(
    `DELETE FROM parent_students
     WHERE parent_id = ? AND student_id = ?`,
    [parent_id, student_id]
  );
  return result.affectedRows > 0;
};

module.exports = {
  findAll,
  countAll,
  findById,
  findByEmail,
  findByPhone,
  create,
  update,
  remove,
  search,
  findStudentsByParentId,
  findParentsByStudentId,
  findLink,
  findStudentByIdOrName,
  findParentByIdOrName,
  linkStudent,
  updateLink,
  unlinkStudent,
};