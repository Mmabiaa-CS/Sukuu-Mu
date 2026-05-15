'use strict';

const express = require('express');
const router = express.Router();

const parentController = require('./parent.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

router.use(authenticate);

// ── Search — MUST be before /:id ───────────────────────────────────────────
/**
 * @openapi
 * /parents/search:
 *   get:
 *     tags: [Parents]
 *     summary: Search by name, email, phone
 */
router.get('/search', parentController.searchParents);

/**
 * @openapi
 * /parents/student/{student_id}:
 *   get:
 *     tags: [Parents]
 *     summary: Get all parents of a student
 */
router.get('/student/:student_id', parentController.getParentsByStudent);

// ── Parent CRUD ────────────────────────────────────────────────────────────
/**
 * @openapi
 * /parents:
 *   get:
 *     tags: [Parents]
 *     summary: Get all parents paginated
 */
router.get('/', parentController.getAllParents);

/**
 * @openapi
 * /parents/{id}:
 *   get:
 *     tags: [Parents]
 *     summary: Get parent with linked students
 */
router.get('/:id', parentController.getParentById);

/**
 * @openapi
 * /parents/{id}/students:
 *   get:
 *     tags: [Parents]
 *     summary: Get all students linked to a parent
 */
router.get('/:id/students', parentController.getStudentsByParent);

router.post('/',
  authorize('admin'),
  parentController.createParent
);

router.put('/:id',
  authorize('admin'),
  parentController.updateParent
);

router.delete('/:id',
  authorize('admin'),
  parentController.deleteParent
);

// ── Student linking ────────────────────────────────────────────────────────
/**
 * @openapi
 * /parents/link-student:
 *   post:
 *     tags: [Parents]
 *     summary: Link parent to a student
 */
router.post('/link-student',
  authorize('admin'),
  parentController.linkStudentToParent
);

/**
 * @openapi
 * /parents/unlink-student:
 *   delete:
 *     tags: [Parents]
 *     summary: Unlink parent from a student
 */
router.delete('/unlink-student',
  authorize('admin'),
  parentController.unlinkStudentFromParent
);

module.exports = router;