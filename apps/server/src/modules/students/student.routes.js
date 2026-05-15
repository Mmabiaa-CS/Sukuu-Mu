'use strict';

const express = require('express');
const router = express.Router();

const studentController = require('./student.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

router.use(authenticate);

// ── Search — MUST be before /:id ───────────────────────────────────────────
router.get('/search', studentController.searchStudents);

// ── Student CRUD ───────────────────────────────────────────────────────────
/**
 * @openapi
 * /students:
 *   get:
 *     tags: [Students]
 *     summary: Get all students (paginated)
 *     responses:
 *       200: { description: Success }
 */
router.get('/', studentController.getAllStudents);

/**
 * @openapi
 * /students/code/{c}:
 *   get:
 *     tags: [Students]
 *     summary: Get student by code
 *     parameters:
 *       - in: path
 *         name: c
 *         required: true
 *         schema: { type: string }
 */
router.get('/code/:c', studentController.getStudentByCode);

/**
 * @openapi
 * /students/{id}:
 *   get:
 *     tags: [Students]
 *     summary: Get student by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 */
router.get('/:id', studentController.getStudentById);

/**
 * @openapi
 * /students:
 *   post:
 *     tags: [Students]
 *     summary: Create a new student
 *     security: [{ bearerAuth: [] }]
 */
router.post('/',
  authorize('admin', 'teacher'),
  studentController.createStudent
);

router.put('/:id',
  authorize('admin', 'teacher'),
  studentController.updateStudent
);

router.delete('/:id',
  authorize('admin'),
  studentController.deleteStudent
);

module.exports = router;