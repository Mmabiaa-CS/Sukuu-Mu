'use strict';

const { pool } = require('../../database/connection');

// ── Subjects ───────────────────────────────────────────────────────────────

const findAll = async ({ limit, offset, search }) => {
  let query = `
    SELECT
      id,
      name,
      code,
      description,
      credit_hours,
      is_active,
      created_at,
      updated_at
    FROM subjects
  `;

  const params = [];

  if (search) {
    query += ` WHERE name LIKE ? OR code LIKE ? OR description LIKE ?`;
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  query += ` ORDER BY created_at DESC`;

  const limitInt  = parseInt(limit, 10);
  const offsetInt = parseInt(offset, 10);
  query += ` LIMIT ${limitInt} OFFSET ${offsetInt}`;

  const [rows] = await pool.execute(query, params);
  return rows;
};

const countAll = async ({ search }) => {
  let query = `SELECT COUNT(*) AS total FROM subjects`;
  const params = [];

  if (search) {
    query += ` WHERE name LIKE ? OR code LIKE ? OR description LIKE ?`;
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  const [rows] = await pool.execute(query, params);
  return rows[0].total;
};

const findById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT
       id,
       name,
       code,
       description,
       credit_hours,
       is_active,
       created_at,
       updated_at
     FROM subjects
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

const findByName = async (name) => {
  const [rows] = await pool.execute(
    `SELECT id, name, code FROM subjects WHERE name = ? LIMIT 1`,
    [name]
  );
  return rows[0] || null;
};

const findByCode = async (code) => {
  const [rows] = await pool.execute(
    `SELECT id, name, code FROM subjects WHERE code = ? LIMIT 1`,
    [code]
  );
  return rows[0] || null;
};

// ── Search subjects by name, code or description ───────────────────────────
const search = async (query) => {
  const term = `%${query}%`;
  const [rows] = await pool.execute(
    `SELECT
       id,
       name,
       code,
       description,
       credit_hours,
       is_active,
       created_at,
       updated_at
     FROM subjects
     WHERE
       name        LIKE ? OR
       code        LIKE ? OR
       description LIKE ?
     ORDER BY name ASC`,
    [term, term, term]
  );
  return rows;
};

const create = async ({ name, code, description, credit_hours, creditHours }) => {
  const hours = credit_hours ?? creditHours ?? 3;
  const [result] = await pool.execute(
    `INSERT INTO subjects (name, code, description, credit_hours, is_active, created_at)
     VALUES (?, ?, ?, ?, 1, NOW())`,
    [name, code, description ?? null, hours]
  );
  return findById(result.insertId);
};

const update = async (id, { name, code, description, credit_hours, creditHours, is_active }) => {
  const hours =
    credit_hours !== undefined ? credit_hours
      : creditHours !== undefined ? creditHours
        : null;

  await pool.execute(
    `UPDATE subjects SET
       name         = COALESCE(?, name),
       code         = COALESCE(?, code),
       description  = COALESCE(?, description),
       credit_hours = COALESCE(?, credit_hours),
       is_active    = COALESCE(?, is_active),
       updated_at   = NOW()
     WHERE id = ?`,
    [
      name        !== undefined ? name        : null,
      code        !== undefined ? code        : null,
      description !== undefined ? description : null,
      hours,
      is_active   !== undefined ? is_active   : null,
      id,
    ]
  );
  return findById(id);
};

const remove = async (id) => {
  const [result] = await pool.execute(
    `DELETE FROM subjects WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};

// ── Resolve class by id or name ────────────────────────────────────────────
const findClassByIdOrName = async (value) => {
  const isNumeric = !isNaN(value);
  const [rows] = await pool.execute(
    isNumeric
      ? `SELECT id, name FROM classes WHERE id = ? LIMIT 1`
      : `SELECT id, name FROM classes WHERE name LIKE ? LIMIT 1`,
    [isNumeric ? value : `%${value}%`]
  );
  return rows[0] || null;
};

// ── Resolve subject by id, name or code ───────────────────────────────────
const findSubjectByIdNameOrCode = async (value) => {
  const isNumeric = !isNaN(value);
  const [rows] = await pool.execute(
    isNumeric
      ? `SELECT id, name, code FROM subjects WHERE id = ? LIMIT 1`
      : `SELECT id, name, code FROM subjects WHERE name LIKE ? OR code LIKE ? LIMIT 1`,
    isNumeric ? [value] : [`%${value}%`, `%${value}%`]
  );
  return rows[0] || null;
};

// ── Resolve teacher by id or name ─────────────────────────────────────────
const findTeacherByIdOrName = async (value) => {
  const isNumeric = !isNaN(value);
  const [rows] = await pool.execute(
    isNumeric
      ? `SELECT id, name, email FROM users WHERE id = ? AND role_id = (SELECT id FROM roles WHERE name = 'teacher') LIMIT 1`
      : `SELECT id, name, email FROM users WHERE name LIKE ? AND role_id = (SELECT id FROM roles WHERE name = 'teacher') LIMIT 1`,
    [isNumeric ? value : `%${value}%`]
  );
  return rows[0] || null;
};

// ── Class-Subject assignments ──────────────────────────────────────────────
const assignToClass = async ({ class_id, subject_id, teacher_id }) => {
  const [result] = await pool.execute(
    `INSERT INTO class_subjects (class_id, subject_id, teacher_id, created_at)
     VALUES (?, ?, ?, NOW())`,
    [class_id, subject_id, teacher_id ?? null]
  );
  return result.insertId;
};

const findAssignment = async (class_id, subject_id) => {
  const [rows] = await pool.execute(
    `SELECT id, class_id, subject_id, teacher_id
     FROM class_subjects
     WHERE class_id = ? AND subject_id = ?
     LIMIT 1`,
    [class_id, subject_id]
  );
  return rows[0] || null;
};

const updateAssignment = async ({ class_id, subject_id, teacher_id }) => {
  await pool.execute(
    `UPDATE class_subjects
     SET teacher_id = ?
     WHERE class_id = ? AND subject_id = ?`,
    [teacher_id ?? null, class_id, subject_id]
  );
};

const removeAssignment = async (class_id, subject_id) => {
  const [result] = await pool.execute(
    `DELETE FROM class_subjects
     WHERE class_id = ? AND subject_id = ?`,
    [class_id, subject_id]
  );
  return result.affectedRows > 0;
};

const findSubjectsByClassId = async (class_id) => {
  const [rows] = await pool.execute(
    `SELECT
       s.id          AS subject_id,
       s.name        AS subject_name,
       s.code        AS subject_code,
       s.description AS subject_description,
       s.is_active   AS subject_is_active,
       u.id          AS teacher_id,
       u.name        AS teacher_name,
       u.email       AS teacher_email
     FROM class_subjects cs
     JOIN subjects s   ON cs.subject_id = s.id
     LEFT JOIN users u ON cs.teacher_id = u.id
     WHERE cs.class_id = ?
     ORDER BY s.name ASC`,
    [class_id]
  );
  return rows;
};

const findClassesBySubjectId = async (subject_id) => {
  const [rows] = await pool.execute(
    `SELECT
       c.id   AS class_id,
       c.name AS class_name,
       u.id   AS teacher_id,
       u.name AS teacher_name
     FROM class_subjects cs
     JOIN classes c    ON cs.class_id   = c.id
     LEFT JOIN users u ON cs.teacher_id = u.id
     WHERE cs.subject_id = ?
     ORDER BY c.name ASC`,
    [subject_id]
  );
  return rows;
};

const findByNameOrCode = async ({ name, code }) => {
  let query = `
    SELECT id, name, code, description, credit_hours, is_active, created_at, updated_at
    FROM subjects
    WHERE 1=1
  `;

  const params = [];

  if (name) {
    query += ` AND name LIKE ?`;
    params.push(`%${name}%`);
  }

  if (code) {
    query += ` AND code LIKE ?`;
    params.push(`%${code}%`);
  }

  query += ` ORDER BY name ASC`;

  const [rows] = await pool.execute(query, params);
  return rows;
};

module.exports = {
  findAll,
  countAll,
  findById,
  findByName,
  findByCode,
  findByNameOrCode,
  search,
  create,
  update,
  remove,
  findClassByIdOrName,
  findSubjectByIdNameOrCode,
  findTeacherByIdOrName,
  assignToClass,
  findAssignment,
  updateAssignment,
  removeAssignment,
  findSubjectsByClassId,
  findClassesBySubjectId,
};