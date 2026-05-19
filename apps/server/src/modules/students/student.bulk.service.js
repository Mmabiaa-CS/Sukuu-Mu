'use strict';

// ── Follows EXACT same pattern as student.service.js ─────────────────────
// - Throws errors with err.status for global error.middleware.js
// - No direct SQL — all DB goes through repositories
// - Uses pool for transactions via pool.getConnection()

const { pool }           = require('../../database/connection');
const { validateAllRows } = require('./student.bulk.validator');
const {
  findExistingStudentEmails,
  findExistingParentPhones,
  resolveClassNames,
  getNextSequenceBatch,
  bulkInsertStudents,
  findStudentsByIds,
} = require('./student.bulk.repository');

// ── Shared: extract arrays from rows for batch DB lookups ─────────────────
const extractLookupArrays = (rows) => {
  const emails = [];
  const phones = [];
  const classNames = [];

  rows.forEach(({ data }) => {
    if (data.email)       emails.push(data.email.toLowerCase().trim());
    if (data.parent_phone) phones.push(data.parent_phone.trim());
    if (data.class_name)  classNames.push(data.class_name.trim());
  });

  return { emails, phones, classNames };
};

// ── Cross-check valid rows against the database ───────────────────────────
// Returns { clean, dbDuplicates }
const crossCheckWithDatabase = async (validRows) => {
  if (validRows.length === 0) return { clean: [], dbDuplicates: [] };

  const { emails, phones, classNames } = extractLookupArrays(validRows);

  const [existingEmails, existingPhones, classNameMap] = await Promise.all([
    findExistingStudentEmails(emails),
    findExistingParentPhones(phones),
    resolveClassNames(classNames),
  ]);

  const clean        = [];
  const dbDuplicates = [];

  validRows.forEach(entry => {
    const { row, data } = entry;
    const rowErrors     = [];

    const email = data.email ? data.email.toLowerCase().trim() : null;
    const phone = data.parent_phone ? data.parent_phone.trim() : null;

    if (email && existingEmails.has(email)) {
      rowErrors.push(`Student email "${data.email}" is already registered in the system`);
    }
    if (phone && existingPhones.has(phone)) {
      rowErrors.push(`Parent phone "${data.parent_phone}" is already registered in the system`);
    }

    // Warn about unknown class name — does not reject the row, student is created without class
    const classWarning = (data.class_name && !classNameMap.get(data.class_name.trim().toLowerCase()))
      ? `Class "${data.class_name}" was not found — student will be created without a class`
      : null;

    if (rowErrors.length > 0) {
      dbDuplicates.push({ row, data, errors: rowErrors });
    } else {
      clean.push({ row, data, classWarning: classWarning || null });
    }
  });

  return { clean, dbDuplicates, classNameMap };
};

// ════════════════════════════════════════════════════════════════════════════
// SERVICE METHODS
// ════════════════════════════════════════════════════════════════════════════

// ── PREVIEW ──────────────────────────────────────────────────────────────
// Validates all rows and checks DB duplicates but does NOT insert anything.
// Gives the client a chance to review before committing.
const previewBulkAdmission = async (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    const err = new Error('No student rows provided');
    err.status = 400;
    throw err;
  }

  if (rows.length > 500) {
    const err = new Error('Maximum 500 students per bulk admission request');
    err.status = 400;
    throw err;
  }

  // Step 1 — format + field validation
  const { valid, invalid, duplicates } = validateAllRows(rows);

  // Step 2 — DB existence checks on valid rows only
  const { clean, dbDuplicates, classNameMap } = await crossCheckWithDatabase(valid);

  // Build class resolution summary
  const classNames = [...new Set(
    valid.map(e => e.data.class_name).filter(Boolean).map(n => n.trim())
  )];
  const resolvedClasses = classNameMap ? [...classNameMap.entries()].map(([name, id]) => ({ name, id })) : [];
  const unresolvedClasses = classNames.filter(n => !classNameMap?.has(n.toLowerCase()));

  return {
    summary: {
      total_rows:          rows.length,
      ready_to_import:     clean.length,
      validation_errors:   invalid.length,
      db_duplicates:       dbDuplicates.length,
      in_batch_duplicates: duplicates.length,
    },
    ready:   clean.map(e => ({
      row:          e.row,
      first_name:   e.data.first_name,
      last_name:    e.data.last_name,
      email:        e.data.email,
      class_name:   e.data.class_name || null,
      has_parent:   !!(e.data.parent_first_name && e.data.parent_phone),
      class_warning: e.classWarning,
    })),
    validation_errors: invalid,
    db_duplicates:     dbDuplicates,
    class_resolution:  {
      resolved:   resolvedClasses,
      unresolved: unresolvedClasses,
    },
  };
};

// ── IMPORT ────────────────────────────────────────────────────────────────
// Validates, checks DB, then inserts inside a transaction.
// allow_partial (boolean): if true, inserts clean rows even if some are invalid.
//                          if false (default), aborts if ANY row fails validation.
const executeBulkAdmission = async (rows, { allow_partial = false } = {}) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    const err = new Error('No student rows provided');
    err.status = 400;
    throw err;
  }

  if (rows.length > 500) {
    const err = new Error('Maximum 500 students per bulk admission request');
    err.status = 400;
    throw err;
  }

  // Step 1 — validation
  const { valid, invalid, duplicates } = validateAllRows(rows);

  // Step 2 — DB cross-check
  const { clean, dbDuplicates, classNameMap } = await crossCheckWithDatabase(valid);

  const allProblems = [...invalid, ...dbDuplicates];

  // Strict mode: any problems = abort entire batch
  if (!allow_partial && allProblems.length > 0) {
    const err = new Error(
      `Bulk admission aborted — ${allProblems.length} row(s) have errors. ` +
      'Fix all errors or set allow_partial=true to insert valid rows only.'
    );
    err.status = 422;
    err.details = { validation_errors: invalid, db_duplicates: dbDuplicates };
    throw err;
  }

  // Nothing valid to insert
  if (clean.length === 0) {
    return {
      success_count: 0,
      failed_count:  allProblems.length,
      inserted:      [],
      failed:        allProblems,
      message:       'No valid rows to import',
    };
  }

  // Step 3 — Reserve student code sequences for this year
  const year = new Date().getFullYear();
  const sequences = await getNextSequenceBatch(year, clean.length);

  // Step 4 — Transaction
  const conn = await pool.getConnection();
  let insertedStudents = [];
  let insertFailed     = [];

  try {
    await conn.beginTransaction();

    const result = await bulkInsertStudents(conn, clean, classNameMap, sequences, year);
    insertedStudents = result.inserted;
    insertFailed     = result.failed;

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    const txErr = new Error('Transaction failed — all inserts rolled back: ' + err.message);
    txErr.status = 500;
    throw txErr;
  } finally {
    conn.release();
  }

  // Step 5 — Fetch inserted students for response (same shape as single create)
  const insertedIds = insertedStudents.map(s => s.student_id);
  const studentRows = await findStudentsByIds(insertedIds);

  const allFailed = [...invalid, ...dbDuplicates, ...insertFailed];

  return {
    success_count: insertedStudents.length,
    failed_count:  allFailed.length,
    inserted:      studentRows,
    failed:        allFailed,
    message: `${insertedStudents.length} student(s) admitted successfully. ${allFailed.length} failed.`,
  };
};

module.exports = { previewBulkAdmission, executeBulkAdmission };