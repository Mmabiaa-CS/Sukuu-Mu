'use strict';

// ── Follows EXACT same pattern as student.repository.js ───────────────────
// - Same pool import
// - Same parameterised queries
// - Same !== undefined ? value : null pattern
// - Same findById call after insert for consistent response shape

const { pool } = require('../../database/connection');

// ── Check which emails already exist in the students table ────────────────
// Returns a Set of existing emails (lowercase) for O(1) lookup
const findExistingStudentEmails = async (emails) => {
  if (!emails || emails.length === 0) return new Set();

  const placeholders = emails.map(() => '?').join(', ');
  const lower        = emails.map(e => e.toLowerCase().trim());

  const [rows] = await pool.execute(
    `SELECT LOWER(email) AS email FROM students WHERE LOWER(email) IN (${placeholders})`,
    lower
  );

  return new Set(rows.map(r => r.email));
};

// ── Check which parent phones already exist in the parents table ──────────
const findExistingParentPhones = async (phones) => {
  if (!phones || phones.length === 0) return new Set();

  const placeholders = phones.map(() => '?').join(', ');
  const [rows] = await pool.execute(
    `SELECT phone FROM parents WHERE phone IN (${placeholders})`,
    phones
  );

  return new Set(rows.map(r => r.phone));
};

// ── Resolve class names → ids in one query ────────────────────────────────
// Returns a Map of class_name (lowercase) → class id
const resolveClassNames = async (classNames) => {
  const unique = [...new Set(classNames.filter(Boolean).map(n => n.trim()))];
  if (unique.length === 0) return new Map();

  const placeholders = unique.map(() => '?').join(', ');
  const [rows] = await pool.execute(
    `SELECT id, name FROM classes WHERE name IN (${placeholders})`,
    unique
  );

  const map = new Map();
  rows.forEach(r => map.set(r.name.trim().toLowerCase(), r.id));
  return map;
};

// ── Get next student code sequence for a given year ───────────────────────
// Mirrors the per-year sequence logic in student.repository.js exactly
const getNextSequenceBatch = async (year, count) => {
  // Ensure row exists for this year
  await pool.execute(
    `INSERT INTO student_id_sequences (academic_year, last_sequence)
     VALUES (?, 0)
     ON DUPLICATE KEY UPDATE academic_year = academic_year`,
    [year]
  );

  // Atomically reserve `count` sequence numbers
  await pool.execute(
    `UPDATE student_id_sequences SET last_sequence = last_sequence + ? WHERE academic_year = ?`,
    [count, year]
  );

  // Get the new high watermark
  const [rows] = await pool.execute(
    `SELECT last_sequence FROM student_id_sequences WHERE academic_year = ? LIMIT 1`,
    [year]
  );

  const highWatermark = rows[0].last_sequence;
  // Return the range: [highWatermark - count + 1 .. highWatermark]
  const sequences = [];
  for (let i = count; i >= 1; i--) {
    sequences.push(highWatermark - i + 1);
  }
  return sequences;
};

// ── Insert a single parent (same SQL as parent.repository.js create) ──────
const insertParent = async (conn, {
  first_name, last_name, phone,
  email, gender, occupation, address,
}) => {
  const [result] = await conn.execute(
    `INSERT INTO parents
       (first_name, last_name, email, phone, address, gender, occupation, is_active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
    [
      first_name,
      last_name,
      email      !== undefined ? email      : null,
      phone,
      address    !== undefined ? address    : null,
      gender     !== undefined ? gender     : null,
      occupation !== undefined ? occupation : null,
    ]
  );
  return result.insertId;
};

// ── Insert a single student (same SQL as student.repository.js create) ────
const insertStudent = async (conn, {
  student_code, first_name, last_name, email, phone,
  date_of_birth, gender, address, enrollment_date, class_id,
}) => {
  const [result] = await conn.execute(
    `INSERT INTO students
       (student_code, first_name, last_name, email, phone, date_of_birth,
        gender, address, enrollment_date, class_id, is_active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
    [
      student_code    !== undefined ? student_code    : null,
      first_name,
      last_name,
      email,
      phone           !== undefined ? phone           : null,
      date_of_birth   !== undefined ? date_of_birth   : null,
      gender          !== undefined ? gender          : null,
      address         !== undefined ? address         : null,
      enrollment_date !== undefined ? enrollment_date : null,
      class_id        !== undefined ? class_id        : null,
    ]
  );
  return result.insertId;
};

// ── Link parent to student (same SQL as student.repository.js linkParent) ─
const linkParentToStudent = async (conn, {
  parent_id, student_id, relation, is_primary,
}) => {
  await conn.execute(
    `INSERT INTO parent_students (parent_id, student_id, relation, is_primary, created_at)
     VALUES (?, ?, ?, ?, NOW())`,
    [
      parent_id,
      student_id,
      relation   !== undefined ? relation   : 'guardian',
      is_primary !== undefined ? is_primary : 0,
    ]
  );
};

// ── Fetch inserted students for response (same as findById) ───────────────
const findStudentsByIds = async (ids) => {
  if (!ids || ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(', ');
  const [rows] = await pool.execute(
    `SELECT
       s.id, s.student_code, s.first_name, s.last_name,
       s.email, s.phone, s.gender, s.date_of_birth,
       s.enrollment_date, s.is_active, s.created_at,
       c.id AS class_id, c.name AS class_name
     FROM students s
     LEFT JOIN classes c ON s.class_id = c.id
     WHERE s.id IN (${placeholders})
     ORDER BY s.id ASC`,
    ids
  );
  return rows;
};

// ── Main bulk insert — runs inside a single transaction ───────────────────
// conn must be a connection with transaction already started by the service
const bulkInsertStudents = async (conn, validatedRows, classNameMap, sequences, year) => {
  const inserted    = [];
  const failed      = [];
  let   seqIndex    = 0;

  for (const entry of validatedRows) {
    const { row, data } = entry;
    try {
      // Build student_code from pre-reserved sequence
      const seq          = sequences[seqIndex++];
      const student_code = `SMS-${year}-${String(seq).padStart(4, '0')}`;

      // Resolve class_id from name or direct id
      let class_id = data.class_id ? Number(data.class_id) : null;
      if (!class_id && data.class_name) {
        const resolved = classNameMap.get(data.class_name.trim().toLowerCase());
        if (resolved) {
          class_id = resolved;
        } else {
          // Class name provided but not found — insert student without class
          // and note the warning (does not fail the row)
        }
      }

      // Insert student
      const student_id = await insertStudent(conn, {
        student_code,
        first_name:      data.first_name,
        last_name:       data.last_name,
        email:           data.email,
        phone:           data.phone           || null,
        date_of_birth:   data.date_of_birth   || null,
        gender:          data.gender          || null,
        address:         data.address         || null,
        enrollment_date: data.enrollment_date || null,
        class_id,
      });

      // Insert parent if parent data provided
      let parent_id = null;
      if (data.parent_first_name && data.parent_last_name && data.parent_phone) {
        parent_id = await insertParent(conn, {
          first_name:  data.parent_first_name,
          last_name:   data.parent_last_name,
          phone:       data.parent_phone,
          email:       data.parent_email       || null,
          gender:      data.parent_gender      || null,
          occupation:  data.parent_occupation  || null,
          address:     data.parent_address     || null,
        });

        // Link parent to student
        await linkParentToStudent(conn, {
          parent_id,
          student_id,
          relation:   data.relation   || 'guardian',
          is_primary: data.is_primary !== undefined ? Number(data.is_primary) : 0,
        });
      }

      inserted.push({
        row,
        student_id,
        student_code,
        first_name: data.first_name,
        last_name:  data.last_name,
        email:      data.email,
        class_id,
        class_name: data.class_name || null,
        parent_id,
      });

    } catch (err) {
      // Per-row failure — collected and returned; does not stop the batch
      // if the service is running in partial-insert mode
      failed.push({
        row,
        data,
        errors: [err.message || 'Database insert failed'],
      });
    }
  }

  return { inserted, failed };
};

module.exports = {
  findExistingStudentEmails,
  findExistingParentPhones,
  resolveClassNames,
  getNextSequenceBatch,
  bulkInsertStudents,
  findStudentsByIds,
};