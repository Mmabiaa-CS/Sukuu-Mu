'use strict';

const { body } = require('express-validator');
const feeRepository = require('./fee.repository');

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
};