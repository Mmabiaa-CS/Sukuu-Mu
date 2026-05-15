'use strict';

const express = require('express');
const router = express.Router();

const classController = require('./class.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

// All class routes require a valid token
router.use(authenticate);

router.get('/search',       classController.searchClasses);    // 👈 before /:id
router.get('/',             classController.getAllClasses);
router.get('/:id',          classController.getClassById);
router.get('/:id/students', classController.getStudentsByClass);

router.post('/create',authorize('admin','manager','user'),classController.createClass);

router.put('/:id',authorize('admin', 'manager'),classController.updateClass);

router.delete('/:id',authorize('admin','manager'),classController.deleteClass);

router.post('/:id/migrate',authorize('admin','manager'),classController.migrateStudents);

module.exports = router;