'use strict';

const express = require('express');
const router = express.Router();

const teacherController = require('./teacher.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

router.use(authenticate);

// ── Search — MUST be before /:id ───────────────────────────────────────────
/**
 * @openapi
 * /teachers/search:
 *   get:
 *     tags: [Teachers]
 *     summary: Search by name, email, employee ID
 */
router.get('/search', teacherController.searchTeachers);

// ── Teacher CRUD ───────────────────────────────────────────────────────────
/**
 * @openapi
 * /teachers:
 *   get:
 *     tags: [Teachers]
 *     summary: Get all teachers paginated
 */
router.get('/', teacherController.getAllTeachers);

/**
 * @openapi
 * /teachers/{id}:
 *   get:
 *     tags: [Teachers]
 *     summary: Get teacher with classes and subjects
 */
router.get('/:id', teacherController.getTeacherById);

/**
 * @openapi
 * /teachers/{id}/classes:
 *   get:
 *     tags: [Teachers]
 *     summary: Get all classes a teacher handles
 */
router.get('/:id/classes', teacherController.getTeacherClasses);

/**
 * @openapi
 * /teachers/{id}/subjects:
 *   get:
 *     tags: [Teachers]
 *     summary: Get all subjects a teacher teaches
 */
router.get('/:id/subjects', teacherController.getTeacherSubjects);

router.post('/',
  authorize('admin'),
  teacherController.createTeacher
);

router.put('/:id',
  authorize('admin'),
  teacherController.updateTeacher
);

router.delete('/:id',
  authorize('admin'),
  teacherController.deleteTeacher
);

// ── Assignments ────────────────────────────────────────────────────────────
/**
 * @openapi
 * /teachers/assign-class:
 *   post:
 *     tags: [Teachers]
 *     summary: Assign a class to a teacher
 */
router.post('/assign-class',
  authorize('admin'),
  teacherController.assignClassToTeacher
);

/**
 * @openapi
 * /teachers/remove-class:
 *   delete:
 *     tags: [Teachers]
 *     summary: Remove a class from a teacher
 */
router.delete('/remove-class',
  authorize('admin'),
  teacherController.removeClassFromTeacher
);

/**
 * @openapi
 * /teachers/assign-subject:
 *   post:
 *     tags: [Teachers]
 *     summary: Assign a subject to a teacher
 */
router.post('/assign-subject',
  authorize('admin'),
  teacherController.assignSubjectToTeacher
);

/**
 * @openapi
 * /teachers/remove-subject:
 *   delete:
 *     tags: [Teachers]
 *     summary: Remove a subject from a teacher
 */
router.delete('/remove-subject',
  authorize('admin'),
  teacherController.removeSubjectFromTeacher
);

module.exports = router;