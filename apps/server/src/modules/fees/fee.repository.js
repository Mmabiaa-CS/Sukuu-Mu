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
       fs.created_at,
       GROUP_CONCAT(DISTINCT c.id ORDER BY c.name) AS class_ids,
       GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', ') AS class_names
     FROM fee_structures fs
     LEFT JOIN fee_structure_classes fsc ON fsc.fee_structure_id = fs.id
     LEFT JOIN classes c ON fsc.class_id = c.id
     GROUP BY fs.id
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
       fs.created_at,
       fs.updated_at
     FROM fee_structures fs
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
  name, total_fee, term, academic_year, description,
}) => {
  const [result] = await pool.execute(
    `INSERT INTO fee_structures
       (name, total_fee, term, academic_year, description)
     VALUES (?, ?, ?, ?, ?)`,
    [
      name,
      total_fee,
      term !== undefined && term !== '' ? term : null,
      academic_year !== undefined && academic_year !== '' ? academic_year : null,
      description !== undefined && description !== '' ? description : null,
    ]
  );
  return findStructureById(result.insertId);
};

const updateStructure = async (id, { name, total_fee, term, academic_year, description }) => {
  await pool.execute(
    `UPDATE fee_structures SET
       name          = COALESCE(?, name),
       total_fee     = COALESCE(?, total_fee),
       term          = COALESCE(?, term),
       academic_year = COALESCE(?, academic_year),
       description   = COALESCE(?, description),
       updated_at    = NOW()
     WHERE id = ?`,
    [
      name !== undefined && name !== '' ? name : null,
      total_fee !== undefined && total_fee !== '' ? total_fee : null,
      term !== undefined && term !== '' ? term : null,
      academic_year !== undefined && academic_year !== '' ? academic_year : null,
      description !== undefined && description !== '' ? description : null,
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
      COALESCE(sf.total_fee, fs.total_fee) AS total_fee,
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
      fs.id        AS fee_structure_id,
      fs.name      AS fee_structure_name,
      fs.term,
      fs.academic_year
    FROM fee_payments fp
    JOIN students s ON fp.student_id = s.id
    LEFT JOIN classes c ON s.class_id = c.id
    LEFT JOIN fee_structures fs ON fp.fee_structure_id = fs.id
    LEFT JOIN student_fees sf ON sf.student_id = fp.student_id
      AND sf.fee_structure_id = fp.fee_structure_id
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

  const limitInt = parseInt(limit, 10);
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
       COALESCE(sf.total_fee, fs.total_fee) AS total_fee,
       fp.payment_date,
       fp.payment_method,
       fp.reference,
       fp.notes,
       fp.created_at,
       s.id         AS student_id,
       s.first_name AS student_first_name,
       s.last_name  AS student_last_name,
       fs.id        AS fee_structure_id,
       fs.name      AS fee_structure_name,
       fs.term,
       fs.academic_year
     FROM fee_payments fp
     JOIN students s ON fp.student_id = s.id
     LEFT JOIN fee_structures fs ON fp.fee_structure_id = fs.id
     LEFT JOIN student_fees sf ON sf.student_id = fp.student_id
       AND sf.fee_structure_id = fp.fee_structure_id
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
       COALESCE(sf.total_fee, fs.total_fee) AS total_fee,
       fp.payment_date,
       fp.payment_method,
       fp.reference,
       fp.notes,
       fp.created_at,
       fs.name      AS fee_structure_name,
       fs.term,
       fs.academic_year
     FROM fee_payments fp
     LEFT JOIN fee_structures fs ON fp.fee_structure_id = fs.id
     LEFT JOIN student_fees sf ON sf.student_id = fp.student_id
       AND sf.fee_structure_id = fp.fee_structure_id
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
       COUNT(sf.id)        AS total_payments,
       COALESCE(SUM(sf.total_fee), 0)  AS total_fee,
       COALESCE(SUM(sf.total_paid), 0) AS total_paid,
       COALESCE(SUM(sf.balance), 0)    AS balance
     FROM student_fees sf
     WHERE sf.student_id = ?`,
    [student_id]
  );
  return rows[0];
};

const recordPayment = async ({
  student_id, fee_structure_id, amount_paid,
  payment_date, payment_method,
  reference, notes,
}) => {
  const [result] = await pool.execute(
    `INSERT INTO fee_payments
       (student_id, fee_structure_id, amount_paid, payment_date, payment_method, reference, notes)
     VALUES (?, ?, ?, COALESCE(?, NOW()), ?, ?, ?)`,
    [
      student_id,
      fee_structure_id !== undefined ? fee_structure_id : null,
      amount_paid,
      payment_date || null,
      payment_method !== undefined ? payment_method : 'cash',
      reference !== undefined ? reference : null,
      notes !== undefined ? notes : null,
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
       notes          = COALESCE(?, notes)
     WHERE id = ?`,
    [
      amount_paid !== undefined ? amount_paid : null,
      payment_method !== undefined ? payment_method : null,
      reference !== undefined ? reference : null,
      notes !== undefined ? notes : null,
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
       (student_id, fee_structure_id, total_fee, total_paid, due_date)
     VALUES (?, ?, ?, 0.00, ?)`,
    [
      student_id,
      fee_structure_id,
      total_fee,
      due_date !== undefined ? due_date : null,
    ]
  );
  return result.insertId;
};

const linkStructureToClass = async (fee_structure_id, class_id) => {
  const [result] = await pool.execute(
    `INSERT IGNORE INTO fee_structure_classes (fee_structure_id, class_id)
     VALUES (?, ?)`,
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

const findAllStudentFees = async () => {
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
       s.id         AS student_id,
       s.first_name AS student_first_name,
       s.last_name  AS student_last_name,
       s.student_code,
       c.name       AS class_name,
       fs.id        AS fee_structure_id,
       fs.name      AS fee_structure_name,
       fs.term,
       fs.academic_year
     FROM student_fees sf
     JOIN students s        ON sf.student_id = s.id
     LEFT JOIN classes c    ON s.class_id    = c.id
     JOIN fee_structures fs ON sf.fee_structure_id = fs.id
     ORDER BY sf.created_at DESC`
  );
  return rows;
};

const updateStudentFeeBalance = async (student_id, fee_structure_id, amount_paid) => {
  await pool.execute(
    `UPDATE student_fees SET
       total_paid = total_paid + ?,
       updated_at = NOW()
     WHERE student_id = ? AND fee_structure_id = ?`,
    [amount_paid, student_id, fee_structure_id]
  );
};

const findFeeReportSummary = async ({ academic_year, term, class_id }) => {
  const [rows] = await pool.execute(
    `SELECT
       c.id                          AS class_id,
       c.name                        AS class_name,
       fs.academic_year,
       fs.term,
       fs.name                       AS structure_name,
       COUNT(sf.student_id)          AS total_students,
       SUM(sf.total_fee)             AS total_billed,
       SUM(sf.total_paid)            AS total_collected,
       SUM(sf.balance)               AS total_outstanding,
       SUM(sf.is_cleared)            AS total_cleared,
       COUNT(sf.student_id) - SUM(sf.is_cleared) AS total_pending,
       ROUND(
         (SUM(sf.total_paid) / NULLIF(SUM(sf.total_fee), 0)) * 100, 2
       )                             AS collection_percentage
     FROM student_fees sf
     JOIN students s     ON sf.student_id       = s.id
     JOIN classes c      ON s.class_id          = c.id
     JOIN fee_structures fs ON sf.fee_structure_id = fs.id
     WHERE
       (? IS NULL OR fs.academic_year = ?) AND
       (? IS NULL OR fs.term          = ?) AND
       (? IS NULL OR c.id             = ?)
     GROUP BY c.id, fs.id
     ORDER BY c.name, fs.term`,
    [
      academic_year || null, academic_year || null,
      term || null, term || null,
      class_id || null, class_id || null,
    ]
  );
  return rows;
};

const findOutstandingReport = async ({ academic_year, term, class_id }) => {
  const [rows] = await pool.execute(
    `SELECT
       s.id              AS student_id,
       s.student_code,
       s.first_name,
       s.last_name,
       c.name            AS class_name,
       fs.name           AS structure_name,
       fs.term,
       fs.academic_year,
       sf.total_fee,
       sf.total_paid,
       sf.balance,
       sf.due_date,
       p.first_name      AS parent_first_name,
       p.last_name       AS parent_last_name,
       p.phone           AS parent_phone
     FROM student_fees sf
     JOIN students s        ON sf.student_id       = s.id
     JOIN classes c         ON s.class_id          = c.id
     JOIN fee_structures fs ON sf.fee_structure_id = fs.id
     LEFT JOIN parent_students ps ON ps.student_id = s.id AND ps.is_primary = 1
     LEFT JOIN parents p    ON ps.parent_id        = p.id
     WHERE
       sf.is_cleared = 0 AND
       sf.balance    > 0 AND
       (? IS NULL OR fs.academic_year = ?) AND
       (? IS NULL OR fs.term          = ?) AND
       (? IS NULL OR c.id             = ?)
     ORDER BY sf.balance DESC, c.name`,
    [
      academic_year || null, academic_year || null,
      term || null, term || null,
      class_id || null, class_id || null,
    ]
  );
  return rows;
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

// ── Receipts ───────────────────────────────────────────────────────────────

const getNextReceiptSequence = async (year) => {
  await pool.execute(
    `INSERT INTO receipt_sequences (year, last_sequence)
     VALUES (?, 0)
     ON DUPLICATE KEY UPDATE year = year`,
    [year]
  );

  await pool.execute(
    `UPDATE receipt_sequences SET last_sequence = last_sequence + 1 WHERE year = ?`,
    [year]
  );

  const [rows] = await pool.execute(
    `SELECT last_sequence FROM receipt_sequences WHERE year = ? LIMIT 1`,
    [year]
  );

  return rows[0].last_sequence;
};

const generateReceiptNumber = async () => {
  const year = new Date().getFullYear();
  const sequence = await getNextReceiptSequence(year);
  const padded = String(sequence).padStart(5, '0');
  return `RCP-${year}-${padded}`;
};

const createReceipt = async ({ payment_id, receipt_no, file_path }) => {
  const [result] = await pool.execute(
    `INSERT INTO fee_receipts (payment_id, receipt_no, file_path, created_at)
     VALUES (?, ?, ?, NOW())`,
    [payment_id, receipt_no, file_path]
  );
  return result.insertId;
};

const findReceiptByPaymentId = async (payment_id) => {
  const [rows] = await pool.execute(
    `SELECT * FROM fee_receipts WHERE payment_id = ? LIMIT 1`,
    [payment_id]
  );
  return rows[0] || null;
};

const updateReceiptSmsStatus = async (payment_id, phone) => {
  await pool.execute(
    `UPDATE fee_receipts SET sent_sms = 1, sent_to_phone = ?, sent_at = NOW()
     WHERE payment_id = ?`,
    [phone, payment_id]
  );
};

const findPrimaryParentByStudentId = async (student_id) => {
  const [rows] = await pool.execute(
    `SELECT
       p.id,
       p.first_name,
       p.last_name,
       p.phone,
       p.email,
       ps.relation,
       ps.is_primary
     FROM parent_students ps
     JOIN parents p ON ps.parent_id = p.id
     WHERE ps.student_id = ?
     ORDER BY ps.is_primary DESC
     LIMIT 1`,
    [student_id]
  );
  return rows[0] || null;
};

const findStudentWithClass = async (student_id) => {
  const [rows] = await pool.execute(
    `SELECT
       s.id,
       s.student_code,
       s.first_name,
       s.last_name,
       s.email,
       c.name AS class_name
     FROM students s
     LEFT JOIN classes c ON s.class_id = c.id
     WHERE s.id = ?
     LIMIT 1`,
    [student_id]
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
  findAllStudentFees,
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
  generateReceiptNumber,
  createReceipt,
  findReceiptByPaymentId,
  updateReceiptSmsStatus,
  findPrimaryParentByStudentId,
  findStudentWithClass,
  findFeeReportSummary,
  findOutstandingReport,
};