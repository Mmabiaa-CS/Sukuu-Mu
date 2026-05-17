'use strict';

const subjectRepository = require('./subject.repository');

// ── Get all subjects ───────────────────────────────────────────────────────
const getAllSubjects = async (query) => {
  const page   = Math.max(parseInt(query.page)  || 1, 1);
  const limit  = Math.min(parseInt(query.limit, 10) || 100, 500);
  const offset = (page - 1) * limit;
  const search = query.search?.trim() || null;

  const [subjects, total] = await Promise.all([
    subjectRepository.findAll({ limit, offset, search }),
    subjectRepository.countAll({ search }),
  ]);

  return {
    data: subjects,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ── Get single subject ─────────────────────────────────────────────────────
const getSubjectById = async (id) => {
  const subject = await subjectRepository.findById(id);
  if (!subject) {
    const err = new Error(`Subject with id ${id} not found`);
    err.status = 404;
    throw err;
  }

  const classes = await subjectRepository.findClassesBySubjectId(id);
  return { ...subject, classes };
};

// ── Search subjects ────────────────────────────────────────────────────────
const searchSubjects = async (query) => {
  if (!query || query.trim() === '') {
    const err = new Error('Search query is required');
    err.status = 400;
    throw err;
  }

  const results = await subjectRepository.search(query.trim());

  return {
    query,
    total: results.length,
    data: results,
  };
};

// ── Lookup subject by name or code ─────────────────────────────────────────
const lookupSubject = async ({ name, code }) => {
  if (!name && !code) {
    const err = new Error('Provide at least a name or code to search');
    err.status = 400;
    throw err;
  }

  const results = await subjectRepository.findByNameOrCode({ name, code });

  if (results.length === 0) {
    const err = new Error('No subjects found matching the provided name or code');
    err.status = 404;
    throw err;
  }

  return results;
};

// ── Create subject ─────────────────────────────────────────────────────────
const createSubject = async (body) => {
  const { name, code } = body;

  if (!name || !code) {
    const err = new Error('Subject name and code are required');
    err.status = 400;
    throw err;
  }

  const [existingName, existingCode] = await Promise.all([
    subjectRepository.findByName(name),
    subjectRepository.findByCode(code),
  ]);

  if (existingName) {
    const err = new Error(`Subject "${name}" already exists`);
    err.status = 409;
    throw err;
  }

  if (existingCode) {
    const err = new Error(`Subject code "${code}" is already in use`);
    err.status = 409;
    throw err;
  }

  return subjectRepository.create(body);
};

// ── Update subject ─────────────────────────────────────────────────────────
const updateSubject = async (id, body) => {
  const subject = await subjectRepository.findById(id);
  if (!subject) {
    const err = new Error(`Subject with id ${id} not found`);
    err.status = 404;
    throw err;
  }

  if (body.name && body.name !== subject.name) {
    const existing = await subjectRepository.findByName(body.name);
    if (existing) {
      const err = new Error(`Subject "${body.name}" already exists`);
      err.status = 409;
      throw err;
    }
  }

  if (body.code && body.code !== subject.code) {
    const existing = await subjectRepository.findByCode(body.code);
    if (existing) {
      const err = new Error(`Subject code "${body.code}" is already in use`);
      err.status = 409;
      throw err;
    }
  }

  return subjectRepository.update(id, body);
};

// ── Delete subject ─────────────────────────────────────────────────────────
const deleteSubject = async (id) => {
  const subject = await subjectRepository.findById(id);
  if (!subject) {
    const err = new Error(`Subject with id ${id} not found`);
    err.status = 404;
    throw err;
  }

  await subjectRepository.remove(id);
};

// ── Assign subject to class (by id OR name) ────────────────────────────────
const assignSubjectToClass = async ({ class_id, class_name, subject_id, subject_name, subject_code, teacher_id, teacher_name }) => {

  // 1. Resolve class — accept id or name
  const classIdentifier = class_id || class_name;
  if (!classIdentifier) {
    const err = new Error('Provide either class_id or class_name');
    err.status = 400;
    throw err;
  }

  const resolvedClass = await subjectRepository.findClassByIdOrName(classIdentifier);
  if (!resolvedClass) {
    const err = new Error(`Class "${classIdentifier}" not found`);
    err.status = 404;
    throw err;
  }

  // 2. Resolve subject — accept id, name or code
  const subjectIdentifier = subject_id || subject_name || subject_code;
  if (!subjectIdentifier) {
    const err = new Error('Provide either subject_id, subject_name or subject_code');
    err.status = 400;
    throw err;
  }

  const resolvedSubject = await subjectRepository.findSubjectByIdNameOrCode(subjectIdentifier);
  if (!resolvedSubject) {
    const err = new Error(`Subject "${subjectIdentifier}" not found`);
    err.status = 404;
    throw err;
  }

  // 3. Resolve teacher — accept id or name (optional)
  let resolvedTeacherId = null;
  const teacherIdentifier = teacher_id || teacher_name;

  if (teacherIdentifier) {
    const resolvedTeacher = await subjectRepository.findTeacherByIdOrName(teacherIdentifier);
    if (!resolvedTeacher) {
      const err = new Error(`Teacher "${teacherIdentifier}" not found or is not a teacher`);
      err.status = 404;
      throw err;
    }
    resolvedTeacherId = resolvedTeacher.id;
  }

  // 4. Check if already assigned — update teacher if so
  const existing = await subjectRepository.findAssignment(resolvedClass.id, resolvedSubject.id);

  if (existing) {
    await subjectRepository.updateAssignment({
      class_id:   resolvedClass.id,
      subject_id: resolvedSubject.id,
      teacher_id: resolvedTeacherId,
    });
  } else {
    await subjectRepository.assignToClass({
      class_id:   resolvedClass.id,
      subject_id: resolvedSubject.id,
      teacher_id: resolvedTeacherId,
    });
  }

  const subjects = await subjectRepository.findSubjectsByClassId(resolvedClass.id);

  return {
    message: existing
      ? `Subject "${resolvedSubject.name}" assignment updated for class "${resolvedClass.name}"`
      : `Subject "${resolvedSubject.name}" successfully assigned to class "${resolvedClass.name}"`,
    class: resolvedClass,
    subjects,
  };
};

// ── Remove subject from class (by id OR name) ──────────────────────────────
const removeSubjectFromClass = async ({ class_id, class_name, subject_id, subject_name, subject_code }) => {
  const classIdentifier = class_id || class_name;
  if (!classIdentifier) {
    const err = new Error('Provide either class_id or class_name');
    err.status = 400;
    throw err;
  }

  const resolvedClass = await subjectRepository.findClassByIdOrName(classIdentifier);
  if (!resolvedClass) {
    const err = new Error(`Class "${classIdentifier}" not found`);
    err.status = 404;
    throw err;
  }

  const subjectIdentifier = subject_id || subject_name || subject_code;
  if (!subjectIdentifier) {
    const err = new Error('Provide either subject_id, subject_name or subject_code');
    err.status = 400;
    throw err;
  }

  const resolvedSubject = await subjectRepository.findSubjectByIdNameOrCode(subjectIdentifier);
  if (!resolvedSubject) {
    const err = new Error(`Subject "${subjectIdentifier}" not found`);
    err.status = 404;
    throw err;
  }

  const existing = await subjectRepository.findAssignment(resolvedClass.id, resolvedSubject.id);
  if (!existing) {
    const err = new Error(`Subject "${resolvedSubject.name}" is not assigned to class "${resolvedClass.name}"`);
    err.status = 404;
    throw err;
  }

  await subjectRepository.removeAssignment(resolvedClass.id, resolvedSubject.id);

  return {
    message: `Subject "${resolvedSubject.name}" removed from class "${resolvedClass.name}"`,
  };
};

// ── Get subjects assigned to a class ──────────────────────────────────────
const getSubjectsByClass = async (class_id) => {
  const subjects = await subjectRepository.findSubjectsByClassId(class_id);
  return {
    class_id,
    total_subjects: subjects.length,
    subjects,
  };
};

module.exports = {
  getAllSubjects,
  getSubjectById,
  searchSubjects,
  lookupSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  assignSubjectToClass,
  removeSubjectFromClass,
  getSubjectsByClass,
};