'use strict';

const { pool } = require('../../database/connection');

const findAll = async ({ limit, offset, search }) => {
  let query = `
    SELECT
      id,
      name,
      description,
      is_active,
      created_at,
      updated_at,
      total_students
    FROM class_summary
  `;

  const params = [];

  if (search) {
    query += ` WHERE name LIKE ? OR description LIKE ?`;
    const term = `%${search}%`;
    params.push(term, term);
  }

  query += ` ORDER BY created_at DESC`;

  const limitInt  = parseInt(limit, 10);
  const offsetInt = parseInt(offset, 10);
  query += ` LIMIT ${limitInt} OFFSET ${offsetInt}`;

  const [rows] = await pool.execute(query, params);
  return rows;
};

const countAll = async ({ search }) => {
  let query = `SELECT COUNT(*) AS total FROM class_summary`;
  const params = [];

  if (search) {
    query += ` WHERE name LIKE ? OR description LIKE ?`;
    const term = `%${search}%`;
    params.push(term, term);
  }

  const [rows] = await pool.execute(query, params);
  return rows[0].total;
};

const findById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT
       id,
       name,
       description,
       is_active,
       created_at,
       updated_at,
       total_students
     FROM class_summary
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  if (!rows[0]) return null;

  // Attach subjects assigned to this class
  const [subjects] = await pool.execute(
    `SELECT
       s.id          AS subject_id,
       s.name        AS subject_name,
       s.code        AS subject_code,
       u.id          AS teacher_id,
       u.name        AS teacher_name,
       u.email       AS teacher_email
     FROM class_subjects cs
     JOIN subjects s   ON cs.subject_id = s.id
     LEFT JOIN users u ON cs.teacher_id = u.id
     WHERE cs.class_id = ?
     ORDER BY s.name ASC`,
    [id]
  );

  return { ...rows[0], subjects };
};

const findByName = async (name) => {
  const [rows] = await pool.execute(
    `SELECT id, name FROM classes WHERE name = ? LIMIT 1`,
    [name]
  );
  return rows[0] || null;
};

const findStudentsByClassId = async (classId) => {
  const [rows] = await pool.execute(
    `SELECT
       s.id,
       s.first_name,
       s.last_name,
       s.email,
       s.phone,
       s.gender,
       s.is_active
     FROM students s
     WHERE s.class_id = ?
     ORDER BY s.first_name ASC`,
    [classId]
  );
  return rows;
};

const create = async ({ name, description }) => {
  const [result] = await pool.execute(
    `INSERT INTO classes (name, description, is_active, created_at)
     VALUES (?, ?, 1, NOW())`,
    [name, description ?? null]
  );
  return findById(result.insertId);
};

const update = async (id, { name, description, is_active }) => {
  await pool.execute(
    `UPDATE classes SET
       name        = COALESCE(?, name),
       description = COALESCE(?, description),
       is_active   = COALESCE(?, is_active),
       updated_at  = NOW()
     WHERE id = ?`,
    [name ?? null, description ?? null, is_active ?? null, id]
  );
  return findById(id);
};

const remove = async (id) => {
  const [result] = await pool.execute(
    `DELETE FROM classes WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};

const migrateStudents = async (fromClassId, toClassId) => {
  const [result] = await pool.execute(
    `UPDATE students
     SET class_id   = ?,
         updated_at = NOW()
     WHERE class_id = ?`,
    [toClassId, fromClassId]
  );
  return result.affectedRows;
};

const search = async (query) => {
  const term = `%${query}%`;
  const [rows] = await pool.execute(
    `SELECT
       id,
       name,
       description,
       is_active,
       created_at,
       updated_at,
       total_students
     FROM class_summary
     WHERE
       name        LIKE ? OR
       description LIKE ?
     ORDER BY name ASC`,
    [term, term]
  );
  return rows;
};

module.exports = {
  findAll,
  countAll,
  findById,
  findByName,
  findStudentsByClassId,
  create,
  update,
  remove,
  migrateStudents,
  search
};