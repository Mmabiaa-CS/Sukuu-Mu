'use strict';

const teacherRepository = require('./teacher.repository');
const authRepository = require('../auth/auth.repository');
const { hashPassword } = require('../../utils/hash.util');

const normalizeIds = (value) => {
  if (value === undefined || value === null) return [];
  const list = Array.isArray(value) ? value : [value];
  return [...new Set(list.map(Number).filter((id) => Number.isInteger(id) && id > 0))];
};

const enrichTeacher = async (teacher) => {
  const [subjects, classes] = await Promise.all([
    teacherRepository.findSubjectsByTeacherId(teacher.id),
    teacherRepository.findClassesByTeacherId(teacher.id),
  ]);
  return { ...teacher, subjects, classes };
};

// ── Get all teachers ───────────────────────────────────────────────────────
const getAllTeachers = async (query) => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(parseInt(query.limit, 10) || 100, 500);
  const offset = (page - 1) * limit;
  const search = query.search?.trim() || null;

  const [teachers, total] = await Promise.all([
    teacherRepository.findAll({ limit, offset, search }),
    teacherRepository.countAll({ search }),
  ]);

  const data = await Promise.all(teachers.map(enrichTeacher));

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ── Get single teacher with classes and subjects ───────────────────────────
const getTeacherById = async (id) => {
  const teacher = await teacherRepository.findById(id);
  if (!teacher) {
    const err = new Error(`Teacher with id ${id} not found`);
    err.status = 404;
    throw err;
  }

  return enrichTeacher(teacher);
};

// ── Search teachers ────────────────────────────────────────────────────────
const searchTeachers = async (query) => {
  if (!query || query.trim() === '') {
    const err = new Error('Search query is required');
    err.status = 400;
    throw err;
  }

  const results = await teacherRepository.search(query.trim());

  return {
    query,
    total: results.length,
    data: results,
  };
};

// ── Create teacher ─────────────────────────────────────────────────────────
const createTeacher = async (body) => {
  const { first_name, last_name, email, employee_id, user_id, password } = body;

  if (!first_name || !last_name || !email || !employee_id) {
    const err = new Error('first_name, last_name, email and employee_id are required');
    err.status = 400;
    throw err;
  }

  if (!password && !user_id) {
    const err = new Error('A password is required to create a teacher account');
    err.status = 400;
    throw err;
  }

  const [existingEmail, existingEmployeeId] = await Promise.all([
    teacherRepository.findByEmail(email),
    teacherRepository.findByEmployeeId(employee_id),
  ]);

  if (existingEmail) {
    const err = new Error('A teacher with this email already exists');
    err.status = 409;
    throw err;
  }

  if (existingEmployeeId) {
    const err = new Error(`Employee ID "${employee_id}" is already in use`);
    err.status = 409;
    throw err;
  }

  // If user_id provided make sure its not already linked to another teacher
  let createdUserId = user_id;
  if (user_id) {
    const existingUser = await teacherRepository.findByUserId(user_id);
    if (existingUser) {
      const err = new Error('This user account is already linked to a teacher profile');
      err.status = 409;
      throw err;
    }
  } else if (password) {
    // Check if user already exists
    const existingAppUser = await authRepository.findUserByEmail(email);
    if (existingAppUser) {
      const err = new Error('A system user with this email already exists.');
      err.status = 409;
      throw err;
    }

    // Get Teacher Role
    const teacherRole = await authRepository.findRoleByName('teacher');
    if (!teacherRole) {
      const err = new Error('Teacher role not configured in the database');
      err.status = 500;
      throw err;
    }

    const hashed = await hashPassword(password);
    const newUser = await authRepository.createUser({
      name: `${first_name} ${last_name}`,
      email,
      password: hashed,
      role_id: teacherRole.id
    });
    createdUserId = newUser.id;
  }

  const finalBody = { ...body, user_id: createdUserId };
  const created = await teacherRepository.create(finalBody);

  const subjectIds = normalizeIds(body.subject_ids ?? body.subjectIds);
  const classIds = normalizeIds(body.class_ids ?? body.classIds);

  if (subjectIds.length) await teacherRepository.syncSubjects(created.id, subjectIds);
  if (classIds.length) await teacherRepository.syncClasses(created.id, classIds);

  return enrichTeacher(created);
};

// ── Update teacher ─────────────────────────────────────────────────────────
const updateTeacher = async (id, body) => {
  const teacher = await teacherRepository.findById(id);
  if (!teacher) {
    const err = new Error(`Teacher with id ${id} not found`);
    err.status = 404;
    throw err;
  }

  if (body.email && body.email !== teacher.email) {
    const existing = await teacherRepository.findByEmail(body.email);
    if (existing) {
      const err = new Error('A teacher with this email already exists');
      err.status = 409;
      throw err;
    }
  }

  const updated = await teacherRepository.update(id, body);

  if (body.subject_ids !== undefined || body.subjectIds !== undefined) {
    await teacherRepository.syncSubjects(id, normalizeIds(body.subject_ids ?? body.subjectIds));
  }
  if (body.class_ids !== undefined || body.classIds !== undefined) {
    await teacherRepository.syncClasses(id, normalizeIds(body.class_ids ?? body.classIds));
  }

  return enrichTeacher(updated);
};

// ── Delete teacher ─────────────────────────────────────────────────────────
const deleteTeacher = async (id) => {
  const teacher = await teacherRepository.findById(id);
  if (!teacher) {
    const err = new Error(`Teacher with id ${id} not found`);
    err.status = 404;
    throw err;
  }

  await teacherRepository.remove(id);
};

// ── Assign class to teacher ────────────────────────────────────────────────
const assignClassToTeacher = async ({ teacher_id, teacher_name, class_id, class_name }) => {
  // Resolve teacher
  const teacherIdentifier = teacher_id || teacher_name;
  if (!teacherIdentifier) {
    const err = new Error('Provide either teacher_id or teacher_name');
    err.status = 400;
    throw err;
  }

  const resolvedTeacher = await teacherRepository.findTeacherByIdOrName(teacherIdentifier);
  if (!resolvedTeacher) {
    const err = new Error(`Teacher "${teacherIdentifier}" not found`);
    err.status = 404;
    throw err;
  }

  // Resolve class
  const classIdentifier = class_id || class_name;
  if (!classIdentifier) {
    const err = new Error('Provide either class_id or class_name');
    err.status = 400;
    throw err;
  }

  const resolvedClass = await teacherRepository.findClassByIdOrName(classIdentifier);
  if (!resolvedClass) {
    const err = new Error(`Class "${classIdentifier}" not found`);
    err.status = 404;
    throw err;
  }

  // Check if already assigned
  const existing = await teacherRepository.findTeacherClass(
    resolvedTeacher.id,
    resolvedClass.id
  );

  if (existing) {
    const err = new Error(
      `Teacher "${resolvedTeacher.first_name} ${resolvedTeacher.last_name}" is already assigned to class "${resolvedClass.name}"`
    );
    err.status = 409;
    throw err;
  }

  await teacherRepository.assignClass(resolvedTeacher.id, resolvedClass.id);

  const classes = await teacherRepository.findClassesByTeacherId(resolvedTeacher.id);

  return {
    message: `Class "${resolvedClass.name}" successfully assigned to teacher "${resolvedTeacher.first_name} ${resolvedTeacher.last_name}"`,
    teacher: resolvedTeacher,
    classes,
  };
};

// ── Remove class from teacher ──────────────────────────────────────────────
const removeClassFromTeacher = async ({ teacher_id, teacher_name, class_id, class_name }) => {
  const teacherIdentifier = teacher_id || teacher_name;
  if (!teacherIdentifier) {
    const err = new Error('Provide either teacher_id or teacher_name');
    err.status = 400;
    throw err;
  }

  const resolvedTeacher = await teacherRepository.findTeacherByIdOrName(teacherIdentifier);
  if (!resolvedTeacher) {
    const err = new Error(`Teacher "${teacherIdentifier}" not found`);
    err.status = 404;
    throw err;
  }

  const classIdentifier = class_id || class_name;
  if (!classIdentifier) {
    const err = new Error('Provide either class_id or class_name');
    err.status = 400;
    throw err;
  }

  const resolvedClass = await teacherRepository.findClassByIdOrName(classIdentifier);
  if (!resolvedClass) {
    const err = new Error(`Class "${classIdentifier}" not found`);
    err.status = 404;
    throw err;
  }

  const existing = await teacherRepository.findTeacherClass(
    resolvedTeacher.id,
    resolvedClass.id
  );

  if (!existing) {
    const err = new Error(
      `Teacher "${resolvedTeacher.first_name} ${resolvedTeacher.last_name}" is not assigned to class "${resolvedClass.name}"`
    );
    err.status = 404;
    throw err;
  }

  await teacherRepository.removeClassAssignment(resolvedTeacher.id, resolvedClass.id);

  return {
    message: `Class "${resolvedClass.name}" removed from teacher "${resolvedTeacher.first_name} ${resolvedTeacher.last_name}"`,
  };
};

// ── Assign subject to teacher ──────────────────────────────────────────────
const assignSubjectToTeacher = async ({ teacher_id, teacher_name, subject_id, subject_name, subject_code }) => {
  // Resolve teacher
  const teacherIdentifier = teacher_id || teacher_name;
  if (!teacherIdentifier) {
    const err = new Error('Provide either teacher_id or teacher_name');
    err.status = 400;
    throw err;
  }

  const resolvedTeacher = await teacherRepository.findTeacherByIdOrName(teacherIdentifier);
  if (!resolvedTeacher) {
    const err = new Error(`Teacher "${teacherIdentifier}" not found`);
    err.status = 404;
    throw err;
  }

  // Resolve subject
  const subjectIdentifier = subject_id || subject_name || subject_code;
  if (!subjectIdentifier) {
    const err = new Error('Provide either subject_id, subject_name or subject_code');
    err.status = 400;
    throw err;
  }

  const resolvedSubject = await teacherRepository.findSubjectByIdNameOrCode(subjectIdentifier);
  if (!resolvedSubject) {
    const err = new Error(`Subject "${subjectIdentifier}" not found`);
    err.status = 404;
    throw err;
  }

  // Check if already assigned
  const existing = await teacherRepository.findTeacherSubject(
    resolvedTeacher.id,
    resolvedSubject.id
  );

  if (existing) {
    const err = new Error(
      `Teacher "${resolvedTeacher.first_name} ${resolvedTeacher.last_name}" is already assigned to subject "${resolvedSubject.name}"`
    );
    err.status = 409;
    throw err;
  }

  await teacherRepository.assignSubject(resolvedTeacher.id, resolvedSubject.id);

  const subjects = await teacherRepository.findSubjectsByTeacherId(resolvedTeacher.id);

  return {
    message: `Subject "${resolvedSubject.name}" successfully assigned to teacher "${resolvedTeacher.first_name} ${resolvedTeacher.last_name}"`,
    teacher: resolvedTeacher,
    subjects,
  };
};

// ── Remove subject from teacher ────────────────────────────────────────────
const removeSubjectFromTeacher = async ({ teacher_id, teacher_name, subject_id, subject_name, subject_code }) => {
  const teacherIdentifier = teacher_id || teacher_name;
  if (!teacherIdentifier) {
    const err = new Error('Provide either teacher_id or teacher_name');
    err.status = 400;
    throw err;
  }

  const resolvedTeacher = await teacherRepository.findTeacherByIdOrName(teacherIdentifier);
  if (!resolvedTeacher) {
    const err = new Error(`Teacher "${teacherIdentifier}" not found`);
    err.status = 404;
    throw err;
  }

  const subjectIdentifier = subject_id || subject_name || subject_code;
  if (!subjectIdentifier) {
    const err = new Error('Provide either subject_id, subject_name or subject_code');
    err.status = 400;
    throw err;
  }

  const resolvedSubject = await teacherRepository.findSubjectByIdNameOrCode(subjectIdentifier);
  if (!resolvedSubject) {
    const err = new Error(`Subject "${subjectIdentifier}" not found`);
    err.status = 404;
    throw err;
  }

  const existing = await teacherRepository.findTeacherSubject(
    resolvedTeacher.id,
    resolvedSubject.id
  );

  if (!existing) {
    const err = new Error(
      `Teacher "${resolvedTeacher.first_name} ${resolvedTeacher.last_name}" is not assigned to subject "${resolvedSubject.name}"`
    );
    err.status = 404;
    throw err;
  }

  await teacherRepository.removeSubjectAssignment(resolvedTeacher.id, resolvedSubject.id);

  return {
    message: `Subject "${resolvedSubject.name}" removed from teacher "${resolvedTeacher.first_name} ${resolvedTeacher.last_name}"`,
  };
};

// ── Get all classes for a teacher ──────────────────────────────────────────
const getTeacherClasses = async (id) => {
  const teacher = await teacherRepository.findById(id);
  if (!teacher) {
    const err = new Error(`Teacher with id ${id} not found`);
    err.status = 404;
    throw err;
  }

  const classes = await teacherRepository.findClassesByTeacherId(id);
  return {
    teacher: {
      id: teacher.id,
      first_name: teacher.first_name,
      last_name: teacher.last_name,
      email: teacher.email,
    },
    total_classes: classes.length,
    classes,
  };
};

// ── Get all subjects for a teacher ─────────────────────────────────────────
const getTeacherSubjects = async (id) => {
  const teacher = await teacherRepository.findById(id);
  if (!teacher) {
    const err = new Error(`Teacher with id ${id} not found`);
    err.status = 404;
    throw err;
  }

  const subjects = await teacherRepository.findSubjectsByTeacherId(id);
  return {
    teacher: {
      id: teacher.id,
      first_name: teacher.first_name,
      last_name: teacher.last_name,
      email: teacher.email,
    },
    total_subjects: subjects.length,
    subjects,
  };
};

module.exports = {
  getAllTeachers,
  getTeacherById,
  searchTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  assignClassToTeacher,
  removeClassFromTeacher,
  assignSubjectToTeacher,
  removeSubjectFromTeacher,
  getTeacherClasses,
  getTeacherSubjects,
};