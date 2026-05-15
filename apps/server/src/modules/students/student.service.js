'use strict';

const studentRepository = require('./student.repository');

// ── Get all students ───────────────────────────────────────────────────────
const getAllStudents = async (query) => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(parseInt(query.limit) || 10, 100);
  const offset = (page - 1) * limit;
  const search = query.search?.trim() || null;

  const [students, total] = await Promise.all([
    studentRepository.findAll({ limit, offset, search }),
    studentRepository.countAll({ search }),
  ]);

  return {
    data: students,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ── Get single student with parents ───────────────────────────────────────
const getStudentById = async (id) => {
  const student = await studentRepository.findById(id);
  if (!student) {
    const err = new Error(`Student with id ${id} not found`);
    err.status = 404;
    throw err;
  }

  const parents = await studentRepository.findParentsByStudentId(student.id);
  return { ...student, parents };
};

const getStudentByCode = async (code) => {
  const student = await studentRepository.findByCode(code);
  if (!student) {
    const err = new Error(`Student with code ${code} not found`);
    err.status = 404;
    throw err;
  }

  const parents = await studentRepository.findParentsByStudentId(student.id);
  return { ...student, parents };
};

// ── Search students ────────────────────────────────────────────────────────
const searchStudents = async (query) => {
  if (!query || query.trim() === '') {
    const err = new Error('Search query is required');
    err.status = 400;
    throw err;
  }

  const results = await studentRepository.search(query.trim());
  return {
    query,
    total: results.length,
    data: results,
  };
};

// ── Create student ─────────────────────────────────────────────────────────
const createStudent = async (body) => {
  const { first_name, last_name, email, enrollment_date, parent_id, parent_name, relation, is_primary } = body;

  if (!first_name || !last_name || !email) {
    const err = new Error('first_name, last_name and email are required');
    err.status = 400;
    throw err;
  }

  // Check duplicate email
  const existing = await studentRepository.findByEmail(email);
  if (existing) {
    const err = new Error('A student with this email already exists');
    err.status = 409;
    throw err;
  }

  // Generate student_code
  const year = enrollment_date ? new Date(enrollment_date).getFullYear() : new Date().getFullYear();
  const sequence = await studentRepository.getNextSequenceNumber(year);
  const student_code = `SMS-${year}-${String(sequence).padStart(4, '0')}`;

  // Create the student
  const student = await studentRepository.create({ ...body, student_code });

  // If parent provided link them
  const parentIdentifier = parent_id || parent_name;
  if (parentIdentifier) {
    const resolvedParent = await studentRepository.findParentByIdOrName(parentIdentifier);
    if (!resolvedParent) {
      const err = new Error(`Parent "${parentIdentifier}" not found`);
      err.status = 404;
      throw err;
    }

    await studentRepository.linkParent({
      parent_id: resolvedParent.id,
      student_id: student.id,
      relation,
      is_primary,
    });
  }

  // Return student with parents attached
  const parents = await studentRepository.findParentsByStudentId(student.id);
  return { ...student, parents };
};

// ── Update student ─────────────────────────────────────────────────────────
const updateStudent = async (id, body) => {
  const student = await studentRepository.findById(id);
  if (!student) {
    const err = new Error(`Student with id ${id} not found`);
    err.status = 404;
    throw err;
  }

  // If email is changing check it isn't taken
  if (body.email && body.email !== student.email) {
    const existing = await studentRepository.findByEmail(body.email);
    if (existing) {
      const err = new Error('A student with this email already exists');
      err.status = 409;
      throw err;
    }
  }

  const updated = await studentRepository.update(id, body);

  // If parent provided in update body link them
  const parentIdentifier = body.parent_id || body.parent_name;
  if (parentIdentifier) {
    const resolvedParent = await studentRepository.findParentByIdOrName(parentIdentifier);
    if (!resolvedParent) {
      const err = new Error(`Parent "${parentIdentifier}" not found`);
      err.status = 404;
      throw err;
    }

    // Only link if not already linked
    const existingLink = await studentRepository.findParentStudentLink(resolvedParent.id, id);
    if (!existingLink) {
      await studentRepository.linkParent({
        parent_id: resolvedParent.id,
        student_id: id,
        relation: body.relation,
        is_primary: body.is_primary,
      });
    }
  }

  const parents = await studentRepository.findParentsByStudentId(id);
  return { ...updated, parents };
};

// ── Delete student ─────────────────────────────────────────────────────────
const deleteStudent = async (id) => {
  const student = await studentRepository.findById(id);
  if (!student) {
    const err = new Error(`Student with id ${id} not found`);
    err.status = 404;
    throw err;
  }

  await studentRepository.remove(id);
};

module.exports = {
  getAllStudents,
  getStudentById,
  getStudentByCode,
  searchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
};