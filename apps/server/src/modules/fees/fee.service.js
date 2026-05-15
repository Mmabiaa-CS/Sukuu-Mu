'use strict';

const { body } = require('express-validator');
const feeRepository = require('./fee.repository');
const { generateReceiptPDF } = require('../../utils/receipt.util');

// ── Fee Structures ─────────────────────────────────────────────────────────
const getAllStructures = async () => {
  return feeRepository.findAllStructures();
};

const createFeeStructure = async (body) => {
  const { name, total_fee } = body;

  if (!name || !total_fee) {
    const err = new Error('name and total_fee are required');
    err.status = 400;
    throw err;
  }

  if (isNaN(total_fee) || Number(total_fee) <= 0) {
    const err = new Error('total_fee must be a positive number');
    err.status = 400;
    throw err;
  }

  return feeRepository.createStructure(body);
};

// ── Get fee structure by id ────────────────────────────────────────────────
const getFeeStructureById = async (id) => {
  const structure = await feeRepository.findStructureById(id);
  if (!structure) {
    const err = new Error(`Fee structure with id ${id} not found`);
    err.status = 404;
    throw err;
  }
  return structure;
};

// ── Update fee structure ───────────────────────────────────────────────────
const updateFeeStructure = async (id, body) => {
  const structure = await feeRepository.findStructureById(id);
  if (!structure) {
    const err = new Error(`Fee structure with id ${id} not found`);
    err.status = 404;
    throw err;
  }

  // Validate total_fee if provided
  if (body.total_fee !== undefined && (isNaN(body.total_fee) || Number(body.total_fee) <= 0)) {
    const err = new Error('total_fee must be a positive number');
    err.status = 400;
    throw err;
  }

  return feeRepository.updateStructure(id, body);
};

// ── Get all payments ───────────────────────────────────────────────────────
const getAllPayments = async (query) => {
  const page   = Math.max(parseInt(query.page)  || 1, 1);
  const limit  = Math.min(parseInt(query.limit) || 10, 100);
  const offset = (page - 1) * limit;
  const search = query.search?.trim() || null;

  const [payments, total] = await Promise.all([
    feeRepository.findAllPayments({ limit, offset, search }),
    feeRepository.countAllPayments({ search }),
  ]);

  return {
    data: payments,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ── Get payments + balance for a specific student ──────────────────────────
const getStudentPayments = async (student_id) => {
  const student = await feeRepository.findStudentByIdOrName(student_id);
  if (!student) {
    const err = new Error(`Student with id ${student_id} not found`);
    err.status = 404;
    throw err;
  }

  const [payments, summary] = await Promise.all([
    feeRepository.findPaymentsByStudentId(student.id),
    feeRepository.getStudentBalance(student.id),
  ]);

  return {
    student: {
      id:         student.id,
      first_name: student.first_name,
      last_name:  student.last_name,
      email:      student.email,
    },
    summary: {
      total_fee:      summary.total_fee      || 0,
      total_paid:     summary.total_paid     || 0,
      balance:        summary.balance        || 0,
      total_payments: summary.total_payments || 0,
      is_cleared:     (summary.balance || 0) <= 0,
    },
    payments,
  };
};

// ── Record a payment ───────────────────────────────────────────────────────
const recordPayment = async (body, recorded_by) => {
  const {
    student_id, student_name,
    fee_structure_id, fee_structure_name,
    amount_paid, total_fee,
    payment_date, payment_method,
    reference, notes,
  } = body;

  // 1. Resolve student
  const studentIdentifier = student_id || student_name;
  if (!studentIdentifier) {
    const err = new Error('Provide either student_id or student_name');
    err.status = 400;
    throw err;
  }

  const student = await feeRepository.findStudentByIdOrName(studentIdentifier);
  if (!student) {
    const err = new Error(`Student "${studentIdentifier}" not found`);
    err.status = 404;
    throw err;
  }

  // 2. Resolve fee structure if provided
  let resolvedStructureId = null;
  let resolvedTotalFee    = total_fee;

  const structureIdentifier = fee_structure_id || fee_structure_name;
  if (structureIdentifier) {
    const structure = await feeRepository.findStructureByIdOrName(structureIdentifier);
    if (!structure) {
      const err = new Error(`Fee structure "${structureIdentifier}" not found`);
      err.status = 404;
      throw err;
    }
    resolvedStructureId = structure.id;
    // Use structure total_fee if not manually provided
    resolvedTotalFee = total_fee || structure.total_fee;
  }

  // 3. Validate amounts
  if (!amount_paid || isNaN(amount_paid) || Number(amount_paid) <= 0) {
    const err = new Error('amount_paid must be a positive number');
    err.status = 400;
    throw err;
  }

  if (!resolvedTotalFee || isNaN(resolvedTotalFee) || Number(resolvedTotalFee) <= 0) {
    const err = new Error('total_fee is required when no fee structure is provided');
    err.status = 400;
    throw err;
  }

  if (Number(amount_paid) > Number(resolvedTotalFee)) {
    const err = new Error('amount_paid cannot exceed total_fee');
    err.status = 400;
    throw err;
  }

  // 4. Get existing balance to check for overpayment
  const existingBalance = await feeRepository.getStudentBalance(student.id);
  const currentBalance  = existingBalance.balance !== null
    ? Number(existingBalance.balance)
    : Number(resolvedTotalFee);

  if (Number(amount_paid) > currentBalance && existingBalance.total_payments > 0) {
    const err = new Error(
      `Payment of ${amount_paid} exceeds remaining balance of ${currentBalance}`
    );
    err.status = 400;
    throw err;
  }

  // 5. Record payment
  const payment = await feeRepository.recordPayment({
    student_id:       student.id,
    fee_structure_id: resolvedStructureId,
    amount_paid:      Number(amount_paid),
    total_fee:        Number(resolvedTotalFee),
    payment_date:     payment_date || new Date(),
    payment_method,
    reference,
    notes,
    recorded_by,
  });

  // 6. Get updated balance
  const updatedBalance = await feeRepository.getStudentBalance(student.id);

  return {
    payment,
    student: {
      id:         student.id,
      first_name: student.first_name,
      last_name:  student.last_name,
    },
    summary: {
      total_fee:   updatedBalance.total_fee   || 0,
      total_paid:  updatedBalance.total_paid  || 0,
      balance:     updatedBalance.balance     || 0,
      is_cleared: (updatedBalance.balance     || 0) <= 0,
    },
  };
};

// ── Update a payment ───────────────────────────────────────────────────────
const updatePayment = async (id, body) => {
  const payment = await feeRepository.findPaymentById(id);
  if (!payment) {
    const err = new Error(`Payment with id ${id} not found`);
    err.status = 404;
    throw err;
  }

  return feeRepository.updatePayment(id, body);
};

// ── Delete a payment ───────────────────────────────────────────────────────
const deletePayment = async (id) => {
  const payment = await feeRepository.findPaymentById(id);
  if (!payment) {
    const err = new Error(`Payment with id ${id} not found`);
    err.status = 404;
    throw err;
  }

  await feeRepository.removePayment(id);
};

// ── Get single payment ─────────────────────────────────────────────────────
const getPaymentById = async (id) => {
  const payment = await feeRepository.findPaymentById(id);
  if (!payment) {
    const err = new Error(`Payment with id ${id} not found`);
    err.status = 404;
    throw err;
  }
  return payment;
};

// ── Bulk assign fee structure to multiple classes ──────────────────────────
const assignStructureToClasses = async (structure_id, { class_ids, class_names, due_date }) => {
  // 1. Verify structure exists
  const structure = await feeRepository.findStructureById(structure_id);
  if (!structure) {
    const err = new Error(`Fee structure with id ${structure_id} not found`);
    err.status = 404;
    throw err;
  }

  // 2. Resolve classes — accept ids or names or both
  const identifiers = [
    ...(class_ids   || []),
    ...(class_names || []),
  ];

  if (identifiers.length === 0) {
    const err = new Error('Provide at least one class_id or class_name');
    err.status = 400;
    throw err;
  }

  // Resolve each identifier to a class record
  const resolvedClasses = [];
  const notFound = [];

  for (const identifier of identifiers) {
    const cls = await feeRepository.findClassByIdOrName(identifier);
    if (!cls) {
      notFound.push(identifier);
    } else {
      // Avoid duplicates
      if (!resolvedClasses.find(c => c.id === cls.id)) {
        resolvedClasses.push(cls);
      }
    }
  }

  if (notFound.length > 0) {
    const err = new Error(`The following classes were not found: ${notFound.join(', ')}`);
    err.status = 404;
    throw err;
  }

  // 3. Get all active students in resolved classes
  const classIds = resolvedClasses.map(c => c.id);
  const students = await feeRepository.findStudentsByClassIds(classIds);

  if (students.length === 0) {
    const err = new Error('No active students found in the selected classes');
    err.status = 400;
    throw err;
  }

  // 4. Link structure to each class
  for (const cls of resolvedClasses) {
    await feeRepository.linkStructureToClass(structure_id, cls.id);
  }

  // 5. Create student fee record for each student (skip if already exists)
  let created  = 0;
  let skipped  = 0;

  for (const student of students) {
    const existing = await feeRepository.findExistingStudentFee(student.id, structure_id);
    if (existing) {
      skipped++;
    } else {
      await feeRepository.createStudentFee({
        student_id:       student.id,
        fee_structure_id: structure_id,
        total_fee:        structure.total_fee,
        due_date,
      });
      created++;
    }
  }

  return {
    message:     `Fee structure "${structure.name}" assigned to ${resolvedClasses.length} class(es)`,
    structure:   { id: structure.id, name: structure.name, total_fee: structure.total_fee },
    classes:     resolvedClasses,
    students_affected: {
      total:   students.length,
      created,
      skipped,
    },
  };
};

// ── Get student fee ledger ─────────────────────────────────────────────────
const getStudentFeeLedger = async (student_id) => {
  const student = await feeRepository.findStudentByIdOrName(student_id);
  if (!student) {
    const err = new Error(`Student with id ${student_id} not found`);
    err.status = 404;
    throw err;
  }

  const [fees, summary] = await Promise.all([
    feeRepository.findStudentFeesByStudentId(student.id),
    feeRepository.getStudentFeesSummary(student.id),
  ]);

  return {
    student: {
      id:         student.id,
      first_name: student.first_name,
      last_name:  student.last_name,
      email:      student.email,
    },
    summary: {
      total_structures: Number(summary.total_structures) || 0,
      total_fee:        Number(summary.total_fee)        || 0,
      total_paid:       Number(summary.total_paid)       || 0,
      total_balance:    Number(summary.total_balance)    || 0,
      cleared_count:    Number(summary.cleared_count)    || 0,
      fully_cleared:    Number(summary.total_balance)    <= 0,
    },
    fee_breakdown: fees,
  };
};


// ── Generate receipt for a payment ────────────────────────────────────────
const generateReceipt = async (payment_id) => {
  // 1. Get payment
  const payment = await feeRepository.findPaymentById(payment_id);
  if (!payment) {
    const err = new Error(`Payment with id ${payment_id} not found`);
    err.status = 404;
    throw err;
  }

  // 2. Check if receipt already exists
  const existing = await feeRepository.findReceiptByPaymentId(payment_id);
  if (existing) {
    return {
      receipt_no: existing.receipt_no,
      file_path:  existing.file_path,
      message:    'Receipt already exists',
    };
  }

  // 3. Get student with class
  const student = await feeRepository.findStudentWithClass(payment.student_id);

  // 4. Get primary parent
  const parent = await feeRepository.findPrimaryParentByStudentId(payment.student_id);

  // 5. Get student balance summary
  const balanceSummary = await feeRepository.getStudentBalance(payment.student_id);

  // 6. Generate receipt number
  const receipt_no = await feeRepository.generateReceiptNumber();

  // 7. Generate PDF
  const file_path = await generateReceiptPDF({
    receipt_no,
    payment,
    student,
    parent,
    summary: {
      total_fee:  balanceSummary.total_fee  || payment.total_fee,
      total_paid: balanceSummary.total_paid || payment.amount_paid,
      balance:    balanceSummary.balance    || 0,
    },
  });

  // 8. Save receipt record
  await feeRepository.createReceipt({ payment_id, receipt_no, file_path });

  return {
    receipt_no,
    file_path,
    student: {
      id:           student.id,
      student_code: student.student_code,
      name:         `${student.first_name} ${student.last_name}`,
      class:        student.class_name,
    },
    parent: parent ? {
      name:  `${parent.first_name} ${parent.last_name}`,
      phone: parent.phone,
    } : null,
    message: 'Receipt generated successfully',
  };
};

// ── Fee reports ────────────────────────────────────────────────────────────
const getFeeReport = async ({ academic_year, term, class_id }) => {
  // Total collected, outstanding, cleared per class
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
      term          || null, term          || null,
      class_id      || null, class_id      || null,
    ]
  );

  // Overall totals
  const totals = rows.reduce((acc, row) => ({
    total_billed:      acc.total_billed      + Number(row.total_billed),
    total_collected:   acc.total_collected   + Number(row.total_collected),
    total_outstanding: acc.total_outstanding + Number(row.total_outstanding),
    total_cleared:     acc.total_cleared     + Number(row.total_cleared),
    total_pending:     acc.total_pending     + Number(row.total_pending),
    total_students:    acc.total_students    + Number(row.total_students),
  }), {
    total_billed: 0, total_collected: 0, total_outstanding: 0,
    total_cleared: 0, total_pending: 0, total_students: 0,
  });

  totals.overall_collection_percentage = totals.total_billed > 0
    ? Math.round((totals.total_collected / totals.total_billed) * 100 * 100) / 100
    : 0;

  return {
    filters: { academic_year, term, class_id },
    totals,
    breakdown: rows,
  };
};

// ── Outstanding balances report ────────────────────────────────────────────
const getOutstandingReport = async ({ academic_year, term, class_id }) => {
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
      term          || null, term          || null,
      class_id      || null, class_id      || null,
    ]
  );

  const total_outstanding = rows.reduce((sum, r) => sum + Number(r.balance), 0);

  return {
    filters: { academic_year, term, class_id },
    total_students_owing: rows.length,
    total_outstanding,
    students: rows,
  };
};

module.exports = {
  getAllStructures,
  updateFeeStructure,
  assignStructureToClasses,  
  getStudentFeeLedger,
  getFeeStructureById,
  createFeeStructure,
  getAllPayments,
  getStudentPayments,
  recordPayment,
  updatePayment,
  deletePayment,
  getPaymentById,
  generateReceipt,          
  getFeeReport,             
  getOutstandingReport,     
};