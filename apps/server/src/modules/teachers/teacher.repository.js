'use strict';

const { pool } = require('../../database/connection');

// ── Core CRUD ──────────────────────────────────────────────────────────────

const findAll = async ({ limit, offset, search }) => {
  let query = `
    SELECT
      t.id,
      t.user_id,
      t.employee_id,
      t.first_name,
      t.last_name,
      t.email,
      t.phone,
      t.gender,
      t.address,
      t.date_of_birth,
      t.join_date,
      t.qualification,
      t.is_active,
      t.created_at,
      t.updated_at
    FROM teachers t
  `;

  const params = [];

  if (search) {
    query += `
      WHERE
        t.first_name  LIKE ? OR
        t.last_name   LIKE ? OR
        CONCAT(t.first_name, ' ', t.last_name) LIKE ? OR
        t.email       LIKE ? OR
        t.employee_id LIKE ? OR
        t.phone       LIKE ?
    `;
    const term = `%${search}%`;
    params.push(term, term, term, term, term, term);
  }

  query += ` ORDER BY t.created_at DESC`;

  const limitInt = parseInt(limit, 10);
  const offsetInt = parseInt(offset, 10);
  query += ` LIMIT ${limitInt} OFFSET ${offsetInt}`;

  const [rows] = await pool.execute(query, params);
  return rows;
};

const countAll = async ({ search }) => {
  let query = `SELECT COUNT(*) AS total FROM teachers t`;
  const params = [];

  if (search) {
    query += `
      WHERE
        t.first_name  LIKE ? OR
        t.last_name   LIKE ? OR
        CONCAT(t.first_name, ' ', t.last_name) LIKE ? OR
        t.email       LIKE ? OR
        t.employee_id LIKE ? OR
        t.phone       LIKE ?
    `;
    const term = `%${search}%`;
    params.push(term, term, term, term, term, term);
  }

  const [rows] = await pool.execute(query, params);
  return rows[0].total;
};

const findById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT
       t.id,
       t.user_id,
       t.employee_id,
       t.first_name,
       t.last_name,
       t.email,
       t.phone,
       t.gender,
       t.address,
       t.date_of_birth,
       t.join_date,
       t.qualification,
       t.is_active,
       t.created_at,
       t.updated_at
     FROM teachers t
     WHERE t.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

const findByEmail = async (email) => {
  const [rows] = await pool.execute(
    `SELECT id, email FROM teachers WHERE email = ? LIMIT 1`,
    [email]
  );
  return rows[0] || null;
};

const findByEmployeeId = async (employee_id) => {
  const [rows] = await pool.execute(
    `SELECT id, employee_id FROM teachers WHERE employee_id = ? LIMIT 1`,
    [employee_id]
  );
  return rows[0] || null;
};

const findByUserId = async (user_id) => {
  const [rows] = await pool.execute(
    `SELECT id, user_id FROM teachers WHERE user_id = ? LIMIT 1`,
    [user_id]
  );
  return rows[0] || null;
};

const create = async ({
  user_id, employee_id, first_name, last_name, email,
  phone, gender, address, date_of_birth, join_date, qualification,
}) => {
  const [result] = await pool.execute(
    `INSERT INTO teachers
       (user_id, employee_id, first_name, last_name, email, phone, gender,
        address, date_of_birth, join_date, qualification, is_active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
    [
      user_id !== undefined ? user_id : null,
      employee_id,
      first_name,
      last_name,
      email,
      phone !== undefined && phone !== '' ? phone : null,
      gender !== undefined && gender !== '' ? gender : null,
      address !== undefined && address !== '' ? address : null,
      date_of_birth !== undefined && date_of_birth !== '' ? date_of_birth : null,
      join_date !== undefined && join_date !== '' ? join_date : null,
      qualification !== undefined && qualification !== '' ? qualification : null,
    ]
  );
  return findById(result.insertId);
};

const update = async (id, {
  first_name, last_name, email, phone, gender,
  address, date_of_birth, join_date, qualification, is_active,
}) => {
  await pool.execute(
    `UPDATE teachers SET
       first_name    = COALESCE(?, first_name),
       last_name     = COALESCE(?, last_name),
       email         = COALESCE(?, email),
       phone         = COALESCE(?, phone),
       gender        = COALESCE(?, gender),
       address       = COALESCE(?, address),
       date_of_birth = COALESCE(?, date_of_birth),
       join_date     = COALESCE(?, join_date),
       qualification = COALESCE(?, qualification),
       is_active     = COALESCE(?, is_active),
       updated_at    = NOW()
     WHERE id = ?`,
    [
      first_name !== undefined ? first_name : null,
      last_name !== undefined ? last_name : null,
      email !== undefined ? email : null,
      phone !== undefined && phone !== '' ? phone : null,
      gender !== undefined && gender !== '' ? gender : null,
      address !== undefined && address !== '' ? address : null,
      date_of_birth !== undefined && date_of_birth !== '' ? date_of_birth : null,
      join_date !== undefined && join_date !== '' ? join_date : null,
      qualification !== undefined && qualification !== '' ? qualification : null,
      is_active !== undefined ? is_active : null,
      id,
    ]
  );
  return findById(id);
};

const remove = async (id) => {
  const [result] = await pool.execute(
    `DELETE FROM teachers WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};

// ── Search ─────────────────────────────────────────────────────────────────

const search = async (query) => {
  const term = `%${query}%`;
  const [rows] = await pool.execute(
    `SELECT
       t.id,
       t.employee_id,
       t.first_name,
       t.last_name,
       t.email,
       t.phone,
       t.gender,
       t.qualification,
       t.is_active
     FROM teachers t
     WHERE
       t.first_name  LIKE ? OR
       t.last_name   LIKE ? OR
       CONCAT(t.first_name, ' ', t.last_name) LIKE ? OR
       t.email       LIKE ? OR
       t.employee_id LIKE ? OR
       t.phone       LIKE ?
     ORDER BY t.first_name ASC`,
    [term, term, term, term, term, term]
  );
  return rows;
};

// ── Resolve helpers ────────────────────────────────────────────────────────

const findTeacherByIdOrName = async (value) => {
  const isNumeric = !isNaN(value);
  const [rows] = await pool.execute(
    isNumeric
      ? `SELECT id, first_name, last_name, email FROM teachers WHERE id = ? LIMIT 1`
      : `SELECT id, first_name, last_name, email FROM teachers
         WHERE first_name LIKE ? OR last_name LIKE ?
         OR CONCAT(first_name, ' ', last_name) LIKE ? LIMIT 1`,
    isNumeric ? [value] : [`%${value}%`, `%${value}%`, `%${value}%`]
  );
  return rows[0] || null;
};

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

// ── Teacher-Class assignments ──────────────────────────────────────────────

const findTeacherClass = async (teacher_id, class_id) => {
  const [rows] = await pool.execute(
    `SELECT id FROM teacher_classes
     WHERE teacher_id = ? AND class_id = ? LIMIT 1`,
    [teacher_id, class_id]
  );
  return rows[0] || null;
};

const assignClass = async (teacher_id, class_id) => {
  const [result] = await pool.execute(
    `INSERT INTO teacher_classes (teacher_id, class_id, created_at)
     VALUES (?, ?, NOW())`,
    [teacher_id, class_id]
  );
  return result.insertId;
};

const removeClassAssignment = async (teacher_id, class_id) => {
  const [result] = await pool.execute(
    `DELETE FROM teacher_classes
     WHERE teacher_id = ? AND class_id = ?`,
    [teacher_id, class_id]
  );
  return result.affectedRows > 0;
};

const findClassesByTeacherId = async (teacher_id) => {
  const [rows] = await pool.execute(
    `SELECT
       c.id,
       c.name,
       c.description,
       c.is_active,
       COUNT(s.id) AS total_students
     FROM teacher_classes tc
     JOIN classes c  ON tc.class_id = c.id
     LEFT JOIN students s ON s.class_id = c.id
     WHERE tc.teacher_id = ?
     GROUP BY c.id
     ORDER BY c.name ASC`,
    [teacher_id]
  );
  return rows;
};

// ── Teacher-Subject assignments ────────────────────────────────────────────

const findTeacherSubject = async (teacher_id, subject_id) => {
  const [rows] = await pool.execute(
    `SELECT id FROM teacher_subjects
     WHERE teacher_id = ? AND subject_id = ? LIMIT 1`,
    [teacher_id, subject_id]
  );
  return rows[0] || null;
};

const assignSubject = async (teacher_id, subject_id) => {
  const [result] = await pool.execute(
    `INSERT INTO teacher_subjects (teacher_id, subject_id, created_at)
     VALUES (?, ?, NOW())`,
    [teacher_id, subject_id]
  );
  return result.insertId;
};

const removeSubjectAssignment = async (teacher_id, subject_id) => {
  const [result] = await pool.execute(
    `DELETE FROM teacher_subjects
     WHERE teacher_id = ? AND subject_id = ?`,
    [teacher_id, subject_id]
  );
  return result.affectedRows > 0;
};

const findSubjectsByTeacherId = async (teacher_id) => {
  const [rows] = await pool.execute(
    `SELECT
       s.id,
       s.name,
       s.code,
       s.description,
       s.is_active
     FROM teacher_subjects ts
     JOIN subjects s ON ts.subject_id = s.id
     WHERE ts.teacher_id = ?
     ORDER BY s.name ASC`,
    [teacher_id]
  );
  return rows;
};

module.exports = {
  findAll,
  countAll,
  findById,
  findByEmail,
  findByEmployeeId,
  findByUserId,
  create,
  update,
  remove,
  search,
  findTeacherByIdOrName,
  findClassByIdOrName,
  findSubjectByIdNameOrCode,
  findTeacherClass,
  assignClass,
  removeClassAssignment,
  findClassesByTeacherId,
  findTeacherSubject,
  assignSubject,
  removeSubjectAssignment,
  findSubjectsByTeacherId,
};