'use strict';

const express = require('express');
const router = express.Router();

const subjectController = require('./subject.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

router.use(authenticate);

// ── Search & lookup — MUST be before /:id ──────────────────────────────────
/**
 * @openapi
 * /subjects/search:
 *   get:
 *     tags: [Subjects]
 *     summary: Search by name, code, or description
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 */
router.get('/search', subjectController.searchSubjects);

/**
 * @openapi
 * /subjects/lookup:
 *   get:
 *     tags: [Subjects]
 *     summary: Find subject by exact name or code
 */
router.get('/lookup', subjectController.lookupSubject);

/**
 * @openapi
 * /subjects/class/{class_id}:
 *   get:
 *     tags: [Subjects]
 *     summary: Get all subjects in a specific class
 */
router.get('/class/:class_id', subjectController.getSubjectsByClass);

// ── Subject CRUD ───────────────────────────────────────────────────────────
router.get('/', subjectController.getAllSubjects);
router.get('/:id', subjectController.getSubjectById);

router.post('/',
  authorize('admin'),
  subjectController.createSubject
);

router.put('/:id',
  authorize('admin', 'teacher'),
  subjectController.updateSubject
);

router.delete('/:id',
  authorize('admin'),
  subjectController.deleteSubject
);

// ── Class-Subject assignments ──────────────────────────────────────────────
/**
 * @openapi
 * /subjects/assign-to-class:
 *   post:
 *     tags: [Subjects]
 *     summary: Assign subject to a class with teacher
 */
router.post('/assign-to-class',
  authorize('admin'),
  subjectController.assignSubjectToClass
);

/**
 * @openapi
 * /subjects/remove-from-class:
 *   delete:
 *     tags: [Subjects]
 *     summary: Remove subject from a class
 */
router.delete('/remove-from-class',
  authorize('admin'),
  subjectController.removeSubjectFromClass
);

module.exports = router;