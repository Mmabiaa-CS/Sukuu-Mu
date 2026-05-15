'use strict';

const parentRepository = require('./parent.repository');

// ── Get all parents ────────────────────────────────────────────────────────
const getAllParents = async (query) => {
  const page   = Math.max(parseInt(query.page)  || 1, 1);
  const limit  = Math.min(parseInt(query.limit) || 10, 100);
  const offset = (page - 1) * limit;
  const search = query.search?.trim() || null;

  const [parents, total] = await Promise.all([
    parentRepository.findAll({ limit, offset, search }),
    parentRepository.countAll({ search }),
  ]);

  return {
    data: parents,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ── Get single parent with linked students ─────────────────────────────────
const getParentById = async (id) => {
  const parent = await parentRepository.findById(id);
  if (!parent) {
    const err = new Error(`Parent with id ${id} not found`);
    err.status = 404;
    throw err;
  }

  const students = await parentRepository.findStudentsByParentId(id);
  return { ...parent, total_students: students.length, students };
};

// ── Search parents ─────────────────────────────────────────────────────────
const searchParents = async (query) => {
  if (!query || query.trim() === '') {
    const err = new Error('Search query is required');
    err.status = 400;
    throw err;
  }

  const results = await parentRepository.search(query.trim());
  return {
    query,
    total: results.length,
    data: results,
  };
};

// ── Create parent ──────────────────────────────────────────────────────────
const createParent = async (body) => {
  const { first_name, last_name, phone } = body;

  if (!first_name || !last_name || !phone) {
    const err = new Error('first_name, last_name and phone are required');
    err.status = 400;
    throw err;
  }

  // Check duplicate email if provided
  if (body.email) {
    const existingEmail = await parentRepository.findByEmail(body.email);
    if (existingEmail) {
      const err = new Error('A parent with this email already exists');
      err.status = 409;
      throw err;
    }
  }

  // Check duplicate phone
  const existingPhone = await parentRepository.findByPhone(phone);
  if (existingPhone) {
    const err = new Error('A parent with this phone number already exists');
    err.status = 409;
    throw err;
  }

  return parentRepository.create(body);
};

// ── Update parent ──────────────────────────────────────────────────────────
const updateParent = async (id, body) => {
  const parent = await parentRepository.findById(id);
  if (!parent) {
    const err = new Error(`Parent with id ${id} not found`);
    err.status = 404;
    throw err;
  }

  if (body.email && body.email !== parent.email) {
    const existing = await parentRepository.findByEmail(body.email);
    if (existing) {
      const err = new Error('A parent with this email already exists');
      err.status = 409;
      throw err;
    }
  }

  if (body.phone && body.phone !== parent.phone) {
    const existing = await parentRepository.findByPhone(body.phone);
    if (existing) {
      const err = new Error('A parent with this phone number already exists');
      err.status = 409;
      throw err;
    }
  }

  return parentRepository.update(id, body);
};

// ── Delete parent ──────────────────────────────────────────────────────────
const deleteParent = async (id) => {
  const parent = await parentRepository.findById(id);
  if (!parent) {
    const err = new Error(`Parent with id ${id} not found`);
    err.status = 404;
    throw err;
  }

  await parentRepository.remove(id);
};

// ── Link student to parent ─────────────────────────────────────────────────
const linkStudentToParent = async ({
  parent_id, parent_name,
  student_id, student_name,
  relation, is_primary,
}) => {
  // Resolve parent
  const parentIdentifier = parent_id || parent_name;
  if (!parentIdentifier) {
    const err = new Error('Provide either parent_id or parent_name');
    err.status = 400;
    throw err;
  }

  const resolvedParent = await parentRepository.findParentByIdOrName(parentIdentifier);
  if (!resolvedParent) {
    const err = new Error(`Parent "${parentIdentifier}" not found`);
    err.status = 404;
    throw err;
  }

  // Resolve student
  const studentIdentifier = student_id || student_name;
  if (!studentIdentifier) {
    const err = new Error('Provide either student_id or student_name');
    err.status = 400;
    throw err;
  }

  const resolvedStudent = await parentRepository.findStudentByIdOrName(studentIdentifier);
  if (!resolvedStudent) {
    const err = new Error(`Student "${studentIdentifier}" not found`);
    err.status = 404;
    throw err;
  }

  // Check if already linked — update relation if so
  const existing = await parentRepository.findLink(resolvedParent.id, resolvedStudent.id);

  if (existing) {
    await parentRepository.updateLink({
      parent_id:  resolvedParent.id,
      student_id: resolvedStudent.id,
      relation,
      is_primary,
    });
  } else {
    await parentRepository.linkStudent({
      parent_id:  resolvedParent.id,
      student_id: resolvedStudent.id,
      relation,
      is_primary,
    });
  }

  const students = await parentRepository.findStudentsByParentId(resolvedParent.id);

  return {
    message: existing
      ? `Link between "${resolvedParent.first_name} ${resolvedParent.last_name}" and "${resolvedStudent.first_name} ${resolvedStudent.last_name}" updated`
      : `Student "${resolvedStudent.first_name} ${resolvedStudent.last_name}" successfully linked to parent "${resolvedParent.first_name} ${resolvedParent.last_name}"`,
    parent: resolvedParent,
    total_students: students.length,
    students,
  };
};

// ── Unlink student from parent ─────────────────────────────────────────────
const unlinkStudentFromParent = async ({
  parent_id, parent_name,
  student_id, student_name,
}) => {
  // Resolve parent
  const parentIdentifier = parent_id || parent_name;
  if (!parentIdentifier) {
    const err = new Error('Provide either parent_id or parent_name');
    err.status = 400;
    throw err;
  }

  const resolvedParent = await parentRepository.findParentByIdOrName(parentIdentifier);
  if (!resolvedParent) {
    const err = new Error(`Parent "${parentIdentifier}" not found`);
    err.status = 404;
    throw err;
  }

  // Resolve student
  const studentIdentifier = student_id || student_name;
  if (!studentIdentifier) {
    const err = new Error('Provide either student_id or student_name');
    err.status = 400;
    throw err;
  }

  const resolvedStudent = await parentRepository.findStudentByIdOrName(studentIdentifier);
  if (!resolvedStudent) {
    const err = new Error(`Student "${studentIdentifier}" not found`);
    err.status = 404;
    throw err;
  }

  const existing = await parentRepository.findLink(resolvedParent.id, resolvedStudent.id);
  if (!existing) {
    const err = new Error(
      `No link found between "${resolvedParent.first_name} ${resolvedParent.last_name}" and "${resolvedStudent.first_name} ${resolvedStudent.last_name}"`
    );
    err.status = 404;
    throw err;
  }

  await parentRepository.unlinkStudent(resolvedParent.id, resolvedStudent.id);

  return {
    message: `Student "${resolvedStudent.first_name} ${resolvedStudent.last_name}" unlinked from parent "${resolvedParent.first_name} ${resolvedParent.last_name}"`,
  };
};

// ── Get all students for a parent ──────────────────────────────────────────
const getStudentsByParent = async (id) => {
  const parent = await parentRepository.findById(id);
  if (!parent) {
    const err = new Error(`Parent with id ${id} not found`);
    err.status = 404;
    throw err;
  }

  const students = await parentRepository.findStudentsByParentId(id);
  return {
    parent: {
      id: parent.id,
      first_name: parent.first_name,
      last_name:  parent.last_name,
      phone:      parent.phone,
      email:      parent.email,
    },
    total_students: students.length,
    students,
  };
};

// ── Get all parents for a student ──────────────────────────────────────────
const getParentsByStudent = async (student_id) => {
  const parents = await parentRepository.findParentsByStudentId(student_id);
  return {
    student_id,
    total_parents: parents.length,
    parents,
  };
};

module.exports = {
  getAllParents,
  getParentById,
  searchParents,
  createParent,
  updateParent,
  deleteParent,
  linkStudentToParent,
  unlinkStudentFromParent,
  getStudentsByParent,
  getParentsByStudent,
};