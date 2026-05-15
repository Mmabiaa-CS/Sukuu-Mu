'use strict';

const express = require('express');
const router = express.Router();

const parentController = require('./parent.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

router.use(authenticate);

// ── Search — MUST be before /:id ───────────────────────────────────────────
router.get('/search',                parentController.searchParents);
router.get('/student/:student_id',   parentController.getParentsByStudent);

// ── Parent CRUD ────────────────────────────────────────────────────────────
router.get('/',                      parentController.getAllParents);
router.get('/:id',                   parentController.getParentById);
router.get('/:id/students',          parentController.getStudentsByParent);

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
router.post('/link-student',
  authorize('admin'),
  parentController.linkStudentToParent
);

router.delete('/unlink-student',
  authorize('admin'),
  parentController.unlinkStudentFromParent
);

module.exports = router;