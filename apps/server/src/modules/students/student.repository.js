'use strict';

const { pool } = require('../../database/connection');

const findAll = async ({ limit, offset, search }) => {
  let query = `
    SELECT
      s.id,
      s.student_code,
      s.first_name,
      s.last_name,
      s.email,
      s.phone,
      s.date_of_birth,
      s.gender,
      s.address,
      s.enrollment_date,
      s.is_active,
      s.created_at,
      s.updated_at,
      c.id   AS class_id,
      c.name AS class_name
    FROM students s
    LEFT JOIN classes c ON s.class_id = c.id
  `;

  const params = [];

  if (search) {
    query += `
      WHERE
        s.student_code LIKE ? OR
        s.first_name LIKE ? OR
        s.last_name  LIKE ? OR
        CONCAT(s.first_name, ' ', s.last_name) LIKE ? OR
        s.email LIKE ? OR
        s.phone LIKE ?
    `;
    const term = `%${search}%`;
    params.push(term, term, term, term, term, term);
  }

  query += ` ORDER BY s.created_at DESC`;

  const limitInt = parseInt(limit, 10);
  const offsetInt = parseInt(offset, 10);
  query += ` LIMIT ${limitInt} OFFSET ${offsetInt}`;

  const [rows] = await pool.execute(query, params);
  return rows;
};

const countAll = async ({ search }) => {
  let query = `SELECT COUNT(*) AS total FROM students s`;
  const params = [];

  if (search) {
    query += `
      WHERE
        s.student_code LIKE ? OR
        s.first_name LIKE ? OR
        s.last_name  LIKE ? OR
        CONCAT(s.first_name, ' ', s.last_name) LIKE ? OR
        s.email LIKE ? OR
        s.phone LIKE ?
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
       s.id,
       s.student_code,
       s.first_name,
       s.last_name,
       s.email,
       s.phone,
       s.date_of_birth,
       s.gender,
       s.address,
       s.enrollment_date,
       s.is_active,
       s.created_at,
       s.updated_at,
       c.id   AS class_id,
       c.name AS class_name
     FROM students s
     LEFT JOIN classes c ON s.class_id = c.id
     WHERE s.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

const findByCode = async (code) => {
  const [rows] = await pool.execute(
    `SELECT
       s.id,
       s.student_code,
       s.first_name,
       s.last_name,
       s.email,
       s.phone,
       s.date_of_birth,
       s.gender,
       s.address,
       s.enrollment_date,
       s.is_active,
       s.created_at,
       s.updated_at,
       c.id   AS class_id,
       c.name AS class_name
     FROM students s
     LEFT JOIN classes c ON s.class_id = c.id
     WHERE s.student_code = ?
     LIMIT 1`,
    [code]
  );
  return rows[0] || null;
};

const findByEmail = async (email) => {
  const [rows] = await pool.execute(
    `SELECT id, email FROM students WHERE email = ? LIMIT 1`,
    [email]
  );
  return rows[0] || null;
};

// ── Parent details for a student ───────────────────────────────────────────
const findParentsByStudentId = async (student_id) => {
  const [rows] = await pool.execute(
    `SELECT
       p.id,
       p.first_name,
       p.last_name,
       p.email,
       p.phone,
       p.occupation,
       p.gender,
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

// ── Resolve parent by id or name ───────────────────────────────────────────
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

// ── Check existing parent-student link ─────────────────────────────────────
const findParentStudentLink = async (parent_id, student_id) => {
  const [rows] = await pool.execute(
    `SELECT id FROM parent_students
     WHERE parent_id = ? AND student_id = ? LIMIT 1`,
    [parent_id, student_id]
  );
  return rows[0] || null;
};

// ── Link parent to student ─────────────────────────────────────────────────
const linkParent = async ({ parent_id, student_id, relation, is_primary }) => {
  await pool.execute(
    `INSERT INTO parent_students (parent_id, student_id, relation, is_primary, created_at)
     VALUES (?, ?, ?, ?, NOW())`,
    [
      parent_id,
      student_id,
      relation !== undefined ? relation : 'guardian',
      is_primary !== undefined ? is_primary : 0,
    ]
  );
};

const getNextSequenceNumber = async (year) => {
  const [rows] = await pool.execute(
    `SELECT MAX(CAST(SUBSTRING_INDEX(student_code, '-', -1) AS UNSIGNED)) as max_seq 
     FROM students 
     WHERE student_code LIKE ?`,
    [`SMS-${year}-%`]
  );
  return (rows[0].max_seq || 0) + 1;
};

const create = async ({
  student_code, first_name, last_name, email, phone,
  date_of_birth, gender, address,
  enrollment_date, class_id,
}) => {
  const [result] = await pool.execute(
    `INSERT INTO students
       (student_code, first_name, last_name, email, phone, date_of_birth, gender,
        address, enrollment_date, class_id, is_active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
    [
      student_code,
      first_name,
      last_name,
      email,
      phone !== undefined && phone !== '' ? phone : null,
      date_of_birth !== undefined && date_of_birth !== '' ? date_of_birth : null,
      gender !== undefined && gender !== '' ? gender : null,
      address !== undefined && address !== '' ? address : null,
      enrollment_date !== undefined && enrollment_date !== '' ? enrollment_date : null,
      class_id !== undefined && class_id !== '' ? class_id : null,
    ]
  );
  return findById(result.insertId);
};

const update = async (id, {
  first_name, last_name, email, phone,
  date_of_birth, gender, address,
  enrollment_date, class_id, is_active,
}) => {
  await pool.execute(
    `UPDATE students SET
       first_name      = COALESCE(?, first_name),
       last_name       = COALESCE(?, last_name),
       email           = COALESCE(?, email),
       phone           = COALESCE(?, phone),
       date_of_birth   = COALESCE(?, date_of_birth),
       gender          = COALESCE(?, gender),
       address         = COALESCE(?, address),
       enrollment_date = COALESCE(?, enrollment_date),
       class_id        = COALESCE(?, class_id),
       is_active       = COALESCE(?, is_active),
       updated_at      = NOW()
     WHERE id = ?`,
    [
      first_name !== undefined ? first_name : null,
      last_name !== undefined ? last_name : null,
      email !== undefined ? email : null,
      phone !== undefined && phone !== '' ? phone : null,
      date_of_birth !== undefined && date_of_birth !== '' ? date_of_birth : null,
      gender !== undefined && gender !== '' ? gender : null,
      address !== undefined && address !== '' ? address : null,
      enrollment_date !== undefined && enrollment_date !== '' ? enrollment_date : null,
      class_id !== undefined && class_id !== '' ? class_id : null,
      is_active !== undefined ? is_active : null,
      id,
    ]
  );
  return findById(id);
};

const remove = async (id) => {
  const [result] = await pool.execute(
    `DELETE FROM students WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};

// ── Search ─────────────────────────────────────────────────────────────────
const search = async (query) => {
  const term = `%${query}%`;
  const [rows] = await pool.execute(
    `SELECT
       s.id,
       s.student_code,
       s.first_name,
       s.last_name,
       s.email,
       s.phone,
       s.gender,
       s.is_active,
       c.id   AS class_id,
       c.name AS class_name
     FROM students s
     LEFT JOIN classes c ON s.class_id = c.id
     WHERE
       s.student_code LIKE ? OR
       s.first_name LIKE ? OR
       s.last_name  LIKE ? OR
       CONCAT(s.first_name, ' ', s.last_name) LIKE ? OR
       s.email LIKE ? OR
       s.phone LIKE ?
     ORDER BY s.first_name ASC`,
    [term, term, term, term, term, term]
  );
  return rows;
};

module.exports = {
  findAll,
  countAll,
  findById,
  findByCode,
  findByEmail,
  findParentsByStudentId,
  findParentByIdOrName,
  findParentStudentLink,
  linkParent,
  getNextSequenceNumber,
  create,
  update,
  remove,
  search,
};