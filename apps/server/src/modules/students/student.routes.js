'use strict';

const express = require('express');
const router = express.Router();

const studentController = require('./student.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

router.use(authenticate);

// ── Search — MUST be before /:id ───────────────────────────────────────────
router.get('/search', studentController.searchStudents);

// ── Student CRUD ───────────────────────────────────────────────────────────
router.get('/', studentController.getAllStudents);
router.get('/code/:c', studentController.getStudentByCode);
router.get('/:id', studentController.getStudentById);

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