'use strict';

const { pool } = require('../../database/connection');

// ── Fee Structures ─────────────────────────────────────────────────────────

const findAllStructures = async () => {
  const [rows] = await pool.execute(
    `SELECT
       fs.id,
       fs.name,
       fs.total_fee,
       fs.term,
       fs.academic_year,
       fs.description,
       fs.is_active,
       c.id   AS class_id,
       c.name AS class_name
     FROM fee_structures fs
     LEFT JOIN classes c ON fs.class_id = c.id
     WHERE fs.is_active = 1
     ORDER BY fs.created_at DESC`
  );
  return rows;
};

const findStructureById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT
       fs.id,
       fs.name,
       fs.total_fee,
       fs.term,
       fs.academic_year,
       fs.description,
       fs.is_active,
       c.id   AS class_id,
       c.name AS class_name
     FROM fee_structures fs
     LEFT JOIN classes c ON fs.class_id = c.id
     WHERE fs.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

const findStructureByIdOrName = async (value) => {
  const isNumeric = !isNaN(value);
  const [rows] = await pool.execute(
    isNumeric
      ? `SELECT id, name, total_fee FROM fee_structures WHERE id = ? LIMIT 1`
      : `SELECT id, name, total_fee FROM fee_structures WHERE name LIKE ? LIMIT 1`,
    [isNumeric ? value : `%${value}%`]
  );
  return rows[0] || null;
};

const createStructure = async ({
  name, total_fee, class_id, term, academic_year, description,
}) => {
  const [result] = await pool.execute(
    `INSERT INTO fee_structures
       (name, total_fee, class_id, term, academic_year, description, is_active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 1, NOW())`,
    [
      name,
      total_fee,
      class_id      !== undefined ? class_id      : null,
      term          !== undefined ? term          : null,
      academic_year !== undefined ? academic_year : null,
      description   !== undefined ? description   : null,
    ]
  );
  return findStructureById(result.insertId);
};

const updateStructure = async (id, { name, total_fee, class_id, term, academic_year, description, is_active }) => {
  await pool.execute(
    `UPDATE fee_structures SET
       name          = COALESCE(?, name),
       total_fee     = COALESCE(?, total_fee),
       class_id      = COALESCE(?, class_id),
       term          = COALESCE(?, term),
       academic_year = COALESCE(?, academic_year),
       description   = COALESCE(?, description),
       is_active     = COALESCE(?, is_active),
       updated_at    = NOW()
     WHERE id = ?`,
    [
      name          !== undefined ? name          : null,
      total_fee     !== undefined ? total_fee     : null,
      class_id      !== undefined ? class_id      : null,
      term          !== undefined ? term          : null,
      academic_year !== undefined ? academic_year : null,
      description   !== undefined ? description   : null,
      is_active     !== undefined ? is_active     : null,
      id,
    ]
  );
  return findStructureById(id);
};

// ── Payments ───────────────────────────────────────────────────────────────

const findAllPayments = async ({ limit, offset, search }) => {
  let query = `
    SELECT
      fp.id,
      fp.amount_paid,
      fp.total_fee,
      fp.payment_date,
      fp.payment_method,
      fp.reference,
      fp.notes,
      fp.created_at,
      s.id         AS student_id,
      s.first_name AS student_first_name,
      s.last_name  AS student_last_name,
      s.email      AS student_email,
      c.name       AS class_name,
      fs.name      AS fee_structure_name,
      fs.term,
      fs.academic_year,
      u.name       AS recorded_by_name
    FROM fee_payments fp
    JOIN students s      ON fp.student_id = s.id
    LEFT JOIN classes c  ON s.class_id    = c.id
    LEFT JOIN fee_structures fs ON fp.fee_structure_id = fs.id
    LEFT JOIN users u    ON fp.recorded_by = u.id
  `;

  const params = [];

  if (search) {
    query += `
      WHERE
        s.first_name LIKE ? OR
        s.last_name  LIKE ? OR
        CONCAT(s.first_name, ' ', s.last_name) LIKE ? OR
        fp.reference LIKE ?
    `;
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }

  query += ` ORDER BY fp.payment_date DESC`;

  const limitInt  = parseInt(limit, 10);
  const offsetInt = parseInt(offset, 10);
  query += ` LIMIT ${limitInt} OFFSET ${offsetInt}`;

  const [rows] = await pool.execute(query, params);
  return rows;
};

const countAllPayments = async ({ search }) => {
  let query = `
    SELECT COUNT(*) AS total
    FROM fee_payments fp
    JOIN students s ON fp.student_id = s.id
  `;
  const params = [];

  if (search) {
    query += `
      WHERE
        s.first_name LIKE ? OR
        s.last_name  LIKE ? OR
        CONCAT(s.first_name, ' ', s.last_name) LIKE ? OR
        fp.reference LIKE ?
    `;
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }

  const [rows] = await pool.execute(query, params);
  return rows[0].total;
};

const findPaymentById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT
       fp.id,
       fp.amount_paid,
       fp.total_fee,
       fp.payment_date,
       fp.payment_method,
       fp.reference,
       fp.notes,
       fp.created_at,
       fp.updated_at,
       s.id         AS student_id,
       s.first_name AS student_first_name,
       s.last_name  AS student_last_name,
       fs.name      AS fee_structure_name,
       fs.term,
       fs.academic_year,
       u.name       AS recorded_by_name
     FROM fee_payments fp
     JOIN students s ON fp.student_id = s.id
     LEFT JOIN fee_structures fs ON fp.fee_structure_id = fs.id
     LEFT JOIN users u ON fp.recorded_by = u.id
     WHERE fp.id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

// ── Payment summary per student ────────────────────────────────────────────
const findPaymentsByStudentId = async (student_id) => {
  const [rows] = await pool.execute(
    `SELECT
       fp.id,
       fp.amount_paid,
       fp.total_fee,
       fp.payment_date,
       fp.payment_method,
       fp.reference,
       fp.notes,
       fp.created_at,
       fs.name      AS fee_structure_name,
       fs.term,
       fs.academic_year,
       u.name       AS recorded_by_name
     FROM fee_payments fp
     LEFT JOIN fee_structures fs ON fp.fee_structure_id = fs.id
     LEFT JOIN users u ON fp.recorded_by = u.id
     WHERE fp.student_id = ?
     ORDER BY fp.payment_date DESC`,
    [student_id]
  );
  return rows;
};

// ── Live balance calculation per student ───────────────────────────────────
const getStudentBalance = async (student_id) => {
  const [rows] = await pool.execute(
    `SELECT
       COUNT(fp.id)           AS total_payments,
       MAX(fp.total_fee)      AS total_fee,
       SUM(fp.amount_paid)    AS total_paid,
       MAX(fp.total_fee) - SUM(fp.amount_paid) AS balance
     FROM fee_payments fp
     WHERE fp.student_id = ?`,
    [student_id]
  );
  return rows[0];
};

const recordPayment = async ({
  student_id, fee_structure_id, amount_paid,
  total_fee, payment_date, payment_method,
  reference, notes, recorded_by,
}) => {
  const [result] = await pool.execute(
    `INSERT INTO fee_payments
       (student_id, fee_structure_id, amount_paid, total_fee,
        payment_date, payment_method, reference, notes, recorded_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      student_id,
      fee_structure_id  !== undefined ? fee_structure_id  : null,
      amount_paid,
      total_fee,
      payment_date,
      payment_method    !== undefined ? payment_method    : 'cash',
      reference         !== undefined ? reference         : null,
      notes             !== undefined ? notes             : null,
      recorded_by       !== undefined ? recorded_by       : null,
    ]
  );
  return findPaymentById(result.insertId);
};

const updatePayment = async (id, {
  amount_paid, payment_method, reference, notes,
}) => {
  await pool.execute(
    `UPDATE fee_payments SET
       amount_paid    = COALESCE(?, amount_paid),
       payment_method = COALESCE(?, payment_method),
       reference      = COALESCE(?, reference),
       notes          = COALESCE(?, notes),
       updated_at     = NOW()
     WHERE id = ?`,
    [
      amount_paid    !== undefined ? amount_paid    : null,
      payment_method !== undefined ? payment_method : null,
      reference      !== undefined ? reference      : null,
      notes          !== undefined ? notes          : null,
      id,
    ]
  );
  return findPaymentById(id);
};

const removePayment = async (id) => {
  const [result] = await pool.execute(
    `DELETE FROM fee_payments WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};

// ── Resolve helpers ────────────────────────────────────────────────────────
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

// ── Bulk assign fee structure to classes ───────────────────────────────────

const findStudentsByClassIds = async (classIds) => {
  const placeholders = classIds.map(() => '?').join(', ');
  const [rows] = await pool.execute(
    `SELECT
       s.id,
       s.first_name,
       s.last_name,
       s.email,
       s.class_id,
       c.name AS class_name
     FROM students s
     JOIN classes c ON s.class_id = c.id
     WHERE s.class_id IN (${placeholders})
     AND s.is_active = 1`,
    classIds
  );
  return rows;
};

const findExistingStudentFee = async (student_id, fee_structure_id) => {
  const [rows] = await pool.execute(
    `SELECT id, student_id, fee_structure_id, balance, is_cleared
     FROM student_fees
     WHERE student_id = ? AND fee_structure_id = ?
     LIMIT 1`,
    [student_id, fee_structure_id]
  );
  return rows[0] || null;
};

const createStudentFee = async ({
  student_id, fee_structure_id, total_fee, due_date,
}) => {
  const [result] = await pool.execute(
    `INSERT INTO student_fees
       (student_id, fee_structure_id, total_fee, total_paid, balance, is_cleared, due_date, created_at)
     VALUES (?, ?, ?, 0.00, ?, 0, ?, NOW())`,
    [
      student_id,
      fee_structure_id,
      total_fee,
      total_fee,
      due_date !== undefined ? due_date : null,
    ]
  );
  return result.insertId;
};

const linkStructureToClass = async (fee_structure_id, class_id) => {
  const [result] = await pool.execute(
    `INSERT IGNORE INTO fee_structure_classes (fee_structure_id, class_id, created_at)
     VALUES (?, ?, NOW())`,
    [fee_structure_id, class_id]
  );
  return result.insertId;
};

const findClassesByStructureId = async (fee_structure_id) => {
  const [rows] = await pool.execute(
    `SELECT
       c.id,
       c.name,
       COUNT(s.id) AS total_students
     FROM fee_structure_classes fsc
     JOIN classes c ON fsc.class_id = c.id
     LEFT JOIN students s ON s.class_id = c.id
     WHERE fsc.fee_structure_id = ?
     GROUP BY c.id`,
    [fee_structure_id]
  );
  return rows;
};

// ── Student fee ledger ─────────────────────────────────────────────────────

const findStudentFeesByStudentId = async (student_id) => {
  const [rows] = await pool.execute(
    `SELECT
       sf.id,
       sf.total_fee,
       sf.total_paid,
       sf.balance,
       sf.is_cleared,
       sf.due_date,
       sf.created_at,
       sf.updated_at,
       fs.id   AS fee_structure_id,
       fs.name AS fee_structure_name,
       fs.term,
       fs.academic_year
     FROM student_fees sf
     JOIN fee_structures fs ON sf.fee_structure_id = fs.id
     WHERE sf.student_id = ?
     ORDER BY sf.created_at DESC`,
    [student_id]
  );
  return rows;
};

const updateStudentFeeBalance = async (student_id, fee_structure_id, amount_paid) => {
  await pool.execute(
    `UPDATE student_fees SET
       total_paid = total_paid + ?,
       balance    = balance - ?,
       is_cleared = CASE WHEN (balance - ?) <= 0 THEN 1 ELSE 0 END,
       updated_at = NOW()
     WHERE student_id = ? AND fee_structure_id = ?`,
    [amount_paid, amount_paid, amount_paid, student_id, fee_structure_id]
  );
};

const getStudentFeesSummary = async (student_id) => {
  const [rows] = await pool.execute(
    `SELECT
       COUNT(*)                AS total_structures,
       SUM(sf.total_fee)       AS total_fee,
       SUM(sf.total_paid)      AS total_paid,
       SUM(sf.balance)         AS total_balance,
       SUM(sf.is_cleared)      AS cleared_count
     FROM student_fees sf
     WHERE sf.student_id = ?`,
    [student_id]
  );
  return rows[0];
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

module.exports = {
  findAllStructures,
  updateStructure,
  findStructureById,
  findStructureByIdOrName,
  createStructure,
   findStudentsByClassIds,
  findExistingStudentFee,
  createStudentFee,
  linkStructureToClass,
  findClassesByStructureId,
  findStudentFeesByStudentId,
  updateStudentFeeBalance,
  getStudentFeesSummary,
  findClassByIdOrName,
  findAllPayments,
  countAllPayments,
  findPaymentById,
  findPaymentsByStudentId,
  getStudentBalance,
  recordPayment,
  updatePayment,
  removePayment,
  findStudentByIdOrName,
};