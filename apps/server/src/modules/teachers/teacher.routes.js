'use strict';

const express = require('express');
const router = express.Router();

const teacherController = require('./teacher.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

router.use(authenticate);

// ── Search — MUST be before /:id ───────────────────────────────────────────
router.get('/search',       teacherController.searchTeachers);

// ── Teacher CRUD ───────────────────────────────────────────────────────────
router.get('/',             teacherController.getAllTeachers);
router.get('/:id',          teacherController.getTeacherById);
router.get('/:id/classes',  teacherController.getTeacherClasses);
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
router.post('/assign-class',
  authorize('admin'),
  teacherController.assignClassToTeacher
);

router.delete('/remove-class',
  authorize('admin'),
  teacherController.removeClassFromTeacher
);

router.post('/assign-subject',
  authorize('admin'),
  teacherController.assignSubjectToTeacher
);

router.delete('/remove-subject',
  authorize('admin'),
  teacherController.removeSubjectFromTeacher
);

module.exports = router;