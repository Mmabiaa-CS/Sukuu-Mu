'use strict';

const express = require('express');
const router = express.Router();

const subjectController = require('./subject.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

router.use(authenticate);

// ── Search & lookup — MUST be before /:id ──────────────────────────────────
router.get('/search', subjectController.searchSubjects);
router.get('/lookup', subjectController.lookupSubject);
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
router.post('/assign-to-class',
  authorize('admin'),
  subjectController.assignSubjectToClass
);

router.delete('/remove-from-class',
  authorize('admin'),
  subjectController.removeSubjectFromClass
);

module.exports = router;