'use strict';

const express = require('express');
const router = express.Router();

const studentController = require('./student.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

const bulkController  = require('./student.bulk.controller');
const { handleUpload } = require('../../middleware/upload.middleware');
 
// All routes require authentication — same as before
router.use(authenticate);
 
// ════════════════════════════════════════════════════════════════════════════
// BULK ADMISSION ROUTES
// Must be declared BEFORE /:id to avoid Express treating "bulk" as an id param
// ════════════════════════════════════════════════════════════════════════════
 
// GET  /students/bulk/template       — download CSV template
router.get('/bulk/template',
  authorize('admin', 'teacher'),
  bulkController.downloadTemplate
);
 
// POST /students/bulk/preview         — preview JSON payload
router.post('/bulk/preview',
  authorize('admin', 'teacher'),
  bulkController.previewFromJSON
);
 
// POST /students/bulk/preview/upload  — preview .csv or .xlsx file
router.post('/bulk/preview/upload',
  authorize('admin', 'teacher'),
  handleUpload,
  bulkController.previewFromFile
);
 
// POST /students/bulk/import          — commit JSON payload
router.post('/bulk/import',
  authorize('admin', 'teacher'),
  bulkController.importFromJSON
);
 
// POST /students/bulk/import/upload   — commit .csv or .xlsx file
router.post('/bulk/import/upload',
  authorize('admin', 'teacher'),
  handleUpload,
  bulkController.importFromFile
);

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