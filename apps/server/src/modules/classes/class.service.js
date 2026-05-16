'use strict';

const classRepository = require('./class.repository');

// ── Get all classes ────────────────────────────────────────────────────────
const getAllClasses = async (query) => {
  const page   = Math.max(parseInt(query.page)  || 1, 1);
  const limit  = Math.min(parseInt(query.limit, 10) || 100, 500);
  const offset = (page - 1) * limit;
  const search = query.search?.trim() || null;

  const [classes, total] = await Promise.all([
    classRepository.findAll({ limit, offset, search }),
    classRepository.countAll({ search }),
  ]);

  return {
    data: classes,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ── Get single class ───────────────────────────────────────────────────────
const getClassById = async (id) => {
  const cls = await classRepository.findById(id);
  if (!cls) {
    const err = new Error(`Class with id ${id} not found`);
    err.status = 404;
    throw err;
  }
  return cls;
};

// ── Get students in a class ────────────────────────────────────────────────
const getStudentsByClass = async (id) => {
  const cls = await classRepository.findById(id);
  if (!cls) {
    const err = new Error(`Class with id ${id} not found`);
    err.status = 404;
    throw err;
  }

  const students = await classRepository.findStudentsByClassId(id);

  return {
    class: {
      id: cls.id,
      name: cls.name,
      description: cls.description,
    },
    total_students: students.length,
    students,
  };
};

// ── Create class ───────────────────────────────────────────────────────────
const createClass = async (body) => {
  const { name } = body;

  if (!name) {
    const err = new Error('Class name is required');
    err.status = 400;
    throw err;
  }

  const existing = await classRepository.findByName(name);
  if (existing) {
    const err = new Error(`Class "${name}" already exists`);
    err.status = 409;
    throw err;
  }

  return classRepository.create(body);
};

// ── Update class ───────────────────────────────────────────────────────────
const updateClass = async (id, body) => {
  const cls = await classRepository.findById(id);
  if (!cls) {
    const err = new Error(`Class with id ${id} not found`);
    err.status = 404;
    throw err;
  }

  if (body.name && body.name !== cls.name) {
    const existing = await classRepository.findByName(body.name);
    if (existing) {
      const err = new Error(`Class "${body.name}" already exists`);
      err.status = 409;
      throw err;
    }
  }

  return classRepository.update(id, body);
};

// ── Delete class ───────────────────────────────────────────────────────────
const deleteClass = async (id) => {
  const cls = await classRepository.findById(id);
  if (!cls) {
    const err = new Error(`Class with id ${id} not found`);
    err.status = 404;
    throw err;
  }

  if (parseInt(cls.total_students) > 0) {
    const err = new Error(
      `Cannot delete class "${cls.name}" — it still has ${cls.total_students} student(s) assigned`
    );
    err.status = 409;
    throw err;
  }

  await classRepository.remove(id);
};

// ── Migrate all students from one class to another ─────────────────────────
const migrateStudentsToClass = async (fromClassId, toClassId) => {
  const [fromClass, toClass] = await Promise.all([
    classRepository.findById(fromClassId),
    classRepository.findById(toClassId),
  ]);

  if (!fromClass) {
    const err = new Error(`Source class with id ${fromClassId} not found`);
    err.status = 404;
    throw err;
  }

  if (!toClass) {
    const err = new Error(`Destination class with id ${toClassId} not found`);
    err.status = 404;
    throw err;
  }

  if (fromClassId === toClassId) {
    const err = new Error('Source and destination classes cannot be the same');
    err.status = 400;
    throw err;
  }

  if (parseInt(fromClass.total_students) === 0) {
    const err = new Error(`Class "${fromClass.name}" has no students to migrate`);
    err.status = 400;
    throw err;
  }

  const movedCount = await classRepository.migrateStudents(fromClassId, toClassId);

  const [updatedFrom, updatedTo] = await Promise.all([
    classRepository.findById(fromClassId),
    classRepository.findById(toClassId),
  ]);

  return {
    message: `Successfully migrated ${movedCount} student(s) from "${fromClass.name}" to "${toClass.name}"`,
    moved_count: movedCount,
    from_class: {
      id: updatedFrom.id,
      name: updatedFrom.name,
      total_students: updatedFrom.total_students,
    },
    to_class: {
      id: updatedTo.id,
      name: updatedTo.name,
      total_students: updatedTo.total_students,
    },
  };
};

const searchClasses = async (query) => {
  if (!query || query.trim() === '') {
    const err = new Error('Search query is required');
    err.status = 400;
    throw err;
  }

  const results = await classRepository.search(query.trim());

  return {
    query,
    total: results.length,
    data: results,
  };
};

module.exports = {
  getAllClasses,
  getClassById,
  getStudentsByClass,
  createClass,
  updateClass,
  deleteClass,
  migrateStudentsToClass,
  searchClasses
};